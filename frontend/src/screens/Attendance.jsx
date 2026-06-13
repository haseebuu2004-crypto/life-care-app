"use client";
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import useStore from '../store/useStore';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { Check, X, Trash2, Calendar, Users } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { formatRupees } from '../utils/currency';

const AttendanceRecord = memo(({ record, canDelete, onDelete }) => (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
        <td style={{ padding: '12px 16px' }}><strong>{record.name}</strong></td>
        <td style={{ padding: '12px 16px' }}>
            <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 13, fontWeight: 600,
                background: record.status === 'default' ? '#f0fdf4' : '#fef2f2',
                color: record.status === 'default' ? '#15803d' : '#b91c1c'
            }}>
                {record.status === 'default' ? 'Present' : 'Custom'}
            </span>
        </td>
        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
            {record.shakeProfit ? formatRupees(record.shakeProfit * 100) : '—'}
        </td>
        <td style={{ padding: '12px 16px', color: 'var(--text-light)', textAlign: 'right' }}>
            {record.recorded_by}
        </td>
        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
            {canDelete && (
                <button className="btn icon-btn" onClick={() => onDelete(record)} style={{ color: 'var(--alert-color)' }}>
                    <Trash2 size={15}/>
                </button>
            )}
        </td>
    </tr>
));

AttendanceRecord.displayName = 'AttendanceRecord';

export function Attendance({ showOnlyMyAttendance = false }) {
    const { attendance, customers, fetchCustomers, addAttendance, deleteAttendance } = useStore();
    const { user } = useAuth();
    const perm = usePermissions();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [customerInput, setCustomerInput] = useState('');
    const [shakeProfit, setShakeProfit] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const activeCustomers = useMemo(() => {
        return customers.filter(c => c.is_active);
    }, [customers]);

    const onSubmit = useCallback(async (status) => {
        if (!customerInput.trim()) return useStore.getState().showToast("Enter or select a customer", "warn");
        
        try {
            setLoading(true);
            const existing = activeCustomers.find(c => c.name.toLowerCase() === customerInput.trim().toLowerCase());
            const payload = { 
                date, 
                type: status === 'Present' ? 'default' : 'custom',
                shakeProfit: shakeProfit !== '' ? Number(shakeProfit) : undefined
            };
            if (existing) {
                payload.customerId = existing.id;
            } else {
                payload.customerName = customerInput.trim();
            }

            await addAttendance(payload);
            useStore.getState().showToast("Attendance logged", "success");
            setCustomerInput('');
            setShakeProfit('');
        } catch (error) {
            useStore.getState().showToast(error.message || "Error logging attendance", "error");
        } finally {
            setLoading(false);
        }
    }, [date, customerInput, shakeProfit, addAttendance]);

    const handleDelete = useCallback(async (a) => {
        if (!window.confirm("Delete this attendance record?")) return;
        try {
            await deleteAttendance(a.id);
            useStore.getState().showToast("Attendance deleted", "success");
        } catch(e) {
            useStore.getState().showToast(e.message || "Error deleting attendance", "error");
        }
    }, [deleteAttendance]);

    const activeRecords = useMemo(() => {
        if (!Array.isArray(attendance)) return [];
        return attendance.filter(a => {
            if (!a.date) return false;
            const recordDate = a.date.split('T')[0];
            if (recordDate !== date) return false;
            if (showOnlyMyAttendance && a.recorded_by !== user?.email) return false;
            return true;
        });
    }, [attendance, date, showOnlyMyAttendance, user]);

    const summary = useMemo(() => {
        let present = 0;
        let custom = 0;
        let profit = 0;
        activeRecords.forEach(a => {
            if (a.status === 'default') {
                present++;
            } else {
                custom++;
            }
            profit += (a.shakeProfit || 0);
        });
        return { present, custom, profit };
    }, [activeRecords]);

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <h2>Daily Attendance</h2>
            </div>

            <div className="card-grid" style={{ padding: 0, marginBottom: 20 }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 50, height: 50, borderRadius: 25, background: 'rgba(59,130,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                        <Calendar size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Select Date</label>
                        <input type="date" max={new Date().toISOString().split('T')[0]} value={date} onChange={e=>setDate(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, fontSize: 16, width: '100%', maxWidth: 200, outline: 'none' }} />
                    </div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Total Attendees</p>
                    <p style={{ fontSize: 24, fontWeight: 'bold' }}>{activeRecords.length}</p>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Total Shake Profit</p>
                    <p style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--accent-color)' }}>{formatRupees(summary.profit * 100)}</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 30 }}>
                <h3 style={{ marginBottom: 15 }}>Log Attendance</h3>
                <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 2, minWidth: 200 }}>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Customer Name</label>
                        <input 
                            list="attendance-customer-list"
                            value={customerInput} 
                            onChange={e=>setCustomerInput(e.target.value)}
                            placeholder="Select or type new customer"
                            style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--card-bg)', outline: 'none' }}
                        />
                        <datalist id="attendance-customer-list">
                            {activeCustomers.map(c => (
                                <option key={c.id} value={c.name} />
                            ))}
                        </datalist>
                    </div>
                    <div style={{ flex: 1, minWidth: 150 }}>
                        <label style={{ display: 'block', fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Profit Override (Rs.)</label>
                        <input type="number" inputMode="decimal" placeholder="Default if empty" value={shakeProfit} onChange={e=>setShakeProfit(e.target.value)} style={{ width: '100%', padding: '10px 15px', border: '1px solid var(--border-color)', borderRadius: 8 }} />
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button disabled={loading} className="btn" style={{ background: '#16a34a', color: 'white', border: 'none', minWidth: 120, display: 'flex', justifyContent: 'center' }} onClick={() => onSubmit('Present')}>
                            <Check size={18} /> Mark Present
                        </button>
                        <button disabled={loading} className="btn" style={{ background: 'var(--alert-color)', color: 'white', border: 'none', minWidth: 120, display: 'flex', justifyContent: 'center' }} onClick={() => onSubmit('Absent')}>
                            <X size={18} /> Mark Custom
                        </button>
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Profit Generated</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Recorded By</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeRecords.map(a => (
                            <AttendanceRecord 
                                key={a.id} 
                                record={a} 
                                onDelete={handleDelete}
                                canDelete={perm.canManageUsers || a.recorded_by === user?.email}
                            />
                        ))}
                        {activeRecords.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ padding: '20px' }}>
                                    <EmptyState 
                                        icon={<Users size={48} />}
                                        title="No Attendance Recorded" 
                                        message="Zero attendance recorded for this date."
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
