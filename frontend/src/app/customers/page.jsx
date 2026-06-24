"use client";
import { Customers } from '@/screens/Customers';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Navigate } from '@/utils/routerShim';
import { usePermissions } from '@/hooks/usePermissions';

export default function Page() {
    const { user, loading } = useAuth();
    const perm = usePermissions();

    if (loading) return <div>Loading...</div>;
    
    if (!user) return <Navigate to="/login" replace />;
    if (!perm.isAdmin) return <Navigate to="/" replace />; // Strictly isolated to Admins
    
    return <Layout><Customers /></Layout>;
}
