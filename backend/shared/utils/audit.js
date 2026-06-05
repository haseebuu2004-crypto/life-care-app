const db = require('../../config/db');

exports.logAction = async (actorId, action, tableName = null, recordId = null, oldJson = null, newJson = null) => {
    try {
        await db.query(
            `INSERT INTO audit_log (actor_id, action, table_name, record_id, old_json, new_json)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                actorId, 
                action, 
                tableName, 
                recordId, 
                oldJson ? JSON.stringify(oldJson) : null, 
                newJson ? JSON.stringify(newJson) : null
            ]
        );
    } catch (e) {
        console.error("Failed to insert audit log:", e.message);
    }
};
