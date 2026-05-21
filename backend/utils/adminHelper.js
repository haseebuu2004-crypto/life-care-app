const ADMIN_EMAILS = [
    'haseeb@gmail.com'
];

const isAdminEmail = (email) => {
    if (!email) return false;
    const normalized = String(email).trim().toLowerCase();
    return ADMIN_EMAILS.includes(normalized);
};

module.exports = { isAdminEmail, ADMIN_EMAILS };
