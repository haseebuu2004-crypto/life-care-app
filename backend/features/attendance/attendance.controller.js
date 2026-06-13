const attendanceService = require('./attendance.service');

exports.getAttendance = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        
        const result = await attendanceService.getAttendance(ownerId, req.user.role, req.user.id);
        
        const rows = Array.isArray(result) ? result : (result?.rows || []);
        let formatted = rows.map(r => ({
            id: r.id,
            date: r.date || (r.attendance_date ? new Date(r.attendance_date).toLocaleDateString('en-CA') : ''),
            customer_id: r.customer_id,
            name: r.customer_name || r.name,
            status: r.type, 
            shakeProfit: r.shake_amount / 100,
            recorded_by: r.recorded_by_email || r.recorded_by
        }));
        
        res.json({ success: true, data: formatted });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        console.error("Get Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.markAttendance = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const recordedBy = req.user.id;
        
        await attendanceService.markAttendance(ownerId, recordedBy, req.body);
        
        res.json({ success: true, message: 'Attendance logged successfully' });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (error.message === "Attendance already marked for this member today.") {
            return res.status(400).json({ success: false, message: error.message });
        }
        console.error("Mark Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteAttendance = async (req, res) => {
    try {
        const ownerId = req.user.owner_id || req.user.id;
        const userId = req.user.id;
        
        await attendanceService.deleteAttendance(ownerId, userId, req.user.role, req.params.id);
        
        res.json({ success: true, message: "Attendance deleted" });
    } catch (error) {
        if (error.message && error.message.includes('Unauthorized')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        if (error.message === "You can only delete attendance you recorded") {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message === "Record not found") {
            return res.status(404).json({ success: false, message: error.message });
        }
        console.error("Delete Attendance Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
