const User = require("../models/User");

//Get all the users
exports.getUsers = (req, res) => {
  User.get((err, users) => {
    !err
      ? res.json({
          status: "Success",
          message: "Successfuly retrived users",
          data: users,
        })
      : res.json({ status: "Failed", error: err });
  });
};
exports.getOneUser = (req, res) => {
  console.log("ID: ", req.params.userId);

  User.findById(req.params.userId, (err, user) => {
    console.log(user);
    if (!err) {
      res.send(user);
    } else {
      res.json({ success: false, error: err });
    }
  });
};

exports.blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { toBlock } = req.body;

    const removeFriend = await User.updateOne(
      { _id: id },
      {
        $pull: { friendsId: toBlock },
      }
    );

    const block = await User.updateOne(
      { _id: id }, //Filter
      {
        $push: { blockedUsers: toBlock },
      } //Mongoose push
    );

    //res fail
    if (!block)
      return res.json({
        success: false,
        message: "User could not be blocked!",
      });

    //res success
    res.json({
      success: true,
      message: "User blocked!",
      block,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "User could not be blocked!",
    });

    next(error);
  }
};

exports.unBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { toUnBlock } = req.body;
    console.log(id);
    console.log(toUnBlock);
    const unBlock = await User.updateOne(
      { _id: id }, //Filter
      {
        $pull: {
          blockedUsers: toUnBlock,
        },
      }
    );

    if (!unBlock)
      return res.json({
        success: false,
        message: "User could not be un blocked!",
      });

    res.json({
      success: true,
      message: "User unblocked!",
      unBlock,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "User could not be un blocked!",
    });

    next(error);
  }
};

//Get one user from params
exports.getOneUser = (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    !err
      ? res.json({
          status: 200,
          message: "Retrived users data",
          data: user,
        })
      : res.json({ status: "Failed", error: err });
  });
};

//New user
exports.newUser = (req, res) => {
  const user = new User();
  user.uId = req.body.uId;
  user.fistName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.email = req.body.email;
  user.gender = req.body.gender;
  user.currentLocation = req.body.currentLocation;
  user.dob = req.body.dob;
  user.isAdmin = req.body.isAdmin;
  user.interests = req.body.interests;
  user.friendsId = req.body.friendsId;
  user.chatID = req.body.chatID;
  user.postID = req.body.postID;

  user.save((err) => {
    if (err) res.json(err);
    res.json({ message: "User info updated", data: user });
  });
};

//Update user Info
exports.updateUserInfo = (req, res) => {
  User.findById(req.params.userId, (err, user) => {
    err ? res.json(err) : null;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.gender = req.body.gender || user.gender;
    user.dob = req.body.dob || user.dob;

    user.save((err) => {
      if (err) res.json(err);
      res.json({ message: "User info updated", data: user });
    });
  });
};

//Delete user
exports.deleteUser = (req, res) => {
  User.remove({ _id: req.params.userId }, (err) => {
    err
      ? res.send(err)
      : res.json({ status: "success", message: "User info deleted" });
  });
};

//Add friends
exports.addFriend = (req, res) => {
  User.findById(req.params.userId, async (err, user) => {
    if (err) res.send(err);
    user.friendsId = [...user.friendsId, req.body.friendsId];
    user.save((err) => {
      if (err) res.json(err);
      res.json({ message: "Friend added", data: user });
    });
  });
};

// //Get friends
// exports.getFriends = (req, res) => {
//   User.findOne({ _id: req.body.userId }, async (err, user) => {
//     if (err) {
//       res.send(err);
//     } else {
//       User.find({ _id: { $in: [...user.friendsId] } }, (err, friends) => {
//         res.send(friends);
//       });
//     }
//   });
// };

exports.uploadPhoto = (req, res) => {
  let { userId, profilePic } = req.body;

  try {
    User.findOne({ _id: userId }, (err, user) => {
      if (!err) {
        user.profilePic = profilePic || user.profilePic;
        user
          .save()
          .then((savedDoc) => {
            res.json({
              success: true,
              user: savedDoc,
            });
          })
          .catch((err) => {
            res.json({
              success: false,
              error: err,
            });
          });
      } else {
        res.json({
          success: false,
          error: err,
        });
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};

exports.updateLocation = (req, res) => {
  let { userId, location } = req.body;

  try {
    User.updateOne(
      { _id: userId },
      { currentLocation: location },
      (err, user) => {
        if (!err) {
          console.log("Done");
          res.json({
            success: true,
            updatedUser: user,
          });
        } else {
          res.json({
            success: false,
            error: err,
          });
        }
      }
    );
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};

exports.getFriends = (req, res) => {
  let { friendsId } = req.body;

  try {
    User.find({ _id: { $in: friendsId } }, (err, friends) => {
      if (!err) {
        res.json({
          success: true,
          friends,
        });
      } else {
        res.json({
          success: false,
          error: err,
        });
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};

exports.getUserCount = (req, res) => {
  User.count({}, (err, userCount) => {
    if (!err) {
      res.json({
        success: true,
        userCount,
      });
    } else {
      res.json({
        success: false,
        error: err,
      });
    }
  });
};

exports.suspendUser = (req, res) => {
  let { userId } = req.body;

  User.findOne({ _id: userId }, (err, user) => {
    if (!err) {
      user.isSuspended = true;
      user.save((err) => {
        if (!err) {
          res.json({ success: true, message: "user suspended" });
        } else {
          res.json({ success: false, message: "Failed to suspend user" });
        }
      });
    } else {
      res.json({ success: false, message: "Failed to suspend user" });
    }
  });
};

exports.unSuspendUser = (req, res) => {
  let { userId } = req.body;

  User.findOne({ _id: userId }, (err, user) => {
    if (!err) {
      user.isSuspended = false;
      user.save((err) => {
        if (!err) {
          res.json({ success: true, message: "user suspended" });
        } else {
          res.json({ success: false, message: "Failed to suspend user" });
        }
      });
    } else {
      res.json({ success: false, message: "Failed to suspend user" });
    }
  });
};

exports.getAllSuspendedUsers = (req, res) => {
  User.find({ isSuspended: true }, (err, users) => {
    if (!err) {
      res.json({ success: true, users });
    } else {
      res.json({
        success: false,
        message: "Failed to retrieve users.",
      });
    }
  });
};

exports.storeFcm = (req, res) => {
  let { userId, fcmToken } = req.body;
  User.findById({ _id: userId }, (err, user) => {
    if (!err) {
      user.fcmToken = fcmToken;
      user.save((err) => {
        if (!err) {
          res.json({
            success: true,
            user,
          });
        } else {
          res.json({
            success: false,
            err,
          });
        }
      });
    } else {
      res.json({
        success: false,
        err,
      });
    }
  });
};
