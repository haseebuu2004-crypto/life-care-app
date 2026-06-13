"use client";
import { useState, useMemo, useCallback } from 'react';
import useStore from '../store/useStore';
import { formatRupees } from '../utils/currency';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { AddSaleModal } from '../components/AddSaleModal';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import { ShoppingCart } from 'lucide-react';

function SaleRow({ sale, onDelete }) {
    const [expanded, setExpanded] = useState(false);
    const perm = usePermissions();
    const { user } = useAuth();

    return (
        <>
            <tr style={{ borderBottom: expanded ? 'none' : '1px solid #f1f5f9', background: expanded ? '#f8fafc' : 'transparent' }}>
                <td style={{ padding: '12px 16px', width: 40 }}>
                    <button onClick={() => setExpanded(!expanded)} className="icon-btn">
                        {expanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                    </button>
                </td>
                <td style={{ padding: '12px 16px' }}>{sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}</td>
                <td style={{ padding: '12px 16px' }}><strong>{sale.customer}</strong></td>
                <td style={{ padding: '12px 16px', color: 'var(--text-light)' }}>{sale.recorded_by}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>{formatRupees((sale.total_amount || 0) * 100)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: sale.total_profit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)' }}>
                    {sale.total_profit >= 0 ? '+' : ''}{formatRupees((sale.total_profit || 0) * 100)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {(perm.canManageUsers || user?.email === sale.recorded_by) && (
                        <button className="btn icon-btn" style={{color:'var(--alert-color)'}} onClick={() => onDelete(sale.id)}>
                            <Trash2 size={16}/>
                        </button>
                    )}
                </td>
            </tr>
            {expanded && (
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td colSpan={7} style={{ padding: '10px 40px 20px 60px' }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 15, border: '1px solid #e2e8f0' }}>
                            <table style={{ width: '100%', fontSize: 13 }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: 'left', paddingBottom: 10 }}>Product</th>
                                        <th style={{ textAlign: 'center', paddingBottom: 10 }}>Qty</th>
                                        <th style={{ textAlign: 'right', paddingBottom: 10 }}>Charged</th>
                                        <th style={{ textAlign: 'right', paddingBottom: 10 }}>Profit</th>
                                        {(perm.canManageUsers || user?.email === sale.recorded_by) && (
                                            <th style={{ textAlign: 'right', paddingBottom: 10 }}></th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(sale.items || []).map((item, idx) => (
                                        <tr key={item.item_id || `sale-item-${idx}`}>
                                            <td style={{ padding: '8px 0', borderTop: '1px solid #f1f5f9' }}>
                                                <strong>{item.displayName || 'Unknown Product'}</strong>
                                            </td>
                                            <td style={{ padding: '8px 0', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>{item.qty}</td>
                                            <td style={{ padding: '8px 0', borderTop: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold' }}>{formatRupees((item.sale_price || 0) * 100)}</td>
                                            <td style={{ padding: '8px 0', borderTop: '1px solid #f1f5f9', textAlign: 'right', color: item.profit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)' }}>
                                                {item.profit >= 0 ? '+' : ''}{formatRupees((item.profit || 0) * 100)}
                                            </td>
                                            {(perm.canManageUsers || user?.email === sale.recorded_by) && (
                                                <td style={{ padding: '8px 0', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                                                    <button className="btn icon-btn" style={{color:'var(--alert-color)', padding: 4}} onClick={() => onDelete(sale.id, item.item_id)}>
                                                        <Trash2 size={14}/>
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

export function Sales({ showOnlyMySales = false, autoOpenAdd = false }) {
    const { sales } = useStore();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(autoOpenAdd);

    const debouncedSearch = useDebounce(search, 300);

    const handleDelete = useCallback(async (saleId, itemId = null) => {
        try {
            if (itemId) {
                if (!window.confirm("Are you sure you want to delete this specific item? Its stock will be restored.")) return;
                const { deleteSaleItem } = useStore.getState();
                await deleteSaleItem(itemId);
                useStore.getState().showToast('Sale item deleted successfully', 'success');
            } else {
                if (!window.confirm("Are you sure you want to delete this entire sale transaction? Stock will be restored.")) return;
                const { deleteSale } = useStore.getState();
                await deleteSale(saleId);
                useStore.getState().showToast('Sale deleted successfully', 'success');
            }
        } catch (err) {
            useStore.getState().showToast(err.message || 'Failed to delete', 'error');
        }
    }, []);

    const filteredSales = useMemo(() => {
        if (!Array.isArray(sales)) return [];
        return sales.filter(s => {
            if (showOnlyMySales && s.recorded_by !== user?.email) return false;
            const customer = (s?.customer || '').toLowerCase();
            const q = debouncedSearch.toLowerCase();
            return customer.includes(q);
        });
    }, [sales, debouncedSearch, showOnlyMySales, user]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <h2>Sales Records</h2>
                <div className="flex gap-4">
                    <input placeholder="Search customer..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth: 300}} />
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16}/> Add Sale
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ width: 40 }}></th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Recorded By</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Amount</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Profit</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSales.map(s => (
                            <SaleRow key={s.id} sale={s} onDelete={handleDelete} />
                        ))}
                        {filteredSales.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '20px' }}>
                                    <EmptyState 
                                        icon={<ShoppingCart size={48} />}
                                        title={showOnlyMySales ? "You haven't recorded any sales yet." : "No Sales Found"} 
                                        message={search ? "We couldn't find any sales matching your search." : (showOnlyMySales ? "" : "No sales records have been created yet.")}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && <AddSaleModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
