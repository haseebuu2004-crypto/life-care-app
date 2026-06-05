"use client";

export const formatRupees = (paise) => {
    if (paise === null || paise === undefined) return 'Rs.0.00';
    return 'Rs.' + (paise / 100).toFixed(2);
};

export const rupeesToPaise = (rupees) => {
    return Math.round(Number(rupees) * 100);
};

export const paiseToRupees = (paise) => {
    return (paise / 100).toFixed(2);
};
