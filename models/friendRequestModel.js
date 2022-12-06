const mongoose = require("mongoose");

const RequesterSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  userId: {
    type: mongoose.Types.ObjectId,
  },
  profilePic: {
    type: String,
  },
});

const FriendRequestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "user",
  },
  recipient: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "user",
  },
  status: {
    type: String,
    required: false,
    default: "Pending",
  },
});

var FriendRequest = mongoose.model("friendrequest", FriendRequestSchema);
module.exports = { FriendRequest };
