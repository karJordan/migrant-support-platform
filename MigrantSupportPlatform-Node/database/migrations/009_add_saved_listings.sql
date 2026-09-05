CREATE TABLE IF NOT EXISTS saved_listings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    listing_type VARCHAR(50) NOT NULL,
    listing_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, listing_type, listing_id)
);
