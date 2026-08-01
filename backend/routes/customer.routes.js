const router = require("express").Router();
const controller = require("../controllers/customer.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/addresses", authenticate, controller.getAddresses);
router.post("/addresses", authenticate, controller.createAddress);
router.patch("/addresses/:id", authenticate, controller.updateAddress);
router.delete("/addresses/:id", authenticate, controller.deleteAddress);

module.exports = router;