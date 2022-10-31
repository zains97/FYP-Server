const router = require("express").Router();
const postController = require("../api/postHandler");
const authVerify = require("./authVerify");

//Defining apis for posts
router.route("/").get(postController.getPosts).post(postController.newPost);

router.route("/friends-post").post(postController.getFriendsPosts);

router
  .route("/onepost/:postId")
  .put(postController.update)
  .patch(postController.update)
  .delete(postController.delete)
  .get(postController.getOnePost);

router.put("/new-comment/:postId", postController.newComment);

router.post("/report-post", postController.reportPost);
router.patch("/like-post/:postId", postController.likePost);
router.patch("/unlike-post/:postId", postController.unlikePost);
router.get("/trending", postController.getTrendingPosts);
//REPORT
router.get("/all-reported", postController.getAllReportedPosts);
router.post("/report", postController.reportPost);
router.delete("/dismiss-report/:reportId", postController.dismissReport);
router.patch("/interest-post", postController.getPostByInterests);
router.delete("/delete-reported", postController.deletedReportedPost);

module.exports = router;
