const User = require('../models/User');
const { calculateDailyTarget } = require('../utils/calculations');

exports.setupPlan = async (req, res) => {
    try {
        const { initialDailyAverage, targetQuitDate, cigaretteCost, dailyThreshold } = req.body;
        const userId = req.user.userId;

        const startDate = new Date();
        // Default reduction frequency (e.g., every 7 days) if not specified
        const reductionFrequency = 7;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        user.quitPlan = {
            startDate,
            targetQuitDate: new Date(targetQuitDate),
            initialDailyAverage,
            currentDailyLimit: initialDailyAverage,
            dailyThreshold: dailyThreshold ? parseInt(dailyThreshold) : undefined,
            reductionFrequency,
            cigaretteCost
        };

        await user.save();

        res.json({ success: true, plan: user.quitPlan });
    } catch (error) {
        console.error('Setup Plan Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.updatePlan = async (req, res) => {
    try {
        const updates = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Merge updates into existing plan
        user.quitPlan = { ...user.quitPlan, ...updates };

        // Recalculate current limit based on new plan settings
        user.quitPlan.currentDailyLimit = calculateDailyTarget(user.quitPlan, new Date());

        await user.save();

        res.json({ success: true, plan: user.quitPlan });
    } catch (error) {
        console.error('Update Plan Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getCurrentPlan = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Calculate dynamic daily target
        const todayTarget = calculateDailyTarget(user.quitPlan, new Date());

        res.json({
            success: true,
            plan: user.quitPlan,
            todayTarget
        });
    } catch (error) {
        console.error('Get Plan Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getTargets = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || !user.quitPlan) {
            return res.status(404).json({ success: false, error: 'Plan not found' });
        }

        // Return targets for the next 7 days
        const targets = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            targets.push({
                date,
                target: calculateDailyTarget(user.quitPlan, date)
            });
        }

        res.json({ success: true, targets });
    } catch (error) {
        console.error('Get Targets Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
