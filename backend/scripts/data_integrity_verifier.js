const crypto = require('crypto');
const pool = require('../shared/db/connection');

class DataIntegrityVerifier {
    async generateHash() {
        const client = await pool.pool.connect();
        try {
            const tables = ['products', 'product_versions', 'stock', 'sale_items', 'variants', 'flavours', 'variant_rollback_archive', 'sale_item_variant_archive'];
            const hashes = {};
            for (let t of tables) {
                try {
                    const res = await client.query(`SELECT * FROM ${t} ORDER BY id ASC`);
                    const str = JSON.stringify(res.rows);
                    hashes[t] = crypto.createHash('sha256').update(str).digest('hex');
                } catch(e) {
                    hashes[t] = null;
                }
            }
            const finalHash = crypto.createHash('sha256').update(JSON.stringify(hashes)).digest('hex');
            return { hashes, finalHash };
        } finally {
            client.release();
        }
    }

    async verify(hashA, hashB) {
        if (hashA === hashB) {
            console.log("PASS: Data integrity verification succeeded. Hashes match.");
            return true;
        } else {
            console.error("FAIL: Data integrity verification failed. Hashes differ.");
            return false;
        }
    }
}

module.exports = new DataIntegrityVerifier();
