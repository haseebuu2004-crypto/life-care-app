"use client";
import { useState, useMemo, useEffect } from 'react';
import useStore from '../store/useStore';
import { formatRupees } from '../utils/currency';
import { Search, ChevronDown, ChevronRight, Users, X, Calendar, DollarSign } from 'lucide-react';
import EmptyState from '../components/EmptyState';

function CustomerDetails({ customerId, onClose }) {
    const { fetchCustomerSummary } = useStore();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fetchCustomerSummary(customerId).then(res => {
            if (mounted) {
                setSummary(res);
                setLoading(false);
            }
        });
        return () => { mounted = false; };
    }, [customerId, fetchCustomerSummary]);

    if (loading) return <div style={{ padding: 20, textAlign: 'center' }}>Loading details...</div>;
    if (!summary) return <div style={{ padding: 20, textAlign: 'center', color: 'var(--alert-color)' }}>Failed to load details.</div>;

    const { sales = [], attendance = [], totalSpent = 0, totalSalesProfit = 0, totalShakeProfit = 0 } = summary;
    const totalCombinedProfit = (totalSalesProfit || 0) + (totalShakeProfit || 0);

    return (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, border: '1px solid #e2e8f0', marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18 }}>Customer Analytics</h3>
                <button className="btn icon-btn" onClick={onClose}><X size={20}/></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15, marginBottom: 30 }}>
                <div style={{ padding: 15, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 5 }}>Total Spent</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold' }}>{formatRupees(totalSpent * 100)}</div>
                </div>
                <div style={{ padding: 15, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 5 }}>Sales Profit</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: totalSalesProfit >= 0 ? 'var(--primary-color)' : 'var(--alert-color)' }}>
                        {totalSalesProfit >= 0 ? '+' : ''}{formatRupees(totalSalesProfit * 100)}
                    </div>
                </div>
                <div style={{ padding: 15, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 5 }}>Attendance Profit</div>
                    <div style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--accent-color)' }}>
                        +{formatRupees(totalShakeProfit * 100)}
                    </div>
                </div>
                <div style={{ padding: 15, background: 'var(--primary-color)', color: 'white', borderRadius: 8 }}>
                    <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 5 }}>Total Value Generated</div>
                    <div style={{ fontSize: 20, fontWeight: 'bold' }}>
                        {formatRupees(totalCombinedProfit * 100)}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Sales History */}
                <div>
                    <h4 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16}/> Recent Sales</h4>
                    {sales.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No sales recorded.</p>
                    ) : (
                        <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                                    <tr>
                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Product</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.slice(0, 50).map((s, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px 12px' }}>{new Date(s.sale_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '8px 12px' }}>{s.product_name}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'center' }}>{s.quantity}</td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold' }}>{formatRupees(Number(s.price_charged || 0))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Attendance History */}
                <div>
                    <h4 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={16}/> Recent Attendance</h4>
                    {attendance.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-light)' }}>No attendance recorded.</p>
                    ) : (
                        <div style={{ maxHeight: 300, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 6 }}>
                            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f1f5f9', position: 'sticky', top: 0 }}>
                                    <tr>
                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Date</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'left' }}>Type</th>
                                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Profit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.slice(0, 50).map((a, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '8px 12px' }}>{new Date(a.attendance_date).toLocaleDateString()}</td>
                                            <td style={{ padding: '8px 12px' }}>
                                                <span style={{ 
                                                    padding: '2px 8px', borderRadius: 12, fontSize: 11, 
                                                    background: a.type === 'custom' ? '#e0e7ff' : '#dcfce7',
                                                    color: a.type === 'custom' ? '#4f46e5' : '#16a34a'
                                                }}>
                                                    {a.type === 'custom' ? 'Custom' : 'Present'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--accent-color)', fontWeight: 'bold' }}>
                                                {a.shake_amount !== null ? formatRupees(Number(a.shake_amount)) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomerRow({ customer }) {
    const [expanded, setExpanded] = useState(false);
    
    return (
        <>
            <tr style={{ borderBottom: expanded ? 'none' : '1px solid #f1f5f9', background: expanded ? '#f8fafc' : 'transparent', opacity: customer.is_active ? 1 : 0.6 }}>
                <td style={{ padding: '12px 16px', width: 40 }}>
                    <button onClick={() => setExpanded(!expanded)} className="icon-btn">
                        {expanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                    </button>
                </td>
                <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: 15 }}>{customer.name}</div>
                    {!customer.is_active && <span style={{ fontSize: 11, color: 'var(--alert-color)' }}>Inactive</span>}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--text-light)' }}>
                    {customer.joined_at ? new Date(customer.joined_at).toLocaleDateString() : 'N/A'}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatRupees(Number(customer.total_sales_revenue || 0))}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--primary-color)' }}>
                    {formatRupees(Number(customer.total_sales_profit || 0))}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--accent-color)' }}>
                    {formatRupees(Number(customer.total_shake_profit || 0))}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn btn-outline" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Close' : 'View Details'}
                    </button>
                </td>
            </tr>
            {expanded && (
                <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <td colSpan={7} style={{ padding: '0 40px 20px 60px' }}>
                        <CustomerDetails customerId={customer.id} onClose={() => setExpanded(false)} />
                    </td>
                </tr>
            )}
        </>
    );
}

export function Customers() {
    const { customers } = useStore();
    const [search, setSearch] = useState('');

    const filteredCustomers = useMemo(() => {
        if (!Array.isArray(customers)) return [];
        return customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    }, [customers, search]);

    return (
        <div>
            <div className="flex justify-between items-center" style={{marginBottom: 20}}>
                <div>
                    <h2>Customer Management</h2>
                    <p style={{ color: 'var(--text-light)', fontSize: 14 }}>Track attendance, sales, and generated profits per customer.</p>
                </div>
                <div className="flex gap-4">
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                        <input 
                            placeholder="Search customers..." 
                            value={search} 
                            onChange={e=>setSearch(e.target.value)} 
                            style={{ width: '100%', padding: '10px 14px 10px 35px', borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none' }} 
                        />
                        {search && (
                            <button 
                                className="icon-btn" 
                                onClick={() => setSearch('')} 
                                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', padding: 4 }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ width: 40 }}></th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer Name</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left' }}>Joined Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Spent</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Sales Profit</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Attendance Profit</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right' }}>Analytics</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.map(c => (
                            <CustomerRow key={c.id} customer={c} />
                        ))}
                        {filteredCustomers.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ padding: '20px' }}>
                                    <EmptyState 
                                        icon={<Users size={48} />}
                                        title="No Customers Found" 
                                        message={search ? "No customers match your search." : "You haven't added any customers yet."}
                                    />
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
