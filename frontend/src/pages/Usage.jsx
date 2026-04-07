import { useState } from 'react';
import useStore from '../store/useStore';

// Memoized input component to prevent re-render issues and solve keyboard dismissal on mobile
function UsageInput({ val, fieldName, onCommit }) {
    const [localVal, setLocalVal] = useState(val);
    
    return (
        <input 
            type="number" 
            value={localVal === 0 ? '0' : localVal} 
            onChange={e => setLocalVal(parseFloat(e.target.value) || 0)}
            onBlur={() => onCommit(fieldName, localVal)}
            onKeyDown={e => e.key === 'Enter' && onCommit(fieldName, localVal)}
            style={{ width: 80, padding: 6, textAlign:'right' }} 
        />
    );
}

export function Usage() {
    const { usage, updateUsage } = useStore();
    const [search, setSearch] = useState('');

    const handleCommit = (id, fieldName, val) => {
        const payload = {};
        const activeItem = usage.find(u => u.id === id);
        if(!activeItem) return;

        // Clone current state and update single value
        ['f1', 'pp', 'afresh', 'others', 'sp'].forEach(k => payload[k] = activeItem[k]);
        payload[fieldName] = val;
        
        updateUsage(id, payload);
    };

    const filtered = search ? usage.filter(u => u.name.toLowerCase().includes(search.toLowerCase())) : usage;

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <h2 style={{minWidth:120}}>Personal Usage</h2>
                <input 
                    placeholder="Search customers..." 
                    value={search} onChange={e=>setSearch(e.target.value)} 
                    style={{maxWidth: 300}} 
                />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Customer Name</th>
                            <th className="text-right">F1 (-3)</th>
                            <th className="text-right">PP (-1)</th>
                            <th className="text-right">Afresh (-2)</th>
                            <th className="text-right">Others (-30)</th>
                            <th className="text-right">Total reduction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => (
                            <tr key={u.id}>
                                <td><strong style={{color:'var(--text-dark)'}}>{u.name}</strong></td>
                                <td className="text-right"><UsageInput val={u.f1} fieldName="f1" onCommit={(f,v)=>handleCommit(u.id, f, v)} /></td>
                                <td className="text-right"><UsageInput val={u.pp} fieldName="pp" onCommit={(f,v)=>handleCommit(u.id, f, v)} /></td>
                                <td className="text-right"><UsageInput val={u.afresh} fieldName="afresh" onCommit={(f,v)=>handleCommit(u.id, f, v)} /></td>
                                <td className="text-right"><UsageInput val={u.others} fieldName="others" onCommit={(f,v)=>handleCommit(u.id, f, v)} /></td>
                                <td className="text-right">
                                    <UsageInput val={u.sp} fieldName="sp" onCommit={(f,v)=>handleCommit(u.id, f, v)} />
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan="6" style={{textAlign:'center', padding: 20, color:'var(--text-light)'}}>No active usage trackers matching the criteria.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
