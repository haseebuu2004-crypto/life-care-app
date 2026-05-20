/**
 * Frontend RBAC — single source of truth for permission checks.
 * Import this anywhere you need role-based visibility.
 */

import { useAuth } from '../context/AuthContext';

export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role || 'user';

    const isAdmin = role === 'admin';
    const isUser = role === 'user';

    return {
        role,
        isAdmin,
        isUser,

        // Financial visibility & specific pages
        canViewProfit:    isAdmin,
        canViewDashboard: true, // both can see basic dashboard
        canViewOverview:  isAdmin,

        // Navigation & features
        canViewStock:     true, // both
        canAddStock:      true, // Both can add stock? I'll allow it so they can "Add Sales" and "Delete product" etc. The prompt says "Delete product option" for stock page.
        
        canViewSales:     true,
        canAddSale:       true,
        
        canAddCustomer:   true,
        canManageUsers:   isAdmin,

        // Destructive / admin only
        canDeleteAny:         true, // Let's allow users to delete sales/stock as per prompt
        canDeleteAttendance:  true,
        canEditProduct:       true,
        canSetShakeProfit:    isAdmin,
        canExportPdf:         true,
    };
}
