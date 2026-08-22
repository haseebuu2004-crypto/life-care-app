"use client";
import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { Plus, Trash2, X } from 'lucide-react';
import { formatRupees } from '../utils/currency';
import { usePermissions } from '../hooks/usePermissions';
import { CustomerAutocomplete } from './CustomerAutocomplete';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function AddSaleModal({ onClose }) {
    const { inventoryEntities, fetchInventoryEntities, customers, fetchCustomers, addSale } = useStore();
    const perm = usePermissions();
    
    const [customerInput, setCustomerInput] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState([{ inventoryId: '', qty: 1, sellingPrice: '' }]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCustomers();
        if (!inventoryEntities || inventoryEntities.length === 0) {
            fetchInventoryEntities();
        }
    }, [fetchCustomers, fetchInventoryEntities, inventoryEntities]);

    const activeCustomers = useMemo(() => {
        return (customers || []).filter(c => c.is_active);
    }, [customers]);

    const activeEntities = useMemo(() => {
        return (inventoryEntities || []).filter(e => e.isActive === true);
    }, [inventoryEntities]);

    // For sales, we only want to show entities that actually have stock available
    const availableEntities = useMemo(() => {
        return activeEntities.filter(e => e.stock > 0);
    }, [activeEntities]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        
        if (field === 'inventoryId') {
            newItems[index].sellingPrice = ''; // reset price on change
        }
        
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { inventoryId: '', qty: 1, sellingPrice: '' }]);
    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    const calculations = useMemo(() => {
        let total = 0;
        let profit = 0;
        items.forEach(item => {
            const e = activeEntities.find(st => st.inventoryId === item.inventoryId);
            if (e && item.inventoryId) {
                const costPrice = e.vendorPrice || 0;
                const sellingPrice = parseFloat(item.sellingPrice) || 0;
                const qty = parseInt(item.qty) || 0;
                total += sellingPrice * qty;
                profit += (sellingPrice - costPrice) * qty;
            }
        });
        return { total, profit };
    }, [items, activeEntities]);

    const onSubmit = async (e) => {
        e.preventDefault();
        const t1 = Date.now();
        console.log(`[TIMING] 1. Frontend: the instant the "Complete Sale" button is clicked:`, t1);
        
        if (!customerInput.trim()) return useStore.getState().showToast("Please select or enter a customer", "warn");
        
        const validItems = items.filter(i => i.inventoryId && i.qty > 0 && i.sellingPrice !== '');
        if (validItems.length === 0) return useStore.getState().showToast("At least 1 valid product required", "warn");

        const hasZeroPrice = validItems.some(i => parseFloat(i.sellingPrice) === 0);
        if (hasZeroPrice) {
            const confirmZero = window.confirm("You are charging Rs.0 for this item. Is this intentional?");
            if (!confirmZero) return;
        }

        try {
            setLoading(true);
            const itemsPayload = validItems.map(i => {
                const ent = activeEntities.find(st => st.inventoryId === i.inventoryId);
                return {
                    inventoryId: ent.inventoryId,
                    productVersionId: ent.productVersionId,
                    quantity: parseInt(i.qty) || 1,
                    price_charged: Math.round(i.sellingPrice * 100),
                    standard_price_snap: 0,
                    vendor_price_snap: Math.round((ent.vendorPrice || 0) * 100)
                };
            });

            const payload = {
                sale_date: date,
                items: itemsPayload,
                customer_name: customerInput.trim(),
                __timing_t1: t1 // pass it so backend can log it if needed
            };

            const t2 = Date.now();
            console.log(`[TIMING] 2. Frontend: the instant the API call actually leaves:`, t2);
            await addSale(payload);
            const t7 = Date.now();
            console.log(`[TIMING] 7. Frontend: the instant the response is received by the client:`, t7);
            
            useStore.getState().showToast("Sale completed successfully", "success");
            onClose();
        } catch (err) {
            let msg = err.message || "Failed to complete sale.";
            useStore.getState().showToast(msg, "error");
        } finally {
            setLoading(false);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    console.log(`[TIMING] 8. Frontend: the instant the UI actually updates/unfreezes:`, Date.now());
                });
            });
        }
    };

    const selectStyles = {
        control: (base) => ({
            ...base,
            height: '38px',
            minHeight: '38px',
            borderRadius: '6px',
            borderColor: 'var(--border-color)',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#94a3b8'
            }
        }),
        valueContainer: (base) => ({
            ...base,
            height: '38px',
            padding: '0 8px'
        }),
        input: (base) => ({
            ...base,
            margin: '0',
            padding: '0'
        }),
        indicatorSeparator: () => ({
            display: 'none'
        }),
        indicatorsContainer: (base) => ({
            ...base,
            height: '38px'
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: '200px'
        })
    };

    const entityOptions = availableEntities.map(e => ({
        value: e.inventoryId,
        label: e.displayName,
        entity: e
    }));

    return (
        <div className="modal-overlay">
            <div className="modal" style={{ maxWidth: 800, padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflow: 'hidden' }}>
                <div className="modal-header" style={{ padding: '28px 28px 20px 28px', margin: 0, flexShrink: 0 }}>
                    <span>Add New Sale</span>
                    <button onClick={onClose} className="btn icon-btn"><X size={20}/></button>
                </div>
                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                    <div style={{ overflowY: 'auto', padding: '0 28px' }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Customer Name</label>
                            <CustomerAutocomplete 
                                customers={activeCustomers}
                                value={customerInput}
                                onChange={setCustomerInput}
                            />
                            {activeCustomers.length === 0 && (
                                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>
                                    Type a name to add a new customer on the fly.
                                </div>
                            )}
                        </div>
                        <div className="form-group" style={{ width: 160 }}>
                            <label>Date</label>
                            <DatePicker 
                                selected={date ? new Date(date) : null} 
                                onChange={d => setDate(d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0] : '')} 
                                dateFormat="dd/MM/yyyy" 
                                required 
                                customInput={<input style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)', outline: 'none' }} />}
                            />
                        </div>
                    </div>

                    <div style={{ marginTop: 20, marginBottom: 10, fontWeight: 'bold' }}>Products</div>
                    
                    {items.map((item, index) => {
                        const selectedEntity = activeEntities.find(e => e.inventoryId === item.inventoryId);
                        const costPrice = selectedEntity?.vendorPrice || 0;
                        const sellingPrice = parseFloat(item.sellingPrice) || 0;
                        const rowProfit = (sellingPrice - costPrice) * item.qty;

                        return (
                            <div key={`sale-item-${index}`} style={{ marginBottom: 15, paddingBottom: 10, borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 3fr) 70px 100px 100px 40px', gap: '10px', alignItems: 'start' }}>
                                    
                                    <div>
                                        <Select
                                            options={entityOptions}
                                            value={entityOptions.find(o => o.value === item.inventoryId) || null}
                                            onChange={opt => handleItemChange(index, 'inventoryId', opt ? opt.value : '')}
                                            placeholder="Search product..."
                                            isClearable
                                            isSearchable
                                            styles={selectStyles}
                                            required
                                        />
                                        {selectedEntity && (
                                            <div style={{ fontSize: 11, color: selectedEntity.stock < item.qty ? 'var(--alert-color)' : 'var(--text-light)', marginTop: 4 }}>
                                                Available: {selectedEntity.stock}
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <input 
                                            type="number" min="1" 
                                            inputMode="decimal"
                                            value={item.qty} 
                                            onChange={e => handleItemChange(index, 'qty', parseInt(e.target.value)||0)}
                                            required
                                            title="Quantity"
                                            style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        />
                                    </div>
                                    
                                    <div>
                                        <input 
                                            type="number" min="0" step="0.5"
                                            inputMode="decimal"
                                            value={item.sellingPrice} 
                                            onChange={e => handleItemChange(index, 'sellingPrice', e.target.value)}
                                            onFocus={e => e.target.select()}
                                            required
                                            title="Selling Price"
                                            placeholder="Sell Price"
                                            style={{ width: '100%', height: '38px', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                        />
                                        {selectedEntity && perm.canViewProfit && (
                                            <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>
                                                Vendor Price: {formatRupees(costPrice * 100)}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {perm.canViewProfit && (
                                            <>
                                                <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontWeight: 'bold', color: rowProfit > 0 ? 'var(--primary-color)' : 'var(--alert-color)' }}>
                                                    {selectedEntity && item.sellingPrice !== '' ? formatRupees(rowProfit * 100) : '-'}
                                                </div>
                                                {selectedEntity && item.sellingPrice !== '' && rowProfit < 0 && (
                                                    <div style={{ fontSize: 11, color: 'var(--alert-color)', marginTop: 4, textAlign: 'right' }}>
                                                        Below cost
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <button type="button" onClick={() => removeItem(index)} className="btn icon-btn" style={{color: 'var(--alert-color)', padding: '4px'}} disabled={items.length === 1}>
                                                <Trash2 size={18}/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    <button type="button" onClick={addItem} className="btn btn-outline" style={{ marginTop: 10, width: '100%', borderStyle: 'dashed' }}>
                        <Plus size={16}/> Add Item
                    </button>

                    <div className="flex justify-between items-center" style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--border-color)', fontSize: 16 }}>
                        <div>
                            <span style={{ fontWeight: 'bold' }}>Total Sales: </span>
                            <span style={{ fontSize: 18 }}>{formatRupees(calculations.total * 100)}</span>
                        </div>
                        {perm.canViewProfit && (
                            <div>
                                <span style={{ fontWeight: 'bold' }}>Total Profit: </span>
                                <span style={{ fontSize: 18, color: calculations.profit > 0 ? 'var(--primary-color)' : 'inherit' }}>{formatRupees(calculations.profit * 100)}</span>
                            </div>
                        )}
                    </div>

                    </div>
                    <div className="modal-footer" style={{ padding: '15px 28px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, backgroundColor: 'var(--card-bg)', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Completing Sale...' : 'Complete Sale'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
