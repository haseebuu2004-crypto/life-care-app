require('dotenv').config();
const { Client } = require('pg');

const sql = `
-- ATOMIC SALE CREATION
CREATE OR REPLACE FUNCTION create_sale_atomic(
  p_owner_id UUID,
  p_customer_id UUID,
  p_sale_date DATE,
  p_recorded_by UUID,
  p_items JSONB  -- array of {product_version_id, flavour_id, quantity, price_charged, standard_price_snap, vendor_price_snap}
)
RETURNS UUID AS $$
DECLARE
  v_sale_id UUID;
  v_item JSONB;
  v_rows_affected INT;
  v_qty INT;
BEGIN
  -- Insert sale header
  INSERT INTO sales (owner_id, customer_id, sale_date, recorded_by)
  VALUES (p_owner_id, p_customer_id, p_sale_date, p_recorded_by)
  RETURNING id INTO v_sale_id;

  -- Process each item
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_qty := (v_item->>'quantity')::INT;
    
    -- Atomic stock deduction
    UPDATE stock
    SET quantity = quantity - v_qty
    WHERE product_version_id = (v_item->>'product_version_id')::UUID
      AND owner_id = p_owner_id
      AND quantity >= v_qty;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;

    IF v_rows_affected = 0 THEN
      RAISE EXCEPTION 'INSUFFICIENT_STOCK:%', (v_item->>'product_version_id');
    END IF;

    -- Insert sale item
    INSERT INTO sale_items (
      sale_id, product_version_id, flavour_id, quantity,
      price_charged, standard_price_snap, vendor_price_snap
    ) VALUES (
      v_sale_id,
      (v_item->>'product_version_id')::UUID,
      NULLIF(v_item->>'flavour_id', '')::UUID,
      v_qty,
      (v_item->>'price_charged')::BIGINT,
      (v_item->>'standard_price_snap')::BIGINT,
      (v_item->>'vendor_price_snap')::BIGINT
    );
  END LOOP;

  RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;


-- ATOMIC SALE DELETION (Soft Delete + Stock Restore)
CREATE OR REPLACE FUNCTION delete_sale_restore_stock(
  p_sale_id UUID,
  p_deleted_by UUID,
  p_owner_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_item RECORD;
BEGIN
  -- Soft delete the sale
  UPDATE sales
  SET is_deleted = true, deleted_at = NOW(), deleted_by = p_deleted_by
  WHERE id = p_sale_id AND owner_id = p_owner_id AND is_deleted = false;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Restore stock for all items in this sale
  FOR v_item IN (SELECT product_version_id, quantity FROM sale_items WHERE sale_id = p_sale_id)
  LOOP
    UPDATE stock
    SET quantity = quantity + v_item.quantity
    WHERE product_version_id = v_item.product_version_id
      AND owner_id = p_owner_id;
  END LOOP;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
`;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    
    try {
        await client.connect();
        console.log("Connected to database. Running functions migration...");
        await client.query(sql);
        console.log("Functions created successfully!");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await client.end();
    }
}

run();
