-- Returns
CREATE TABLE IF NOT EXISTS order_item_returns (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'requested', -- requested | approved | rejected
  resolution_note TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Only one active (unresolved) return request per item at a time
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_return_per_item
  ON order_item_returns(order_item_id)
  WHERE status = 'requested';

CREATE INDEX IF NOT EXISTS idx_order_item_returns_seller ON order_item_returns(seller_id, status);

-- 'returned' becomes a valid item_status alongside the existing five
-- (no CHECK constraint currently enforces ITEM_STATUSES in the DB, so nothing to alter there —
--  just confirming the app-level array needs the new value, done below)

-- Reviews
CREATE TABLE IF NOT EXISTS product_reviews (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id INTEGER NOT NULL REFERENCES users(id),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- One review per purchased item — prevents review-bombing the same purchase twice
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_review_per_item ON product_reviews(order_item_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);