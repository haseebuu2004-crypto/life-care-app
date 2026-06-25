const express = require('express');
const router = express.Router();
const attendanceController = require('./attendance.controller');
const attendanceValidation = require('./attendance.validation');
const { authenticateToken } = require('../../shared/middleware/authMiddleware');

router.get('/attendance', authenticateToken, attendanceController.getAttendance);
router.post('/attendance', authenticateToken, attendanceValidation.validateAttendance, attendanceController.markAttendance);
router.delete('/attendance/:id', authenticateToken, attendanceController.deleteAttendance);

module.exports = router;
