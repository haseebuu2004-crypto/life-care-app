import React, { useEffect, useState, useRef } from 'react';
import useBackupStore from '../store/useBackupStore';
import { Database, Download, Upload, Cloud, RefreshCw, AlertTriangle, FileSpreadsheet, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

export function AdminBackupCenter() {
    const { backupLogs, loading, generating, restoring, fetchBackupLogs, generateBackup, validateRestore, confirmRestore } = useBackupStore();
    
    const [backupType, setBackupType] = useState('full');
    const [backupFormat, setBackupFormat] = useState('xlsx');
    
    const [restoreFile, setRestoreFile] = useState(null);
    const [restoreValidation, setRestoreValidation] = useState(null);
    const [restoreStrategy, setRestoreStrategy] = useState('merge');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBackupLogs();
    }, []);

    const handleGenerate = (cloud = false) => {
        generateBackup(backupType, backupFormat, cloud);
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setRestoreFile(file);
        
        try {
            const validation = await validateRestore(file);
            setRestoreValidation(validation);
        } catch (error) {
            setRestoreFile(null);
            setRestoreValidation(null);
        }
    };

    const executeRestore = async () => {
        if (!restoreFile || !restoreValidation?.isValid) return;
        
        const success = await confirmRestore(restoreFile, restoreStrategy);
        if (success) {
            setRestoreFile(null);
            setRestoreValidation(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <Database size={28} />
                Backup & Restore Center
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 32 }}>
                
                {/* BACKUP GENERATOR CARD */}
                <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Download size={20} /> Generate Backup
                    </h3>
                    
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Target Data</label>
                        <select 
                            className="input" 
                            value={backupType} 
                            onChange={(e) => setBackupType(e.target.value)}
                            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                        >
                            <option value="full">Full Database</option>
                            <option value="sales">Sales & History</option>
                            <option value="attendance">Attendance Records</option>
                            <option value="products">Products & Stock</option>
                            <option value="customers">Customers List</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Format</label>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <input type="radio" name="fmt" value="xlsx" checked={backupFormat === 'xlsx'} onChange={() => setBackupFormat('xlsx')} />
                                <FileSpreadsheet size={16} /> Excel (.xlsx)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: backupType === 'full' ? 0.5 : 1 }}>
                                <input type="radio" name="fmt" value="csv" disabled={backupType === 'full'} checked={backupFormat === 'csv'} onChange={() => setBackupFormat('csv')} />
                                <FileText size={16} /> CSV
                            </label>
                        </div>
                        {backupType === 'full' && <small style={{ color: '#666' }}>Full backups require Excel (multi-sheet).</small>}
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                            className="btn btn-primary" 
                            onClick={() => handleGenerate(false)} 
                            disabled={generating}
                            style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}
                        >
                            {generating ? <RefreshCw className="spin" size={18} /> : <Download size={18} />}
                            Download Now
                        </button>
                        <button 
                            className="btn" 
                            onClick={() => handleGenerate(true)} 
                            disabled={generating}
                            style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8, background: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd' }}
                        >
                            <Cloud size={18} />
                            Save to Drive
                        </button>
                    </div>
                </div>

                {/* RESTORE CENTER CARD */}
                <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #fee2e2' }}>
                    <h3 style={{ marginTop: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#b91c1c' }}>
                        <Upload size={20} /> Restore System
                    </h3>
                    
                    {!restoreFile ? (
                        <div 
                            style={{ 
                                border: '2px dashed #ccc', borderRadius: 8, padding: 32, textAlign: 'center', 
                                background: '#f8fafc', cursor: 'pointer' 
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={32} style={{ color: '#94a3b8', marginBottom: 12 }} />
                            <p style={{ margin: 0, fontWeight: 500, color: '#475569' }}>Click to upload a backup file</p>
                            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', marginTop: 4 }}>Supports .xlsx and .csv</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                accept=".csv,.xlsx" 
                                onChange={handleFileSelect} 
                            />
                        </div>
                    ) : (
                        <div style={{ background: '#f8fafc', padding: 16, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <strong style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <FileSpreadsheet size={16} /> {restoreFile.name}
                                </strong>
                                <button className="btn icon-btn" onClick={() => { setRestoreFile(null); setRestoreValidation(null); }}>×</button>
                            </div>
                            
                            {restoreValidation ? (
                                restoreValidation.isValid ? (
                                    <>
                                        <div style={{ background: '#ecfdf5', padding: 12, borderRadius: 6, color: '#065f46', marginBottom: 16, display: 'flex', gap: 8 }}>
                                            <CheckCircle size={18} style={{ flexShrink: 0 }} />
                                            <span style={{ fontSize: 14 }}>{restoreValidation.message}</span>
                                        </div>

                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500, fontSize: 14 }}>Restore Strategy</label>
                                            
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, background: restoreStrategy === 'merge' ? '#eff6ff' : 'transparent', borderRadius: 6, border: `1px solid ${restoreStrategy === 'merge' ? '#bfdbfe' : 'transparent'}` }}>
                                                    <input type="radio" name="strategy" value="merge" checked={restoreStrategy === 'merge'} onChange={() => setRestoreStrategy('merge')} style={{ marginTop: 4 }} />
                                                    <div>
                                                        <strong>Safe Merge (Recommended)</strong>
                                                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Updates existing records and adds missing ones. Keeps new data safe.</p>
                                                    </div>
                                                </label>
                                                
                                                <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: 8, background: restoreStrategy === 'wipe' ? '#fef2f2' : 'transparent', borderRadius: 6, border: `1px solid ${restoreStrategy === 'wipe' ? '#fecaca' : 'transparent'}` }}>
                                                    <input type="radio" name="strategy" value="wipe" checked={restoreStrategy === 'wipe'} onChange={() => setRestoreStrategy('wipe')} style={{ marginTop: 4 }} />
                                                    <div>
                                                        <strong style={{ color: '#b91c1c' }}>Full Rollback (Emergency)</strong>
                                                        <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Wipes current data completely before inserting backup. Use with extreme caution.</p>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <button 
                                            className="btn" 
                                            onClick={executeRestore} 
                                            disabled={restoring}
                                            style={{ width: '100%', background: '#ef4444', color: 'white', display: 'flex', justifyContent: 'center', gap: 8 }}
                                        >
                                            {restoring ? <RefreshCw className="spin" size={18} /> : <AlertTriangle size={18} />}
                                            CONFIRM RESTORE
                                        </button>
                                    </>
                                ) : (
                                    <div style={{ background: '#fef2f2', padding: 12, borderRadius: 6, color: '#991b1b', display: 'flex', gap: 8 }}>
                                        <AlertTriangle size={18} />
                                        <span style={{ fontSize: 14 }}>{restoreValidation.message}</span>
                                    </div>
                                )
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b' }}>
                                    <RefreshCw className="spin" size={16} /> Validating backup integrity...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* BACKUP LOGS */}
            <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Backup History</h3>
                    <button className="btn icon-btn" onClick={fetchBackupLogs} disabled={loading} title="Refresh Logs">
                        <RefreshCw className={loading ? "spin" : ""} size={18} />
                    </button>
                </div>
                
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', color: '#475569', fontSize: 13, textTransform: 'uppercase' }}>
                            <tr>
                                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Date</th>
                                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Type</th>
                                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Provider</th>
                                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Status</th>
                                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Triggered By</th>
                                <th style={{ padding: '12px 24px', fontWeight: 600 }}>Link</th>
                            </tr>
                        </thead>
                        <tbody>
                            {backupLogs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#334155' }}>
                                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14 }}>
                                        <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: 4, textTransform: 'capitalize' }}>
                                            {log.backup_type}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>
                                        {log.storage_provider === 'GoogleDrive' ? <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Cloud size={14} /> Drive</span> : log.storage_provider}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {log.status === 'Success' ? (
                                            <span style={{ color: '#059669', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={14} /> Success</span>
                                        ) : (
                                            <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={14} /> {log.status}</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: '#64748b' }}>
                                        {log.created_by}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14 }}>
                                        {log.file_url ? (
                                            <a href={log.file_url} target="_blank" rel="noreferrer" style={{ color: '#0ea5e9', textDecoration: 'none', fontWeight: 500 }}>Open File</a>
                                        ) : (
                                            <span style={{ color: '#94a3b8' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {backupLogs.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                                        No backup history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
