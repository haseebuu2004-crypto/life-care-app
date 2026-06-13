"use client";
import { useState, useEffect } from 'react';
import { Navigate } from "@/utils/routerShim";
import useStore from '../store/useStore';
import { usePermissions } from '../hooks/usePermissions';
import { RefreshCw, Monitor, Smartphone } from 'lucide-react';

function formatDate(dt) {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function LoginActivity() {
    const perm = usePermissions();
    const { fetchLoginHistory } = useStore();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await fetchLoginHistory();
            setHistory(data);
        } catch {
            useStore.getState().showToast('Failed to fetch login history', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (perm.canManageUsers) load(); }, []);

    if (!perm.canManageUsers) return null;

    const filtered = history.filter(h =>
        !filter || h.userEmail?.toLowerCase().includes(filter.toLowerCase())
    );

    const stats = {
        total: history.length,
        active: history.filter(h => h.status === 'Online').length,
        mobile: history.filter(h => h.userAgent?.includes('Mobile')).length,
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 24 }}>
                <div>
                    <h2 style={{ marginBottom: 4 }}>User Login Activity</h2>
                    <p style={{ color: 'var(--text-light)', margin: 0 }}>Track user sessions and access history</p>
                </div>
                <button className="btn btn-outline" onClick={load}>
                    <RefreshCw size={15}/> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="card-grid" style={{ padding: 0, marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)', padding: '14px 18px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Total Sessions</div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.total}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #15803d', padding: '14px 18px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Active Now</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color: '#15803d' }}>{stats.active}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid #8b5cf6', padding: '14px 18px' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Mobile Sessions</div>
                    <div style={{ fontSize: 26, fontWeight: 700 }}>{stats.mobile}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="card" style={{ marginBottom: 20 }}>
                <input
                    placeholder="Filter by email..."
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    style={{ width: '100%', maxWidth: 340 }}
                />
            </div>

            {/* Table */}
            <div className="card">
                {loading ? (
                    <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: 30 }}>Loading login history...</p>
                ) : (
                    <div className="table-container" style={{ margin: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Device</th>
                                    <th>Browser</th>
                                    <th>Login Time</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((h) => (
                                    <tr key={`${h.userEmail}-${h.loginTime}`}>
                                        <td><strong>{h.userEmail}</strong></td>
                                        <td style={{ color: 'var(--text-light)' }}>
                                            {h.userAgent?.includes('Mobile')
                                                ? <><Smartphone size={13} style={{ verticalAlign: 'middle' }}/> Mobile</>
                                                : <><Monitor size={13} style={{ verticalAlign: 'middle' }}/> Desktop</>
                                            }
                                        </td>
                                        <td style={{ color: 'var(--text-light)', fontSize: 13 }}>{h.userAgent?.split(' ')[0] || 'Unknown'}</td>
                                        <td style={{ fontSize: 13 }}>{formatDate(h.loginTime)}</td>
                                        <td>
                                            {h.status === 'Online'
                                                ? <span style={{ color: '#15803d', fontWeight: 600, fontSize: 12 }}>● Online</span>
                                                : h.status === 'Idle' 
                                                ? <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 12 }}>● Idle</span>
                                                : <span style={{ color: '#6b7280', fontSize: 12 }}>Ended</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: 30, color: 'var(--text-light)' }}>No login records found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
