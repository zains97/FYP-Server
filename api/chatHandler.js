const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// Get conversations list
router.get("/conversations", async (req, res) => {
  console.log("HIT API CONVERSATIONS");
  try {
    const recipientId = req.query.recipientId;
    const conversations = await Conversation.find({
      recipients: recipientId,
    }).populate("recipients from");

    if (!conversations) {
      return res.json({
        success: false,
        message: "Conversations not found!",
      });
    }

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Conversations not found!",
    });
  }
});

// Update read field of conversation
router.put("/conversations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updConversation = req.body;
    const conversation = await Conversation.findByIdAndUpdate(
      id,
      updConversation,
      { useFindAndModify: false, new: true }
    ).populate("recipients from");

    if (!conversation) {
      return res.json({
        success: false,
        message: "Conversation could not be updated!",
      });
    }

    res.json({
      success: true,
      conversation,
      message: "Conversation updated!",
    });
  } catch (error) {
    console.log(error);

    res.json({
      success: false,
      message: "Conversation could not be updated!",
    });
  }
});

// Get messages from conversation
router.get("/conversations/query", (req, res) => {
  let user1 = mongoose.Types.ObjectId(req.query.senderId);
  let user2 = mongoose.Types.ObjectId(req.query.receiverId);

  Message.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "to",
        foreignField: "_id",
        as: "toObj",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "from",
        foreignField: "_id",
        as: "fromObj",
      },
    },
  ])
    .match({
      $or: [
        { $and: [{ to: user1 }, { from: user2 }] },
        { $and: [{ to: user2 }, { from: user1 }] },
      ],
    })
    .project({
      "toObj.password": 0,
      "toObj.__v": 0,
      "toObj.date": 0,
      "fromObj.password": 0,
      "fromObj.__v": 0,
      "fromObj.date": 0,
    })
    .exec((err, messages) => {
      if (err) {
        console.log(err);
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ message: "Failure", success: false }));
        res.sendStatus(500);
      } else {
        res.send(messages);
      }
    });
});

// Post private message
router.post("/", async (req, res) => {
  try {
    let from = mongoose.Types.ObjectId(req.body.from);
    let to = mongoose.Types.ObjectId(req.body.to);

    Conversation.findOneAndUpdate(
      {
        recipients: {
          $all: [{ $elemMatch: { $eq: from } }, { $elemMatch: { $eq: to } }],
        },
      },
      {
        recipients: [from, to],
        lastMessage: req.body.body,
        read: false,
        from,
        date: Date.now(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        useFindAndModify: false,
      },
      function (err, conversation) {
        if (err) {
          console.log(err);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ message: "Failure", success: false }));
          res.sendStatus(500);
        } else {
          let message = new Message({
            conversation: conversation._id,
            to,
            from,
            body: req.body.body,
          });

          req.io.sockets.emit("messages", message);

          message.save((err) => {
            if (err) {
              console.log(err);
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ message: "Failure", success: false }));
              res.sendStatus(500);
            } else {
              res.setHeader("Content-Type", "application/json");
              res.end(
                JSON.stringify({
                  success: true,
                  response: "Success",
                  message,
                  conversationId: conversation._id,
                })
              );
            }
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
//===================
// TESTING NEW APIS
// ===================
