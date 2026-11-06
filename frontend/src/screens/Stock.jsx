"use client";
import { useState, useMemo, memo, useEffect, useRef, useCallback } from 'react';
import useStore from '../store/useStore';
import { Plus, Minus, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import { AddStockModal } from '../components/AddStockModal';
import { useDebounce } from '../hooks/useDebounce';
import { usePermissions } from '../hooks/usePermissions';
import EmptyState from '../components/EmptyState';
import { formatRupees } from '../utils/currency';

const StockRow = memo(({ item, isAdmin, canEditStockQty, updateStockQuantity, deleteStock, readOnly }) => {
    const [tempQty, setTempQty] = useState(item.stock);
    const [isSyncing, setIsSyncing] = useState(false);

    const debounceTimerRef = useRef(null);
    const abortControllerRef = useRef(null);
    const pendingQtyRef = useRef(null);
    const isEditingRef = useRef(false);
    const requestSeqRef = useRef(0);

    // Sync from prop ONLY when user is NOT actively editing or awaiting debounce/sync
    useEffect(() => {
        if (!isEditingRef.current && pendingQtyRef.current === null) {
            setTempQty(item.stock);
        }
    }, [item.stock]);

    // Cleanup timers and in-flight requests on unmount, and flush pending change
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
                abortControllerRef.current = null;
            }
            // If component unmounts with a pending target quantity, flush it immediately
            if (pendingQtyRef.current !== null && pendingQtyRef.current !== item.stock) {
                updateStockQuantity(item.inventoryId, pendingQtyRef.current).catch(console.error);
            }
        };
    }, [item.inventoryId, item.stock, updateStockQuantity]);

    const executeCommit = useCallback(async (targetQty) => {
        const q = parseInt(targetQty, 10);
        if (isNaN(q) || q < 0) {
            setTempQty(item.stock);
            isEditingRef.current = false;
            pendingQtyRef.current = null;
            setIsSyncing(false);
            return;
        }

        // If target equals the server's confirmed stock, no network call needed
        if (q === item.stock) {
            isEditingRef.current = false;
            pendingQtyRef.current = null;
            setIsSyncing(false);
            return;
        }

        // Abort previous in-flight request if any
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;
        const currentSeq = ++requestSeqRef.current;
        pendingQtyRef.current = q;
        setIsSyncing(true);

        try {
            await updateStockQuantity(item.inventoryId, q, { signal: controller.signal });

            // Only mark finished if this was the latest sequence
            if (requestSeqRef.current === currentSeq) {
                isEditingRef.current = false;
                pendingQtyRef.current = null;
                setIsSyncing(false);
            }
        } catch (err) {
            // Ignore deliberate cancellations
            if (err?.name === 'CanceledError' || err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') {
                return;
            }

            // Only handle failure if this request is still the active sequence
            if (requestSeqRef.current === currentSeq) {
                useStore.getState().showToast(err.message || 'Failed to update stock', 'error');
                setTempQty(item.stock);
                isEditingRef.current = false;
                pendingQtyRef.current = null;
                setIsSyncing(false);
            }
        } finally {
            if (abortControllerRef.current === controller) {
                abortControllerRef.current = null;
            }
        }
    }, [item.inventoryId, item.stock, updateStockQuantity]);

    const scheduleCommit = useCallback((targetQty) => {
        isEditingRef.current = true;
        pendingQtyRef.current = targetQty;
        setIsSyncing(true);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            debounceTimerRef.current = null;
            executeCommit(targetQty);
        }, 400); // 400ms trailing debounce window
    }, [executeCommit]);

    const handleQtyChange = (e) => {
        const val = e.target.value.replace(/[^0-9]/g, '');
        isEditingRef.current = true;
        setTempQty(val);
        setIsSyncing(true);
    };

    const handleBlur = () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }
        const q = parseInt(tempQty, 10);
        if (!isNaN(q)) {
            executeCommit(q);
        } else {
            setTempQty(item.stock);
            isEditingRef.current = false;
            setIsSyncing(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.target.blur();
        }
    };

    const increment = () => {
        setTempQty(prev => {
            const current = parseInt(prev, 10);
            const base = isNaN(current) ? (item.stock || 0) : current;
            const newQ = base + 1;
            scheduleCommit(newQ);
            return newQ;
        });
    };

    const decrement = () => {
        setTempQty(prev => {
            const current = parseInt(prev, 10);
            const base = isNaN(current) ? (item.stock || 0) : current;
            const newQ = Math.max(0, base - 1);
            scheduleCommit(newQ);
            return newQ;
        });
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, position: 'relative' }}>
                        <button 
                            className="btn icon-btn" 
                            onClick={decrement} 
                            disabled={parseInt(tempQty) <= 0} 
                            style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'white' }}
                            title="Decrease quantity"
                        >
                            <Minus size={14} />
                        </button>
                        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                            <input 
                                type="text" 
                                inputMode="numeric" 
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
                                    border: isSyncing ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                                    background: isSyncing ? '#f5f3ff' : 'white',
                                    transition: 'border-color 0.2s ease, background-color 0.2s ease'
                                }} 
                            />
                            {isSyncing && (
                                <span 
                                    style={{
                                        position: 'absolute',
                                        top: -3,
                                        right: -3,
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        backgroundColor: 'var(--primary-color)'
                                    }}
                                    title="Syncing with cloud..."
                                />
                            )}
                        </div>
                        <button 
                            className="btn icon-btn" 
                            onClick={increment} 
                            style={{ padding: '4px', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'white' }}
                            title="Increase quantity"
                        >
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
                    <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                        <input 
                            placeholder="Search stock..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            style={{ width: '100%', paddingRight: search ? 30 : 14 }} 
                        />
                        {search && (
                            <button 
                                className="icon-btn" 
                                onClick={() => setSearch('')} 
                                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 4 }}
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
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
