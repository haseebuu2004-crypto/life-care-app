BEGIN;

-- Restore variants table
CREATE TABLE IF NOT EXISTS variants AS SELECT * FROM variants_migration_archive;

-- Drop flavor from products and revert to name
ALTER TABLE products DROP COLUMN IF EXISTS flavor;
ALTER TABLE products RENAME COLUMN product_group TO name;

-- Restore products table (delete newly created ones, update base ones back to original state if needed, though they already have the right name)
TRUNCATE TABLE products;
INSERT INTO products SELECT * FROM products_migration_archive;

-- Restore product_versions table
TRUNCATE TABLE product_versions;
INSERT INTO product_versions SELECT * FROM product_versions_migration_archive;

-- Restore stock table (including variant_id)
ALTER TABLE stock ADD COLUMN IF NOT EXISTS variant_id UUID;
TRUNCATE TABLE stock;
INSERT INTO stock SELECT * FROM stock_migration_archive;

-- Restore sale_items table
ALTER TABLE sale_items ADD COLUMN IF NOT EXISTS variant_id UUID;
TRUNCATE TABLE sale_items;
INSERT INTO sale_items SELECT * FROM sale_items_migration_archive;

-- Drop archives
DROP TABLE IF EXISTS variants_migration_archive;
DROP TABLE IF EXISTS product_versions_migration_archive;
DROP TABLE IF EXISTS products_migration_archive;
DROP TABLE IF EXISTS stock_migration_archive;
DROP TABLE IF EXISTS sale_items_migration_archive;

COMMIT;
