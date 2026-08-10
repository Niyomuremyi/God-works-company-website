const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/email");
const { passwordResetEmail } = require("../utils/email/templates");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

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
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const userResult = await pool.query("SELECT id, name, email FROM users WHERE email = $1", [email]);

    // Always respond the same way whether or not the email exists —
    // otherwise this endpoint becomes a way to check which emails are registered.
    if (userResult.rows.length === 0) {
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }
    const user = userResult.rows[0];

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)",
      [user.id, tokenHash, expiresAt]
    );

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${rawToken}`;
    const { subject, html } = passwordResetEmail({ name: user.name, resetUrl });
    await sendEmail({ to: user.email, subject, html });

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ error: "Token and new password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters" });
  }

  const tokenHash = hashToken(token);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const tokenResult = await client.query(
      `SELECT * FROM password_reset_tokens
       WHERE token_hash = $1 AND used = false AND expires_at > NOW()
       FOR UPDATE`,
      [tokenHash]
    );
    if (tokenResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "This reset link is invalid or has expired" });
    }
    const resetToken = tokenResult.rows[0];

    const passwordHash = await bcrypt.hash(password, 10);
    await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, resetToken.user_id]);
    await client.query("UPDATE password_reset_tokens SET used = true WHERE id = $1", [resetToken.id]);

    // Invalidate any other outstanding reset tokens for this user too —
    // a stale link from an earlier request shouldn't still work after this.
    await client.query(
      "UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false",
      [resetToken.user_id]
    );

    await client.query("COMMIT");
    res.json({ message: "Password has been reset. You can now log in." });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  } finally {
    client.release();
  }
};