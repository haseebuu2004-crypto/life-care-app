import { useState } from 'react';
import { Package, Users, Clock, Database } from 'lucide-react';
import { Stock } from './Stock';
import { UserManagement } from './UserManagement';
import { LoginActivity } from './LoginActivity';
import useStore from '../store/useStore';

export function Settings() {
    const [activeTab, setActiveTab] = useState('stock');
    const { resetData } = useStore();

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

    return (
        <div>
            <h2>Settings</h2>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                <button className={`btn ${activeTab === 'stock' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('stock')}><Package size={16}/> Stock</button>
                <button className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('users')}><Users size={16}/> Users</button>
                <button className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('activity')}><Clock size={16}/> Login Activity</button>
                <button className={`btn ${activeTab === 'system' ? 'btn-danger' : 'btn-outline'}`} onClick={() => setActiveTab('system')}><Database size={16}/> System</button>
            </div>

            <div className="card">
                {activeTab === 'stock' && <Stock />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'activity' && <LoginActivity />}
                {activeTab === 'system' && (
                    <div style={{ padding: 20 }}>
                        <h3 style={{ color: 'var(--alert-color)', marginBottom: 10 }}>Danger Zone</h3>
                        <p style={{ marginBottom: 20 }}>This action cannot be undone. It will wipe all business data (Sales, Stock, Attendance).</p>
                        <button className="btn btn-danger" onClick={handleReset}>Factory Reset Database</button>
                    </div>
                )}
            </div>
        </div>
    );
}
