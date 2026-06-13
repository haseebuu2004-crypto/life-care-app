BEGIN;

CREATE TABLE IF NOT EXISTS variants_migration_archive AS SELECT * FROM variants;
CREATE TABLE IF NOT EXISTS product_versions_migration_archive AS SELECT * FROM product_versions;
CREATE TABLE IF NOT EXISTS products_migration_archive AS SELECT * FROM products;
CREATE TABLE IF NOT EXISTS stock_migration_archive AS SELECT * FROM stock;
CREATE TABLE IF NOT EXISTS sale_items_migration_archive AS SELECT * FROM sale_items;

ALTER TABLE products RENAME COLUMN name TO product_group;
ALTER TABLE products ADD COLUMN IF NOT EXISTS flavor VARCHAR(255);

CREATE TEMP TABLE temp_new_products (
    old_product_id UUID,
    flavor VARCHAR(255),
    new_product_id UUID DEFAULT gen_random_uuid(),
    is_base_product BOOLEAN DEFAULT FALSE
);

INSERT INTO temp_new_products (old_product_id, flavor)
SELECT DISTINCT pv.product_id, COALESCE(v.name, 'Standard')
FROM product_versions pv
LEFT JOIN variants v ON v.product_version_id = pv.id;

WITH BaseFlavors AS (
    SELECT old_product_id, MIN(flavor) as base_flavor
    FROM temp_new_products
    GROUP BY old_product_id
)
UPDATE temp_new_products tnp
SET is_base_product = TRUE, new_product_id = old_product_id
FROM BaseFlavors bf
WHERE tnp.old_product_id = bf.old_product_id AND tnp.flavor = bf.base_flavor;

UPDATE products p
SET flavor = tnp.flavor
FROM temp_new_products tnp
WHERE p.id = tnp.old_product_id AND tnp.is_base_product = TRUE;

INSERT INTO products (id, owner_id, product_group, created_at, flavor)
SELECT tnp.new_product_id, p.owner_id, p.product_group, p.created_at, tnp.flavor
FROM temp_new_products tnp
JOIN products p ON p.id = tnp.old_product_id
WHERE tnp.is_base_product = FALSE;

CREATE TEMP TABLE temp_new_versions (
    old_pv_id UUID,
    variant_id UUID,
    flavor VARCHAR(255),
    new_product_id UUID,
    new_pv_id UUID DEFAULT gen_random_uuid(),
    is_base_version BOOLEAN DEFAULT FALSE
);

INSERT INTO temp_new_versions (old_pv_id, variant_id, flavor, new_product_id)
SELECT pv.id, v.id, COALESCE(v.name, 'Standard'), tnp.new_product_id
FROM product_versions pv
LEFT JOIN variants v ON v.product_version_id = pv.id
JOIN temp_new_products tnp ON tnp.old_product_id = pv.product_id AND tnp.flavor = COALESCE(v.name, 'Standard');

UPDATE temp_new_versions tnv
SET is_base_version = TRUE, new_pv_id = old_pv_id
FROM temp_new_products tnp
WHERE tnv.new_product_id = tnp.new_product_id AND tnp.is_base_product = TRUE;

INSERT INTO product_versions (id, product_id, vendor_price, is_active, effective_from, effective_to, created_by, volume_points, version_label)
SELECT tnv.new_pv_id, tnv.new_product_id, pv.vendor_price, pv.is_active, pv.effective_from, pv.effective_to, pv.created_by, pv.volume_points, pv.version_label
FROM temp_new_versions tnv
JOIN product_versions pv ON pv.id = tnv.old_pv_id
WHERE tnv.is_base_version = FALSE;

UPDATE stock s
SET product_version_id = tnv.new_pv_id
FROM temp_new_versions tnv
WHERE (s.variant_id = tnv.variant_id AND tnv.variant_id IS NOT NULL)
   OR (s.product_version_id = tnv.old_pv_id AND s.variant_id IS NULL AND tnv.variant_id IS NULL);

UPDATE sale_items si
SET product_version_id = tnv.new_pv_id
FROM temp_new_versions tnv
WHERE (si.variant_id = tnv.variant_id AND tnv.variant_id IS NOT NULL)
   OR (si.product_version_id = tnv.old_pv_id AND si.variant_id IS NULL AND tnv.variant_id IS NULL);

ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner_variant;
ALTER TABLE stock DROP COLUMN IF EXISTS variant_id;

ALTER TABLE sale_items DROP COLUMN IF EXISTS variant_id;

DROP TABLE IF EXISTS variants;

COMMIT;
