"use client";
import { useState, useEffect } from 'react';
import api from '../services/api';
import useStore from '../store/useStore';
import { Bell, Check, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fetchUnreadCount, showToast } = useStore();

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications');
            setNotifications(res.data.data || []);
            fetchUnreadCount();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            fetchUnreadCount();
        } catch (error) {
            showToast("Failed to mark notification as read", "error");
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read');
            setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
            fetchUnreadCount();
            showToast("All notifications marked as read", "success");
        } catch (error) {
            showToast("Failed to mark notifications as read", "error");
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: 30 }}>
                <h2>Notifications</h2>
                <button className="btn btn-outline" onClick={markAllAsRead} disabled={notifications.every(n => n.read_at)}>
                    <Check size={16} /> Mark all as read
                </button>
            </div>

            {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-light)' }}>Loading notifications...</div>
            ) : notifications.length === 0 ? (
                <EmptyState 
                    icon={<Bell size={48} />}
                    title="You're all caught up." 
                    message="No notifications."
                />
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    {notifications.map(n => (
                        <div key={n.id} className="card" style={{ 
                            padding: 20, 
                            borderLeft: n.read_at ? '4px solid transparent' : '4px solid #3b82f6',
                            background: n.read_at ? 'var(--card-bg)' : '#eff6ff'
                        }}>
                            <div className="flex justify-between" style={{ marginBottom: 8 }}>
                                <strong style={{ color: n.read_at ? 'var(--text-color)' : '#1e3a8a' }}>{n.title}</strong>
                                <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                                    {new Date(n.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p style={{ color: 'var(--text-color)', margin: 0, fontSize: 14, lineHeight: 1.5 }}>
                                {n.body}
                            </p>
                            {!n.read_at && (
                                <button 
                                    onClick={() => markAsRead(n.id)}
                                    style={{ 
                                        marginTop: 15, background: 'none', border: 'none', color: '#3b82f6', 
                                        fontSize: 13, fontWeight: 'bold', cursor: 'pointer', padding: 0 
                                    }}
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
