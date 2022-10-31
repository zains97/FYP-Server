const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const { Chatroom } = require("../models/Chatroom");
const { Message } = require("../models/Message");
const User = require("../models/User");

router.get("/:userId", async (req, res) => {
  let { userId } = req.params;

  User.findOne({ _id: userId })
    .populate("chatrooms")
    .exec((err, user) => {
      if (!err) {
        res.json({ success: true, chatrooms: user.chatrooms });
      } else {
        res.json({ error: err });
      }
    });
});

router.post("/", (req, res) => {
  let { participants, chatName } = req.body;
  participants = participants.sort();
  // Validation is Required
  Chatroom.find({ participants: participants }, (err, chatroom) => {
    if (!err) {
      if (chatroom.length > 0) {
        res.json({
          success: false,
          message: "Could not create new chat",
        });
      } else {
        let chatroom = new Chatroom();
        chatroom.chatroomName = chatName;
        chatroom.participants = participants;
        chatroom.save((err) => {
          if (!err) {
            participants.forEach((element) => {
              User.findOne(
                {
                  _id: element,
                },
                (err, user) => {
                  if (!err) {
                    user.chatrooms.push(chatroom);
                    user.save();
                  } else {
                    res.json({ success: false });
                  }
                }
              );
            });

            res.json({ success: true, chatroom });
          } else {
            res.json({
              success: false,
              err,
            });
          }
        });
      }
    } else {
      res.json({
        success: false,
        message: "Something went wrong",
      });
    }
  });
});

//FOR TESTING
router.put("/", (req, res) => {
  let { participants, _id: chatroomId } = req.body;
  let success = true;
  participants.forEach((participantId) => {
    User.findOne({ _id: participantId }).then(async (user) => {
      user.chatrooms = user.chatrooms.filter(
        (chatroom) => chatroom == chatroomId
      );
      await user.save((err) => {
        if (err) {
          success = false;
        }
      });
    });
  });
  Chatroom.deleteOne({ _id: chatroomId })
    .then(() => {
      if (success == true) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    })
    .catch(() => {
      res.json({ success: false });
    });
});

router.get("/all-messages/:chatroomId", (req, res) => {
  let { chatroomId } = req.params;

  Message.find({ chatroomId: chatroomId })
    .sort("-_id")
    .populate("sender")
    .exec((err, messages) => {
      if (!err) {
        res.json({
          success: true,
          messages,
        });
      } else {
        res.json({ success: false });
      }
    });
});

router.get("/get-chatroom/:chatroomId", (req, res) => {
  let { chatroomId } = req.params;

  Chatroom.findOne({ _id: chatroomId })
    .populate("participants")
    .exec((err, chatroom) => {
      if (!err) {
        res.json({ success: true, chatroom });
      } else {
        res.json({ success: false, error: err });
      }
    });
});

module.exports = router;
