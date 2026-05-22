import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Package, DollarSign, Calendar, User, LogOut, Menu, Plus, Users, Clock, Database, BarChart2 } from 'lucide-react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { AddSaleModal } from './AddSaleModal';
import { AddStockModal } from './AddStockModal';

export function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { fetchData, toast } = useStore();
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const perm = usePermissions();
    
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showStockModal, setShowStockModal] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);

    useEffect(() => {
        // Layout manages background auto-sync (ProtectedRoute handles initial fetch)
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleLogout = async () => {
        await logout();
        nav('/login');
    };

    return (
        <div className="app-container">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    onClick={() => setSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 99, display: 'none' }}
                    className="sidebar-overlay"
                />
            )}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">🥗 Life Care</div>
                <nav style={{ flex: 1, padding: '20px 0' }}>
                    {perm.isAdmin && <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><LayoutDashboard size={20}/> Dashboard</NavLink>}
                    <NavLink to="/stock" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><Package size={20}/> Stock</NavLink>
                    <NavLink to="/sales" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><DollarSign size={20}/> Sales</NavLink>
                    <NavLink to="/attendance" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><Calendar size={20}/> Attendance</NavLink>
                    {perm.isAdmin && <NavLink to="/data-management" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><Database size={20}/> Data Mgt.</NavLink>}
                    {perm.isAdmin && <NavLink to="/reports" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><BarChart2 size={20}/> Reports</NavLink>}
                    {perm.isAdmin && <NavLink to="/settings" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><Database size={20}/> Settings</NavLink>}
                </nav>
                <div className="nav-link" style={{ color: 'var(--alert-color)', marginTop: 'auto', marginBottom: 20 }} onClick={handleLogout}>
                    <LogOut size={20}/> Logout ({user?.role})
                </div>
            </aside>
            <main className="main-content">
                <header className="topbar">
                    <button className="btn btn-outline" style={{ display: 'block' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Menu size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{fontWeight: 600}}>Welcome, {user?.username}</div>
                        <span style={{
                            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                            padding: '2px 8px', borderRadius: 10, letterSpacing: '0.5px',
                            background: user?.role === 'admin' ? '#b91c1c' : '#374151',
                            color: 'white'
                        }}>{user?.role}</span>
                    </div>
                </header>
                <div style={{ padding: '20px', flex: 1 }}>{children}</div>
                
                {/* Floating Action Button for Mobile / Quick Access */}
                <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                    {fabOpen && (
                        <>
                            <button className="btn btn-primary" style={{ borderRadius: '20px', padding: '10px 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', width: 'auto', background: 'var(--accent-color)' }} onClick={() => { setShowSaleModal(true); setFabOpen(false); }}>
                                + Add Sale
                            </button>
                            <button className="btn btn-primary" style={{ borderRadius: '20px', padding: '10px 20px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', width: 'auto' }} onClick={() => { setShowStockModal(true); setFabOpen(false); }}>
                                + Add Stock
                            </button>
                        </>
                    )}
                    <button className="btn btn-primary" style={{ borderRadius: '50%', width: 56, height: 56, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.2s', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0)' }} onClick={() => setFabOpen(!fabOpen)}>
                        <Plus size={28} />
                    </button>
                </div>

                {showSaleModal && <AddSaleModal onClose={() => setShowSaleModal(false)} />}
                {showStockModal && <AddStockModal onClose={() => setShowStockModal(false)} />}
                
                {toast && (
                    <div style={{
                        position: 'fixed',
                        top: 20,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: toast.type === 'error' ? 'var(--alert-color)' : (toast.type === 'warn' ? '#f39c12' : 'var(--primary-color)'),
                        color: 'white',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        zIndex: 9999,
                        fontWeight: 600,
                        animation: 'fadeInOut 3s ease-in-out'
                    }}>
                        {toast.msg}
                    </div>
                )}
            </main>
        </div>
    );
}
