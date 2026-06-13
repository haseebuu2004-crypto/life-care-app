const { Client } = require('pg');
require('dotenv').config({ path: './backend/.env' });

async function cleanOrphans() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    
    try {
        await client.query('BEGIN');
        console.log('Deleting orphans...');
        
        const r1 = await client.query('DELETE FROM sale_items WHERE sale_id NOT IN (SELECT id FROM sales)');
        console.log('Deleted orphaned sale_items:', r1.rowCount);
        
        const r2 = await client.query('DELETE FROM product_versions WHERE product_id NOT IN (SELECT id FROM products)');
        console.log('Deleted orphaned product_versions:', r2.rowCount);
        
        const r4 = await client.query('DELETE FROM stock WHERE product_version_id NOT IN (SELECT id FROM product_versions)');
        console.log('Deleted orphaned stock by product_versions:', r4.rowCount);
        
        const r5 = await client.query('DELETE FROM sales WHERE customer_id NOT IN (SELECT id FROM customers)');
        console.log('Deleted orphaned sales:', r5.rowCount);

        const r6 = await client.query('DELETE FROM attendance WHERE customer_id NOT IN (SELECT id FROM customers)');
        console.log('Deleted orphaned attendance:', r6.rowCount);
        
        // Add foreign keys back to prevent this from ever happening again!
        // We need to add ON DELETE CASCADE foreign keys.
        await client.query(`
            ALTER TABLE product_versions
            ADD CONSTRAINT fk_product_versions_product_id 
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        `);
        console.log('Added FK to product_versions');

        await client.query(`
            ALTER TABLE stock
            ADD CONSTRAINT fk_stock_product_version_id 
            FOREIGN KEY (product_version_id) REFERENCES product_versions(id) ON DELETE CASCADE
        `);
        console.log('Added FK to stock');

        await client.query(`
            ALTER TABLE sale_items
            ADD CONSTRAINT fk_sale_items_sale_id 
            FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
        `);
        console.log('Added FK to sale_items');

        await client.query(`
            ALTER TABLE sales
            ADD CONSTRAINT fk_sales_customer_id 
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        `);
        console.log('Added FK to sales');

        await client.query(`
            ALTER TABLE attendance
            ADD CONSTRAINT fk_attendance_customer_id 
            FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
        `);
        console.log('Added FK to attendance');
        
        await client.query('COMMIT');
        console.log('Successfully completed database integrity fix!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('Error during execution:', e);
    } finally {
        await client.end();
    }
}

cleanOrphans();
