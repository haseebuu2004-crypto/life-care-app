"use client";
import { MasterDashboard } from '@/screens/MasterDashboard';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Navigate } from '@/utils/routerShim';

export default function Page() {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'master') return <Navigate to="/" replace />;
    return <MasterDashboard />;
}
