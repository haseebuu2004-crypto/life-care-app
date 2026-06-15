"use client";
import { Layout } from '../../components/Layout';
import { ProductManager } from '../../screens/ProductManager';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProductsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && user && user.role === 'user') {
            router.push('/user/sales');
        }
    }, [user, loading, router]);

    if (loading || !user || user.role === 'user') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <Layout>
            <ProductManager />
        </Layout>
    );
}
