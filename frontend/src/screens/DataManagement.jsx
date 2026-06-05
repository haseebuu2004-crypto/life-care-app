"use client";
import { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { usePermissions } from '../hooks/usePermissions';
import { Database, AlertTriangle, Calendar as CalendarIcon, RotateCcw, ShoppingCart, ClipboardCheck } from 'lucide-react';
import { Navigate } from "@/utils/routerShim";
import EmptyState from '../components/EmptyState';

import api from '../services/api';

export function DataManagement() {
    const { clearAttendanceData, clearSalesData, showToast, attendance, sales, fetchSales, fetchAttendance, deletedRecords, fetchDeletedRecords, restoreDeletedRecord } = useStore();
    const perm = usePermissions();
    
    useEffect(() => {
        if (perm.isAdmin) {
            fetchSales();
            fetchAttendance();
            fetchDeletedRecords();
        }
    }, [fetchSales, fetchAttendance, fetchDeletedRecords, perm.isAdmin]);

    const [monthFilterAtt, setMonthFilterAtt] = useState('');
    const [monthFilterSales, setMonthFilterSales] = useState('');
    
    const [showConfirm, setShowConfirm] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // 'attendance' or 'sales'
    const [isDeleting, setIsDeleting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [restoringId, setRestoringId] = useState(null);

    const handleRestore = async (type, id) => {
        if (!window.confirm(`Are you sure you want to restore this ${type}?`)) return;
        setRestoringId(id);
        try {
            const res = await restoreDeletedRecord(type, id);
            showToast(res.message || 'Restored successfully', 'success');
            fetchDeletedRecords();
            fetchSales();
            fetchAttendance();
        } catch (error) {
            showToast(error.message || 'Failed to restore', 'error');
        } finally {
            setRestoringId(null);
        }
    };

    const [importType, setImportType] = useState('customers');
    const [importFile, setImportFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleImport = async () => {
        if (!importFile) return;
        setIsImporting(true);
        const formData = new FormData();
        formData.append('file', importFile);
        formData.append('type', importType);
        try {
            const res = await api.post('/reports/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.warning) {
                // If warning is returned, display it explicitly
                alert(`Warning: ${res.data.warning}`);
                showToast(`Import completed with warning: ${res.data.warning}`, 'warn');
            } else {
                showToast(res.data.message || `Imported ${res.data.imported} records successfully!`, 'success');
            }
            setImportFile(null);
            // Refresh database data
            if (importType === 'customers') {
                useStore.getState().fetchCustomers();
            } else {
                useStore.getState().fetchProducts();
                useStore.getState().fetchStock();
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'CSV Import failed', 'error');
        } finally {
            setIsImporting(false);
        }
    };

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
            setConfirmText('');
        }
    };

    const filterUsed = confirmAction === 'attendance' ? monthFilterAtt : monthFilterSales;
    const data = confirmAction === 'attendance' ? (attendance || []) : (sales || []);
    
    const filteredData = filterUsed 
        ? data.filter(item => item.date?.startsWith(filterUsed))
        : data;

    const recordsCount = filteredData.length;
    
    // Format YYYY-MM to uppercase "MONTH YEAR" (e.g. "OCTOBER 2023")
    let displayMonth = 'All Time';
    let expectedConfirmText = 'ALL';
    
    if (filterUsed) {
        const [year, month] = filterUsed.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        const formatted = date.toLocaleString('default', { month: 'long', year: 'numeric' }).toUpperCase();
        displayMonth = formatted;
        expectedConfirmText = formatted;
    }

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

                {/* CSV Import Card */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 15, borderTop: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 'bold' }}>
                        <Database size={24} color="#f59e0b" /> Bulk CSV Import
                    </div>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>
                        Import customers or products from a CSV file.
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <select 
                            value={importType} 
                            onChange={(e) => setImportType(e.target.value)}
                            style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                        >
                            <option value="customers">Customers</option>
                            <option value="products">Products</option>
                        </select>
                        <input 
                            type="file" 
                            accept=".csv"
                            onChange={(e) => setImportFile(e.target.files[0])}
                            style={{ fontSize: 14 }}
                        />
                    </div>

                    <button 
                        className="btn btn-primary" 
                        style={{ marginTop: 'auto', display: 'flex', justifyContent: 'center' }}
                        onClick={handleImport}
                        disabled={isImporting || !importFile}
                    >
                        {isImporting ? 'Importing...' : 'Upload & Import CSV'}
                    </button>
                </div>

            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 450, textAlign: 'center', padding: '30px 20px' }}>
                        <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 15px' }} />
                        <h3 style={{ marginBottom: 10 }}>Confirm Reset</h3>
                        <p style={{ color: 'var(--text-light)', marginBottom: 15, lineHeight: '1.5' }}>
                            This will soft-delete <b>{recordsCount} records</b> from <b>{displayMonth}</b>. 
                            Records can be recovered within 30 days.
                        </p>
                        
                        <div style={{ marginBottom: 20, textAlign: 'left' }}>
                            <label style={{ fontSize: 12, fontWeight: 'bold', display: 'block', marginBottom: 5 }}>
                                Type <b>{expectedConfirmText}</b> to confirm
                            </label>
                            <input 
                                type="text" 
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={expectedConfirmText}
                                style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                            <button className="btn btn-outline" onClick={() => { setShowConfirm(false); setConfirmText(''); }} disabled={isDeleting} style={{ flex: 1 }}>
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleConfirm} 
                                disabled={isDeleting || confirmText !== expectedConfirmText} 
                                style={{ flex: 1, background: confirmText === expectedConfirmText ? '#ef4444' : '#fca5a5', border: 'none', cursor: confirmText === expectedConfirmText ? 'pointer' : 'not-allowed' }}
                            >
                                {isDeleting ? 'Deleting...' : 'Confirm Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Recently Deleted section */}
            <div className="card" style={{ marginTop: 30, padding: 20 }}>
                <h3 style={{ marginBottom: 15, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Database size={20} color="var(--primary-color)" /> Recently Deleted Records
                </h3>
                {deletedRecords && deletedRecords.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '400px', overflowY: 'auto' }}>
                        {deletedRecords.map(record => (
                            <div key={`${record.type}-${record.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-light)' }}>
                                <div style={{ display: 'flex', gap: 15, alignItems: 'center' }}>
                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: 10, borderRadius: '50%' }}>
                                        {record.type === 'Sale' ? <ShoppingCart size={20} color="#3b82f6" /> : <ClipboardCheck size={20} color="#10b981" />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{record.type}: {record.customerName}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                                            Amount/Profit: Rs {record.value} • Recorded: {new Date(record.date).toLocaleDateString()}
                                        </div>
                                        <div style={{ fontSize: 12, color: '#ef4444', marginTop: 3 }}>
                                            Deleted: {new Date(record.deletedAt).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-outline" 
                                    onClick={() => handleRestore(record.type, record.id)}
                                    disabled={restoringId === record.id}
                                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 13 }}
                                >
                                    <RotateCcw size={14} />
                                    {restoringId === record.id ? 'Restoring...' : 'Restore'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ border: '1px dashed var(--border-color)', borderRadius: 8, padding: '30px 20px', textAlign: 'center' }}>
                        <EmptyState 
                            icon={<AlertTriangle size={48} style={{ opacity: 0.2 }} />}
                            title="No recently deleted records."
                            message="Deleted records will show up here."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
