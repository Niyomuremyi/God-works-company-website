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

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("God Works Company backend is running!");
});

app.get("/api/products", async (req, res) => {
  try {
    const productsResult = await pool.query("SELECT * FROM products");
    const products = productsResult.rows;

    for (const product of products) {
      const featuresResult = await pool.query(
        "SELECT feature FROM product_features WHERE product_id = $1",
        [product.id],
      );
      product.features = featuresResult.rows.map((f) => f.feature);

      const variantsResult = await pool.query(
        "SELECT id, color, size, stock FROM product_variants WHERE product_id = $1",
        [product.id],
      );
      product.variants = variantsResult.rows;
    }

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
