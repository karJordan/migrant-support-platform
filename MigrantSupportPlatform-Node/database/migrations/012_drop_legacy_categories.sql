-- Legacy text values are removed; category_id remains the category reference.
ALTER TABLE services DROP COLUMN category;
ALTER TABLE resources DROP COLUMN category;
ALTER TABLE community_groups DROP COLUMN category;
