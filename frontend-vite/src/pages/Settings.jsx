import { useState } from 'react';
import { Package, Users, Clock, Database, Key } from 'lucide-react';
import { Stock } from './Stock';
import { UserManagement } from './UserManagement';
import { LoginActivity } from './LoginActivity';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import api from '../services/api';

export function Settings() {
    const { user } = useAuth();
    const perm = usePermissions();
    const [activeTab, setActiveTab] = useState(perm.isAdmin ? 'stock' : 'account');
    const { resetData } = useStore();

    // Password change state
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    const handleReset = async () => {
        if (!window.confirm("CRITICAL WARNING: This will permanently delete ALL sales, stock, and attendance data. Proceed?")) return;
        const pwd = window.prompt("To proceed, enter your Admin Password:");
        if (!pwd) return;
        try {
            await resetData(pwd);
        } catch (e) {
            console.error(e);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        try {
            setMsg(''); setErr('');
            if (newPassword.length < 8) return setErr('New password must be at least 8 characters long.');
            await api.put('/users/me/password', { oldPassword, newPassword });
            setMsg('Password changed successfully.');
            setOldPassword(''); setNewPassword('');
        } catch (error) {
            setErr(error.response?.data?.message || 'Failed to change password.');
        }
    };

    return (
        <div>
            <h2>Settings</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                {perm.isAdmin && (
                    <>
                        <button className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('stock')}><Package size={16}/> Stock</button>
                        <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}><Users size={16}/> Users</button>
                        <button className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('activity')}><Clock size={16}/> Login Activity</button>
                        <button className={`btn ${activeTab === 'system' ? 'btn-danger' : 'btn-outline'}`} onClick={() => setActiveTab('system')}><Database size={16}/> System</button>
                    </>
                )}
                <button className={`btn ${activeTab === 'account' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('account')}><Key size={16}/> Account</button>
            </div>

            <div className="card">
                {activeTab === 'stock' && perm.isAdmin && <Stock />}
                {activeTab === 'users' && perm.isAdmin && <UserManagement />}
                {activeTab === 'activity' && perm.isAdmin && <LoginActivity />}
                {activeTab === 'system' && perm.isAdmin && (
                    <div style={{ padding: 20 }}>
                        <h3 style={{ color: 'var(--alert-color)', marginBottom: 10 }}>Danger Zone</h3>
                        <p style={{ marginBottom: 20 }}>This action cannot be undone. It will wipe all business data (Sales, Stock, Attendance).</p>
                        <button className="btn btn-danger" onClick={handleReset}>Factory Reset Database</button>
                    </div>
                )}
                {activeTab === 'account' && (
                    <div style={{ padding: 20, maxWidth: 500 }}>
                        <h3 style={{ marginBottom: 20 }}>Change Password</h3>
                        {msg && <div style={{ color: '#16a34a', padding: 10, background: '#dcfce7', borderRadius: 5, marginBottom: 15 }}>{msg}</div>}
                        {err && <div style={{ color: '#dc2626', padding: 10, background: '#fee2e2', borderRadius: 5, marginBottom: 15 }}>{err}</div>}
                        <form onSubmit={handleChangePassword}>
                            <div className="form-group" style={{ marginBottom: 15 }}>
                                <label>Current Password</label>
                                <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="form-control" />
                            </div>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label>New Password (Min 8 characters)</label>
                                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} className="form-control" />
                            </div>
                            <button type="submit" className="btn btn-primary w-full">Update Password</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
