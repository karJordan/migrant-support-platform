-- Allow category_id to replace the legacy text category during migration.
ALTER TABLE services
ALTER COLUMN category DROP NOT NULL;