"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from "@/utils/routerShim";
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, Users, Activity, Eye, EyeOff, ChevronDown, ChevronRight, Key, Trash2, LogOut, CheckCircle, AlertTriangle } from 'lucide-react';

export function MasterDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ total_admins: 0, total_users: 0, active_users: 0 });
    const [adminsList, setAdminsList] = useState([]);
    const [liveSessions, setLiveSessions] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    const [logFilterAction, setLogFilterAction] = useState('');
    const [logFilterAdmin, setLogFilterAdmin] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [expandedRows, setExpandedRows] = useState({});
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    
    // Inline Edit State
    const [editingClubId, setEditingClubId] = useState(null);
    const [editClubName, setEditClubName] = useState('');

    const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

    const loadData = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        else setRefreshing(true);
        
        try {
            const [st, ls, al, ad] = await Promise.all([
                api.get('/master/stats'),
                api.get('/master/sessions'),
                api.get('/master/audit-log'),
                api.get('/master/admins')
            ]);
            if (st.data.success) setStats(st.data.stats);
            if (ls.data.success) setLiveSessions(ls.data.data);
            if (al.data.success) setActivityLog(al.data.data);
            if (ad.data.success) setAdminsList(ad.data.data);
        } catch (err) {
            console.error("Failed to load master data", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'master') {
            loadData();
            const interval = setInterval(() => loadData(true), 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleCreateAdmin = async (e) => {
        e.preventDefault();
        setMsg(''); setError('');
        try {
            const data = await api.post('/master/admins', { email: newAdminEmail });
            setMsg('Admin created successfully! Temp Password: ' + data.data.tempPassword);
            setNewAdminEmail('');
            loadData(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create admin');
        }
    };

    const handleResetPassword = async (id, isUserRow = false) => {
        if (!window.confirm(`Force password reset for this ${isUserRow ? 'user' : 'admin'}?`)) return;
        try {
            const res = await api.post(`/master/admins/${id}/reset-password`);
            alert(`Password reset successfully! Temporary Password: ${res.data.tempPassword}`);
            loadData(true);
        } catch (err) {
            alert('Failed to reset password');
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this account?`)) return;
        try {
            await api.put(`/master/admins/${id}/toggle-status`);
            loadData(true);
        } catch (err) {
            alert('Failed to toggle status');
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            await api.delete(`/master/admins/${deleteTarget.id}`);
            setDeleteTarget(null);
            loadData(true);
        } catch (err) {
            alert('Failed to delete account');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleSaveClubName = async (id) => {
        try {
            await api.put(`/master/admins/${id}/club-name`, { club_name: editClubName });
            setEditingClubId(null);
            loadData(true);
            alert('Club name updated successfully');
        } catch (err) {
            alert('Failed to update club name');
        }
    };

    if (!user || user.role !== 'master') return null;

    const onlineNow = liveSessions.filter(s => s.status === 'Online').length;
    
    const activeToday = useMemo(() => {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const activeRecent = liveSessions.filter(s => new Date(s.lastActivity).getTime() > oneDayAgo);
        const uniqueUsers = new Set(activeRecent.map(s => s.email));
        return uniqueUsers.size;
    }, [liveSessions]);
    
    const totalAccounts = stats.total_admins + stats.total_users;

    const filteredLogs = activityLog.filter(log => {
        if (logFilterAction && log.action !== logFilterAction) return false;
        if (logFilterAdmin && !log.actor_email?.includes(logFilterAdmin)) return false;
        return true;
    });

    const uniqueActions = [...new Set(activityLog.map(l => l.action))];

    const styles = {
        container: { minHeight: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'Inter, sans-serif', padding: '40px 20px' },
        wrapper: { maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '20px' },
        headerTitle: { display: 'flex', alignItems: 'center', gap: '15px', fontSize: '28px', fontWeight: 'bold', color: '#ffffff' },
        logoutBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
        tabs: { display: 'flex', gap: '10px', borderBottom: '1px solid #334155', paddingBottom: '10px' },
        tabBtn: (active) => ({ padding: '10px 20px', border: 'none', background: 'transparent', color: active ? '#38bdf8' : '#94a3b8', borderBottom: active ? '2px solid #38bdf8' : 'none', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', fontSize: '16px' }),
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' },
        card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)' },
        cardValue: { fontSize: '40px', fontWeight: 'bold', color: '#ffffff', marginTop: '10px' },
        cardLabel: { color: '#94a3b8', fontWeight: '600', fontSize: '14px' },
        panel: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' },
        panelHeader: { padding: '20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#162032' },
        panelTitle: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: 'bold', color: '#ffffff' },
        table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
        th: { padding: '15px 20px', color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', borderBottom: '1px solid #334155', backgroundColor: '#0f172a' },
        td: { padding: '15px 20px', color: '#f1f5f9', borderBottom: '1px solid #334155', fontSize: '14px' },
        input: { padding: '12px 16px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#f1f5f9', borderRadius: '8px', outline: 'none', width: '300px' },
        btnPrimary: { padding: '12px 24px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
        badge: (color, bg) => ({ padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', backgroundColor: bg, color: color }),
        iconBtn: (color) => ({ background: 'transparent', border: 'none', color: color, cursor: 'pointer', padding: '5px' })
    };

    return (
        <div style={styles.container}>
            <div style={styles.wrapper}>
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        <Shield size={32} color="#3b82f6" />
                        Master Control Panel
                    </div>
                    <button style={styles.logoutBtn} onClick={handleLogout}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>

                <div style={styles.tabs}>
                    <button style={styles.tabBtn(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>Admin Management</button>
                    <button style={styles.tabBtn(activeTab === 'live')} onClick={() => setActiveTab('live')}>Live Status</button>
                    <button style={styles.tabBtn(activeTab === 'activity')} onClick={() => setActiveTab('activity')}>Activity Log</button>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '50px' }}>Loading master data...</div>
                ) : (
                    <>
                        {activeTab === 'overview' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={styles.grid}>
                                    <div style={styles.card}>
                                        <Shield size={32} color="#818cf8" />
                                        <div style={styles.cardValue}>{stats.total_admins}</div>
                                        <div style={styles.cardLabel}>Total Admins</div>
                                    </div>
                                    <div style={styles.card}>
                                        <Users size={32} color="#34d399" />
                                        <div style={styles.cardValue}>{stats.total_users}</div>
                                        <div style={styles.cardLabel}>Total Staff Users</div>
                                    </div>
                                    <div style={styles.card}>
                                        <Activity size={32} color="#60a5fa" />
                                        <div style={styles.cardValue}>{stats.active_users}</div>
                                        <div style={styles.cardLabel}>Active App Sessions</div>
                                    </div>
                                </div>

                                <div style={{ ...styles.panel, padding: '20px' }}>
                                    <h2 style={{ ...styles.panelTitle, marginBottom: '20px' }}><Shield size={24} color="#60a5fa" /> Provision New Admin</h2>
                                    {msg && <div style={{ padding: '15px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', borderRadius: '8px', marginBottom: '20px' }}>{msg}</div>}
                                    {error && <div style={{ padding: '15px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: '8px', marginBottom: '20px' }}>{error}</div>}
                                    <form onSubmit={handleCreateAdmin} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '13px', color: '#94a3b8' }}>Admin Email Address</label>
                                            <input type="email" required value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} style={styles.input} />
                                        </div>
                                        <button type="submit" style={{ ...styles.btnPrimary, marginTop: '23px' }}>Create Admin</button>
                                    </form>
                                </div>

                                <div style={styles.panel}>
                                    <div style={styles.panelHeader}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <h2 style={styles.panelTitle}><Users size={24} color="#60a5fa" /> Admin List</h2>
                                            {refreshing && <span style={{ color: '#94a3b8', fontSize: '12px' }}>Refreshing...</span>}
                                        </div>
                                        <button onClick={() => loadData(true)} style={{ ...styles.btnPrimary, padding: '8px 16px', backgroundColor: '#334155' }}>Refresh</button>
                                    </div>
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="master-table" style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}></th>
                                                    <th style={styles.th}>Email</th>
                                                    <th style={styles.th}>Club Name</th>
                                                    <th style={styles.th}>Role</th>
                                                    <th style={styles.th}>Date Added</th>
                                                    <th style={styles.th}>Last Login</th>
                                                    <th style={{ ...styles.th, textAlign: 'center' }}>Status</th>
                                                    <th style={{ ...styles.th, textAlign: 'center' }}>Users</th>
                                                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {adminsList.map(u => (
                                                    <React.Fragment key={u.id}>
                                                        <tr style={{ backgroundColor: u.is_active ? 'transparent' : 'rgba(239, 68, 68, 0.05)' }}>
                                                            <td style={styles.td}>
                                                                {(u.users && u.users.length > 0) && (
                                                                    <button onClick={() => toggleRow(u.id)} style={styles.iconBtn('#94a3b8')}>
                                                                        {expandedRows[u.id] ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                                                                    </button>
                                                                )}
                                                            </td>
                                                            <td style={{ ...styles.td, fontWeight: 'bold' }}>{u.email}</td>
                                                            <td style={styles.td}>
                                                                {editingClubId === u.id ? (
                                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                                        <input 
                                                                            type="text" 
                                                                            value={editClubName} 
                                                                            onChange={(e) => setEditClubName(e.target.value)} 
                                                                            style={{ ...styles.input, width: '150px', padding: '6px' }} 
                                                                        />
                                                                        <button onClick={() => handleSaveClubName(u.id)} style={{ ...styles.btnPrimary, padding: '6px 10px', backgroundColor: '#22c55e' }}>Save</button>
                                                                        <button onClick={() => setEditingClubId(null)} style={{ ...styles.btnPrimary, padding: '6px 10px', backgroundColor: '#64748b' }}>Cancel</button>
                                                                    </div>
                                                                ) : (
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                        <span style={{ color: u.club_name ? '#f1f5f9' : '#94a3b8' }}>{u.club_name || 'Not Set'}</span>
                                                                        <button onClick={() => { setEditingClubId(u.id); setEditClubName(u.club_name || ''); }} style={{ ...styles.iconBtn('#3b82f6'), fontSize: '12px', padding: '2px 5px', border: '1px solid #3b82f6', borderRadius: '4px' }}>Edit</button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td style={styles.td}><span style={styles.badge('#60a5fa', 'rgba(59, 130, 246, 0.1)')}>{u.role}</span></td>
                                                            <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                                                            <td style={styles.td}>{u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}</td>
                                                            <td style={{ ...styles.td, textAlign: 'center' }}>
                                                                {u.is_active ? <span style={{ color: '#4ade80', fontWeight: 'bold' }}><CheckCircle size={14}/> Active</span> : <span style={{ color: '#f87171', fontWeight: 'bold' }}><EyeOff size={14}/> Inactive</span>}
                                                            </td>
                                                            <td style={{ ...styles.td, textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>{u.user_count}</td>
                                                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                                                <button onClick={() => handleResetPassword(u.id, false)} style={styles.iconBtn('#eab308')} title="Reset Password"><Key size={18} /></button>
                                                                <button onClick={() => handleToggleStatus(u.id, u.is_active)} style={styles.iconBtn(u.is_active ? '#94a3b8' : '#22c55e')} title="Toggle Status">
                                                                    {u.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                                                                </button>
                                                                <button onClick={() => setDeleteTarget(u)} style={styles.iconBtn('#ef4444')} title="Delete"><Trash2 size={18} /></button>
                                                            </td>
                                                        </tr>
                                                        {expandedRows[u.id] && u.users && u.users.map(subUser => (
                                                            <tr key={subUser.id} style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                                                                <td style={styles.td}></td>
                                                                <td style={{ ...styles.td, paddingLeft: '40px', color: '#cbd5e1' }}>↳ {subUser.email}</td>
                                                                <td style={styles.td}></td>
                                                                <td style={styles.td}><span style={styles.badge('#94a3b8', '#334155')}>{subUser.role}</span></td>
                                                                <td style={{ ...styles.td, color: '#94a3b8' }}>{new Date(subUser.created_at).toLocaleDateString()}</td>
                                                                <td style={{ ...styles.td, color: '#94a3b8' }}>{subUser.last_login_at ? new Date(subUser.last_login_at).toLocaleDateString() : 'Never'}</td>
                                                                <td style={{ ...styles.td, textAlign: 'center' }}>
                                                                    {subUser.is_active ? <span style={{ color: '#4ade80' }}>Active</span> : <span style={{ color: '#f87171' }}>Inactive</span>}
                                                                </td>
                                                                <td style={{ ...styles.td, textAlign: 'center' }}>-</td>
                                                                <td style={{ ...styles.td, textAlign: 'center' }}>-</td>
                                                                <td style={{ ...styles.td, textAlign: 'right' }}>
                                                                    <button onClick={() => handleResetPassword(subUser.id, true)} style={styles.iconBtn('#eab308')}><Key size={16} /></button>
                                                                    <button onClick={() => handleToggleStatus(subUser.id, subUser.is_active)} style={styles.iconBtn(subUser.is_active ? '#94a3b8' : '#22c55e')}>
                                                                        {subUser.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </React.Fragment>
                                                ))}
                                                {adminsList.length === 0 && (
                                                    <tr><td colSpan="9" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No admins provisioned yet.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'live' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                                <div style={styles.grid}>
                                    <div style={styles.card}>
                                        <div style={styles.cardLabel}>Online Now (5m)</div>
                                        <div style={{ ...styles.cardValue, color: '#4ade80' }}>{onlineNow}</div>
                                    </div>
                                    <div style={styles.card}>
                                        <div style={styles.cardLabel}>Active Today</div>
                                        <div style={{ ...styles.cardValue, color: '#60a5fa' }}>{activeToday}</div>
                                    </div>
                                    <div style={styles.card}>
                                        <div style={styles.cardLabel}>Total Accounts</div>
                                        <div style={styles.cardValue}>{totalAccounts}</div>
                                    </div>
                                </div>

                                <div style={styles.panel}>
                                    <div style={styles.panelHeader}>
                                        <h2 style={styles.panelTitle}><Activity size={24} color="#4ade80" /> System Sessions (Live)</h2>
                                        <button onClick={loadData} style={{ ...styles.btnPrimary, padding: '8px 16px', backgroundColor: '#334155' }}>Refresh</button>
                                    </div>
                                    <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                                        <table className="master-table" style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>User Email</th>
                                                    <th style={styles.th}>Role</th>
                                                    <th style={styles.th}>Status</th>
                                                    <th style={styles.th}>Last Tracked Activity</th>
                                                    <th style={styles.th}>Device & IP</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {liveSessions.map((session) => (
                                                    <tr key={session.id}>
                                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>{session.email}</td>
                                                        <td style={styles.td}><span style={styles.badge('#94a3b8', '#334155')}>{session.role}</span></td>
                                                        <td style={styles.td}>
                                                            {session.status === 'Online' && <span style={{ color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '50%' }}></div> Online</span>}
                                                            {session.status === 'Idle' && <span style={{ color: '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', backgroundColor: '#94a3b8', borderRadius: '50%' }}></div> Idle</span>}
                                                            {session.status === 'Ended' && <span style={{ color: '#64748b' }}>Ended</span>}
                                                        </td>
                                                        <td style={{ ...styles.td, color: '#cbd5e1' }}>{new Date(session.lastActivity || session.loginTime).toLocaleString()}</td>
                                                        <td style={styles.td}>
                                                            <div style={{ color: '#f1f5f9' }}>{session.device || 'Unknown Device'}</div>
                                                            <div style={{ color: '#64748b', fontSize: '12px' }}>{session.ipAddress}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'activity' && (
                            <div style={styles.panel}>
                                <div style={{ ...styles.panelHeader, flexWrap: 'wrap', gap: '15px' }}>
                                    <h2 style={styles.panelTitle}><Shield size={24} color="#c084fc" /> Global Security Audit Log</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <select style={{ ...styles.input, width: 'auto' }} value={logFilterAction} onChange={e => setLogFilterAction(e.target.value)}>
                                            <option value="">All Actions</option>
                                            {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
                                        </select>
                                        <input type="text" placeholder="Filter by Admin Email..." style={{ ...styles.input, width: '200px' }} value={logFilterAdmin} onChange={e => setLogFilterAdmin(e.target.value)} />
                                    </div>
                                </div>
                                <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
                                    <table className="master-table" style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Timestamp</th>
                                                <th style={styles.th}>Actor</th>
                                                <th style={styles.th}>Action</th>
                                                <th style={styles.th}>Table Modified</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLogs.map((log) => {
                                                const isCritical = ['SYSTEM_RESET', 'BACKUP_RESTORE', 'DATA_BULK_DELETE'].includes(log.action);
                                                return (
                                                    <tr key={log.id} style={{ backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.1)' : 'transparent' }}>
                                                        <td style={{ ...styles.td, color: isCritical ? '#fca5a5' : '#cbd5e1' }}>{new Date(log.created_at).toLocaleString()}</td>
                                                        <td style={styles.td}>
                                                            <div style={{ color: isCritical ? '#f87171' : '#f1f5f9', fontWeight: isCritical ? 'bold' : 'normal' }}>{log.actor_email}</div>
                                                            <div style={{ color: '#64748b', fontSize: '12px' }}>{log.actor_role}</div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{ ...styles.badge(isCritical ? '#f87171' : '#e2e8f0', isCritical ? '#7f1d1d' : '#334155'), border: isCritical ? '1px solid #991b1b' : '1px solid #475569' }}>{log.action}</span>
                                                        </td>
                                                        <td style={{ ...styles.td, color: isCritical ? '#fca5a5' : '#94a3b8' }}>{log.table_name || '-'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {deleteTarget && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
                    <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '12px', border: '1px solid #334155', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#ef4444', marginBottom: '20px' }}>
                            <AlertTriangle size={32} />
                            <h3 style={{ fontSize: '24px', fontWeight: 'bold' }}>Confirm Deletion</h3>
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '16px', lineHeight: '1.5', marginBottom: '30px' }}>
                            This will permanently deactivate <strong>{deleteTarget.email}</strong> and their <strong>{deleteTarget.user_count || 0}</strong> users. All data is preserved.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                            <button onClick={() => setDeleteTarget(null)} style={{ ...styles.btnPrimary, backgroundColor: '#334155' }}>Cancel</button>
                            <button onClick={confirmDelete} style={{ ...styles.btnPrimary, backgroundColor: '#ef4444' }}>Deactivate</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
