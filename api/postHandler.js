const { Post, Comment } = require("../models/Post");
const ReportedPost = require("../models/ReportedPost");
const User = require("../models/User");
const { groupInterests } = require("../utils/groupInterests");

//Get All Posts
exports.getPosts = (req, res) => {
  Post.find({})
    .sort("-createDate")
    .limit(100)
    .exec((err, posts) => {
      !err
        ? res.json({
            status: "success",
            message: "Fetched posts successfully.",
            data: posts,
          })
        : res.json({
            status: "failure",
            message: "Failled t load posts",
            error: err,
          });
    });
};

//Create new post:
exports.newPost = (req, res) => {
  let post = new Post();
  //Saving properties
  post.postBody = req.body.postBody;
  post.likeCount = 0;
  post.comments = req.body.comments;
  post.tags = req.body.tags;
  post.creator = req.body.creator;
  post.creatorName = req.body.creatorName;
  post.creatorImage = req.body.creatorImage;
  post.postImage = req.body.postImage;

  post.save((err) => {
    err ? res.json({ err }) : res.json({ message: "Post Created", data: post });
  });
};

//View single post:
exports.getOnePost = (req, res) => {
  Post.findById(req.params.postId)
    .populate("comments")
    .exec((err, post) => {
      err ? res.json(err) : res.json({ message: "Post lading", data: post });
    });
};

// Delete post
exports.delete = (req, res) => {
  Post.findOneAndDelete({
    _id: req.params.postId,
  })
    .then(() => {
      res.json({
        success: true,
        message: "Post deleted",
      });
    })
    .catch((error) => {
      res.json({
        success: false,
        error,
      });
    });
};

//Update post
exports.update = (req, res) => {
  Post.findById(req.params.postId, (err, post) => {
    if (err) res.send(err);
    post.postBody = req.body.postBody ? req.body.postBody : post.postBody;
    post.likes = req.body.likes ? req.body.likes : post.likes;
    post // save the post
      .save((err) => {
        if (err) res.json(err);
        res.json({
          message: "Post Info updated",
          data: post,
        });
      });
  });
};

//Adding a new comment
exports.newComment = (req, res) => {
  Post.findById(req.params.postId, async (err, post) => {
    if (err) res.send(err);
    try {
      if (!post) res.status(404).send("Post not found").end();
      else {
        let comment = new Comment({ ...req.body });
        post.comments.push(comment);
        console.log(post);
        post.save((err, result) => {
          if (err) res.json(err);
          else {
            comment.save((err) => {
              if (err) {
                res.json({ err, success: false });
              } else {
                res.json({
                  message: "Comment created",
                  data: result,
                });
              }
            });
          }
        });
      }
    } catch (error) {
      res.json(err);
    }
  });
};

exports.newComment2 = (req, res) => {
  let { commentBody, creatorName, creatorImage, creator, postId } = req.body;

  let comment = new Comment();
  comment.commentBody = commentBody;
  comment.creatorName = creatorName;
  comment.creatorImage = creatorImage;
  comment.creator = creator;
  comment.save((err) => {
    if (!err) {
      Post.findOne({ _id: postId }, (err, post) => {
        post.comments = [...post.comments, comment._id];
        post.save((err, result) => {
          if (!err) {
            res.json({
              message: "Comment created",
              data: result,
            });
          } else {
            res.json(err);
          }
        });
      });
    } else {
      res.json(err);
    }
  });
};

// exports.getFriendsPosts = (req, res) => {
//   User.findById(req.params.userId, (err, user) => {
//     let friends = user.friendsId;
//     let i;
//     let posts = [];
//     for (i in friends) {
//       let post = Post.findAll({ friendsId: friendsId[i] });
//       posts = [...posts, ...post];
//       posts.sort();
//     }
//   });
// };

// //Get All Friends Posts
// exports.getFriendsPosts = (req, res) => {
//   User.findById(req.params.userId, async (err, user) => {
//     let friends = user.friendsId;
//     let friendsPost = [];
//     let posts;

//     for (i in friends) {
//       posts = await Post.find({ _id: friends[i] });
//       friendsPost.push(posts);
//     }
//     res.json(friendsPost);
//   });
// };

exports.getFriendsPosts = (req, res) => {
  Post.find({ creator: { $in: req.body.friendsId } }, (err, posts) => {
    if (err) res.send(err);
    res.send(posts);
  })
    .sort({ _id: -1 })
    .catch((err) => {
      res.send(err);
    });
};

exports.likePost = (req, res) => {
  let { postId } = req.params;
  let { likerId } = req.body;
  console.log("Post ID", postId, "\t\tLikerID", likerId);
  try {
    Post.findOne({ _id: postId }, (err, post) => {
      if (!err) {
        if (!post.likers.includes(likerId)) {
          post.likers = [...post.likers, likerId];
          if (post.likeCount == 0 || post.likeCount == undefined) {
            post.likeCount = 1;
          } else {
            post.likeCount = post.likeCount + 1;
          }
          post.save((err) => {
            if (!err) {
              res.json({
                success: true,
                message: "Liked post successfully",
              });
            } else {
              res.json({
                success: false,
                message: "Something went wrong",
              });
            }
          });
        } else {
          res.json({
            success: false,
            message: "You have already liked the post",
          });
        }
      } else {
        res.json({
          success: false,
          message: "Failed to find post",
        });
      }
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};

exports.unlikePost = (req, res) => {
  let { postId } = req.params;
  let { unlikerId } = req.body;

  Post.findOne({ _id: postId }, (err, post) => {
    if (!err) {
      if (post.likers.includes(unlikerId)) {
        post.likers = post.likers.filter((id) => {
          return id == postId;
        });
        if (post.likeCount > 0) {
          post.likeCount = post.likeCount - 1;
        }
      }

      post.save((err) => {
        if (!err) {
          res.json({
            success: true,
            message: "Unliked post successfully",
          });
        } else {
          res.json({
            success: false,
            message: "Something went wrong",
          });
        }
      });
    } else {
      res.json({
        success: false,
        message: "Failed to retrieve post",
      });
    }
  });
};

exports.getTrendingPosts = (req, res) => {
  let date = new Date();
  date.setDate(date.getDate() - 1);
  console.log(date.toISOString());
  try {
    Post.find({
      createDate: {
        $gt: date.setHours(00, 00, 00),
      },
    })
      .sort("-likers")
      .exec((err, posts) => {
        if (!err) {
          res.json({
            success: true,
            data: posts,
          });
        } else {
          res.json({
            success: false,
            error: err,
          });
        }
      });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
};

exports.getAllReportedPosts = (req, res) => {
  try {
    ReportedPost.find({})
      .sort("-_id")
      .limit(100)
      .exec((err, reportedPosts) => {
        if (!err) {
          res.json({
            success: true,
            data: reportedPosts,
          });
        } else {
          res.json({
            success: false,
            error: err,
          });
        }
      });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
    });
  }
};

// exports.reportPost = (req, res) => {
//   try {
//     const { reporterId, post } = req.body;
//     const reportedPost = new ReportedPost();
//     reportedPost.reporterId = reporterId;
//     reportedPost.post = post;

//     reportedPost.save((err) => {
//       if (err)
//         res.json({
//           success: false,
//           message: "Failed to report post.",
//         });
//       res.json({
//         success: true,
//         message: "Post reported.",
//       });
//     });
//   } catch (e) {
//     res.json({
//       success: false,
//       message: "Failed to report post.",
//     });
//   }
// };

exports.reportPost = (req, res) => {
  let { reporterId, postId } = req.body;
  let reportedPost = new ReportedPost();
  reportedPost.reporterId = reporterId;
  console.log(req.body);

  try {
    Post.findOne({ _id: postId }, (err, post) => {
      if (err) {
        res.json({
          success: false,
          error: err,
        });
      } else {
        console.log(post);
        reportedPost.post = post;
      }

      reportedPost.save((err) => {
        if (err) {
          res.json({
            success: false,
            error: err.message,
          });
        } else {
          res.json({
            success: true,
            message: "Reported post successfully",
          });
        }
      });
    });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};

exports.dismissReport = (req, res) => {
  let { reportId } = req.params;

  try {
    ReportedPost.findOneAndDelete({ _id: reportId })
      .then(() => {
        res.json({
          success: true,
          message: "Report was dismissed successfully",
        });
      })
      .catch((e) => {
        res.json({
          success: false,
          error: e,
        });
      });
  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
};

exports.getPostByInterests = (req, res) => {
  let { interests } = req.body;

  interests = groupInterests(interests);

  try {
    Post.find({ tags: { $in: ["General", ...interests] } })
      .sort("-createDate")
      .limit(50)
      .exec((err, posts) => {
        if (!err) {
          res.json({
            success: true,
            posts,
          });
        } else {
          res.json({
            status: false,
            error: err,
          });
        }
      });
  } catch (error) {
    res.json({
      success: false,
      error,
    });
  }
};

exports.deletedReportedPost = async (req, res) => {
  let { postId, reportId } = req.body;
  try {
    await ReportedPost.findOneAndDelete({ _id: reportId });
    await Post.findOneAndDelete({ _id: postId });
    res.json({ success: true, message: "Deleted post!" });
  } catch {
    res.json({
      success: false,
      message: "Failed to delete post!",
    });
  }
};
