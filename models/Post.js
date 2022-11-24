const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
  commentBody: String,
  creatorName: String,
  creatorImage: String,
  likes: Number,
  creator: { ref: "user", type: mongoose.Types.ObjectId },
  time: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = mongoose.Schema({
  creator: { ref: "user", type: mongoose.Types.ObjectId },
  creatorName: String,
  creatorImage: String,
  postBody: String,
  likers: [mongoose.Types.ObjectId],
  likeCount: Number,
  tags: String,
  comments: [{ type: mongoose.Types.ObjectId, ref: "comment" }],
  createDate: {
    type: Date,
    default: Date.now,
  },
  postImage: {
    type: String,
    default: "no",
  },
});

var Post = mongoose.model("post", postSchema);

const get = (callback, limit) => {
  Post.find(callback).limit(limit);
};
const Comment = mongoose.model("comment", commentSchema);

module.exports = {
  get,
  Post,
  Comment,
  postSchema,
};
