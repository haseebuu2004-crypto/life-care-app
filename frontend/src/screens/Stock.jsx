"use client";
import { useState, useMemo, memo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Package, Plus, Trash2, Minus } from 'lucide-react';
import { AddStockModal } from '../components/AddStockModal';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';
import EmptyState from '../components/EmptyState';
import { formatRupees } from '../utils/currency';

const StockRow = memo(({ item, isAdmin, canEditStockQty, updateStockQuantity, deleteStock, readOnly }) => {
    const [tempQty, setTempQty] = useState(item.stock);

    useEffect(() => {
        setTempQty(item.stock);
    }, [item.stock]);
    
    const handleQtyChange = (e) => setTempQty(e.target.value);
    
    const saveQty = () => {
        const q = parseInt(tempQty);
        if (!isNaN(q) && q !== item.stock) {
            updateStockQuantity(item.inventoryId, q).catch(err => {
                useStore.getState().showToast(err.message, 'error');
                setTempQty(item.stock); // revert on error
            });
        }
    };
    
    const handleBlur = () => saveQty();
    const handleKeyDown = (e) => { if (e.key === 'Enter') e.target.blur(); };

    const increment = () => {
        const newQ = parseInt(tempQty || 0) + 1;
        setTempQty(newQ);
        updateStockQuantity(item.inventoryId, newQ).catch(() => setTempQty(item.stock));
    };
    
    const decrement = () => {
        const newQ = Math.max(0, parseInt(tempQty || 0) - 1);
        setTempQty(newQ);
        updateStockQuantity(item.inventoryId, newQ).catch(() => setTempQty(item.stock));
    };

    const isLowStock = item.stock <= item.lowStockThreshold && item.alertEnabled;

    return (
        <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>{item.displayName}</strong>
                    {isLowStock && (
                        <div 
                            style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                backgroundColor: 'var(--alert-color)',
                                flexShrink: 0
                            }} 
                            title="Low Stock"
                        />
                    )}
                </div>
            </td>
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
                    <span style={{ fontWeight: isLowStock ? 'bold' : 'normal', color: isLowStock ? 'var(--alert-color)' : 'inherit', fontSize: '15px' }}>{item.stock}</span>
                )}
            </td>
            <td style={{ padding: '12px 16px' }}>
                {formatRupees(item.vendorPrice * 100)}
            </td>
            <td style={{ padding: '12px 16px' }}>{item.vp}</td>
            {isAdmin && !readOnly && (
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn icon-btn" style={{ color: 'var(--alert-color)' }} onClick={() => {
                        if (window.confirm(`Delete stock for ${item.displayName}?`)) {
                            deleteStock(item.inventoryId).catch(err => useStore.getState().showToast(err.message, 'error'));
                        }
                    }} title="Clear Stock">
                        <Trash2 size={16} />
                    </button>
                </td>
            )}
        </tr>
    );
});

StockRow.displayName = 'StockRow';

export function Stock({ readOnly = false }) {
    const { inventoryEntities, fetchInventoryEntities, updateStockQuantity, deleteStock } = useStore();
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const perm = usePermissions();
    const canDelete = perm.isAdmin && !readOnly;
    const canEditStockQty = perm.canEditStockQty && !readOnly;
    const canAddStock = perm.canAddStock && !readOnly;

    useEffect(() => {
        if (!inventoryEntities || inventoryEntities.length === 0) {
            fetchInventoryEntities();
        }
    }, [inventoryEntities, fetchInventoryEntities]);

    const activeEntities = useMemo(() => {
        return (inventoryEntities || []).filter(e => e.isActive === true && e.hasStockRecord === true);
    }, [inventoryEntities]);

    const debouncedSearch = useDebounce(search, 300);

    const filteredStock = useMemo(() => {
        let result = activeEntities;
        if (debouncedSearch) {
            const q = debouncedSearch.toLowerCase();
            result = result.filter(s => 
                s.displayName.toLowerCase().includes(q)
            );
        }
        return result; 
    }, [activeEntities, debouncedSearch]);

    const { totalStockValue, totalStockVp, lowStockItems } = useMemo(() => {
        let value = 0;
        let vp = 0;
        let low = 0;
        activeEntities.forEach(s => {
            const qty = s.stock || 0;
            const sp = s.vendorPrice || 0; 
            const sVp = s.vp || 0;
            value += qty * sp;
            vp += qty * sVp;
            if (qty <= s.lowStockThreshold && s.alertEnabled) low++;
        });
        return { totalStockValue: value, totalStockVp: vp, lowStockItems: low };
    }, [activeEntities]);

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
                        <div style={{ fontSize: 24, fontWeight: 'bold', color: '#10b981' }}>{totalStockVp.toFixed(2)}</div>
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
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Entity</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Remaining Qty</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Vendor Price</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>V.P</th>
                            {canDelete && <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStock.map(item => (
                            <StockRow 
                                key={item.inventoryId} 
                                item={item} 
                                isAdmin={perm.isAdmin} 
                                canEditStockQty={canEditStockQty}
                                updateStockQuantity={updateStockQuantity}
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
