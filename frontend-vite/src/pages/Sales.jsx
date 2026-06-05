import { useState, useMemo, useCallback } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2 } from 'lucide-react';
import { AddSaleModal } from '../components/AddSaleModal';
import { useDebounce } from '../hooks/useDebounce';

export function Sales() {
    const { sales, user } = useStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    // PERFORMANCE: Debounce search to avoid expensive filtering on every keystroke
    const debouncedSearch = useDebounce(search, 300);

    const handleDelete = useCallback(async (itemId, productCount) => {
        const warning = productCount > 1 
            ? `Are you sure you want to delete this product from the sale?` 
            : 'Are you sure you want to delete this sale? This action cannot be undone.';
        if (!window.confirm(warning)) return;
        try {
            const { deleteSaleItem } = useStore.getState();
            await deleteSaleItem(itemId);
            useStore.getState().showToast('Sale item deleted successfully', 'success');
        } catch (err) {
            let msg = err.message || 'Failed to delete sale';
            if (msg.includes("SQLITE_")) {
                msg = "Database error: Failed to delete sale.";
            }
            useStore.getState().showToast(msg, 'error');
        }
    }, []);

    const filteredSales = useMemo(() => {
        if (!Array.isArray(sales)) return [];
        return sales.filter(s => {
            const customer = (s?.customer || '').toLowerCase();
            const product = (s?.product_name || '').toLowerCase();
            const q = debouncedSearch.toLowerCase();
            return customer.includes(q) || product.includes(q);
        });
    }, [sales, debouncedSearch]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <h2>Sales Records</h2>
                <div className="flex gap-4">
                    <input placeholder="Search records..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth: 300}} />
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16}/> Add Sale
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Qty</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total (₹)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Profit (₹)</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(s => (
                            <tr key={s.item_id || s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px 16px' }}>{s.date ? new Date(s.date).toLocaleDateString() : 'N/A'}</td>
                                <td style={{ padding: '12px 16px' }}><strong>{s.customer}</strong></td>
                                <td style={{ padding: '12px 16px' }}>{s.product_name} {s.flavor ? `(${s.flavor})` : ''}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{s.qty}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>{s.total_amount}</td>
                                <td style={{ padding: '12px 16px', textAlign: 'right', color: s.profit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)' }}>
                                    {s.profit >= 0 ? '+' : ''}{s.profit}
                                </td>
                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                    <button className="btn icon-btn" style={{color:'var(--alert-color)'}} onClick={() => {
                                        const productCount = sales.filter(x => x.id === s.id).length;
                                        handleDelete(s.item_id || s.id, productCount);
                                    }}>
                                        <Trash2 size={16}/>
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No sales records found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && <AddSaleModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
