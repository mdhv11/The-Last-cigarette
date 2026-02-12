const Achievement = require('../models/Achievement');
const User = require('../models/User');
const CigLog = require('../models/CigLog');
const JournalEntry = require('../models/JournalEntry');

const ACHIEVEMENTS = [
    // Streak Achievements
    { id: 'streak_1', type: 'streak', name: 'First Step', description: 'Stay smoke-free for 1 day', value: 1 },
    { id: 'streak_3', type: 'streak', name: 'Getting Serious', description: 'Stay smoke-free for 3 days', value: 3 },
    { id: 'streak_7', type: 'streak', name: 'One Week', description: 'Stay smoke-free for 1 week', value: 7 },
    { id: 'streak_30', type: 'streak', name: 'One Month', description: 'Stay smoke-free for 1 month', value: 30 },

    // Savings Achievements
    { id: 'savings_10', type: 'savings', name: 'Pocket Change', description: 'Save your first $10', value: 10 },
    { id: 'savings_50', type: 'savings', name: 'Dinner on Me', description: 'Save $50', value: 50 },
    { id: 'savings_100', type: 'savings', name: 'Big Saver', description: 'Save $100', value: 100 },
    { id: 'savings_500', type: 'savings', name: 'Investment Grade', description: 'Save $500', value: 500 },

    // Reduction Achievements (based on daily average vs initial)
    { id: 'reduction_10', type: 'reduction', name: 'Small Steps', description: 'Reduce smoking by 10%', value: 10 },
    { id: 'reduction_50', type: 'reduction', name: 'Halfway There', description: 'Reduce smoking by 50%', value: 50 },
    { id: 'reduction_100', type: 'reduction', name: 'Smoke Free', description: 'Quit smoking completely', value: 100 },

    // Milestone Achievements
    { id: 'milestone_log', type: 'milestone', name: 'Tracker', description: 'Log your first cigarette', value: 1 },
    { id: 'milestone_journal', type: 'milestone', name: 'Reflector', description: 'Create your first journal entry', value: 1 },
];

const checkAchievements = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user || !user.quitPlan) return [];

        const existingAchievements = await Achievement.find({ userId });
        const existingIds = new Set(existingAchievements.map(a => a.name)); // Using name as unique ID for now, or could add a custom 'achievementId' field to schema

        const newAchievements = [];

        // --- Fetch Data needed for checks ---

        // 1. Logs & Savings
        const allLogs = await CigLog.find({ userId });
        const totalSmoked = allLogs.reduce((acc, curr) => acc + curr.count, 0);

        const startDate = new Date(user.quitPlan.startDate);
        const now = new Date();
        const diffDays = Math.max(1, Math.ceil(Math.abs(now - startDate) / (1000 * 60 * 60 * 24)));

        const expectedSmoked = diffDays * user.quitPlan.initialDailyAverage;
        const totalNotSmoked = Math.max(0, expectedSmoked - totalSmoked);
        const totalMoneySaved = totalNotSmoked * (user.quitPlan.cigaretteCost || 0);

        // 2. Streak (Simplified: consecutive days with 0 logs or below target? Let's say 0 logs for "smoke-free")
        // For reduction app, maybe "streak" means "staying within target". 
        // But the descriptions say "smoke-free". Let's stick to "smoke-free" for strict streaks.
        // Or maybe we calculate "days within limit".
        // Let's assume "smoke-free" means 0 cigarettes for that day.

        // Calculate current smoke-free streak
        let currentStreak = 0;

        // Only calculate streak if the plan has started
        if (now >= startDate) {
            const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));

            // Iterate backwards from today, but not before startDate
            for (let i = 0; i <= daysSinceStart; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                d.setHours(0, 0, 0, 0);

                // Don't count days before start date
                if (d < startDate) break;

                const nextD = new Date(d);
                nextD.setDate(d.getDate() + 1);

                const logsOnDay = allLogs.filter(l => l.timestamp >= d && l.timestamp < nextD);
                const countOnDay = logsOnDay.reduce((acc, curr) => acc + curr.count, 0);

                if (countOnDay === 0) {
                    currentStreak++;
                } else {
                    // If today (i=0) has logs, streak is 0.
                    if (i === 0) currentStreak = 0;
                    break;
                }
            }
        }

        // 3. Journal
        const journalCount = await JournalEntry.countDocuments({ userId });


        // --- Check Rules ---

        for (const ach of ACHIEVEMENTS) {
            if (existingIds.has(ach.name)) continue;

            let unlocked = false;

            switch (ach.type) {
                case 'streak':
                    if (currentStreak >= ach.value) unlocked = true;
                    break;
                case 'savings':
                    if (totalMoneySaved >= ach.value) unlocked = true;
                    break;
                case 'reduction':
                    // Calculate current reduction % based on recent average (e.g. last 3 days) vs initial
                    // For simplicity, let's use "today's" projected reduction or overall?
                    // Let's use overall reduction ratio
                    const overallReduction = totalNotSmoked / expectedSmoked; // % avoided
                    if (overallReduction * 100 >= ach.value) unlocked = true;
                    break;
                case 'milestone':
                    if (ach.id === 'milestone_log' && allLogs.length > 0) unlocked = true;
                    if (ach.id === 'milestone_journal' && journalCount > 0) unlocked = true;
                    break;
            }

            if (unlocked) {
                const newAch = new Achievement({
                    userId,
                    type: ach.type,
                    name: ach.name,
                    description: ach.description,
                    value: ach.value,
                    unlockedAt: new Date()
                });
                await newAch.save();
                newAchievements.push(newAch);
            }
        }

        return newAchievements;

    } catch (error) {
        console.error('Check Achievements Error:', error);
        return [];
    }
};

module.exports = {
    ACHIEVEMENTS,
    checkAchievements
};
