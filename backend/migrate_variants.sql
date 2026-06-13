BEGIN;

-- 1. Rename existing 'flavours' table to 'variants' and add SKU
ALTER TABLE flavours RENAME TO variants;
ALTER TABLE variants ADD COLUMN sku VARCHAR(255);

-- 2. Ensure EVERY product has at least one variant
INSERT INTO variants (product_id, owner_id, name)
SELECT id, owner_id, 'Standard'
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM variants v WHERE v.product_id = p.id
);

-- 3. Update stock table to track variant_id
ALTER TABLE stock ADD COLUMN variant_id UUID REFERENCES variants(id) ON DELETE CASCADE;

-- Map existing stock to the first available variant for the corresponding product
UPDATE stock s
SET variant_id = (
    SELECT v.id
    FROM variants v
    JOIN product_versions pv ON pv.product_id = v.product_id
    WHERE pv.id = s.product_version_id
    ORDER BY v.created_at ASC
    LIMIT 1
);

-- Ensure variant_id is not null for future queries
ALTER TABLE stock ALTER COLUMN variant_id SET NOT NULL;

-- 4. Update Unique Constraints on Stock
ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner;

-- Add new constraint
ALTER TABLE stock ADD CONSTRAINT unique_stock_version_owner_variant UNIQUE (owner_id, variant_id, product_version_id);

-- 5. Update sale_items table
ALTER TABLE sale_items RENAME COLUMN flavour_id TO variant_id;

-- Ensure all sale items have a variant_id
UPDATE sale_items si
SET variant_id = (
    SELECT v.id
    FROM variants v
    JOIN product_versions pv ON pv.product_id = v.product_id
    WHERE pv.id = si.product_version_id
    ORDER BY v.created_at ASC
    LIMIT 1
)
WHERE variant_id IS NULL;

COMMIT;
