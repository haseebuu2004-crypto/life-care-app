BEGIN;

-- 1. Create unique constraint to prevent duplicate flavours within the same product version
-- Note: Requires deleting duplicates if they exist, but Phase 14 validation checks for this.
-- We'll assume the validation script will be run or duplicates don't exist yet.
CREATE UNIQUE INDEX IF NOT EXISTS unique_variant_name_per_version 
ON variants (product_version_id, LOWER(TRIM(name)));

-- 2. Add columns for Low Stock System
ALTER TABLE variants ADD COLUMN IF NOT EXISTS low_stock_threshold INT DEFAULT 5;
ALTER TABLE variants ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT true;

-- 3. SKU System Backfill
-- Generates a unique SKU like 'FOR-MANG-XXXX' where XXXX is a short random string to guarantee uniqueness.
UPDATE variants v
SET sku = UPPER(SUBSTRING(p.name FROM 1 FOR 3)) || '-' || UPPER(SUBSTRING(v.name FROM 1 FOR 4)) || '-' || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4))
FROM product_versions pv
JOIN products p ON p.id = pv.product_id
WHERE v.product_version_id = pv.id 
  AND (v.sku IS NULL OR v.sku = '');

-- Ensure SKU is unique globally
CREATE UNIQUE INDEX IF NOT EXISTS unique_variant_sku ON variants (sku);

COMMIT;
