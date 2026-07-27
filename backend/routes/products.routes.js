const router = require("express").Router();
const controller = require("../controllers/products.controller");

router.get("/", controller.getAllProducts);
router.get("/:slug", controller.getProductBySlug);
router.post("/", controller.createProduct);

module.exports = router;