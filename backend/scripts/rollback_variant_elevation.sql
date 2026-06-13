BEGIN;

-- Drop constraints and indexes
DROP INDEX IF EXISTS unique_variant_name_per_version;
DROP INDEX IF EXISTS unique_variant_sku;

-- Drop added columns
ALTER TABLE variants DROP COLUMN IF EXISTS low_stock_threshold;
ALTER TABLE variants DROP COLUMN IF EXISTS alert_enabled;

-- Note: We do not revert SKUs as they are safe to keep.
-- Existing functionality ignores the sku column or safely ignores populated values if unused.

COMMIT;
