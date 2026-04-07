import { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { Check, X } from 'lucide-react';

export function Attendance() {
    const { attendance, addAttendance } = useStore();
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [name, setName] = useState('');

    const onSubmit = async (status) => {
        if (!name.trim()) return alert("Enter customer name");
        try {
            await addAttendance({ date, name, status });
            setName('');
        } catch (e) {
            alert("Error logging attendance");
        }
    };

    const grouped = useMemo(() => {
        const g = {};
        attendance.forEach(a => {
            if (!g[a.date]) g[a.date] = [];
            g[a.date].push(a);
        });
        return g;
    }, [attendance]);

    const activeRecords = grouped[date] || [];

    return (
        <div>
            <h2>Daily Attendance</h2>
            
            <div className="card" style={{margin: '20px 0', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap'}}>
                <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:160}} required />
                <input placeholder="Customer Name" value={name} onChange={e=>setName(e.target.value)} style={{flex:1, minWidth:200}} />
                
                <button className="btn btn-primary" onClick={() => onSubmit('Present')}><Check size={18}/> Mark Present</button>
                <button className="btn btn-danger" onClick={() => onSubmit('Absent')}><X size={18}/> Mark Absent</button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeRecords.map(a => (
                            <tr key={a.id}>
                                <td><strong>{a.name}</strong></td>
                                <td style={{color: a.status === 'Present' ? 'var(--primary-color)' : 'var(--alert-color)', fontWeight: 600}}>
                                    {a.status}
                                </td>
                            </tr>
                        ))}
                        {activeRecords.length === 0 && (
                            <tr><td colSpan="2" style={{textAlign:'center', padding: 20, color:'var(--text-light)'}}>No records for {date}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
