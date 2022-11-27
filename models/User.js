const mongoose = require("mongoose");

const locationSchema = mongoose.Schema({
  longitude: String,
  latitude: String,
});

const userSchema = mongoose.Schema({
  firstName: { type: String, required: true, min: 1, max: 256 },
  lastName: { type: String, required: true, min: 1, max: 256 },
  email: { type: String, required: true, min: 6, max: 256 },
  password: { type: String, required: true, min: 6, max: 1024 },
  gender: { type: String, max: 256 },
  currentLocation: locationSchema,
  fcmToken: { type: String },
  dob: Date,
  profilePic: String,
  isAdmin: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  interests: [String],
  friendsId: [mongoose.Types.ObjectId],
  sentFriendRequests: [mongoose.Types.ObjectId],
  recievedFriendRequests: [mongoose.Types.ObjectId],
  chatrooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "chatroom",
    },
  ],
  postID: [mongoose.Types.ObjectId],
  blockedUsers: [{ type: mongoose.Types.ObjectId, ref: "user" }],
  suspendedTill: {
    type: Number,
    default: 0,
  },
});

const User = (module.exports = mongoose.model("user", userSchema));
module.exports.get = (callback, limit) => {
  User.find(callback).limit(limit);
};
