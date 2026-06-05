"use client";
import { Attendance } from '@/screens/Attendance';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Navigate } from '@/utils/routerShim';

export default function Page() {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    
    
      if (!user) return <Navigate to="/login" replace />;
      if (user.role === 'master') return <Navigate to="/master" replace />;
      if (user.role === 'user') return <Navigate to="/user/attendance" replace />;
      return <Layout><Attendance /></Layout>;
}
