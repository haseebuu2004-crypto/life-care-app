"use client";
import { ResetPassword } from '@/screens/ResetPassword';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Navigate } from '@/utils/routerShim';

export default function Page() {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    
    
      return <ResetPassword />;
      
}
