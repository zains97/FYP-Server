const Mongoose = require("mongoose");
const { postSchema } = require("./Post");

const ReportedPostSchema = new Mongoose.Schema({
  reporterId: {
    type: Mongoose.Types.ObjectId,
    required: true,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  post: {
    type: postSchema,
    required: true,
  },
});

const ReportedPost = Mongoose.model("ReportedPost", ReportedPostSchema);
module.exports = ReportedPost;
