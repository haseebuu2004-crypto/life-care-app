import { format } from 'date-fns';

/**
 * Formats an ISO date string or Date object to dd/MM/yyyy
 * @param {string|Date} dateInput 
 * @returns {string} Formatted date string
 */
export function formatDate(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        // Verify it's a valid date
        if (isNaN(date.getTime())) return 'Invalid Date';
        return format(date, 'dd/MM/yyyy');
    } catch (e) {
        return 'Invalid Date';
    }
}

/**
 * Formats an ISO date string or Date object to dd/MM/yyyy HH:mm
 * @param {string|Date} dateInput 
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(dateInput) {
    if (!dateInput) return 'N/A';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) return 'Invalid Date';
        return format(date, 'dd/MM/yyyy HH:mm');
    } catch (e) {
        return 'Invalid Date';
    }
}
