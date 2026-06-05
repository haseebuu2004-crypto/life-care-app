"use client";
export const ADMIN_EMAILS = [
    'haseeb@gmail.com'
];

export const isAdminEmail = (email) => {
    if (!email) return false;
    const normalized = String(email).trim().toLowerCase();
    return ADMIN_EMAILS.includes(normalized);
};
