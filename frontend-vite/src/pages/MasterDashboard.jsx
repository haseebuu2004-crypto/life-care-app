import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, Users, Activity, Eye, EyeOff } from 'lucide-react';

export function MasterDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ total_admins: 0, total_users: 0, active_users: 0 });
    const [usersList, setUsersList] = useState([]);
    
    // Add Club Form
    const [newClubEmail, setNewClubEmail] = useState('');
    const [newClubPassword, setNewClubPassword] = useState('');
    const [newClubName, setNewClubName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    if (user?.role !== 'master') {
        return <Navigate to="/" replace />;
    }

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                api.get('/master/stats'),
                api.get('/master/users')
            ]);
            setStats(statsRes.data.stats || { total_admins: 0, total_users: 0, active_users: 0 });
            setUsersList(usersRes.data.data || []);
        } catch (err) {
            console.error("Failed to load master data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreateClub = async (e) => {
        e.preventDefault();
        try {
            setMsg(''); setError('');
            await api.post('/master/clubs', { email: newClubEmail, password: newClubPassword, clubName: newClubName });
            setMsg("Club Admin created successfully.");
            setNewClubEmail(''); setNewClubPassword(''); setNewClubName('');
            loadData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create club admin');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await api.delete(`/master/users/${id}`);
            loadData();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handlePasswordUpdate = async (id, currentPass) => {
        const newPass = window.prompt("Enter new password (min 8 characters):", currentPass || "");
        if (!newPass || newPass === currentPass) return;
        if (newPass.length < 8) return alert("Password must be at least 8 characters.");
        
        try {
            await api.put(`/master/users/${id}/password`, { newPassword: newPass });
            loadData();
        } catch (err) {
            alert('Failed to update password');
        }
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 30 }}>
                <Shield size={32} color="#4f46e5" />
                <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Master Control Panel</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: 40 }}>
                <div className="card" style={{ padding: 25, borderLeft: '4px solid #4f46e5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', marginBottom: 10 }}>
                        <Shield size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Total Clubs (Admins)</h3>
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>{stats.total_admins}</div>
                </div>
                
                <div className="card" style={{ padding: 25, borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', marginBottom: 10 }}>
                        <Users size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Total Staff (Users)</h3>
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>{stats.total_users}</div>
                </div>

                <div className="card" style={{ padding: 25, borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', marginBottom: 10 }}>
                        <Activity size={20} />
                        <h3 style={{ margin: 0, fontSize: '16px' }}>Active Sessions (Last 1hr)</h3>
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#111827' }}>{stats.active_users}</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 30 }}>
                {/* Create Club Form */}
                <div className="card" style={{ padding: 25 }}>
                    <h3 style={{ marginBottom: 20, fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>Add New Club (Admin)</h3>
                    
                    {msg && <div style={{ color: '#16a34a', marginBottom: 15 }}>{msg}</div>}
                    {error && <div style={{ color: '#dc2626', marginBottom: 15 }}>{error}</div>}
                    
                    <form onSubmit={handleCreateClub}>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Club Name (Username)</label>
                            <input type="text" value={newClubName} onChange={e => setNewClubName(e.target.value)} required className="form-control" placeholder="e.g. Club AB" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 15 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Email Address</label>
                            <input type="email" value={newClubEmail} onChange={e => setNewClubEmail(e.target.value)} required className="form-control" placeholder="admin@clubab.com" />
                        </div>
                        <div className="form-group" style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 5 }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? "text" : "password"} value={newClubPassword} onChange={e => setNewClubPassword(e.target.value)} required className="form-control" placeholder="Min 8 characters" style={{ paddingRight: 40 }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn btn-primary w-full">Create Club</button>
                    </form>
                </div>

                {/* User Directory */}
                <div className="card" style={{ padding: 25, overflowX: 'auto' }}>
                    <h3 style={{ marginBottom: 20, fontSize: '18px', borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>Global User Directory</h3>
                    
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb', textAlign: 'left', borderBottom: '2px solid #e5e7eb' }}>
                                <th style={{ padding: '12px', color: '#4b5563' }}>Role</th>
                                <th style={{ padding: '12px', color: '#4b5563' }}>Email</th>
                                <th style={{ padding: '12px', color: '#4b5563' }}>Club / Owner</th>
                                <th style={{ padding: '12px', color: '#4b5563' }}>Raw Password</th>
                                <th style={{ padding: '12px', color: '#4b5563' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                                            backgroundColor: u.role === 'admin' ? '#fee2e2' : '#e0e7ff',
                                            color: u.role === 'admin' ? '#991b1b' : '#3730a3'
                                        }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', fontWeight: '500' }}>{u.email || u.username}</td>
                                    <td style={{ padding: '12px', color: '#6b7280' }}>{u.owner_id}</td>
                                    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#dc2626', fontWeight: 'bold' }}>
                                        {u.raw_password || '********'}
                                    </td>
                                    <td style={{ padding: '12px', display: 'flex', gap: 10 }}>
                                        <button onClick={() => handlePasswordUpdate(u.id, u.raw_password)} style={{ padding: '6px 12px', backgroundColor: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit Pass</button>
                                        <button onClick={() => handleDeleteUser(u.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {usersList.length === 0 && !loading && (
                                <tr>
                                    <td colSpan="5" style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>No users found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
