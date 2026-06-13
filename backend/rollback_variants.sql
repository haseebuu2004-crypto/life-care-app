BEGIN;

-- Reverse sale_items
ALTER TABLE sale_items RENAME COLUMN variant_id TO flavour_id;

-- Reverse stock
ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner_variant;
ALTER TABLE stock DROP COLUMN variant_id;

-- Restore old unique constraint
ALTER TABLE stock ADD CONSTRAINT unique_stock_version_owner UNIQUE (owner_id, product_version_id);

-- Reverse variants back to flavours
ALTER TABLE variants DROP COLUMN sku;
ALTER TABLE variants RENAME TO flavours;

-- Remove 'Standard' default flavours we added (optional, but clean for exact revert)
DELETE FROM flavours WHERE name = 'Standard';

COMMIT;
