const { uploadBuffer } = require("../utils/cloudinary");

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

exports.uploadChatImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({ error: "Only JPEG, PNG, WEBP, or GIF images are allowed" });
  }
  if (req.file.size > MAX_SIZE_BYTES) {
    return res.status(400).json({ error: "Image must be under 5MB" });
  }

  try {
    const result = await uploadBuffer(req.file.buffer, {
      resource_type: "image",
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
};