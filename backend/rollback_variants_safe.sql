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
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'variants') THEN
        TRUNCATE TABLE variant_rollback_archive;
        INSERT INTO variant_rollback_archive (product_version_id, variant_id, name, sku)
        SELECT pv.id, v.id, v.name, v.sku 
        FROM variants v
        JOIN product_versions pv ON pv.product_id = v.product_id;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sale_items' AND column_name='variant_id') AND
       EXISTS (SELECT FROM pg_tables WHERE tablename = 'variants') THEN
        TRUNCATE TABLE sale_item_variant_archive;
        INSERT INTO sale_item_variant_archive (sale_item_id, sale_id, variant_id, name, sku, product_version_id)
        SELECT si.id, si.sale_id, v.id, v.name, v.sku, si.product_version_id
        FROM sale_items si
        JOIN variants v ON si.variant_id = v.id;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='stock' AND column_name='variant_id') THEN
        CREATE TEMP TABLE temp_consolidated_stock ON COMMIT DROP AS
        SELECT MIN(id) as keep_id, owner_id, product_version_id, SUM(quantity) as merged_qty
        FROM stock 
        GROUP BY owner_id, product_version_id;

        UPDATE stock s
        SET quantity = t.merged_qty
        FROM temp_consolidated_stock t
        WHERE s.id = t.keep_id;

        DELETE FROM stock WHERE id NOT IN (SELECT keep_id FROM temp_consolidated_stock);
        
        ALTER TABLE stock DROP CONSTRAINT IF EXISTS unique_stock_version_owner_variant;
        ALTER TABLE stock DROP COLUMN variant_id;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'unique_stock_version_owner'
    ) THEN
        ALTER TABLE stock ADD CONSTRAINT unique_stock_version_owner UNIQUE (owner_id, product_version_id);
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sale_items' AND column_name='variant_id') THEN
        ALTER TABLE sale_items RENAME COLUMN variant_id TO flavour_id;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'variants') THEN
        ALTER TABLE variants DROP COLUMN IF EXISTS sku;
        ALTER TABLE variants RENAME TO flavours;
    END IF;
END $$;

COMMIT;
