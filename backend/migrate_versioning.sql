BEGIN;

-- 1. Add version_label to product_versions
ALTER TABLE product_versions ADD COLUMN IF NOT EXISTS version_label VARCHAR(255);
UPDATE product_versions SET version_label = '1' WHERE version_label IS NULL;
-- It is possible multiple active/inactive versions exist. If we just set '1', the UNIQUE constraint will fail if a product has >1 version!
-- We need to sequence the version labels if a product has multiple versions.
-- We can use a CTE to number them.
WITH numbered_versions AS (
    SELECT id, row_number() OVER (PARTITION BY product_id ORDER BY effective_from ASC) as rn
    FROM product_versions
)
UPDATE product_versions pv
SET version_label = nv.rn::text
FROM numbered_versions nv
WHERE pv.id = nv.id;

ALTER TABLE product_versions ALTER COLUMN version_label SET NOT NULL;
ALTER TABLE product_versions DROP CONSTRAINT IF EXISTS unique_product_version_label;
ALTER TABLE product_versions ADD CONSTRAINT unique_product_version_label UNIQUE (product_id, version_label);

-- 2. Add product_version_id to variants
ALTER TABLE variants ADD COLUMN IF NOT EXISTS product_version_id UUID REFERENCES product_versions(id) ON DELETE CASCADE;

-- 3. Map existing variants to the active (or latest) product version
UPDATE variants v
SET product_version_id = (
    SELECT id FROM product_versions pv 
    WHERE pv.product_id = v.product_id 
    AND pv.is_active = true 
    LIMIT 1
)
WHERE product_version_id IS NULL;

UPDATE variants v
SET product_version_id = (
    SELECT id FROM product_versions pv 
    WHERE pv.product_id = v.product_id 
    ORDER BY effective_from DESC 
    LIMIT 1
)
WHERE product_version_id IS NULL;

-- 4. Delete variants that couldn't be mapped to any version (e.g. orphaned)
DELETE FROM variants WHERE product_version_id IS NULL;

ALTER TABLE variants ALTER COLUMN product_version_id SET NOT NULL;

-- 5. Drop old product_id and add new constraint
ALTER TABLE variants DROP COLUMN IF EXISTS product_id CASCADE;
ALTER TABLE variants DROP CONSTRAINT IF EXISTS unique_variant_name_per_version;
-- Drop any existing unique constraint on variants
ALTER TABLE variants DROP CONSTRAINT IF EXISTS unique_product_variant_name; 
ALTER TABLE variants DROP CONSTRAINT IF EXISTS variants_product_id_name_key; -- Postgres auto-name
ALTER TABLE variants ADD CONSTRAINT unique_variant_name_per_version UNIQUE (product_version_id, name);

COMMIT;
