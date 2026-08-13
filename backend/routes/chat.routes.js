const router = require("express").Router();
const controller = require("../controllers/chat.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/conversations", authenticate, controller.getMyConversations);
router.post("/conversations", authenticate, controller.startConversation);
router.get("/conversations/:id/messages", authenticate, controller.getMessages);
router.post("/conversations/:id/messages", authenticate, controller.sendMessage);
router.post("/conversations/:id/read", authenticate, controller.markRead);

module.exports = router;