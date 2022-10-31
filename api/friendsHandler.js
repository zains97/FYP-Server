const { FriendRequest } = require("../models/friendRequestModel");
const User = require("../models/User");
const { use } = require("../routes/friendsRoutes");

exports.sendFriendRequest = (req, res) => {
  let { requester, recipient } = req.body;
  let requesterId = requester._id;
  let recipientId = recipient;
  let updatedRequester;
  if (requesterId == recipientId) {
    res.send("Cannot send request to self.");
  } else {
    const friendRequest = new FriendRequest();
    friendRequest.requester = {
      name: requester.firstName + " " + requester.lastName,
      userId: requesterId,
      profilePic: requester.profilePic,
    };
    friendRequest.recipient = recipientId;

    //Update requester
    User.findOne({ _id: requesterId }, (err, user) => {
      user.sentFriendRequests = [...user.sentFriendRequests, recipientId];
      user.save();
      updatedRequester = user;
      console.log("Sender:", user);
    })
      .then(() => {
        //Update recipient
        User.findOne({ _id: recipientId }, (err, user) => {
          user.recievedFriendRequests = [
            ...user.recievedFriendRequests,
            requesterId,
          ];
          user.save();
          console.log("OUTPUT : ", user);
        });
      })
      //Save request
      .then(() => {
        friendRequest.save();
      })
      .then(() => {
        res.json({
          success: true,
          message: "Friend request sent",
          user: updatedRequester,
        });
      })
      .catch((e) => {
        res.send(e);
      });

    //Update recipient
  }
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

exports.getFriendRequests = (req, res) => {
  FriendRequest.find(
    { recipient: req.params.recipientId },
    (err, friendRequests) => {
      try {
        if (err) res.send(err);
        res.status(200).json({
          message: "Got all friend requests for user",
          data: friendRequests,
          status: 200,
        });
      } catch (error) {
        res.send(error);
      }
    }
  );
};

exports.confirmFriendRequest = (req, res) => {
  User.findOne({ _id: req.body.requesterId }, (err, user) => {
    console.log("Requseter : " + user);
    user.sentFriendRequests = user.sentFriendRequests.filter(
      (id) => id != req.body.recipientId
    );
    user.friendsId = [...user.friendsId, req.body.recipientId];
    user.save();
  })
    .then(() => {
      User.findOne({ _id: req.body.recipientId }, (err, user) => {
        console.log("Recipient: " + user);
        user.recievedFriendRequests = user.recievedFriendRequests.filter(
          (id) => id != req.body.requesterId
        );
        user.friendsId = [...user.friendsId, req.body.requesterId];
        user.save();
      });
    })
    .then(() => {
      FriendRequest.remove({ _id: req.body.requestId }, (err) => {
        if (!err) {
          res.status(200).json({ msg: "Request accepted." });
        } else {
          res.send(err);
        }
      });
    })
    .catch((e) => {
      res.send(e.message);
    });
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

exports.cancelRequest = (req, res) => {
  let { senderId, recipientId } = req.body;
  let updatedSender;
  try {
    User.updateOne(
      { _id: senderId },
      {
        $pull: { sentFriendRequests: recipientId },
      }
    )
      .then(() => {
        User.updateOne(
          { _id: recipientId },
          {
            $pull: { recievedFriendRequests: senderId },
          }
        );
      })
      .then(() => {
        User.findOne({ _id: senderId }, (err, sender) => {
          if (err) {
            res.json({
              success: false,
              error: err,
            });
          } else {
            updatedSender = sender;
          }
        });
      })
      .then(() => {
        FriendRequest.find({ recipient: recipientId }, (err, request) => {
          if (!err) {
            let _request = request[0];
            FriendRequest.findOneAndDelete({ _id: _request._id })
              .then(() => {
                res.json({
                  success: true,
                  message: "Request cancelled",
                  user: updatedSender,
                });
              })
              .catch((e) => {
                res.json({
                  success: false,
                  error: e,
                });
              });
          } else {
            res.json({
              success: false,
              error: err,
            });
          }
        });
      })
      .catch((e) => {
        res.json({
          success: false,
          error: e,
        });
      });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};
