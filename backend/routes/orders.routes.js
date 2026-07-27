const router = require("express").Router();
const controller = require("../controllers/orders.controller");

// Customer
router.post("/", controller.createOrder);
router.patch("/:id/cancel", controller.cancelOrder);

// Admin
router.get("/", controller.getAllOrders);
router.get("/:id", controller.getOrderById);
router.patch("/:id/status", controller.updateOrderStatus);
router.delete("/:id", controller.deleteOrder);

// Seller
router.get("/seller/:sellerName", controller.getSellerOrders);
router.patch("/items/:itemId/status", controller.updateOrderItemStatus);

module.exports = router;