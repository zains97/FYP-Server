const router = require("express").Router();
const userController = require("../api/userHandler");

//Defining apis for users
router.route("/").get(userController.getUsers).post(userController.newUser);

router.put("/add-friend/:friendId", userController.addFriend);

router.put("/get-friends", userController.getFriends);

// start: routes for blocking and unblocking a user
router.put("/block/:id", userController.blockUser);
router.put("/unblock/:id", userController.unBlockUser);
// end: routes for blocking and unblocking a user

router
  .route("/user/:userId")
  .get(userController.getOneUser)
  .patch(userController.updateUserInfo)
  .put(userController.updateUserInfo)
  .delete(userController.deleteUser);

router.route("/friends/:userId").get(userController.getFriends);

router.put("/store-fcm-token", userController.storeFcm);

router.route("/upload-photo").put(userController.uploadPhoto);
router.patch("/suspend-user", userController.suspendUser);
router.patch("/unsuspend-user", userController.unSuspendUser);
router.get("/get-all-suspended", userController.getAllSuspendedUsers);
router.patch("/update-location", userController.updateLocation);
router.get("/count", userController.getUserCount);
module.exports = router;
