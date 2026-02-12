const CigLog = require('../models/CigLog');
const User = require('../models/User');
const { calculateDailyTarget } = require('../utils/calculations');

exports.logCigarette = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { count = 1, location, trigger } = req.body;

        const log = new CigLog({
            userId,
            count,
            location,
            trigger,
            timestamp: new Date()
        });

        await log.save();

        // Check daily limit and return status
        const user = await User.findById(userId);
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const logsToday = await CigLog.find({
            userId,
            timestamp: { $gte: todayStart, $lte: todayEnd }
        });

        const totalSmokedToday = logsToday.reduce((acc, curr) => acc + curr.count, 0);
        const dailyTarget = calculateDailyTarget(user.quitPlan, new Date());

        res.status(201).json({
            success: true,
            log,
            totalSmokedToday,
            dailyTarget,
            limitExceeded: totalSmokedToday > dailyTarget
        });
    } catch (error) {
        console.error('Log Cigarette Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getTodayCount = async (req, res) => {
    try {
        const userId = req.user.userId;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const logsToday = await CigLog.find({
            userId,
            timestamp: { $gte: todayStart, $lte: todayEnd }
        });

        const totalSmokedToday = logsToday.reduce((acc, curr) => acc + curr.count, 0);

        res.json({ success: true, count: totalSmokedToday });
    } catch (error) {
        console.error('Get Today Count Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { startDate, endDate } = req.query;

        const query = { userId };
        if (startDate && endDate) {
            query.timestamp = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const logs = await CigLog.find(query).sort({ timestamp: -1 });

        res.json({ success: true, logs });
    } catch (error) {
        console.error('Get History Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
