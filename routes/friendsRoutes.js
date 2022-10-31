const router = require("express").Router();
const friendsHandler = require("../api/friendsHandler");

router.post("/send-request", friendsHandler.sendFriendRequest);
router.get("/get-requests/:recipientId", friendsHandler.getFriendRequests);
router.put("/confirm-request", friendsHandler.confirmFriendRequest);
router.put("/decline-request", friendsHandler.declineRequest);
router.put("/cancel-request", friendsHandler.cancelRequest);

module.exports = router;
