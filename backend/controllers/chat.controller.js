const pool = require("../config/db");

function mapConversation(row, userId) {
  const isBuyer = row.buyer_id === userId;
  return {
    id: row.id,
    buyerId: row.buyer_id,
    sellerId: row.seller_id,
    otherPartyName: isBuyer ? row.seller_name : row.buyer_name,
    productId: row.product_id,
    productName: row.product_name,
    orderId: row.order_id,
    lastMessage: row.last_message_body,
    lastMessageAt: row.last_message_at,
    unreadCount: Number(row.unread_count) || 0,
    updatedAt: row.updated_at,
  };
}

// List all conversations for the logged-in user (works for buyer or seller side)
exports.getMyConversations = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT c.*,
              buyer.name AS buyer_name,
              seller.name AS seller_name,
              p.name AS product_name,
              lm.body AS last_message_body,
              lm.created_at AS last_message_at,
              (
                SELECT COUNT(*) FROM messages m
                WHERE m.conversation_id = c.id
                AND m.sender_id != $1
                AND m.created_at > COALESCE(
                  CASE WHEN c.buyer_id = $1 THEN c.buyer_last_read_at ELSE c.seller_last_read_at END,
                  'epoch'
                )
              ) AS unread_count
       FROM conversations c
       JOIN users buyer ON buyer.id = c.buyer_id
       JOIN users seller ON seller.id = c.seller_id
       LEFT JOIN products p ON p.id = c.product_id
       LEFT JOIN LATERAL (
         SELECT body, created_at FROM messages
         WHERE conversation_id = c.id
         ORDER BY created_at DESC LIMIT 1
       ) lm ON true
       WHERE c.buyer_id = $1 OR c.seller_id = $1
       ORDER BY c.updated_at DESC`,
      [userId]
    );
    res.json(result.rows.map((row) => mapConversation(row, userId)));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// Find-or-create a conversation, auto-sending the product/order as the opening message.
// Called when the buyer clicks "Chat" on a product page or an order.
exports.startConversation = async (req, res) => {
  const buyerId = req.user.id;
  const { productId, orderId } = req.body;

  if (!productId && !orderId) {
    return res.status(400).json({ error: "productId or orderId is required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let sellerId, resolvedProductId = productId || null, resolvedOrderId = orderId || null;

    if (productId) {
      const productResult = await client.query("SELECT seller_id FROM products WHERE id = $1", [productId]);
      if (productResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Product not found" });
      }
      sellerId = productResult.rows[0].seller_id;
    } else {
      // Order-initiated: order can have multiple sellers, so require the item
      // to identify which seller this conversation is with.
      const { itemId } = req.body;
      if (!itemId) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "itemId is required when starting a chat from an order" });
      }
      const itemResult = await client.query(
        `SELECT oi.seller_id, oi.product_id, o.customer_id
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE oi.id = $1 AND oi.order_id = $2`,
        [itemId, orderId]
      );
      if (itemResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Order item not found" });
      }
      const item = itemResult.rows[0];
      if (item.customer_id !== buyerId) {
        await client.query("ROLLBACK");
        return res.status(403).json({ error: "You can't start a chat on someone else's order" });
      }
      sellerId = item.seller_id;
      resolvedProductId = item.product_id;
    }

    const existing = await client.query(
      resolvedOrderId
        ? "SELECT * FROM conversations WHERE buyer_id = $1 AND seller_id = $2 AND order_id = $3"
        : "SELECT * FROM conversations WHERE buyer_id = $1 AND seller_id = $2 AND product_id = $3",
      [buyerId, sellerId, resolvedOrderId || resolvedProductId]
    );

    let conversation;
    if (existing.rows.length > 0) {
      conversation = existing.rows[0];
    } else {
      const insertResult = await client.query(
        `INSERT INTO conversations (buyer_id, seller_id, product_id, order_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [buyerId, sellerId, resolvedProductId, resolvedOrderId]
      );
      conversation = insertResult.rows[0];

      // Auto-send the opening reference message only on first creation
      await client.query(
        `INSERT INTO messages (conversation_id, sender_id, type, body)
         VALUES ($1, $2, $3, $4)`,
        [
          conversation.id,
          buyerId,
          resolvedOrderId ? "order_ref" : "product_ref",
          String(resolvedOrderId || resolvedProductId),
        ]
      );
    }

    await client.query("COMMIT");
    res.status(201).json({ id: conversation.id });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

// Fetch a conversation's messages — used both for initial load and polling.
// ?after=<messageId> returns only messages newer than that id, for efficient polling.
exports.getMessages = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { after } = req.query;

  try {
    const convResult = await pool.query("SELECT * FROM conversations WHERE id = $1", [id]);
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const conversation = convResult.rows[0];

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const params = [id];
    let query = "SELECT * FROM messages WHERE conversation_id = $1";
    if (after) {
      params.push(after);
      query += " AND id > $2";
    }
    query += " ORDER BY created_at ASC";

    const messagesResult = await pool.query(query, params);
    res.json(messagesResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.sendMessage = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { body, attachmentUrl } = req.body;

  if (!body?.trim() && !attachmentUrl) {
    return res.status(400).json({ error: "Message must have text or an attachment" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const convResult = await client.query("SELECT * FROM conversations WHERE id = $1 FOR UPDATE", [id]);
    if (convResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Conversation not found" });
    }
    const conversation = convResult.rows[0];
    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Conversation not found" });
    }

    const type = attachmentUrl ? "image" : "text";
    const insertResult = await client.query(
      `INSERT INTO messages (conversation_id, sender_id, type, body, attachment_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id, userId, type, body?.trim() || null, attachmentUrl || null]
    );

    await client.query("UPDATE conversations SET updated_at = NOW() WHERE id = $1", [id]);

    await client.query("COMMIT");
    res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

// Marks the conversation as read up to now, for the calling user's side
exports.markRead = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const convResult = await pool.query("SELECT * FROM conversations WHERE id = $1", [id]);
    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const conversation = convResult.rows[0];

    if (conversation.buyer_id === userId) {
      await pool.query("UPDATE conversations SET buyer_last_read_at = NOW() WHERE id = $1", [id]);
    } else if (conversation.seller_id === userId) {
      await pool.query("UPDATE conversations SET seller_last_read_at = NOW() WHERE id = $1", [id]);
    } else {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};