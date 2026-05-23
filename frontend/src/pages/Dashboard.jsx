import { useMemo, useState } from 'react';
import useStore from '../store/useStore';
import { usePermissions } from '../hooks/usePermissions';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Zap, BarChart2, Package, AlertTriangle, Users, Download, Trash2 } from 'lucide-react';
import { ErrorBoundary } from '../components/ErrorBoundary';

function AdminMetricCard({ icon: Icon, title, value, color, subtitle }) {
    return (
        <div className="card" style={{ borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-light)', fontSize: 13 }}>
                <Icon size={15} color={color} />
                <span>{title}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color }}>{value !== undefined && value !== null && !isNaN(value) ? value : '0'}</div>
            {subtitle && <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{subtitle}</div>}
        </div>
    );
}

function DashboardInner() {
    const { stock, sales, attendance, dashboardStats, isLoading, resetData, exportReport, showToast } = useStore();
    const perm = usePermissions();
    const [isExporting, setIsExporting] = useState(false);

    const { lowStock, monthlySalesInfo, topSellerName, customerProfitArr, totalShakeProfit, shakeProfitArr, totalSalesProfit, totalVpSold, totalStockValue } = useMemo(() => {
        // PERFORMANCE: If we have pre-calculated stats from backend, use them directly
        if (dashboardStats) {
            return {
                lowStock: dashboardStats.lowStockItems || [],
                monthlySalesInfo: dashboardStats.monthlyProductSales || [],
                topSellerName: dashboardStats.totals?.topSeller || 'N/A',
                customerProfitArr: dashboardStats.topCustomers || [],
                totalShakeProfit: dashboardStats.totals?.totalShakeProfit || 0,
                shakeProfitArr: dashboardStats.shakeProfitDetails || [],
                totalSalesProfit: dashboardStats.totals?.totalSalesProfit || 0,
                totalVpSold: dashboardStats.totals?.totalVpSold || 0,
                totalStockValue: dashboardStats.totals?.totalStockValue || 0,
            };
        }

        // Fallback for safety (though store should fetch it)
        const safeStock = Array.isArray(stock) ? stock : [];
        const safeSales = Array.isArray(sales) ? sales : [];
        const safeAttendance = Array.isArray(attendance) ? attendance : [];

        const low = safeStock.filter(s => (s?.qty ?? 0) < 5);

        const now = new Date();
        const currMonth = now.getMonth();
        const currYear = now.getFullYear();

        // Monthly product sales
        const productSales = {};
        let salesProfitTotal = 0;
        let vpSoldTotal = 0;
        safeSales.forEach(sale => {
            if (!sale) return;
            const d = new Date(sale.date);
            if (d.getMonth() === currMonth && d.getFullYear() === currYear) {
                const name = sale.product_name || 'Unknown';
                productSales[name] = (productSales[name] || 0) + (sale.qty || 0);
            }
            salesProfitTotal += (sale.profit || 0);
            const matchStock = safeStock.find(st => st?.id === sale.stock_id);
            if (matchStock) vpSoldTotal += ((matchStock.vp || 0) * (sale.qty || 0));
        });

        const monthlySalesArr = Object.entries(productSales).map(([name, qty]) => ({ name, qty })).sort((a, b) => b.qty - a.qty);
        const topSeller = monthlySalesArr.length > 0 ? monthlySalesArr[0].name : 'N/A';

        // Customer-wise profit from sales
        const customerProfits = {};
        safeSales.forEach(sale => {
            if (sale?.profit) {
                const name = (sale.customer || 'Unknown').trim();
                customerProfits[name] = (customerProfits[name] || 0) + sale.profit;
            }
        });
        const custProfitsSorted = Object.entries(customerProfits).map(([name, profit]) => ({ name, profit })).sort((a, b) => b.profit - a.profit);

        // Shake profit from attendance records
        let shakeProfitTotal = 0;
        const shakeArr = [];
        const nonUsageMap = {};
        
        safeAttendance.filter(a => a?.status === 'Present').forEach(a => {
            if (!a) return;
            const normName = (a.name || '').trim();
            const mapKey = normName.toLowerCase();
            if (!nonUsageMap[mapKey]) {
                nonUsageMap[mapKey] = { name: normName, attendance: 0, totalProfit: 0, profitPerDay: a.shake_profit || 50 };
            }
            nonUsageMap[mapKey].attendance += 1;
            nonUsageMap[mapKey].totalProfit += (a.shake_profit || 50);
            nonUsageMap[mapKey].profitPerDay = a.shake_profit || 50;
            shakeProfitTotal += (a.shake_profit || 50);
        });

        Object.values(nonUsageMap).forEach(v => shakeArr.push(v));
        shakeArr.sort((a, b) => b.totalProfit - a.totalProfit);

        // Total stock value
        const stockVal = safeStock.reduce((sum, s) => sum + ((s?.sp || 0) * (s?.qty || 0)), 0);

        return {
            lowStock: low,
            monthlySalesInfo: monthlySalesArr,
            topSellerName: topSeller,
            customerProfitArr: custProfitsSorted,
            totalShakeProfit: shakeProfitTotal,
            shakeProfitArr: shakeArr,
            totalSalesProfit: salesProfitTotal,
            totalVpSold: vpSoldTotal,
            totalStockValue: stockVal,
        };
    }, [stock, sales, attendance, dashboardStats]);

    if (!perm.canViewOverview) {
        return <Navigate to="/sales" replace />;
    }

    const handleReset = async () => {
        const confirm1 = window.confirm("Are you sure? This will delete ALL data permanently.");
        if (!confirm1) return;
        const confirm2 = window.confirm("FINAL WARNING: All stock, sales, attendance and product data will be erased. This action CANNOT be undone. Proceed?");
        if (!confirm2) return;
        
        const pwd = window.prompt("To proceed, enter your Admin Password:");
        if (!pwd) return;

        try {
            await resetData(pwd);
            showToast("All data successfully reset", "success");
        } catch (err) {
            showToast(err.message || "Failed to reset data", "error");
        }
    };

    const handleExport = async (type) => {
        setIsExporting(true);
        try {
            await exportReport(type);
            showToast(`Report exported successfully`, "success");
        } catch (err) {
            showToast(err.message || "Failed to export report", "error");
        } finally {
            setIsExporting(false);
        }
    };

    // Show loading state while data is being fetched
    if (isLoading && !dashboardStats) {
        return (
            <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-light)' }}>
                <div className="loader" style={{ margin: '0 auto 20px' }}></div>
                Loading overview data...
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: 30 }}>
                <h2>Business Overview</h2>
            </div>

            {/* Financial KPI Cards */}
            <div className="card-grid" style={{ padding: 0, marginBottom: 30 }}>
                <AdminMetricCard icon={TrendingUp} title="Total Sales Profit" value={`₹${Number(totalSalesProfit || 0).toFixed(0)}`} color="var(--primary-color)" subtitle="All time" />
                <AdminMetricCard icon={Zap} title="Total Shake Profit" value={`₹${Number(totalShakeProfit || 0)}`} color="var(--accent-color)" subtitle="From attendance" />
                <AdminMetricCard icon={BarChart2} title="Total V.P Sold" value={Number(totalVpSold || 0).toFixed(1)} color="#8b5cf6" subtitle="Volume points" />
                <AdminMetricCard icon={Package} title="Stock Value" value={`₹${Number(totalStockValue || 0).toFixed(0)}`} color="#0ea5e9" subtitle="Current inventory" />
                <AdminMetricCard icon={AlertTriangle} title="Low Stock Alerts" value={`${(lowStock || []).length} item(s)`} color={(lowStock || []).length > 0 ? 'var(--alert-color)' : '#6c757d'} subtitle="Below 5 units" />
                <AdminMetricCard icon={Users} title="Top Selling Product" value={topSellerName || 'N/A'} color="#f59e0b" subtitle="This month" />
            </div>

            {/* Low stock detail */}
            {(lowStock || []).length > 0 && (
                <div className="card" style={{ marginBottom: 30, background: 'var(--alert-bg)', borderColor: 'var(--alert-color)' }}>
                    <h3 style={{ marginBottom: 15, color: 'var(--alert-color)' }}>Low Stock Products (&lt; 5 Qty)</h3>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {lowStock.map(s => (
                            <li key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                                <span><strong>{s.product_name}</strong> {s.flavor ? `(${s.flavor})` : ''}</span>
                                <span style={{ color: 'var(--alert-color)', fontWeight: 'bold' }}>{s.qty} left</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Monthly Sales Table */}
            <div className="card" style={{ marginBottom: 30 }}>
                <h3 style={{ marginBottom: 20 }}>Monthly Product Sales</h3>
                {(monthlySalesInfo || []).length === 0 ? (
                    <p style={{ color: 'var(--text-light)' }}>No sales recorded this month.</p>
                ) : (
                    <div className="table-container" style={{ margin: 0 }}>
                        <table>
                            <thead><tr><th>Product Name</th><th className="text-right">Total Sold</th></tr></thead>
                            <tbody>
                                {(monthlySalesInfo || []).map((item, idx) => (
                                    <tr key={item.name} style={{ background: idx === 0 ? '#fdf8e4' : 'transparent' }}>
                                        <td>
                                            <strong>{item.name}</strong>
                                            {idx === 0 && <span style={{ marginLeft: 10, fontSize: 12, background: 'orange', color: 'white', padding: '2px 8px', borderRadius: 12 }}>Top Seller</span>}
                                        </td>
                                        <td className="text-right"><strong>{item.qty}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Customer Profit */}
            <div className="card-grid" style={{ padding: 0, marginBottom: 30, gridTemplateColumns: '1fr' }}>
                <div className="card">
                    <h3 style={{ marginBottom: 20 }}>Top Customers by Profit</h3>
                    {(customerProfitArr || []).length === 0 ? (
                        <p style={{ color: 'var(--text-light)' }}>No sales profit recorded.</p>
                    ) : (
                        <div className="table-container" style={{ margin: 0 }}>
                            <table>
                                <thead><tr><th>Customer</th><th className="text-right">Total Profit</th></tr></thead>
                                <tbody>
                                    {(customerProfitArr || []).map((item, idx) => (
                                        <tr key={item.name}>
                                            <td>
                                                <strong>{item.name}</strong>
                                                {idx === 0 && <span style={{ marginLeft: 10, fontSize: 12, background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: 12 }}>Top Customer</span>}
                                            </td>
                                            <td className="text-right"><strong style={{ color: 'var(--primary-color)' }}>₹{Number(item.profit || 0).toFixed(0)}</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Shake Profit Table */}
            <div className="card" style={{ marginBottom: 30 }}>
                <h3 style={{ marginBottom: 20 }}>Customer Shake Profit Tracking</h3>
                {(shakeProfitArr || []).length === 0 ? (
                    <p style={{ color: 'var(--text-light)' }}>No shake profits generated yet. Mark attendance to earn profit.</p>
                ) : (
                    <div className="table-container" style={{ margin: 0 }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th className="text-right">Attendance</th>
                                    <th className="text-right">Profit / Day</th>
                                    <th className="text-right">Total Shake Profit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(shakeProfitArr || []).map(item => (
                                    <tr key={item.name}>
                                        <td><strong>{item.name}</strong></td>
                                        <td className="text-right">{item.attendance} Days</td>
                                        <td className="text-right" style={{ color: 'var(--text-light)' }}>₹{item.profitPerDay}</td>
                                        <td className="text-right"><strong style={{ color: 'var(--accent-color)' }}>₹{item.totalProfit}</strong></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Admin Tools Section */}
            {perm.isAdmin && (
                <div className="card" style={{ marginBottom: 30, background: '#fff', border: '1px solid var(--border-color)' }}>
                    <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        System Administration
                    </h3>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 250, border: '1px solid var(--border-color)', borderRadius: 8, padding: 20 }}>
                            <h4 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}><Download size={16}/> Export Reports</h4>
                            <p style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 15 }}>Download system data as PDF reports.</p>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                <button className="btn btn-outline" disabled={isExporting} onClick={() => handleExport('sales')} style={{ flex: 1 }}>Sales</button>
                                <button className="btn btn-outline" disabled={isExporting} onClick={() => handleExport('attendance')} style={{ flex: 1 }}>Attendance</button>
                                <button className="btn btn-outline" disabled={isExporting} onClick={() => handleExport('summary')} style={{ flex: 1 }}>Summary</button>
                            </div>
                        </div>

                        <div style={{ flex: 1, minWidth: 250, border: '1px solid #fecaca', background: '#fef2f2', borderRadius: 8, padding: 20 }}>
                            <h4 style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, color: 'var(--alert-color)' }}><Trash2 size={16}/> Danger Zone</h4>
                            <p style={{ fontSize: 13, color: '#991b1b', marginBottom: 15 }}>Permanently wipe all system data. Irreversible.</p>
                            <button className="btn btn-danger" onClick={handleReset} style={{ width: '100%' }}>Reset All Data</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function Dashboard() {
    return (
        <ErrorBoundary>
            <DashboardInner />
        </ErrorBoundary>
    );
}
