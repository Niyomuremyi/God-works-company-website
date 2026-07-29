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
      order.items = itemsResult.rows;
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
    order.items = itemsResult.rows;
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
exports.updateOrderItemStatus = async (req, res) => {
  const { itemId } = req.params;
  const { status } = req.body;
  const sellerId = req.user.id;

  if (!ITEM_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ITEM_STATUSES.join(", ")}` });
  }

  try {
    const result = await pool.query(
      `UPDATE order_items SET item_status = $1, updated_at = NOW()
       WHERE id = $2 AND seller_id = $3
       RETURNING *`,
      [status, itemId, sellerId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Item not found for this seller" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const orderResult = await client.query("SELECT * FROM orders WHERE id = $1 FOR UPDATE", [id]);
    if (orderResult.rows.length === 0) {
      throw { status: 404, message: "Order not found" };
    }
    const order = orderResult.rows[0];

    if (order.status === "cancelled") {
      throw { status: 409, message: "Order is already cancelled" };
    }
    if (order.status === "completed") {
      throw { status: 409, message: "Completed orders can't be cancelled" };
    }

    const itemsResult = await client.query("SELECT * FROM order_items WHERE order_id = $1", [id]);

    for (const item of itemsResult.rows) {
      await client.query("UPDATE products SET stock = stock + $1 WHERE id = $2", [item.quantity, item.product_id]);
      if (item.variant_id) {
        await client.query("UPDATE product_variants SET stock = stock + $1 WHERE id = $2", [item.quantity, item.variant_id]);
      }
      await client.query("UPDATE order_items SET item_status = 'cancelled', updated_at = NOW() WHERE id = $1", [item.id]);
    }

    const updatedResult = await client.query(
      "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *",
      [id]
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
      `SELECT id, name, stock FROM products WHERE seller_id = $1 AND stock <= 10 ORDER BY stock ASC LIMIT 5`,
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