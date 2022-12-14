const router = require("express").Router();
const friendsHandler = require("../api/friendsHandler");

router.post("/send-request", friendsHandler.sendFriendRequest);
router.get("/get-requests/:recipientId", friendsHandler.getFriendRequests);
router.put("/confirm-request", friendsHandler.confirmFriendRequest);
router.put("/decline-request", friendsHandler.declineRequest);
router.put("/cancel-request", friendsHandler.cancelRequest);
router.put("/clear-friends", friendsHandler.clearFriends);
router.put("/test", friendsHandler.test);
router.patch("/unfriend", friendsHandler.unfriend);
router.put("/test/reset-user", friendsHandler.resetUserFriendsAndBlocked);
module.exports = router;
