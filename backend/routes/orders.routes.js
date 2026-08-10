const router = require("express").Router();
const controller = require("../controllers/orders.controller");
const { authenticate, optionalAuthenticate, requireRole } = require("../middleware/auth.middleware");

// Checkout — guest-friendly, but picks up req.user if the buyer is logged in
router.post("/", optionalAuthenticate, controller.createOrder);

// Buyer — identity from JWT
router.get("/me/dashboard", authenticate, requireRole("buyer", "seller"), controller.getMyDashboard);
router.get("/me/:id", authenticate, requireRole("buyer", "seller"), controller.getMyOrderById);
router.get("/me", authenticate, requireRole("buyer", "seller"), controller.getMyOrders);
router.patch("/:id/cancel", authenticate, requireRole("buyer", "seller"), controller.cancelOrder);
//
router.post("/items/:itemId/return", authenticate, requireRole("buyer", "seller"), controller.createReturnRequest);
router.post("/items/:itemId/review", authenticate, requireRole("buyer", "seller"), controller.createReview);
router.get("/seller/me/returns", authenticate, requireRole("seller"), controller.getSellerReturns);
router.patch("/returns/:returnId", authenticate, requireRole("seller"), controller.resolveReturnRequest);
router.get("/seller/me/earnings", authenticate, requireRole("seller"), controller.getSellerEarnings);
// Seller
router.get("/seller/me", authenticate, requireRole("seller"), controller.getSellerOrders);
router.get("/seller/me/dashboard", authenticate, requireRole("seller"), controller.getSellerDashboard);
router.get("/seller/me/:id", authenticate, requireRole("seller"), controller.getSellerOrderById);
router.patch("/items/:itemId/status", authenticate, requireRole("seller"), controller.updateOrderItemStatus);
router.get("/items/:itemId/tracking", authenticate, requireRole("buyer", "seller"), controller.getOrderItemTracking);

module.exports = router;