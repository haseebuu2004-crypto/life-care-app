"use client";
import { Notifications } from '../../screens/Notifications';
import { Layout } from '../../components/Layout';
import { ErrorBoundary } from '../../components/ErrorBoundary';

export default function NotificationsPage() {
    return (
        <ErrorBoundary>
            <Layout>
                <Notifications />
            </Layout>
        </ErrorBoundary>
    );
}
