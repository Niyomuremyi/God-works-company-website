const pool = require("../config/db");

const ORDER_STATUSES = ["pending", "processing", "completed", "cancelled"];
const ITEM_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

// Customer checkout
exports.createOrder = async (req, res) => {
  const { customerName, customerEmail, customerPhone, shippingAddress, paymentMethod, items } = req.body;

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
        "SELECT id, name, price, seller, stock FROM products WHERE id = $1 FOR UPDATE",
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
        price: product.price,
        quantity,
        subtotal,
      });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (customer_name, customer_email, customer_phone, shipping_address, payment_method, total_amount, status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending')
       RETURNING *`,
      [customerName, customerEmail, customerPhone || null, shippingAddress, paymentMethod || "cod", total]
    );
    const order = orderResult.rows[0];

    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, product_name, seller, price, quantity, subtotal, item_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')`,
        [order.id, item.productId, item.variantId, item.productName, item.seller, item.price, item.quantity, item.subtotal]
      );

      if (item.variantId) {
        await client.query("UPDATE product_variants SET stock = stock - $1 WHERE id = $2", [item.quantity, item.variantId]);
      }
      await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [item.quantity, item.productId]);
    }

    await client.query("COMMIT");

    const itemsResult = await pool.query("SELECT * FROM order_items WHERE order_id = $1", [order.id]);
    res.status(201).json({ ...order, items: itemsResult.rows });
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

    res.json(orders);
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
    res.json(order);
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

// Seller "command center": every line item that belongs to them, across all orders
exports.getSellerOrders = async (req, res) => {
  const { sellerName } = req.params;
  try {
    const result = await pool.query(
      `SELECT oi.*, o.customer_name, o.customer_email, o.customer_phone, o.shipping_address,
              o.status AS order_status, o.created_at AS order_created_at
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       WHERE oi.seller = $1
       ORDER BY oi.created_at DESC`,
      [sellerName]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Seller "commands" one of their line items (e.g. mark shipped)
// TODO: once login exists, get `seller` from req.user instead of the request body
exports.updateOrderItemStatus = async (req, res) => {
  const { itemId } = req.params;
  const { status, seller } = req.body;

  if (!ITEM_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${ITEM_STATUSES.join(", ")}` });
  }
  if (!seller) {
    return res.status(400).json({ error: "seller is required" });
  }

  try {
    const result = await pool.query(
      `UPDATE order_items SET item_status = $1, updated_at = NOW()
       WHERE id = $2 AND seller = $3
       RETURNING *`,
      [status, itemId, seller]
    );
    if (result.rows.length === 0) {
      // Either the item doesn't exist, or it belongs to a different seller
      return res.status(404).json({ error: "Item not found for this seller" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
// Customer/Admin: cancel — restocks everything, keeps the order as a record
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

// Admin only: hard delete — for cleaning up test/junk orders, not everyday use
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING id", [id]);
    // order_items cascade-delete automatically (ON DELETE CASCADE in the schema)
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};