CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  shipping_address TEXT NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | processing | completed | cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  variant_id INTEGER REFERENCES product_variants(id),
  product_name VARCHAR(255) NOT NULL,
  seller VARCHAR(255) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10,2) NOT NULL,
  item_status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending | confirmed | shipped | delivered | cancelled
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_seller ON order_items(seller);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
ALTER TABLE products ADD COLUMN seller_id INTEGER REFERENCES users(id);
ALTER TABLE order_items ADD COLUMN seller_id INTEGER REFERENCES users(id);
ALTER TABLE orders ADD COLUMN customer_id INTEGER REFERENCES users(id);

-- Backfill: match existing free-text seller names to seller_profiles.shop_name
UPDATE products p SET seller_id = sp.user_id
FROM seller_profiles sp
WHERE LOWER(TRIM(p.seller)) = LOWER(TRIM(sp.shop_name)) AND p.seller_id IS NULL;

UPDATE order_items oi SET seller_id = sp.user_id
FROM seller_profiles sp
WHERE LOWER(TRIM(oi.seller)) = LOWER(TRIM(sp.shop_name)) AND oi.seller_id IS NULL;

-- Run this after migrating — anything returned here didn't match and needs a manual fix
-- SELECT id, name, seller FROM products WHERE seller_id IS NULL;
CREATE TABLE IF NOT EXISTS customer_addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL DEFAULT 'Home', -- Home | Work | Other (free text, not enforced)
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  line1 VARCHAR(255) NOT NULL,
  line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  postcode VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON customer_addresses(user_id);

-- Guarantees only one default address per user at the database level —
-- app code can't accidentally leave two defaults even under a race condition.
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_one_default_per_user
  ON customer_addresses(user_id)
  WHERE is_default = true;