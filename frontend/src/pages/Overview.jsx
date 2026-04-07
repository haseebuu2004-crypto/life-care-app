import { useMemo } from 'react';
import useStore from '../store/useStore';

export function Overview() {
    const { sales, attendance, stock } = useStore();

    const metrics = useMemo(() => {
        let totalProfit = 0;
        let dailyProfit = 0;
        let monthlyProfit = 0;
        let shakeProfit = 0;
        let totalVal = 0;
        
        const now = new Date();
        const currMonth = now.getMonth();
        const currYear = now.getFullYear();
        const todayStr = `${currYear}-${String(currMonth+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

        sales.forEach(s => {
            const p = s.profit || 0;
            totalProfit += p;
            const d = new Date(s.date);
            if (d.getMonth() === currMonth && d.getFullYear() === currYear) monthlyProfit += p;
            if (s.date === todayStr) dailyProfit += p;
        });

        const excluded = ['shareef', 'naseera', 'haseeb'];
        attendance.forEach(a => {
            if (a.status === 'Present' && !excluded.includes(a.name.toLowerCase())) {
                shakeProfit += 50;
                totalProfit += 50;
                const d = new Date(a.date);
                if (d.getMonth() === currMonth && d.getFullYear() === currYear) monthlyProfit += 50;
                if (a.date === todayStr) dailyProfit += 50;
            }
        });

        stock.forEach(s => {
            totalVal += (s.sp * s.qty);
        });

        return { totalProfit, dailyProfit, monthlyProfit, shakeProfit, totalVal };
    }, [sales, attendance, stock]);

    return (
        <div>
            <h2 style={{ marginBottom: 20 }}>Performance Overview</h2>
            <div className="card-grid">
                <div className="card">
                    <div className="card-title">Total Profit</div>
                    <div className="card-value" style={{color:'var(--primary-color)'}}>₹{metrics.totalProfit.toFixed(2)}</div>
                </div>
                <div className="card">
                    <div className="card-title">Daily Profit</div>
                    <div className="card-value" style={{color:'var(--primary-color)'}}>₹{metrics.dailyProfit.toFixed(2)}</div>
                </div>
                <div className="card">
                    <div className="card-title">Monthly Profit</div>
                    <div className="card-value" style={{color:'var(--primary-color)'}}>₹{metrics.monthlyProfit.toFixed(2)}</div>
                </div>
                <div className="card">
                    <div className="card-title">Shake Profit</div>
                    <div className="card-value" style={{color:'var(--primary-color)'}}>₹{metrics.shakeProfit}</div>
                </div>
                <div className="card">
                    <div className="card-title">Stock Value</div>
                    <div className="card-value">₹{metrics.totalVal.toFixed(2)}</div>
                </div>
            </div>
        </div>
    );
}
