const { FriendRequest } = require("../models/friendRequestModel");
const User = require("../models/User");
const { use } = require("../routes/friendsRoutes");

exports.sendFriendRequest = async (req, res) => {
  let { requester, recipient } = req.body;
  try {
    let sender = await User.findById(requester);

    if (sender.sentFriendRequests.includes(recipient)) {
      res.json({ success: false, msg: "Already sent request" });
    } else {
      let friendRequest = new FriendRequest();
      friendRequest.requester = requester;
      friendRequest.recipient = recipient;
      await friendRequest.save();

      let reciever = await User.findById(recipient);
      reciever.recievedFriendRequests.push(requester);
      await reciever.save();

      sender.FriendRequests = friendRequest;
      sender.sentFriendRequests.push(recipient);
      await sender.save();

      res.json({
        success: true,
        message: "Friend request sent",
        user: sender,
      });
    }
  } catch (error) {
    res.json({ success: false, error });
  }
  // let requesterId = requester._id;
  // let recipientId = recipient;
  // let updatedRequester;
  // if (requesterId == recipientId) {
  //   res.send("Cannot send request to self.");
  // } else {
  //   const friendRequest = new FriendRequest();
  //   friendRequest.requester = {
  //     name: requester.firstName + " " + requester.lastName,
  //     userId: requesterId,
  //     profilePic: requester.profilePic,
  //   };
  //   friendRequest.recipient = recipientId;

  //   //Update requester
  //   User.findOne({ _id: requesterId }, (err, user) => {
  //     user.sentFriendRequests = [...user.sentFriendRequests, recipientId];
  //     user.save();
  //     updatedRequester = user;
  //     console.log("Sender:", user);
  //   })
  //     .then(() => {
  //       //Update recipient
  //       User.findOne({ _id: recipientId }, (err, user) => {
  //         user.recievedFriendRequests = [
  //           ...user.recievedFriendRequests,
  //           requesterId,
  //         ];
  //         user.save();
  //         console.log("OUTPUT : ", user);
  //       });
  //     })
  //     //Save request
  //     .then(() => {
  //       friendRequest.save();
  //     })
  //     .then(() => {
  //       res.json({
  //         success: true,
  //         message: "Friend request sent",
  //         user: updatedRequester,
  //       });
  //     })
  //     .catch((e) => {
  //       res.send(e);
  //     });

  //   //Update recipient
  // }
};

// exports.test = (req, res) => {
//   let { requester, recipient } = req.body;

//   User.findOne({ _id: requester.userId }, (err, user) => {
//     user.sentFriendRequests = [...user.sentFriendRequests, recipient];
//     user.save();
//     console.log("Requester:", user);
//   }).then(() => {
//     User.findOne({ _id: recipient }, (err, user) => {
//       user.recievedFriendRequests = [...user.sentFriendRequests, requester];
//       user.save();
//       console.log("Requester:", user);
//     });
//   });
//   res.send("TEST");
// };

exports.getFriendRequests = async (req, res) => {
  let { recipientId } = req.params;
  try {
    let requests = await FriendRequest.find({
      recipient: recipientId,
    }).populate("requester");

    res.json({
      message: "Got all friend requests for user",
      data: requests,
      status: 200,
    });
  } catch (error) {
    res.json({ success: false, error });
  }

  // res.send(recipientId);
  // FriendRequest.find(
  // { recipient: req.params.recipientId },
  // (err, friendRequests) => {
  //   try {
  //     if (err) res.send(err);
  //     res.status(200).json({
  //       message: "Got all friend requests for user",
  //       data: friendRequests,
  //       status: 200,
  //     });
  //   } catch (error) {
  //     res.send(error);
  //   }
  // }
  // );
};

exports.confirmFriendRequest = async (req, res) => {
  try {
    let { requesterId, recipientId, requestId } = req.body;

    await FriendRequest.findOneAndDelete({ _id: requestId });

    let sender = await User.findById(requesterId);
    sender.friendsId.push(recipientId);
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (id) => id != recipientId
    );
    await sender.save();

    let recipient = await User.findById(recipientId);
    recipient.friendsId.push(requesterId);
    recipient.recievedFriendRequests = recipient.recievedFriendRequests.filter(
      (id) => id != requesterId
    );
    await recipient.save();

    res.json({
      success: true,
      user: recipient,
    });
  } catch (error) {
    res.json({ success: false, error });
  }
  // User.findOne({ _id: req.body.requesterId }, (err, user) => {
  //   console.log("Requseter : " + user);
  //   user.sentFriendRequests = user.sentFriendRequests.filter(
  //     (id) => id != req.body.recipientId
  //   );
  //   user.friendsId = [...user.friendsId, req.body.recipientId];
  //   user.save();
  // })
  //   .then(() => {
  //     User.findOne({ _id: req.body.recipientId }, (err, user) => {
  //       console.log("Recipient: " + user);
  //       user.recievedFriendRequests = user.recievedFriendRequests.filter(
  //         (id) => id != req.body.requesterId
  //       );
  //       user.friendsId = [...user.friendsId, req.body.requesterId];
  //       user.save();
  //     });
  //   })
  //   .then(() => {
  //     FriendRequest.remove({ _id: req.body.requestId }, (err) => {
  //       if (!err) {
  //         res.status(200).json({ msg: "Request accepted." });
  //       } else {
  //         res.send(err);
  //       }
  //     });
  //   })
  //   .catch((e) => {
  //     res.send(e.message);
  //   });
};

exports.declineRequest = (req, res) => {
  // User.findOne({ _id: req.body.requesterId }, (err, user) => {
  //   console.log("Requseter : " + user);
  //   user.sentFriendRequests = user.sentFriendRequests.filter(
  //     (id) => id != req.body.recipientId
  //   );
  //   user.save();
  // })
  //   .then(() => {
  //     User.findOne({ _id: req.body.recipientId }, (err, user) => {
  //       console.log("Recipient: " + user);
  //       user.recievedFriendRequests = user.recievedFriendRequests.filter(
  //         (id) => id != req.body.requesterId
  //       );
  //       user.save();
  //     });
  //   })
  //   .then(() => {
  //     FriendRequest.remove({ _id: req.body.requestId }, (err) => {
  //       if (!err) {
  //         res.status(200).json({ msg: "Request accepted." });
  //       } else {
  //         res.send(err);
  //       }
  //     });
  //   })
  //   .catch((e) => {
  //     res.send(e.message);
  //   });

  console.log("DEvline req");
  res.send("Decline req");
};

exports.cancelRequest = async (req, res) => {
  // let { senderId, recipientId, friendRequestId } = req.body;
  let { senderId, recipientId } = req.body;
  console.log("SENDER: ", senderId, "RECIPIENT: ", recipientId);

  try {
    await FriendRequest.findOneAndDelete({
      requester: senderId,
      recipient: recipientId,
    });

    let sender = await User.findById(senderId);
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (id) => id != recipientId
    );
    await sender.save();

    let recipient = await User.findById(recipientId);
    recipient.recievedFriendRequests = recipient.recievedFriendRequests.filter(
      (id) => id != senderId
    );
    await recipient.save();

    res.json({
      success: true,
      user: sender,
    });
  } catch (error) {
    res.json({ success: true, error });
  }

  // let updatedSender;
  // try {
  //   User.updateOne(
  //     { _id: senderId },
  //     {
  //       $pull: { sentFriendRequests: recipientId },
  //     }
  //   )
  //     .then(() => {
  //       User.updateOne(
  //         { _id: recipientId },
  //         {
  //           $pull: { recievedFriendRequests: senderId },
  //         }
  //       );
  //     })
  //     .then(() => {
  //       User.findOne({ _id: senderId }, (err, sender) => {
  //         if (err) {
  //           res.json({
  //             success: false,
  //             error: err,
  //           });
  //         } else {
  //           updatedSender = sender;
  //         }
  //       });
  //     })
  //     .then(() => {
  //       FriendRequest.find({ recipient: recipientId }, (err, request) => {
  //         if (!err) {
  //           let _request = request[0];
  //           FriendRequest.findOneAndDelete({ _id: _request._id })
  //             .then(() => {
  //               res.json({
  //                 success: true,
  //                 message: "Request cancelled",
  //                 user: updatedSender,
  //               });
  //             })
  //             .catch((e) => {
  //               res.json({
  //                 success: false,
  //                 error: e,
  //               });
  //             });
  //         } else {
  //           res.json({
  //             success: false,
  //             error: err,
  //           });
  //         }
  //       });
  //     })
  //     .catch((e) => {
  //       res.json({
  //         success: false,
  //         error: e,
  //       });
  //     });
  // } catch (error) {
  //   res.json({
  //     success: false,
  //     error,
  //   });
  // }
};

exports.clearFriends = (req, res) => {
  let { userId } = req.body;

  if (userId) {
    User.findById(userId).exec((err, user) => {
      if (!err) {
        user.friendsId = [];
        user.save((err) => {
          if (!err) {
            res.json({ success: true, user });
          } else {
            res.json({ success: false, err });
          }
        });
      } else {
        res.json({ success: false });
      }
    });
  } else {
    res.json({ success: false });
  }
};

exports.test = (req, res) => {
  let { userId } = req.body;

  if (userId) {
    User.findById(userId).exec((err, user) => {
      if (!err) {
        user.blockedUsers = [];
        user.save((err) => {
          if (!err) {
            res.json({ success: true, msg: "THIS IS A TEST" });
          } else {
            res.json({ success: false, err });
          }
        });
      } else {
        res.json({ success: false });
      }
    });
  } else {
    res.json({ success: false });
  }
};

exports.unfriend = async (req, res) => {
  try {
    let { userId, unfriendedId } = req.body;

    let user = await User.findById(userId);
    user.friendsId = user.friendsId.filter((frId) => frId != unfriendedId);
    await user.save();

    let user2 = await User.findById(unfriendedId);
    user2.friendsId = user2.friendsId.filter((frId) => frId != userId);
    await user2.save();

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, error });
  }
};

exports.resetUserFriendsAndBlocked = async (req, res) => {
  let { userId } = req.body;

  try {
    let user = await User.findById(userId);

    user.friendsId = [];
    user.sentFriendRequests = [];
    user.recievedFriendRequests = [];
    user.blockedUsers = [];
    user.FriendRequests = [];
    await user.save();
    FriendRequest.deleteMany({ id: !null });
    res.json({ succes: true, user });
  } catch (error) {
    res.json({ succes: false, error });
  }
};
