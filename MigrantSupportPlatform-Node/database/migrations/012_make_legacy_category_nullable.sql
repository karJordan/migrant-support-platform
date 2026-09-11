-- Allow category_id to replace the legacy text category during migration E migration.
ALTER TABLE services
ALTER COLUMN category category DROP NOT NULL;