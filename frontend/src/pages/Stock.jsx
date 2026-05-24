import { useState, useMemo, memo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Plus, Minus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { AddStockModal } from '../components/AddStockModal';
import { useDebounce } from '../hooks/useDebounce';

import { usePermissions } from '../hooks/usePermissions';

const StockRow = memo(({ item, isAdmin, canEditStockQty, updateStockQuantity, updateStockPrice, deleteStock }) => {
    const [tempQty, setTempQty] = useState(item.qty.toString());
    const [tempPrice, setTempPrice] = useState(item.sp.toString());
    const isLowStock = item.qty <= 5;

    // Keep tempQty in sync with actual qty when it changes from outside
    useEffect(() => {
        setTempQty(item.qty.toString());
        setTempPrice(item.sp.toString());
    }, [item.qty, item.sp]);

    const handleQtyChange = (e) => {
        setTempQty(e.target.value);
    };

    const handlePriceChange = (e) => {
        setTempPrice(e.target.value);
    };

    const commitQty = (newQtyStr) => {
        let val = parseInt(newQtyStr);
        if (isNaN(val) || val < 0) val = item.qty;
        setTempQty(val.toString());
        
        if (val !== item.qty) {
            updateStockQuantity(item.id, val).catch(err => {
                useStore.getState().showToast(err.message, 'error');
                setTempQty(item.qty.toString());
            });
        }
    };

    const commitPrice = (newPriceStr) => {
        let val = Number(newPriceStr);
        if (isNaN(val) || val < 0) val = item.sp;
        setTempPrice(val.toString());
        
        if (val !== item.sp) {
            updateStockPrice(item.id, val).catch(err => {
                useStore.getState().showToast(err.message, 'error');
                setTempPrice(item.sp.toString());
            });
        }
    };

    const handleBlur = () => {
        commitQty(tempQty);
    };

    const handlePriceBlur = () => {
        commitPrice(tempPrice);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur(); // Triggers blur to commit
        }
    };

    const increment = () => {
        const val = parseInt(tempQty) || 0;
        commitQty((val + 1).toString());
    };

    const decrement = () => {
        const val = parseInt(tempQty) || 0;
        if (val > 0) {
            commitQty((val - 1).toString());
        }
    };

    return (
        <tr style={{ background: isLowStock ? 'rgba(239, 68, 68, 0.05)' : 'transparent', borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '12px 16px' }}>
                <strong>{item.product_name}</strong>
                {isLowStock && (
                    <span style={{ marginLeft: 8, fontSize: 11, background: 'var(--alert-color)', color: 'white', padding: '2px 6px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={10} /> Low Stock
                    </span>
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>{item.flavor || 'Standard'}</td>
            <td style={{ padding: '12px 16px' }}>
                {canEditStockQty ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <button 
                            className="btn icon-btn" 
                            onClick={decrement} 
                            disabled={parseInt(tempQty) <= 0}
                            style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'white' }}
                        >
                            <Minus size={14} />
                        </button>
                        
                        <input 
                            type="number" 
                            value={tempQty} 
                            onChange={handleQtyChange}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            style={{ 
                                width: 60, 
                                padding: '6px', 
                                textAlign: 'center',
                                fontWeight: isLowStock ? 'bold' : 'normal', 
                                color: isLowStock ? 'var(--alert-color)' : 'inherit',
                                margin: 0,
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                        
                        <button 
                            className="btn icon-btn" 
                            onClick={increment}
                            style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'white' }}
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                ) : (
                    <span style={{ 
                        fontWeight: isLowStock ? 'bold' : 'normal', 
                        color: isLowStock ? 'var(--alert-color)' : 'inherit',
                        fontSize: '15px'
                    }}>
                        {item.qty}
                    </span>
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>
                {isAdmin ? (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: 4 }}>₹</span>
                        <input 
                            type="number" 
                            value={tempPrice} 
                            onChange={handlePriceChange}
                            onBlur={handlePriceBlur}
                            onKeyDown={handleKeyDown}
                            style={{ 
                                width: 80, 
                                padding: '6px', 
                                margin: 0,
                                borderRadius: '4px',
                                border: '1px solid var(--border-color)'
                            }}
                        />
                    </div>
                ) : (
                    `₹${item.sp}`
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>{item.vp}</td>
            {isAdmin && (
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn icon-btn" style={{ color: 'var(--alert-color)' }} onClick={() => {
                        if (window.confirm(`Delete ${item.product_name} (${item.flavor || 'Standard'})?`)) {
                            deleteStock(item.id).catch(err => useStore.getState().showToast(err.message, 'error'));
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

export function Stock() {
    const { stock, updateStockQuantity, updateStockPrice, deleteStock } = useStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const perm = usePermissions();
    const canDelete = perm.isAdmin;
    const canEditStockQty = perm.canEditStockQty;
    const canAddStock = perm.canAddStock;

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
        return result; // Backend already orders by insertion (pv.id ASC)
    }, [stock, debouncedSearch]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 20, flexWrap: 'wrap', gap: 15 }}>
                <h2 style={{ margin: 0 }}>Stock Overview</h2>
                <div className="flex gap-4" style={{ flex: 1, justifyContent: 'flex-end', minWidth: 300 }}>
                    <input 
                        placeholder="Search stock..." 
                        value={search} onChange={e => setSearch(e.target.value)} 
                        style={{ maxWidth: 300, flex: 1 }} 
                    />
                    {canAddStock && (
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                            <Plus size={16} /> Add Stock
                        </button>
                    )}
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Flavour</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Remaining Qty</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Price</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>V.P</th>
                            {canDelete && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map(item => (
                            <StockRow 
                                key={item.id} 
                                item={item} 
                                isAdmin={canDelete} 
                                canEditStockQty={canEditStockQty}
                                updateStockQuantity={updateStockQuantity}
                                updateStockPrice={updateStockPrice}
                                deleteStock={deleteStock} 
                            />
                        ))}
                    </tbody>
                </table>
                
                {filteredStock.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-light)' }}>
                        <Package size={48} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                        <p>No products found</p>
                    </div>
                )}
            </div>

            {showModal && <AddStockModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
