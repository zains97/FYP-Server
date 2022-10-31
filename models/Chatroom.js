const mongoose = require("mongoose");
const { MessageSchema } = require("./Message");

const ChatroomSchema = mongoose.Schema(
  {
    chatroomName: String,
    participants: [{ type: mongoose.Types.ObjectId, ref: "user" }],
    lastMessage: MessageSchema,
  },
  {
    timestamps: true,
  }
);

const Chatroom = mongoose.model("chatroom", ChatroomSchema);
module.exports = { Chatroom };
