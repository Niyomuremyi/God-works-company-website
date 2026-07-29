const router = require("express").Router();
const controller = require("../controllers/orders.controller");
const { authenticate, optionalAuthenticate, requireRole } = require("../middleware/auth.middleware");

// Checkout — guest-friendly, but picks up req.user if the buyer is logged in
router.post("/", optionalAuthenticate, controller.createOrder);

// Buyer — identity from JWT
router.get("/me/dashboard", authenticate, requireRole("buyer"), controller.getMyDashboard);
router.get("/me/:id", authenticate, requireRole("buyer"), controller.getMyOrderById);
router.get("/me", authenticate, requireRole("buyer"), controller.getMyOrders);
router.patch("/:id/cancel", authenticate, controller.cancelOrder);

// Deprecated — remove once the frontend is fully off email-based lookups
router.get("/customer/dashboard/:email", controller.getCustomerDashboard);
router.get("/customer/:email/:id", controller.getCustomerOrderById);
router.get("/customer/:email", controller.getCustomerOrdersByEmail);

// Admin — left open for now; there's no admin role in the system yet (see note above)
router.get("/", controller.getAllOrders);
router.get("/:id", controller.getOrderById);
router.patch("/:id/status", controller.updateOrderStatus);
router.delete("/:id", controller.deleteOrder);

// Seller
router.get("/seller/me", authenticate, requireRole("seller"), controller.getSellerOrders);
router.get("/seller/me/dashboard", authenticate, requireRole("seller"), controller.getSellerDashboard);
router.patch("/items/:itemId/status", authenticate, requireRole("seller"), controller.updateOrderItemStatus);
module.exports = router;