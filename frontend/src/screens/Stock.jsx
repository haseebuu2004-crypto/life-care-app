"use client";
import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Package, Plus, Trash2, Edit2, Check, X, Minus } from 'lucide-react';
import { AddStockModal } from '../components/AddStockModal';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';
import EmptyState from '../components/EmptyState';
import { formatRupees } from '../utils/currency';

const StockRow = memo(({ item, isAdmin, canEditStockQty, updateStockQuantity, updateStockPrice, deleteStock, readOnly }) => {
    const [tempQty, setTempQty] = useState(item.qty);

    useEffect(() => {
        setTempQty(item.qty);
    }, [item.qty]);
    
    const handleQtyChange = (e) => setTempQty(e.target.value);
    
    const saveQty = () => {
        const q = parseInt(tempQty);
        if (!isNaN(q) && q !== item.qty) {
            updateStockQuantity(item.stock_id, q).catch(err => {
                useStore.getState().showToast(err.message, 'error');
                setTempQty(item.qty); // revert on error
            });
        }
    };
    
    const handleBlur = () => saveQty();
    const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };

    const increment = () => {
        const newQ = parseInt(tempQty || 0) + 1;
        setTempQty(newQ);
        updateStockQuantity(item.stock_id, newQ).catch(() => setTempQty(item.qty));
    };
    
    const decrement = () => {
        const newQ = Math.max(0, parseInt(tempQty || 0) - 1);
        setTempQty(newQ);
        updateStockQuantity(item.stock_id, newQ).catch(() => setTempQty(item.qty));
    };

    const isLowStock = item.qty <= 5;

    return (
        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '12px 16px' }}>
                <strong>{item.product_name}</strong>
                {isLowStock && (
                    <span style={{ 
                        display: 'inline-block', marginLeft: 8, padding: '2px 8px', 
                        background: 'var(--alert-bg)', color: 'var(--alert-color)', 
                        fontSize: 10, borderRadius: 12, fontWeight: 'bold' 
                     }}>
                        LOW
                    </span>
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>{item.flavor || 'Standard'}</td>
            <td style={{ padding: '12px 16px' }}>
                {canEditStockQty && !readOnly ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button className="btn icon-btn" onClick={decrement} disabled={parseInt(tempQty) <= 0} style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'white' }}>
                            <Minus size={14} />
                        </button>
                        <input type="number" value={tempQty} onChange={handleQtyChange} onBlur={handleBlur} onKeyDown={handleKeyDown} style={{ width: 60, padding: '6px', textAlign: 'center', fontWeight: isLowStock ? 'bold' : 'normal', color: isLowStock ? 'var(--alert-color)' : 'inherit', margin: 0, borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                        <button className="btn icon-btn" onClick={increment} style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'white' }}>
                            <Plus size={14} />
                        </button>
                    </div>
                ) : (
                    <span style={{ fontWeight: isLowStock ? 'bold' : 'normal', color: isLowStock ? 'var(--alert-color)' : 'inherit', fontSize: '15px' }}>{item.qty}</span>
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>
                {formatRupees(item.vendor_price * 100)}
            </td>
            <td style={{ padding: '12px 16px' }}>{item.vp}</td>
            {isAdmin && !readOnly && (
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn icon-btn" style={{ color: 'var(--alert-color)' }} onClick={() => {
                        if (window.confirm(`Delete ${item.product_name} (${item.flavor || 'Standard'})?`)) {
                            deleteStock(item.stock_id).catch(err => useStore.getState().showToast(err.message, 'error'));
                        }
                    }} title="Delete Product">
                        <Trash2 size={16} />
                    </button>
                </td>
            )}
        </tr>
    );
});

StockRow.displayName = 'StockRow';

export function Stock({ readOnly = false }) {
    const { stock, updateStockQuantity, updateStockPrice, deleteStock } = useStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const perm = usePermissions();
    const canDelete = perm.isAdmin && !readOnly;
    const canEditStockQty = perm.canEditStockQty && !readOnly;
    const canAddStock = perm.canAddStock && !readOnly;

    const debouncedSearch = useDebounce(search, 300);

    const filteredStock = useMemo(() => {
        let result = stock || [];
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(s => 
                s.product_name.toLowerCase().includes(q) || 
                (s.flavor || '').toLowerCase().includes(q)
            );
        }
        return result; 
    }, [stock, debouncedSearch]);

    const { totalStockValue, totalStockVp, lowStockItems } = useMemo(() => {
        let value = 0;
        let vp = 0;
        let low = 0;
        (stock || []).forEach(s => {
            const qty = s.qty || 0;
            const sp = s.vendor_price || 0; // Using vendor_price for rough stock value estimation, since SP is variable
            const sVp = s.vp || 0;
            value += qty * sp;
            vp += qty * sVp;
            if (qty <= 5) low++;
        });
        return { totalStockValue: value, totalStockVp: vp, lowStockItems: low };
    }, [stock]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                <h2 style={{ margin: 0 }}>Stock Overview</h2>
                <div className="flex gap-4" style={{ flex: 1, justifyContent: 'flex-end', minWidth: 300 }}>
                    <input placeholder="Search stock..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300, flex: 1 }} />
                    {canAddStock && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={16} /> Add Stock
                        </button>
                    )}
                </div>
            </div>

            {perm.isAdmin && !readOnly && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15, marginBottom: 20 }}>
                    <div className="card" style={{ padding: 15, borderLeft: '4px solid #0ea5e9' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Total Stock Value</div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#0ea5e9' }}>{formatRupees(totalStockValue * 100)}</div>
                    </div>
                    <div className="card" style={{ padding: 15, borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Total Available V.P</div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{totalStockVp}</div>
                    </div>
                    <div className="card" style={{ padding: 15, borderLeft: '4px solid var(--alert-color)' }}>
                        <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 5 }}>Low Stock Items</div>
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: 'var(--alert-color)' }}>{lowStockItems}</div>
                    </div>
                </div>
            )}

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Flavour</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Remaining Qty</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Vendor Price</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>V.P</th>
                            {canDelete && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map(item => (
                            <StockRow 
                                key={item.id} 
                                item={item} 
                                isAdmin={perm.isAdmin} 
                                canEditStockQty={canEditStockQty}
                                updateStockQuantity={updateStockQuantity}
                                updateStockPrice={updateStockPrice}
                                deleteStock={deleteStock} 
                                readOnly={readOnly}
                            />
                        ))}
                    </tbody>
                </table>
                {filteredStock.length === 0 && (
                    <EmptyState 
                        icon={<Package size={48} />}
                        title="No Products Found" 
                        message={search ? "We couldn't find any stock items matching your search." : "No stock has been added yet."}
                    />
                )}
            </div>

            {showModal && <AddStockModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
