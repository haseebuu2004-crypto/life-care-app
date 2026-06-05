import { useState } from 'react';
import useStore from '../store/useStore';
import { usePermissions } from '../hooks/usePermissions';
import { Database, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function DataManagement() {
    const { clearAttendanceData, clearSalesData, showToast } = useStore();
    const perm = usePermissions();
    
    const [monthFilterAtt, setMonthFilterAtt] = useState('');
    const [monthFilterSales, setMonthFilterSales] = useState('');
    
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'attendance' or 'sales'
    const [isDeleting, setIsDeleting] = useState(false);

    if (!perm.isAdmin) {
        return <Navigate to="/overview" replace />;
    }

    const openConfirm = (action) => {
        setConfirmAction(action);
        setShowConfirm(true);
    };

    const handleConfirm = async () => {
        setIsDeleting(true);
        try {
            if (confirmAction === 'attendance') {
                const res = await clearAttendanceData(monthFilterAtt || null);
                showToast(res.message || 'Attendance data cleared successfully', 'success');
            } else if (confirmAction === 'sales') {
                const res = await clearSalesData(monthFilterSales || null);
                showToast(res.message || 'Sales data cleared successfully', 'success');
            }
        } catch (error) {
            showToast(error.message || 'Failed to clear data', 'error');
        } finally {
            setIsDeleting(false);
            setShowConfirm(false);
            setConfirmAction(null);
        }
    };

    const modalTitle = confirmAction === 'attendance' ? 'Clear Attendance Data' : 'Clear Sales Data';
    const filterUsed = confirmAction === 'attendance' ? monthFilterAtt : monthFilterSales;
    const recordsText = filterUsed ? `records for ${filterUsed}` : 'ALL records';

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 30 }}>
                <h2>Data Management</h2>
            </div>
            
            <p style={{ color: 'var(--text-light)', marginBottom: 20 }}>
                Manage your system data. You can clear monthly records independently without affecting your stock inventory or customer profiles.
            </p>
            
            <div className="card-grid" style={{ padding: 0 }}>
                
                {/* Attendance Reset Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15, borderTop: '4px solid #3b82f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 'bold' }}>
                        <Database size={24} color="#3b82f6" /> Clear Attendance Data
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>
                        Deletes attendance history and generated profit analytics. <b>Does not</b> delete customers or stock.
                    </p>
                    
                    <div style={{ marginTop: 10 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: 'var(--text-light)', marginBottom: 5 }}>Optional: Filter by Month</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CalendarIcon size={16} color="var(--text-light)" />
                            <input 
                                type="month" 
                                value={monthFilterAtt} 
                                onChange={(e) => setMonthFilterAtt(e.target.value)} 
                                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                            />
                            {monthFilterAtt && (
                                <button className="btn icon-btn" onClick={() => setMonthFilterAtt('')} style={{ padding: '8px' }}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <button 
                        className="btn" 
                        style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', background: 'white', color: '#ef4444', border: '1px solid #ef4444' }}
                        onClick={() => openConfirm('attendance')}
                    >
                        Delete Attendance Records
                    </button>
                </div>

                {/* Sales Reset Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15, borderTop: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 'bold' }}>
                        <Database size={24} color="#10b981" /> Clear Sales Data
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>
                        Deletes all saved sales records and resets sales analytics. <b>Does not</b> alter current stock quantities.
                    </p>
                    
                    <div style={{ marginTop: 10 }}>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 'bold', color: 'var(--text-light)', marginBottom: 5 }}>Optional: Filter by Month</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <CalendarIcon size={16} color="var(--text-light)" />
                            <input 
                                type="month" 
                                value={monthFilterSales} 
                                onChange={(e) => setMonthFilterSales(e.target.value)} 
                                style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                            />
                            {monthFilterSales && (
                                <button className="btn icon-btn" onClick={() => setMonthFilterSales('')} style={{ padding: '8px' }}>
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <button 
                        className="btn" 
                        style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center', background: 'white', color: '#ef4444', border: '1px solid #ef4444' }}
                        onClick={() => openConfirm('sales')}
                    >
                        Delete Sales Records
                    </button>
                </div>

            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 400, textAlign: 'center', padding: '30px 20px' }}>
                        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 15px' }} />
                        <h3 style={{ marginBottom: 10 }}>Confirm Reset</h3>
                        <p style={{ color: 'var(--text-light)', marginBottom: 20, lineHeight: '1.5' }}>
                            You are about to permanently delete <b>{recordsText}</b> for this module. This cannot be undone.
                        </p>
                        
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => setShowConfirm(false)} disabled={isDeleting} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={handleConfirm} disabled={isDeleting} style={{ flex: 1, background: '#ef4444', border: 'none' }}>
                                {isDeleting ? 'Deleting...' : 'Confirm Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
