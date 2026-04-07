import { useState, useMemo } from 'react';
import useStore from '../store/useStore';
import { Trash2 } from 'lucide-react';

export function Sales() {
    const { sales, stock, user, addSale } = useStore();
    const isAdmin = user?.role === 'admin';
    const [search, setSearch] = useState('');

    const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], customer: '', stock_id: '', qty: 1 });

    const onSubmit = async (e) => {
        e.preventDefault();
        const selected = stock.find(s => s.id === parseInt(form.stock_id));
        if (!selected) return alert("Select product");
        
        try {
            await addSale({ ...form, sale_price: selected.sp });
            setForm(f => ({ ...f, customer: '', stock_id: '', qty: 1 }));
        } catch (err) {
            alert("Failed. Check stock availability.");
        }
    };

    const filteredSales = useMemo(() => {
        return sales.filter(s => s.customer.toLowerCase().includes(search.toLowerCase()) || (s.product_name || '').toLowerCase().includes(search.toLowerCase()));
    }, [sales, search]);

    return (
        <div>
            <h2>Sales Records</h2>
            <div className="card" style={{margin: '20px 0'}}>
                <form onSubmit={onSubmit} className="flex gap-4 items-center" style={{flexWrap: 'wrap'}}>
                    <input type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} style={{width:160}} required />
                    <input placeholder="Customer Name" value={form.customer} onChange={e=>setForm({...form, customer: e.target.value})} style={{flex:1, minWidth:200}} required />
                    <select value={form.stock_id} onChange={e=>setForm({...form, stock_id: e.target.value})} style={{flex:1, minWidth:200}} required>
                        <option value="">Select Product...</option>
                        {stock.map(s => (
                            <option key={s.id} value={s.id}>{s.product_name} ({s.flavor}) - Avail: {s.qty}</option>
                        ))}
                    </select>
                    <input type="number" min="1" value={form.qty} onChange={e=>setForm({...form, qty: parseInt(e.target.value)||1})} style={{width: 80}} required />
                    <button type="submit" className="btn btn-primary">Add Sale</button>
                </form>
            </div>

            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <input placeholder="Search records..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth: 300}} />
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th className="text-right">Qty</th>
                            <th className="text-right">Total</th>
                            <th className="text-right">Profit</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(s => (
                            <tr key={s.id}>
                                <td>{s.date}</td>
                                <td><strong>{s.customer}</strong></td>
                                <td>{s.product_name} ({s.flavor})</td>
                                <td className="text-right">{s.qty}</td>
                                <td className="text-right">₹{s.total_amount}</td>
                                <td className="text-right" style={{color: s.profit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)'}}>
                                    {s.profit >= 0 ? '+' : ''}₹{s.profit}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
