exports.generateReportHTML = (type, data, clubName = '') => {
    const today = new Date().toLocaleString();
    let content = '';

    if (type === 'sales') {
        const rows = data.rows.map((r, i) => `
            <tr>
                <td>${r.sale_date.toLocaleDateString('en-CA')}</td>
                <td>${r.customer}</td>
                <td>${r.product}</td>
                <td style="text-align: center;">${r.quantity}</td>
                <td style="text-align: right; font-weight: bold;">₹${((r.price_charged * r.quantity) / 100).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold; color: #10b981;">₹${(r.item_profit / 100).toFixed(2)}</td>
            </tr>
        `).join('');

        content = `
            <div class="summary-box">
                <h2>Total Revenue</h2>
                <div class="amount">₹${data.total.toFixed(2)}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Product</th>
                        <th style="text-align: center;">Quantity</th>
                        <th style="text-align: right;">Amount</th>
                        <th style="text-align: right;">Profit</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    } 
    else if (type === 'attendance') {
        const rows = data.rows.map((r, i) => `
            <tr>
                <td>${r.attendance_date.toLocaleDateString('en-CA')}</td>
                <td>${r.name}</td>
                <td><span class="badge ${r.type.toLowerCase()}">${r.type}</span></td>
                <td style="text-align: right; font-weight: bold;">₹${(r.shake_amount / 100).toFixed(2)}</td>
            </tr>
        `).join('');

        content = `
            <div class="summary-box">
                <h2>Total Shake Profit</h2>
                <div class="amount">₹${data.profit.toFixed(2)}</div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer</th>
                        <th>Type</th>
                        <th style="text-align: right;">Profit</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        `;
    }
    else if (type === 'summary') {
        let salesListHTML = '';
        if (data.salesList && data.salesList.length > 0) {
            const rows = data.salesList.map((r) => `
                <tr>
                    <td>${r.sale_date.toLocaleDateString('en-CA')}</td>
                    <td>${r.customer}</td>
                    <td>${r.product}</td>
                    <td style="text-align: center;">${r.quantity}</td>
                    <td style="text-align: right; font-weight: bold;">₹${((r.price_charged * r.quantity) / 100).toFixed(2)}</td>
                    <td style="text-align: right; font-weight: bold; color: #10b981;">₹${(r.item_profit / 100).toFixed(2)}</td>
                </tr>
            `).join('');
            salesListHTML = `
                <h2 style="margin-top: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Sales Records</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Product</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Amount</th>
                            <th style="text-align: right;">Profit</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        let attendanceListHTML = '';
        if (data.attendanceList && data.attendanceList.length > 0) {
            const rows = data.attendanceList.map((r) => `
                <tr>
                    <td>${r.attendance_date.toLocaleDateString('en-CA')}</td>
                    <td>${r.name}</td>
                    <td><span class="badge ${r.type.toLowerCase()}">${r.type}</span></td>
                    <td style="text-align: right; font-weight: bold;">₹${(r.shake_amount / 100).toFixed(2)}</td>
                </tr>
            `).join('');
            attendanceListHTML = `
                <h2 style="margin-top: 40px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Attendance Records</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Customer</th>
                            <th>Type</th>
                            <th style="text-align: right;">Profit</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        content = `
            <div class="dashboard">
                <div class="card">
                    <h3>Total Sales Revenue</h3>
                    <div class="amount">₹${((data.sales.rev || 0) / 100).toFixed(2)}</div>
                </div>
                <div class="card">
                    <h3>Total Sales Profit</h3>
                    <div class="amount" style="color: #10b981;">₹${((data.sales.prof || 0) / 100).toFixed(2)}</div>
                </div>
                <div class="card">
                    <h3>Total Attendance Profit</h3>
                    <div class="amount" style="color: #8b5cf6;">₹${((data.attendance.att_prof || 0) / 100).toFixed(2)}</div>
                </div>
                <div class="card">
                    <h3>Total Active Customers</h3>
                    <div class="amount" style="color: #f59e0b;">${data.customers.count}</div>
                </div>
            </div>
            ${salesListHTML}
            ${attendanceListHTML}
        `;
    }

    let titlePrefix = '';
    if (data && data.range === 'weekly') titlePrefix = 'WEEKLY ';
    else if (data && data.range === 'monthly') titlePrefix = 'MONTHLY ';
    else titlePrefix = 'ALL-TIME ';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${type.toUpperCase()} Report</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Inter', sans-serif;
                margin: 0;
                padding: 40px;
                color: #1e293b;
                background-color: #ffffff;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f1f5f9;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                color: #0f172a;
                letter-spacing: -0.5px;
            }
            .header h2 {
                margin: 5px 0 0 0;
                font-size: 18px;
                color: #475569;
                font-weight: 500;
            }
            .header p {
                margin: 10px 0 0 0;
                color: #64748b;
                font-size: 14px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
            }
            th {
                background-color: #f8fafc;
                color: #475569;
                font-weight: 600;
                text-align: left;
                padding: 12px 16px;
                border-bottom: 2px solid #e2e8f0;
                font-size: 13px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            td {
                padding: 14px 16px;
                border-bottom: 1px solid #f1f5f9;
                color: #334155;
                font-size: 14px;
            }
            tr:nth-child(even) {
                background-color: #fafbfc;
            }
            .summary-box {
                background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 30px;
                border: 1px solid #e2e8f0;
            }
            .summary-box h2 {
                margin: 0 0 10px 0;
                font-size: 14px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .summary-box .amount {
                font-size: 32px;
                font-weight: 700;
                color: #0f172a;
            }
            .dashboard {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
            }
            .card {
                padding: 24px;
                border-radius: 12px;
                background: #ffffff;
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            }
            .card h3 {
                margin: 0 0 12px 0;
                font-size: 14px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .card .amount {
                font-size: 36px;
                font-weight: 700;
                color: #0f172a;
            }
            .badge {
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .badge.morning { background: #dbeafe; color: #1e40af; }
            .badge.evening { background: #fef3c7; color: #92400e; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${clubName || 'BUSINESS'} REPORT</h1>
            <h2>${titlePrefix}${type.toUpperCase()}</h2>
            <p>Generated on: ${today}</p>
        </div>
        ${content}
    </body>
    </html>
    `;
};
