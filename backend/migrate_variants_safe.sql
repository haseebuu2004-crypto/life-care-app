BEGIN;

CREATE TABLE IF NOT EXISTS variant_rollback_archive (
    id SERIAL PRIMARY KEY,
    product_version_id UUID,
    variant_id UUID,
    name VARCHAR(255),
    sku VARCHAR(255),
    archived_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_item_variant_archive (
    id SERIAL PRIMARY KEY,
    sale_item_id UUID,
    sale_id UUID,
    variant_id UUID,
    name VARCHAR(255),
    sku VARCHAR(255),
    product_version_id UUID,
    archived_at TIMESTAMP DEFAULT NOW()
);

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'flavours') THEN
        ALTER TABLE flavours RENAME TO variants;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='variants' AND column_name='sku') THEN
        ALTER TABLE variants ADD COLUMN sku VARCHAR(255);
    END IF;
END $$;

UPDATE variants v
SET sku = a.sku
FROM variant_rollback_archive a
WHERE v.id = a.variant_id AND a.sku IS NOT NULL;

INSERT INTO variants (product_id, owner_id, name)
SELECT id, owner_id, 'Standard'
FROM products p
WHERE NOT EXISTS (
    SELECT 1 FROM variants v WHERE v.product_id = p.id
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stock' AND column_name='variant_id') THEN
        ALTER TABLE stock ADD COLUMN variant_id UUID;
    END IF;
END $$;

UPDATE stock s
SET variant_id = (
    SELECT v.id
    FROM variants v
    JOIN product_versions pv ON pv.product_id = v.product_id
    WHERE pv.id = s.product_version_id
    ORDER BY v.created_at ASC
    LIMIT 1
)
WHERE variant_id IS NULL;

ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner;
ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner_variant;
ALTER TABLE stock ADD CONSTRAINT unique_stock_version_owner_variant UNIQUE (owner_id, variant_id, product_version_id);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sale_items' AND column_name='flavour_id') THEN
        ALTER TABLE sale_items RENAME COLUMN flavour_id TO variant_id;
    END IF;
END $$;

UPDATE sale_items si
SET variant_id = a.variant_id
FROM sale_item_variant_archive a
WHERE si.id = a.sale_item_id;

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
