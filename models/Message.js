const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema(
  {
    chatroomId: {
      type: Schema.Types.ObjectId,
      ref: "chatroom",
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: [true, "From is required!"],
    },
    messageBody: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

let Message = mongoose.model("message", MessageSchema);
module.exports = { Message, MessageSchema };
