const { Message } = require("../models/Message");
const { Chatroom } = require("../models/Chatroom");
const saveMessage = async (data) => {
  let { chatroomId, sender, messageBody } = data;

  const message = new Message();
  message.chatroomId = chatroomId;
  message.sender = sender;
  message.messageBody = messageBody;
  try {
    await message.save();
    // Chatroom.findByIdAndUpdate(chatroomId, { lastMessage: message });
    Chatroom.findOne({ _id: chatroomId }, (err, chatroom) => {
      if (!err) {
        chatroom.lastMessage = message;
        chatroom.save();
      }
    });
    return { success: true };
  } catch {
    success: false;
  }
};

const updateChatroom = async (data) => {};

module.exports = { saveMessage };
