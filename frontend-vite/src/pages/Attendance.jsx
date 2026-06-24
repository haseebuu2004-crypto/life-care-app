import { useState, useMemo, useCallback, memo } from 'react';
import useStore from '../store/useStore';
import { usePermissions } from '../hooks/usePermissions';
import { Check, X, Trash2, Calendar } from 'lucide-react';

const AttendanceRecord = memo(({ record, canDelete, onDelete, canViewProfit }) => (
    <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
        <td style={{ padding: '12px 16px' }}><strong>{record.name}</strong></td>
        <td style={{ padding: '12px 16px' }}>
            <span style={{
                display: 'inline-block',
                padding: '2px 10px',
                borderRadius: 20,
                fontSize: 13, fontWeight: 600,
                background: record.status === 'Present' ? '#f0fdf4' : '#fef2f2',
                color: record.status === 'Present' ? '#15803d' : '#b91c1c'
            }}>
                {record.status}
            </span>
        </td>
        {canViewProfit && (
            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                {record.status === 'Present' ? `₹${record.shake_profit || 0}` : '—'}
            </td>
        )}
        {canDelete && (
            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <button className="btn icon-btn" onClick={() => onDelete(record)} style={{ color: 'var(--alert-color)' }}>
                    <Trash2 size={15}/>
                </button>
            </td>
        )}
    </tr>
));

AttendanceRecord.displayName = 'AttendanceRecord';

export function Attendance() {
    const { attendance, addAttendance, deleteAttendance } = useStore();
    const perm = usePermissions();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [name, setName] = useState('');
    const [shakeProfit, setShakeProfit] = useState('');
    const [loading, setLoading] = useState(false);

    const onSubmit = useCallback(async (status) => {
        if (!name.trim()) return useStore.getState().showToast("Select or enter a customer name", "warn");
        
        try {
            setLoading(true);
            const payload = { 
                customerName: name, 
                date, 
                status,
                shakeProfit: shakeProfit !== '' ? Number(shakeProfit) : undefined
            };

            await addAttendance(payload);
            useStore.getState().showToast("Attendance logged", "success");
            setName('');
            setShakeProfit('');
        } catch (error) {
            useStore.getState().showToast(error.message || "Error logging attendance", "error");
        } finally {
            setLoading(false);
        }
    }, [date, name, addAttendance]);

    const handleDelete = useCallback(async (a) => {
        if (!window.confirm("Delete this attendance record?")) return;
        try {
            await deleteAttendance(a.id);
            useStore.getState().showToast("Attendance deleted", "success");
        } catch {
            useStore.getState().showToast("Error deleting attendance", "error");
        }
    }, [deleteAttendance]);

    const activeRecords = useMemo(() => {
        if (!Array.isArray(attendance)) return [];
        return attendance.filter(a => {
            if (!a.date) return false;
            // Handle both full ISO strings from DB and raw YYYY-MM-DD
            const recordDate = a.date.split('T')[0];
            return recordDate === date;
        }).reverse();
    }, [attendance, date]);

    const uniqueCustomers = useMemo(() => {
        if (!Array.isArray(attendance)) return [];
        const customers = attendance.map(a => a.name).filter(Boolean);
        return [...new Set(customers)];
    }, [attendance]);

    const summary = useMemo(() => {
        let present = 0;
        let absent = 0;
        let profit = 0;
        activeRecords.forEach(a => {
            if (a.status === 'Present') {
                present++;
                profit += (a.shake_profit || 0);
            } else {
                absent++;
            }
        });
        return { present, absent, profit };
    }, [activeRecords]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 20 }}>
                <h2 style={{ margin: 0 }}>Daily Attendance</h2>
            </div>

            <div className="card" style={{ marginBottom: 20, padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>Date</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>Customer Name</label>
                        <input 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Enter customer name"
                            required
                            list="attendance-customers"
                            autoComplete="off"
                        />
                        <datalist id="attendance-customers">
                            {uniqueCustomers.map(c => <option key={c} value={c} />)}
                        </datalist>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: 12, color: 'var(--text-light)', fontWeight: 600 }}>Shake Profit (Optional)</label>
                        <input 
                            type="number"
                            value={shakeProfit} 
                            onChange={e => setShakeProfit(e.target.value)} 
                            placeholder="Defaults to 50"
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" style={{ flex: 1, minWidth: 140 }} onClick={() => onSubmit('Present')} disabled={loading}>
                        <Check size={18} style={{ marginRight: 8 }}/> {loading ? 'Logging...' : 'Mark Present'}
                    </button>
                    <button className="btn btn-danger" style={{ flex: 1, minWidth: 140 }} onClick={() => onSubmit('Absent')} disabled={loading}>
                        <X size={18} style={{ marginRight: 8 }}/> {loading ? 'Logging...' : 'Mark Absent'}
                    </button>
                </div>

                {perm.canViewProfit && (
                    <div style={{ marginTop: 15, fontSize: 12, color: 'var(--text-light)', background: '#f8fafc', padding: '10px 15px', borderRadius: 8 }}>
                        <span>
                            Marking present logs the attendance and records profit automatically.
                        </span>
                    </div>
                )}
            </div>

            <div className="card-grid" style={{ padding: 0, marginBottom: 20 }}>
                <div className="card" style={{ borderLeft: '4px solid var(--primary-color)' }}>
                    <div className="card-title">Total Present</div>
                    <div className="card-value" style={{ fontSize: 24, color: 'var(--primary-color)' }}>{summary.present}</div>
                </div>
                <div className="card" style={{ borderLeft: '4px solid var(--alert-color)' }}>
                    <div className="card-title">Total Absent</div>
                    <div className="card-value" style={{ fontSize: 24, color: 'var(--alert-color)' }}>{summary.absent}</div>
                </div>
                {perm.canViewProfit && (
                    <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                        <div className="card-title">Total Profit</div>
                        <div className="card-value" style={{ fontSize: 24, color: '#8b5cf6' }}>₹{summary.profit}</div>
                    </div>
                )}
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                            {perm.canViewProfit && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Profit</th>}
                            {perm.canDeleteAttendance && <th style={{ padding: '12px 16px', textAlign: 'right', width: 80 }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {activeRecords.map(a => (
                            <AttendanceRecord 
                                key={a.id} 
                                record={a} 
                                canDelete={perm.canDeleteAttendance} 
                                canViewProfit={perm.canViewProfit}
                                onDelete={handleDelete} 
                            />
                        ))}
                        {activeRecords.length === 0 && (
                            <tr>
                                <td colSpan={(perm.canDeleteAttendance ? 1 : 0) + (perm.canViewProfit ? 1 : 0) + 2} style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                                    <Calendar size={40} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                                    <p>No records for {new Date(date).toLocaleDateString()}</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
