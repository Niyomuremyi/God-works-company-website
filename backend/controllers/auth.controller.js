const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, role, shopName, phone, address, tin } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields required" });
  }
  if (!["buyer", "seller"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  if (role === "seller" && (!shopName || !phone || !address || !tin)) {
    return res.status(400).json({ error: "All seller business fields are required" });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const password_hash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
      [name, email, password_hash, role]
    );
    const user = userResult.rows[0];

    if (role === "seller") {
      await client.query(
        `INSERT INTO seller_profiles (user_id, shop_name, phone, address, tin)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, shopName, phone, address, tin]
      );
    }

    await client.query("COMMIT");
    res.status(201).json(user);
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already registered" });
    }
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};

exports.login = async (req, res) => {
  console.log("Login endpoint hit");

  const { email, password } = req.body;
  console.log("Email:", email);

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    console.log("Users found:", result.rows.length);

    if (result.rows.length === 0) {
      console.log("User not found");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    console.log("User:", user.email);

    const match = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", match);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("Token created");

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};