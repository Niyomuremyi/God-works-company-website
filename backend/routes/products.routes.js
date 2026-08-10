const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const controller = require("../controllers/products.controller");

router.get("/", controller.getAllProducts);
router.get("/mine", authenticate, requireRole("seller"), controller.getMyProducts);
router.post("/", authenticate, requireRole("seller"), controller.createProduct);
router.get("/:id/reviews", controller.getProductReviews);
router.get("/:slug", controller.getProductBySlug);

module.exports = router;