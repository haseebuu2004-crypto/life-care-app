const pool = require('../config/db');

async function getClubDisplayName(admin_id) {
    try {
        const res = await pool.query(`
            SELECT ac.club_name, u.email
            FROM admin_config ac
            JOIN users u ON u.id = ac.owner_id
            WHERE ac.owner_id = $1
        `, [admin_id]);

        if (res.rows.length === 0) {
            return 'Life Care';
        }

        const { club_name, email } = res.rows[0];

        if (club_name && club_name.trim() !== '') {
            return club_name.trim();
        }

        if (email) {
            return email.split('@')[0];
        }

        return 'Life Care';
    } catch (error) {
        console.error('Error fetching club display name:', error);
        return 'Life Care';
    }
}

module.exports = {
    getClubDisplayName
};
