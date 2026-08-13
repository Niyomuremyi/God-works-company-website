const router = require("express").Router();
const multer = require("multer");
const controller = require("../controllers/upload.controller");
const { authenticate } = require("../middleware/auth.middleware");

// In-memory storage — file is briefly held in RAM then streamed to Cloudinary,
// never written to disk on your server.
const upload = multer({ storage: multer.memoryStorage() });

router.post("/chat-image", authenticate, upload.single("file"), controller.uploadChatImage);

module.exports = router;