const pool = require("../config/db");

function mapAddress(row) {
  return {
    id: row.id,
    label: row.label,
    name: row.full_name,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    postcode: row.postcode,
    country: row.country,
    isDefault: row.is_default,
    createdAt: row.created_at,
  };
}

exports.getAddresses = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT * FROM customer_addresses WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );
    res.json(result.rows.map(mapAddress));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.createAddress = async (req, res) => {
  const userId = req.user.id;
  const { label, name, phone, line1, line2, city, postcode, country, isDefault } = req.body;

  if (!name || !line1 || !city || !country) {
    return res.status(400).json({ error: "name, line1, city and country are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const countResult = await client.query(
      "SELECT COUNT(*)::int AS count FROM customer_addresses WHERE user_id = $1",
      [userId]
    );
    const isFirstAddress = countResult.rows[0].count === 0;
    const shouldBeDefault = isFirstAddress || !!isDefault;

    if (shouldBeDefault) {
      await client.query(
        "UPDATE customer_addresses SET is_default = false WHERE user_id = $1 AND is_default = true",
        [userId]
      );
    }

    const insertResult = await client.query(
      `INSERT INTO customer_addresses
        (user_id, label, full_name, phone, line1, line2, city, postcode, country, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [userId, label || "Home", name, phone || null, line1, line2 || null, city, postcode || null, country, shouldBeDefault]
    );

    await client.query("COMMIT");
    res.status(201).json(mapAddress(insertResult.rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

exports.updateAddress = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { label, name, phone, line1, line2, city, postcode, country, isDefault } = req.body;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const existingResult = await client.query(
      "SELECT * FROM customer_addresses WHERE id = $1 AND user_id = $2 FOR UPDATE",
      [id, userId]
    );
    if (existingResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Address not found" });
    }

    if (isDefault) {
      await client.query(
        "UPDATE customer_addresses SET is_default = false WHERE user_id = $1 AND is_default = true AND id != $2",
        [userId, id]
      );
    }

    const updateResult = await client.query(
      `UPDATE customer_addresses SET
        label = COALESCE($1, label),
        full_name = COALESCE($2, full_name),
        phone = $3,
        line1 = COALESCE($4, line1),
        line2 = $5,
        city = COALESCE($6, city),
        postcode = $7,
        country = COALESCE($8, country),
        is_default = COALESCE($9, is_default),
        updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [label, name, phone, line1, line2, city, postcode, country, isDefault, id, userId]
    );

    await client.query("COMMIT");
    res.json(mapAddress(updateResult.rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

exports.deleteAddress = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const deleteResult = await client.query(
      "DELETE FROM customer_addresses WHERE id = $1 AND user_id = $2 RETURNING is_default",
      [id, userId]
    );
    if (deleteResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Address not found" });
    }

    const wasDefault = deleteResult.rows[0].is_default;
    if (wasDefault) {
      // Promote the most recently added remaining address to default,
      // so a user never ends up with saved addresses but no default.
      await client.query(
        `UPDATE customer_addresses SET is_default = true
         WHERE id = (
           SELECT id FROM customer_addresses
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 1
         )`,
        [userId]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Address deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};