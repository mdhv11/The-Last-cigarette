const User = require('../models/User');
const CigLog = require('../models/CigLog');
const { calculateDailyTarget } = require('../utils/calculations');

const HEALTH_TIPS = [
    "20 minutes after quitting, your heart rate and blood pressure drop.",
    "12 hours after quitting, the carbon monoxide level in your blood drops to normal.",
    "2 weeks to 3 months after quitting, your circulation improves and your lung function increases.",
    "1 to 9 months after quitting, coughing and shortness of breath decrease.",
    "1 year after quitting, the excess risk of coronary heart disease is half that of a continuing smoker.",
    "5 years after quitting, risk of cancer of the mouth, throat, esophagus, and bladder are cut in half.",
    "10 years after quitting, the risk of dying from lung cancer is about half that of a person who is still smoking.",
    "15 years after quitting, the risk of coronary heart disease is that of a non-smoker."
];

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user || !user.quitPlan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        // Money Saved Today
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const logsToday = await CigLog.find({
            userId,
            timestamp: { $gte: todayStart, $lte: todayEnd }
        });

        const smokedToday = logsToday.reduce((acc, curr) => acc + curr.count, 0);
        // Allow negative values to show cost incurred if over limit
        const notSmokedToday = user.quitPlan.initialDailyAverage - smokedToday;
        const moneySavedToday = notSmokedToday * (user.quitPlan.cigaretteCost || 0);

        // Random Health Tip
        const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];

        res.json({
            success: true,
            stats: {
                moneySavedToday,
                healthTip: randomTip
            }
        });
    } catch (error) {
        console.error('Get Dashboard Stats Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getProgressStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        // Last 7 days data
        const progressData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const logs = await CigLog.find({
                userId,
                timestamp: { $gte: date, $lt: nextDay }
            });

            const smoked = logs.reduce((acc, curr) => acc + curr.count, 0);
            const target = calculateDailyTarget(user.quitPlan, date);

            progressData.push({
                date: date.toISOString().split('T')[0], // YYYY-MM-DD
                smoked,
                target
            });
        }

        res.json({ success: true, progressData });
    } catch (error) {
        console.error('Get Progress Stats Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getSavingsStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);

        if (!user || !user.quitPlan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        const startDate = new Date(user.quitPlan.startDate);
        if (isNaN(startDate.getTime())) {
            return res.json({
                success: true,
                totalMoneySaved: 0,
                totalNotSmoked: 0
            });
        }
        const now = new Date();

        // Calculate total days since start
        const diffTime = Math.abs(now - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Get total smoked since start
        const allLogs = await CigLog.find({
            userId,
            timestamp: { $gte: startDate }
        });
        const totalSmoked = allLogs.reduce((acc, curr) => acc + curr.count, 0);

        // Expected smoked if no change
        const expectedSmoked = diffDays * user.quitPlan.initialDailyAverage;

        // Total Saved (can be negative if over-smoking)
        const totalNotSmoked = expectedSmoked - totalSmoked;
        const totalMoneySaved = totalNotSmoked * (user.quitPlan.cigaretteCost || 0);

        res.json({
            success: true,
            totalMoneySaved,
            totalNotSmoked
        });

    } catch (error) {
        console.error('Get Savings Stats Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getAchievements = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Check for new achievements whenever this is called
        const { checkAchievements } = require('../utils/achievements');
        const newUnlocked = await checkAchievements(userId);

        const Achievement = require('../models/Achievement');
        const allAchievements = await Achievement.find({ userId }).sort({ unlockedAt: -1 });

        res.json({
            success: true,
            achievements: allAchievements,
            newUnlocked: newUnlocked.length > 0 ? newUnlocked : null
        });
    } catch (error) {
        console.error('Get Achievements Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
