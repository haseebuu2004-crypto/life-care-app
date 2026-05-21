const attendanceService = require('../services/attendanceService');
const { getOwnerId } = require('../middleware/authMiddleware');

exports.getAttendance = async (req, res) => {
    try {
        const rows = await attendanceService.getAllAttendance(getOwnerId(req));
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        let { customerName, date, status } = req.body;
        if (!customerName) customerName = req.body.name;
        
        if (!customerName || !date) return res.status(400).json({ success: false, message: "Date and customer name are required" });

        const normalizedName = customerName.toLowerCase().trim();

        let finalShakeProfit = 0;
        if (status === 'Present') {
            const exceptionNames = ['haseeb', 'shareef', 'naseera'];
            if (exceptionNames.includes(normalizedName)) {
                finalShakeProfit = 0;
            } else {
                finalShakeProfit = 50;
            }
        }

        await attendanceService.markAttendanceRecord(date, normalizedName, status, finalShakeProfit, getOwnerId(req));
        res.json({ success: true, data: { message: 'Attendance logged successfully' } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        await attendanceService.deleteAttendanceRecord(req.params.id, getOwnerId(req));
        res.json({ success: true, data: null });
    } catch (error) {
        if (error.message === "Record not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};
