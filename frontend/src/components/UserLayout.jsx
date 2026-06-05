import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from '../utils/routerShim';
import { DollarSign, Calendar, Package, Settings, LogOut, Bell, X } from 'lucide-react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import EmptyState from './EmptyState';

export function UserLayout({ children }) {
    const { fetchData, toast, clubName, fetchClubName } = useStore();
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        fetchData();
        fetchNotifications();
        fetchClubName();
        const interval = setInterval(() => {
            fetchData();
            fetchNotifications();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchData, fetchClubName]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            if (res.data.success) {
                setNotifications(res.data.data);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    const handleLogout = async () => {
        await logout();
        nav('/login');
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    const handleNotifClick = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch (e) {}
    };

    const markAllRead = async () => {
        try {
            await api.put('/notifications/read');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
        } catch (e) {}
    };

    return (
        <div className="app-container" style={{ paddingBottom: '65px' }}>
            <main className="main-content">
                <header className="topbar" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>{clubName || 'Business'}</div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>{user?.username?.split('_')[0] || 'Staff'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <button className="icon-btn" style={{ position: 'relative' }} onClick={() => setShowNotifications(!showNotifications)}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--alert-color)', color: 'white', fontSize: 10, borderRadius: '50%', padding: '2px 6px', fontWeight: 'bold' }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        <button className="icon-btn" onClick={handleLogout} style={{ color: 'var(--alert-color)' }} title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </header>

                <div style={{ padding: '16px', flex: 1 }}>{children}</div>
            </main>

            {/* Notifications Slide-out Panel */}
            {showNotifications && (
                <>
                    <div style={{ position: 'fixed', inset: 0, zIndex: 899 }} onClick={() => setShowNotifications(false)}></div>
                    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 65, width: 320, background: 'var(--card-bg)', zIndex: 900, boxShadow: '-2px 0 10px rgba(0,0,0,0.1)', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: 16, borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <h3 style={{ margin: 0 }}>Notifications</h3>
                                <button className="icon-btn" onClick={() => setShowNotifications(false)} style={{ padding: 4, display: 'flex', alignItems: 'center' }}><X size={18} /></button>
                            </div>
                            <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: 12 }} onClick={markAllRead}>Mark All Read</button>
                        </div>
                    <div style={{ flex: 1 }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: 20 }}>
                                <EmptyState
                                    icon={<Bell size={32} />}
                                    title="You're all caught up."
                                    message="No notifications."
                                />
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} onClick={() => handleNotifClick(n.id)} style={{ padding: 16, borderBottom: '1px solid var(--border-color)', borderLeft: n.read_at ? 'none' : '4px solid var(--primary-color)', cursor: 'pointer', background: n.read_at ? 'transparent' : 'var(--bg-color)' }}>
                                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{n.title}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>{n.body}</div>
                                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(n.created_at).toLocaleString()}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                </>
            )}

            {/* Bottom Navigation */}
            <nav className="bottom-nav">
                <NavLink href="/user/sales" className={({isActive}) => `bottom-nav-link ${isActive ? 'active':''}`}><DollarSign size={20}/>Sales</NavLink>
                <NavLink href="/user/attendance" className={({isActive}) => `bottom-nav-link ${isActive ? 'active':''}`}><Calendar size={20}/>Attendance</NavLink>
                <NavLink href="/user/stock" className={({isActive}) => `bottom-nav-link ${isActive ? 'active':''}`}><Package size={20}/>Stock</NavLink>
                <NavLink href="/user/settings" className={({isActive}) => `bottom-nav-link ${isActive ? 'active':''}`}><Settings size={20}/>Settings</NavLink>
            </nav>
        </div>
    );
}
