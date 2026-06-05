"use client";
import { UserLayout } from '@/components/UserLayout';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from '@/utils/routerShim';

export default function Layout({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    return <UserLayout>{children}</UserLayout>;
}
