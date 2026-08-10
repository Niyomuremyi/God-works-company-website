const pool = require("../config/db");

const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"];
const ITEM_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function mapOrder(order) {
  return {
    id: order.id,
    orderNumber: order.id,
    customerName: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    address: order.shipping_address,
    paymentMethod: order.payment_method,
    total: Number(order.total_amount),
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    itemCount: order.items ? order.items.length : undefined,
    items: order.items,
  };
}

// Attaches hasReturnRequest / hasReview flags onto each item in place, via one
// extra query per order fetch rather than a per-item round trip.
async function attachItemFlags(items) {
  if (items.length === 0) return items;
  const itemIds = items.map((i) => i.id);

  const [returnsResult, reviewsResult] = await Promise.all([
    pool.query("SELECT order_item_id, status FROM order_item_returns WHERE order_item_id = ANY($1)", [itemIds]),
    pool.query("SELECT order_item_id FROM product_reviews WHERE order_item_id = ANY($1)", [itemIds]),
  ]);

  const returnStatusByItem = new Map(returnsResult.rows.map((r) => [r.order_item_id, r.status]));
  const reviewedItemIds = new Set(reviewsResult.rows.map((r) => r.order_item_id));

  for (const item of items) {
    item.return_status = returnStatusByItem.get(item.id) || null;
    item.has_review = reviewedItemIds.has(item.id);
  }
  return items;
}

// Guest-friendly: req.user is only populated if a valid token was sent (optionalAuthenticate)
exports.createOrder = async (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, items } = req.body;
  const customerId = req.user?.id || null;

  if (!customerName || !customerEmail || !shippingAddress) {
    return res.status(400).json({ error: "customerName, customerEmail and shippingAddress are required" });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let total = 0;
    const resolvedItems = [];

    for (const item of items) {
      const { productId, variantId, quantity } = item;

      if (!productId || !quantity || quantity <= 0) {
        throw { status: 400, message: "Each item needs a valid productId and quantity" };
      }

      const productResult = await client.query(
        "SELECT id, name, price, seller, seller_id, stock FROM products WHERE id = $1 FOR UPDATE",
        [productId]
      );
      if (productResult.rows.length === 0) {
        throw { status: 404, message: `Product ${productId} not found` };
      }
      const product = productResult.rows[0];

      let availableStock = product.stock;
      if (variantId) {
        const variantResult = await client.query(
          "SELECT id, stock FROM product_variants WHERE id = $1 AND product_id = $2 FOR UPDATE",
          [variantId, productId]
        );
        if (variantResult.rows.length === 0) {
          throw { status: 404, message: `Variant ${variantId} not found for product ${productId}` };
        }
        availableStock = variantResult.rows[0].stock;
      }

      if (availableStock < quantity) {
        throw { status: 409, message: `Not enough stock for ${product.name}` };
      }

      const subtotal = Number(product.price) * quantity;
      total += subtotal;

      resolvedItems.push({
        productId,
        variantId: variantId || null,
        productName: product.name,
        seller: product.seller,
        sellerId: product.seller_id,
        price: product.price,
        quantity,
        subtotal,
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')
       RETURNING *`,
      [customerId, customerName, customerEmail, customerPhone || null, shippingAddress, paymentMethod || "cod", total]
    );
    const order = orderResult.rows[0];

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, seller, seller_id, price, quantity, subtotal, item_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')`,
        [order.id, item.productId, item.variantId, item.productName, item.seller, item.sellerId, item.price, item.quantity, item.subtotal]
      );

      if (item.variantId) {
        await client.query("UPDATE product_variants SET stock = stock - $1 WHERE id = $2", [item.quantity, item.variantId]);
      }
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.productId]);
    }

    await client.query("COMMIT");

    const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
    res.status(201).json(mapOrder({ ...order, items: itemsResult.rows }));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Something went wrong creating the order" });
  } finally {
    client.release();
  }
};

// Admin: all orders (optionally filtered by ?status=)
exports.getAllOrders = async (req, res) => {
  const { status } = req.query;
  try {
    const params = [];
    let query = "SELECT * FROM orders";
    if (status) {
      params.push(status);
      query += " WHERE status = $1";
    }
    query += " ORDER BY created_at DESC";

    const ordersResult = await pool.query(query, params);
    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
      order.items = itemsResult.rows;
    }
    res.json(orders.map(mapOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult.rows[0];
    const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
    order.items = itemsResult.rows;
    res.json(mapOrder(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Buyer: identity comes from the JWT, never a URL param — old email-based
// routes let anyone view anyone's orders just by guessing their email.
exports.getMyOrders = async (req, res) => {
  const customerId = req.user.id;
  try {
    const ordersResult = await pool.query(
      "SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC",
      [customerId]
    );
    const orders = ordersResult.rows;
    for (const order of orders) {
      const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
      order.items = await attachItemFlags(itemsResult.rows);
    }
    res.json(orders.map(mapOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getMyOrderById = async (req, res) => {
  const { id } = req.params;
  const customerId = req.user.id;
  try {
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND customer_id = $2",
      [id, customerId]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult.rows[0];
    const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
    order.items = await attachItemFlags(itemsResult.rows);
    res.json(mapOrder(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getMyDashboard = async (req, res) => {
  const customerId = req.user.id;
  try {
    const statsResult = await pool.query(
      `SELECT COUNT(*)::int AS total_orders, COALESCE(SUM(total_amount), 0) AS total_spent
       FROM orders WHERE customer_id = $1`,
      [customerId]
    );
    const { total_orders, total_spent } = statsResult.rows[0];

    const recentResult = await pool.query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [customerId]
    );
    const recentOrders = recentResult.rows;
    for (const order of recentOrders) {
      const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
      order.items = itemsResult.rows;
    }

    res.json({
      totalOrders: total_orders,
      totalSpent: Number(total_spent),
      recentOrders: recentOrders.map(mapOrder),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Deprecated — kept only so nothing breaks mid-migration. Anyone can view any
// customer's orders by guessing their email; remove once the frontend fully
// moves to /me routes above.
exports.getCustomerOrdersByEmail = async (req, res) => {
  const email = req.params?.email ?? "";
  try {
    const ordersResult = await pool.query(
      "SELECT * FROM orders WHERE LOWER(customer_email) = LOWER($1) ORDER BY created_at DESC",
      [email]
    );
    const orders = ordersResult.rows;
    for (const order of orders) {
      const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
      order.items = itemsResult.rows;
    }
    res.json(orders.map(mapOrder));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getCustomerOrderById = async (req, res) => {
  const { email, id } = req.params;
  try {
    const orderResult = await pool.query(
      "SELECT * FROM orders WHERE id = $1 AND LOWER(customer_email) = LOWER($2)",
      [id, email]
    );
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult.rows[0];
    const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
    order.items = itemsResult.rows;
    res.json(mapOrder(order));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.getCustomerDashboard = async (req, res) => {
  const { email } = req.params;
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  try {
    const statsResult = await pool.query(
      `SELECT COUNT(*)::int AS total_orders, COALESCE(SUM(total_amount), 0) AS total_spent
       FROM orders WHERE LOWER(customer_email) = LOWER($1)`,
      [email]
    );
    const { total_orders, total_spent } = statsResult.rows[0];

    const recentResult = await pool.query(
      `SELECT * FROM orders WHERE LOWER(customer_email) = LOWER($1) ORDER BY created_at DESC LIMIT 5`,
      [email]
    );
    const recentOrders = recentResult.rows;
    for (const order of recentOrders) {
      const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
      order.items = itemsResult.rows;
    }

    res.json({
      totalOrders: total_orders,
      totalSpent: Number(total_spent),
      recentOrders: recentOrders.map(mapOrder),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Admin: change overall order status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ORDER_STATUSES.join(", ")}` });
  }

  try {
    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller: every line item that belongs to them, identity from the JWT
exports.getSellerOrders = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT oi.*, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address,
              o.status AS order_status, o.created_at AS order_created_at
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.seller_id = $1
       ORDER BY oi.created_at DESC`,
      [sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller marks one of their line items (e.g. shipped) — seller comes from the JWT now
// Seller marks one of their line items (e.g. shipped) — seller comes from the JWT now.
// Also recomputes the parent order's overall status from all its items, so the
// customer-facing order status stays in sync with per-seller item updates.
exports.updateOrderItemStatus = async (req, res) => {
  const { itemId } = req.params;
  const { status, note, estimatedDelivery, cancellationReason } = req.body;
  const sellerId = req.user.id;

  if (!ITEM_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ITEM_STATUSES.join(", ")}` });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const currentResult = await client.query(
      "SELECT * FROM order_items WHERE id = $1 AND seller_id = $2 FOR UPDATE",
      [itemId, sellerId]
    );
    if (currentResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Item not found for this seller" });
    }
    const currentItem = currentResult.rows[0];

    if (currentItem.item_status === "cancelled") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "This item is already cancelled and can't be changed" });
    }

    const isNewlyCancelled = status === "cancelled";

    const itemResult = await client.query(
      `UPDATE order_items SET
         item_status = $1,
         carrier_note = $2,
         estimated_delivery = $3,
         cancellation_reason = $4,
         updated_at = NOW()
       WHERE id = $5 AND seller_id = $6
       RETURNING *`,
      [status, note || null, estimatedDelivery || null, isNewlyCancelled ? (cancellationReason || null) : null, itemId, sellerId]
    );
    const updatedItem = itemResult.rows[0];

    if (isNewlyCancelled) {
      await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [updatedItem.quantity, updatedItem.product_id]);
      if (updatedItem.variant_id) {
        await client.query("UPDATE product_variants SET stock = stock + $1 WHERE id = $2", [updatedItem.quantity, updatedItem.variant_id]);
      }
    }

    await client.query(
      "INSERT INTO order_item_status_history (order_item_id, status, note) VALUES ($1, $2, $3)",
      [itemId, status, note || null]
    );

    const allItemsResult = await client.query(
      "SELECT item_status FROM order_items WHERE order_id = $1",
      [updatedItem.order_id]
    );
    const statuses = allItemsResult.rows.map((r) => r.item_status);

    let newOrderStatus;
    if (statuses.every((s) => s === "cancelled")) {
      newOrderStatus = "cancelled";
    } else if (statuses.every((s) => s === "delivered")) {
      newOrderStatus = "completed";
    } else if (statuses.some((s) => s !== "pending")) {
      newOrderStatus = "processing";
    } else {
      newOrderStatus = "pending";
    }

    await client.query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
      [newOrderStatus, updatedItem.order_id]
    );

    await client.query("COMMIT");
    res.json({ ...updatedItem, order_status: newOrderStatus });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

// Buyer or seller (whoever owns/sells this item) can view its tracking timeline
exports.getOrderItemTracking = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const itemResult = await pool.query(
      `SELECT oi.*, o.customer_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.id = $1`,
      [itemId]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    const item = itemResult.rows[0];

    const isBuyer = item.customer_id === userId;
    const isSeller = item.seller_id === userId;
    if (!isBuyer && !isSeller) {
      return res.status(404).json({ error: "Item not found" });
    }

    const historyResult = await pool.query(
      "SELECT status, note, created_at FROM order_item_status_history WHERE order_item_id = $1 ORDER BY created_at ASC",
      [itemId]
    );

    res.json({
      id: item.id,
      productName: item.product_name,
      status: item.item_status,
      carrierNote: item.carrier_note,
      estimatedDelivery: item.estimated_delivery,
      history: historyResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const CANCELLABLE_ITEM_STATUSES = ["pending", "confirmed"];

exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const customerId = req.user.id;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [id]);
    if (orderResult.rows.length === 0) {
      throw { status: 404, message: "Order not found" };
    }
    const order = orderResult.rows[0];

    if (order.customer_id !== customerId) {
      throw { status: 403, message: "You can't cancel someone else's order" };
    }
    if (order.status === "cancelled") {
      throw { status: 409, message: "Order is already cancelled" };
    }
    if (order.status === "completed") {
      throw { status: 409, message: "Completed orders can't be cancelled" };
    }

    const itemsResult = await client.query("SELECT * FROM order_items WHERE order_id = $1", [id]);
    const items = itemsResult.rows;

    const hasShippedItem = items.some((item) => !CANCELLABLE_ITEM_STATUSES.includes(item.item_status));
    if (hasShippedItem) {
      throw {
        status: 409,
        message: "This order has already shipped and can no longer be cancelled. Please request a return instead.",
      };
    }

    for (const item of items) {
      await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, item.product_id]);
      if (item.variant_id) {
        await client.query("UPDATE product_variants SET stock = stock + $1 WHERE id = $2", [item.quantity, item.variant_id]);
      }
      await client.query(
        "UPDATE order_items SET item_status = 'cancelled', updated_at = NOW() WHERE id = $1",
        [item.id]
      );
      await client.query(
        "INSERT INTO order_item_status_history (order_item_id, status, note) VALUES ($1, 'cancelled', $2)",
        [item.id, reason || null]
      );
    }

    const updatedResult = await client.query(
      "UPDATE orders SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [reason || null, id]
    );

    await client.query("COMMIT");
    res.json(updatedResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
  } finally {
    client.release();
  }
};

exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING id", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
// Seller dashboard: product + order stats scoped to this seller only
exports.getSellerDashboard = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const productStats = await pool.query(
      `SELECT COUNT(*)::int AS total_products,
              COUNT(*) FILTER (WHERE stock <= 10)::int AS low_stock_count
       FROM products WHERE seller_id = $1`,
      [sellerId]
    );
    const { total_products, low_stock_count } = productStats.rows[0];

    const orderStats = await pool.query(
      `SELECT COUNT(DISTINCT order_id)::int AS total_orders
       FROM order_items WHERE seller_id = $1`,
      [sellerId]
    );
    const { total_orders } = orderStats.rows[0];

    const lowStockItems = await pool.query(
      `SELECT id, name, image, stock FROM products WHERE seller_id = $1 AND stock <= 10 ORDER BY stock ASC LIMIT 5`,
      [sellerId]
    );

    const recentOrders = await pool.query(
      `SELECT oi.*, o.customer_name, o.status AS order_status, o.created_at AS order_created_at
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.seller_id = $1
       ORDER BY oi.created_at DESC
       LIMIT 5`,
      [sellerId]
    );

    res.json({
      totalProducts: total_products,
      totalOrders: total_orders,
      lowStockCount: low_stock_count,
      lowStockItems: lowStockItems.rows,
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller: view a single order, scoped to only their own line items within it.
// If the seller has no items in this order, treat it as not found — don't leak
// that the order exists or expose other sellers' items/revenue.
exports.getSellerOrderById = async (req, res) => {
  const sellerId = req.user.id;
  const { id } = req.params;
  try {
    const itemsResult = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1 AND seller_id = $2 ORDER BY id",
      [id, sellerId]
    );
    if (itemsResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    const order = orderResult.rows[0];
    const items = itemsResult.rows;
    const sellerSubtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    res.json({
      id: order.id,
      orderNumber: order.id,
      customerName: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      paymentMethod: order.payment_method,
      status: order.status,
      createdAt: order.created_at,
      sellerSubtotal,
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// (update the const at the top of the file to include "returned")

// Buyer: request a return on a delivered item they own
exports.createReturnRequest = async (req, res) => {
  const { itemId } = req.params;
  const { reason } = req.body;
  const customerId = req.user.id;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ error: "A reason is required" });
  }

  try {
    const itemResult = await pool.query(
      `SELECT oi.*, o.customer_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.id = $1`,
      [itemId]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    const item = itemResult.rows[0];

    if (item.customer_id !== customerId) {
      return res.status(403).json({ error: "You can't request a return on someone else's order" });
    }
    if (item.item_status !== "delivered") {
      return res.status(409).json({ error: "Only delivered items can be returned" });
    }

    const insertResult = await pool.query(
      `INSERT INTO order_item_returns (order_item_id, customer_id, seller_id, reason)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [itemId, customerId, item.seller_id, reason.trim()]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "A return request is already pending for this item" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller: list return requests for their items
exports.getSellerReturns = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT r.*, oi.product_name, oi.quantity, oi.subtotal, o.customer_name
       FROM order_item_returns r
       JOIN order_items oi ON oi.id = r.order_item_id
       JOIN orders o ON o.id = oi.order_id
       WHERE r.seller_id = $1
       ORDER BY r.created_at DESC`,
      [sellerId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller: approve or reject a return request
exports.resolveReturnRequest = async (req, res) => {
  const { returnId } = req.params;
  const { decision, resolutionNote } = req.body; // decision: "approved" | "rejected"
  const sellerId = req.user.id;

  if (!["approved", "rejected"].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'approved' or 'rejected'" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const returnResult = await client.query(
      "SELECT * FROM order_item_returns WHERE id = $1 AND seller_id = $2 FOR UPDATE",
      [returnId, sellerId]
    );
    if (returnResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Return request not found" });
    }
    const returnRequest = returnResult.rows[0];

    if (returnRequest.status !== "requested") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "This return request has already been resolved" });
    }

    await client.query(
      "UPDATE order_item_returns SET status = $1, resolution_note = $2, resolved_at = NOW() WHERE id = $3",
      [decision, resolutionNote || null, returnId]
    );

    if (decision === "approved") {
      const itemResult = await client.query(
        "UPDATE order_items SET item_status = 'returned', updated_at = NOW() WHERE id = $1 RETURNING *",
        [returnRequest.order_item_id]
      );
      const item = itemResult.rows[0];

      await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, item.product_id]);
      if (item.variant_id) {
        await client.query("UPDATE product_variants SET stock = stock + $1 WHERE id = $2", [item.quantity, item.variant_id]);
      }
      await client.query(
        "INSERT INTO order_item_status_history (order_item_id, status, note) VALUES ($1, 'returned', $2)",
        [item.id, resolutionNote || "Return approved"]
      );
    }

    await client.query("COMMIT");
    res.json({ message: `Return ${decision}` });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

// Buyer: leave a review on a delivered item they own
exports.createReview = async (req, res) => {
  const { itemId } = req.params;
  const { rating, comment } = req.body;
  const customerId = req.user.id;

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ error: "rating must be an integer between 1 and 5" });
  }

  try {
    const itemResult = await pool.query(
      `SELECT oi.*, o.customer_id
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.id = $1`,
      [itemId]
    );
    if (itemResult.rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    const item = itemResult.rows[0];

    if (item.customer_id !== customerId) {
      return res.status(403).json({ error: "You can't review someone else's order" });
    }
    if (item.item_status !== "delivered") {
      return res.status(409).json({ error: "You can only review items after delivery" });
    }

    const insertResult = await pool.query(
      `INSERT INTO product_reviews (order_item_id, product_id, customer_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [itemId, item.product_id, customerId, numericRating, comment || null]
    );
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "You've already reviewed this item" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller: earnings reporting (COD-based — this reflects money collected, not a real payout transfer)
exports.getSellerEarnings = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const collectedResult = await pool.query(
      `SELECT COALESCE(SUM(subtotal), 0) AS total
       FROM order_items WHERE seller_id = $1 AND item_status = 'delivered'`,
      [sellerId]
    );
    const monthResult = await pool.query(
      `SELECT COALESCE(SUM(subtotal), 0) AS total
       FROM order_items
       WHERE seller_id = $1 AND item_status = 'delivered'
       AND created_at >= date_trunc('month', NOW())`,
      [sellerId]
    );
    const pendingResult = await pool.query(
      `SELECT COALESCE(SUM(subtotal), 0) AS total
       FROM order_items
       WHERE seller_id = $1 AND item_status IN ('confirmed', 'shipped')`,
      [sellerId]
    );
    const returnedResult = await pool.query(
      `SELECT COALESCE(SUM(subtotal), 0) AS total
       FROM order_items WHERE seller_id = $1 AND item_status = 'returned'`,
      [sellerId]
    );

    res.json({
      totalCollected: Number(collectedResult.rows[0].total),
      collectedThisMonth: Number(monthResult.rows[0].total),
      pendingDelivery: Number(pendingResult.rows[0].total),
      totalReturned: Number(returnedResult.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};