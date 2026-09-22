-- jobs
ALTER TABLE jobs
    ADD CONSTRAINT jobs_title_company_unique UNIQUE (title, company);

-- services
ALTER TABLE services
    ADD CONSTRAINT services_name_unique UNIQUE (name);

-- community_events
ALTER TABLE community_events
    ADD CONSTRAINT community_events_title_date_unique UNIQUE (title, event_date);

-- community_groups
ALTER TABLE community_groups
    ADD CONSTRAINT community_groups_name_unique UNIQUE (name);

-- resources
ALTER TABLE resources
    ADD CONSTRAINT resources_title_unique UNIQUE (title);

-- created_by columns (in case any table is missing them)
ALTER TABLE services
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

ALTER TABLE community_events
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

ALTER TABLE community_groups
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);

ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
   
-- Down Migration

ALTER TABLE jobs
    DROP CONSTRAINT IF EXISTS jobs_title_company_unique;

ALTER TABLE services
    DROP CONSTRAINT IF EXISTS services_name_unique;

ALTER TABLE community_events
    DROP CONSTRAINT IF EXISTS community_events_title_date_unique;

ALTER TABLE community_groups
    DROP CONSTRAINT IF EXISTS community_groups_name_unique;

ALTER TABLE resources
    DROP CONSTRAINT IF EXISTS resources_title_unique;