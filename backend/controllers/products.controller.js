const pool = require("../config/db");

exports.getAllProducts = async (req, res) => {
  try {
    const productsResult = await pool.query(
      "SELECT * FROM products WHERE seller_id IS NOT NULL",
    );
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
};

// New: needed so the order flow can look a product up by slug from the product page
exports.getProductBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const productResult = await pool.query(
      "SELECT * FROM products WHERE slug = $1",
      [slug],
    );
    if (productResult.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    const product = productResult.rows[0];

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

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

exports.createProduct = async (req, res) => {
  const sellerId = req?.user?.id; // set by authenticate + requireRole("seller") in the route
  const { name, slug, description, image, price, features, variants } =
    req.body;
  try {
    const profileResult = await pool.query(
      "SELECT shop_name FROM seller_profiles WHERE user_id = $1",
      [sellerId],
    );
    if (profileResult.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Only registered sellers can create products" });
    }
    const shopName = profileResult.rows[0].shop_name;

    const productResult = await pool.query(
      `INSERT INTO products (name, slug, description, image, seller, seller_id, price, discount, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0)
       RETURNING id`,
      [name, slug, description, image, shopName, sellerId, price],
    );

    const productId = productResult.rows[0].id;

    for (const feature of features || []) {
      if (feature.trim() !== "") {
        await pool.query(
          "INSERT INTO product_features (product_id, feature) VALUES ($1, $2)",
          [productId, feature],
        );
      }
    }

    let totalStock = 0;
    for (const variant of variants || []) {
      if (variant.color.trim() !== "" || variant.size.trim() !== "") {
        await pool.query(
          "INSERT INTO product_variants (product_id, color, size, stock) VALUES ($1, $2, $3, $4)",
          [productId, variant.color, variant.size, variant.stock],
        );
        totalStock += variant.stock;
      }
    }

    await pool.query("UPDATE products SET stock = $1 WHERE id = $2", [
      totalStock,
      productId,
    ]);

    res
      .status(201)
      .json({ id: productId, message: "Product created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
// Seller: only their own products (needed for the seller inventory/dashboard views)
exports.getMyProducts = async (req, res) => {
  const sellerId = req.user.id;
  try {
    const productsResult = await pool.query(
      "SELECT * FROM products WHERE seller_id = $1 ORDER BY id DESC",
      [sellerId],
    );
    const products = productsResult.rows;
    for (const product of products) {
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
};
