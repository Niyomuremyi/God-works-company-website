require("dotenv").config();
const { Pool } = require("pg");
const express = require("express");
const cors = require("cors");
const app = express();
const ordersRoutes = require("./routes/orders.routes");
const productsRoutes = require("./routes/products.routes");

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("God Works Company backend is running!");
});
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);

app.post("/api/products", async (req, res) => {
  const { name, slug, description, image, seller, price, features, variants } = req.body;

  try {
    const productResult = await pool.query(
      `INSERT INTO products (name, slug, description, image, seller, price, discount, stock)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 0)
       RETURNING id`,
      [name, slug, description, image, seller, price]
    );

    const productId = productResult.rows[0].id;

    for (const feature of features) {
      if (feature.trim() !== "") {
        await pool.query(
          "INSERT INTO product_features (product_id, feature) VALUES ($1, $2)",
          [productId, feature]
        );
      }
    }

    let totalStock = 0;
    for (const variant of variants) {
      if (variant.color.trim() !== "" || variant.size.trim() !== "") {
        await pool.query(
          "INSERT INTO product_variants (product_id, color, size, stock) VALUES ($1, $2, $3, $4)",
          [productId, variant.color, variant.size, variant.stock]
        );
        totalStock += variant.stock;
      }
    }

    await pool.query("UPDATE products SET stock = $1 WHERE id = $2", [totalStock, productId]);

    res.status(201).json({ id: productId, message: "Product created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
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
