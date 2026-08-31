ALTER TABLE services
ADD COLUMN IF NOT EXISTS status VARCHAR(20)
NOT NULL DEFAULT 'pending'
CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE services
ADD COLUMN IF NOT EXISTS created_by INTEGER
REFERENCES users(id);