const prisma = require('../config/prisma');

exports.getAllAttendance = async (ownerId) => {
    return await prisma.attendance.findMany({
        where: { ownerId },
        orderBy: { date: 'desc' }
    });
};

exports.markAttendanceRecord = async (date, normalizedName, status, finalShakeProfit, ownerId) => {
    const record = await prisma.attendance.create({
        data: {
            date: new Date(date),
            name: normalizedName,
            status,
            shakeProfit: finalShakeProfit,
            ownerId
        }
    });
    return record.id;
};

exports.deleteAttendanceRecord = async (id, ownerId) => {
    const record = await prisma.attendance.findFirst({
        where: { id: parseInt(id), ownerId }
    });
    
    if (!record) {
        throw new Error("Record not found");
    }
    
    await prisma.attendance.delete({
        where: { id: record.id }
    });
};
