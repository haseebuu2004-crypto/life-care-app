"use client";
import { Login } from '@/screens/Login';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/Layout';
import { Navigate } from '@/utils/routerShim';

import { Suspense } from 'react';

export default function Page() {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    
    return (
        <Suspense fallback={<div>Loading login form...</div>}>
            <Login />
        </Suspense>
    );
}
