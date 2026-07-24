require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PORT = 4000;

app.get("/", (req, res) => {
  res.send("God Works Company backend is running!");
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});