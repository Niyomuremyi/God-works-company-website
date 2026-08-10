ALTER TABLE order_items ADD COLUMN cancellation_reason TEXT;
ALTER TABLE orders ADD COLUMN cancellation_reason TEXT;