CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  order_id INTEGER REFERENCES orders(id),
  buyer_last_read_at TIMESTAMP,
  seller_last_read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CHECK (product_id IS NOT NULL OR order_id IS NOT NULL)
);

-- One conversation per buyer/seller/product combo — reopening chat on the same
-- product returns the existing thread instead of creating a duplicate.
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_buyer_seller_product
  ON conversations(buyer_id, seller_id, product_id)
  WHERE product_id IS NOT NULL;

-- Same for order-initiated chats
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversation_buyer_seller_order
  ON conversations(buyer_id, seller_id, order_id)
  WHERE order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(20) NOT NULL DEFAULT 'text', -- text | image | product_ref | order_ref
  body TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);