CREATE TABLE IF NOT EXISTS order_item_status_history (
  id SERIAL PRIMARY KEY,
  order_item_id INTEGER NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  status VARCHAR(30) NOT NULL,
  note TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_item_status_history_item
  ON order_item_status_history(order_item_id, created_at);

ALTER TABLE order_items ADD COLUMN estimated_delivery DATE;
ALTER TABLE order_items ADD COLUMN carrier_note TEXT;

-- Backfill: give existing items a starting history row matching their current status,
-- so timelines aren't empty for orders already in the system.
INSERT INTO order_item_status_history (order_item_id, status, created_at)
SELECT id, item_status, created_at FROM order_items;