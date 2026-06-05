"use client";
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
        canAddStock:      isAdmin, // Only admin can add stock directly
        canEditStockQty:  isAdmin, // Only admin can edit stock qty directly
        
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
