const router = require("express").Router();
const { authenticate, requireRole } = require("../middleware/auth.middleware");
const controller = require("../controllers/products.controller");

router.get("/", controller.getAllProducts);
router.get("/:slug", controller.getProductBySlug);
router.post("/",authenticate, controller.createProduct);
router.get("/mine", authenticate, requireRole("seller"), controller.getMyProducts);

module.exports = router;