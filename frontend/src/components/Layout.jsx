import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, DollarSign, Calendar, User, LogOut, Menu } from 'lucide-react';
import useStore from '../store/useStore';

export function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, fetchData } = useStore();
    const nav = useNavigate();

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // lightweight auto-sync
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleLogout = () => {
        logout();
        nav('/login');
    };

    return (
        <div className="app-container">
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">🥗 Life Care</div>
                <nav style={{ flex: 1, padding: '20px 0' }}>
                    <NavLink to="/" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><LayoutDashboard size={20}/> Overview</NavLink>
                    <NavLink to="/stock" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><Package size={20}/> Stock</NavLink>
                    <NavLink to="/sales" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><DollarSign size={20}/> Sales</NavLink>
                    <NavLink to="/attendance" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><Calendar size={20}/> Attendance</NavLink>
                    <NavLink to="/usage" className={({isActive}) => `nav-link ${isActive ? 'active':''}`} onClick={()=>setSidebarOpen(false)}><User size={20}/> Usage</NavLink>
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
                    <div style={{fontWeight: 600}}>Welcome, {user?.username}</div>
                </header>
                <div style={{ padding: '20px', flex: 1 }}>{children}</div>
            </main>
        </div>
    );
}
