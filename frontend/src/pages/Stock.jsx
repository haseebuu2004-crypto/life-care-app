import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2 } from 'lucide-react';

// Isolated debounce input to prevent full re-renders
function EditableQty({ item, onAddQty }) {
    const [val, setVal] = useState(0);

    const commitVal = () => {
        if (val > 0) {
            onAddQty(item.id, val);
            setVal(0);
        }
    };

    return (
        <div style={{ display:'flex', gap: 8, alignItems:'center', justifyContent: 'flex-end' }}>
            <span style={{color: 'var(--text-light)', minWidth: 20}}>{item.qty}</span>
            <input 
                type="number" 
                value={val || ''} 
                onChange={e => setVal(parseInt(e.target.value)||0)} 
                onBlur={commitVal}
                onKeyDown={e => e.key === 'Enter' && commitVal()}
                placeholder="+"
                style={{ width: 60, padding: 6 }} 
            />
        </div>
    );
}

export function Stock() {
    const { stock, user, increaseStock, deleteStock } = useStore();
    const [search, setSearch] = useState('');
    
    const isAdmin = user?.role === 'admin';

    const filtered = useMemo(() => {
        if (!search) return stock;
        return stock.filter(s => 
            s.product_name.toLowerCase().includes(search.toLowerCase()) || 
            (s.flavor || '').toLowerCase().includes(search.toLowerCase())
        );
    }, [stock, search]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <h2 style={{minWidth:120}}>Stock Inventory</h2>
                <input 
                    placeholder="Search product..." 
                    value={search} onChange={e=>setSearch(e.target.value)} 
                    style={{maxWidth: 300}} 
                />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Flavour</th>
                            <th className="text-right">Qty (+Add)</th>
                            <th className="text-right">V.P</th>
                            <th className="text-right">Price</th>
                            {isAdmin && <th></th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(s => (
                            <tr key={s.id}>
                                <td><strong style={{color:'var(--primary-color)'}}>{s.product_name}</strong></td>
                                <td>{s.flavor}</td>
                                <td className="text-right">
                                    <EditableQty item={s} onAddQty={increaseStock} />
                                </td>
                                <td className="text-right">{s.vp}</td>
                                <td className="text-right">₹{s.sp}</td>
                                {isAdmin && (
                                    <td className="text-right">
                                        <button className="btn icon-btn" style={{color:'var(--alert-color)'}} onClick={() => deleteStock(s.id)}>
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
