const { Message } = require("../models/Message");

const saveMessage = async (data) => {
  let { chatroomId, sender, messageBody } = data;

  const message = new Message();
  message.chatroomId = chatroomId;
  message.sender = sender;
  message.messageBody = messageBody;
  try {
    await message.save();
    return { success: true };
  } catch {
    success: false;
  }
};

module.exports = { saveMessage };
