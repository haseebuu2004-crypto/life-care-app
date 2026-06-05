const db = require('../db');
const audit = require('../services/auditLogService');

exports.importCSV = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const { type } = req.body; // 'customers', 'products'
        
        if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
        if (!['customers', 'products'].includes(type)) return res.status(400).json({ success: false, message: "Invalid type" });

        const csvString = req.file.buffer.toString('utf8');
        const lines = csvString.split('\n').map(l => l.trim()).filter(l => l);
        
        if (lines.length <= 1) return res.status(400).json({ success: false, message: "Empty CSV or only headers found." });

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            let importedCount = 0;
            let missingIdCount = 0;

            if (type === 'customers') {
                const idIdx = headers.indexOf('id');
                const nameIdx = headers.indexOf('name');
                const phoneIdx = headers.indexOf('phone');
                
                if (nameIdx === -1) throw new Error("CSV must contain a 'name' column");

                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.trim());
                    if (!cols[nameIdx]) continue; // skip empty names

                    const name = cols[nameIdx];
                    const phone = phoneIdx !== -1 ? cols[phoneIdx] : null;
                    const id = idIdx !== -1 ? cols[idIdx] : null;

                    if (id) {
                        const existing = await client.query(`SELECT id FROM customers WHERE id = $1 AND owner_id = $2`, [id, ownerId]);
                        if (existing.rows.length > 0) {
                            await client.query(`UPDATE customers SET name = $1, phone = $2 WHERE id = $3`, [name, phone, id]);
                        } else {
                            await client.query(
                                `INSERT INTO customers (id, owner_id, name, phone) VALUES ($1, $2, $3, $4)`,
                                [id, ownerId, name, phone]
                            );
                        }
                    } else {
                        missingIdCount++;
                        await client.query(
                            `INSERT INTO customers (owner_id, name, phone) VALUES ($1, $2, $3)`,
                            [ownerId, name, phone]
                        );
                    }
                    importedCount++;
                }
            } else if (type === 'products') {
                const nameIdx = headers.indexOf('name');
                const vpIdx = headers.indexOf('vendor_price');
                const qtyIdx = headers.indexOf('stock_quantity');
                
                if (nameIdx === -1 || vpIdx === -1) {
                    throw new Error("CSV must contain 'name' and 'vendor_price' columns");
                }

                for (let i = 1; i < lines.length; i++) {
                    const cols = lines[i].split(',').map(c => c.trim());
                    if (!cols[nameIdx]) continue;

                    const name = cols[nameIdx];
                    const vp = Math.round(Number(cols[vpIdx]) * 100);
                    const qty = qtyIdx !== -1 ? parseInt(cols[qtyIdx]) || 0 : 0;

                    // Create product
                    const prodRes = await client.query(
                        `INSERT INTO products (owner_id, name) VALUES ($1, $2) RETURNING id`,
                        [ownerId, name]
                    );
                    const productId = prodRes.rows[0].id;

                    // Create version
                    const pvRes = await client.query(
                        `INSERT INTO product_versions (product_id, vendor_price, created_by) VALUES ($1, $2, $3) RETURNING id`,
                        [productId, vp, req.user.id]
                    );
                    const versionId = pvRes.rows[0].id;

                    // Auto-create stock
                    await client.query(
                        `INSERT INTO stock (product_version_id, owner_id, quantity, vendor_price_snap, added_by) VALUES ($1, $2, $3, $4, $5)`,
                        [versionId, ownerId, qty, vp, req.user.id]
                    );
                    importedCount++;
                }
            }

            await client.query('COMMIT');
            client.release();
            
            await audit.logAction(req.user.id, 'IMPORT_CSV', type, null);
            
            if (type === 'customers' && missingIdCount > 0) {
                return res.json({
                    success: true,
                    imported: importedCount,
                    warning: `${missingIdCount} customers were imported without an ID. Check the Members section for potential duplicates.`
                });
            }

            res.json({ success: true, imported: importedCount, message: `Bulk import for ${type} successful.` });
        } catch (e) {
            await client.query('ROLLBACK');
            client.release();
            console.error("CSV Import Error:", e);
            res.status(500).json({ success: false, message: e.message || "Import failed. Transaction rolled back." });
        }
    } catch (e) {
        console.error("CSV Import Error:", e);
        res.status(500).json({ success: false, message: e.message || "Import failed. Transaction rolled back." });
    }
};
