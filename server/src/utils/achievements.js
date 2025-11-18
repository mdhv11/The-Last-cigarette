/**
 * Achievement calculation and management utilities
 */

const mongoose = require("mongoose");

/**
 * Achievement definitions with unlock criteria
 */
const ACHIEVEMENT_DEFINITIONS = {
  // Streak achievements
  first_day: {
    type: "first_day",
    title: "First Day Complete!",
    description: "You made it through your first day of quitting. Great start!",
    category: "streak",
    icon: "🌟",
    checkCriteria: async (userId, models) => {
      const { User } = models;
      const user = await User.findById(userId);
      if (!user || !user.quitPlan) return false;

      const daysSinceStart = Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceStart >= 1;
    },
  },
  streak_3_days: {
    type: "streak_3_days",
    title: "3-Day Streak!",
    description: "Three days staying within your targets. You're building momentum!",
    category: "streak",
    icon: "🔥",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 3;
    },
  },
  streak_7_days: {
    type: "streak_7_days",
    title: "One Week Strong!",
    description: "A full week within targets. Your body is already healing!",
    category: "streak",
    icon: "💪",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 7;
    },
  },
  streak_30_days: {
    type: "streak_30_days",
    title: "One Month Milestone!",
    description: "30 days of staying on track. You're unstoppable!",
    category: "streak",
    icon: "🏆",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 30;
    },
  },
  streak_90_days: {
    type: "streak_90_days",
    title: "90-Day Champion!",
    description: "Three months of dedication. You've built a new lifestyle!",
    category: "streak",
    icon: "👑",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 90;
    },
  },
  streak_365_days: {
    type: "streak_365_days",
    title: "One Year Smoke-Free!",
    description: "A full year of success. You're an inspiration!",
    category: "streak",
    icon: "🎉",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 365;
    },
  },

  // Money saved achievements
  money_saved_50: {
    type: "money_saved_50",
    title: "$50 Saved!",
    description: "You've saved $50 by reducing smoking. Treat yourself!",
    category: "savings",
    icon: "💰",
    value: 50,
    checkCriteria: async (userId, models) => {
      const moneySaved = await calculateMoneySaved(userId, models);
      return moneySaved >= 50;
    },
  },
  money_saved_100: {
    type: "money_saved_100",
    title: "$100 Saved!",
    description: "You've saved $100! That's real money back in your pocket.",
    category: "savings",
    icon: "💵",
    value: 100,
    checkCriteria: async (userId, models) => {
      const moneySaved = await calculateMoneySaved(userId, models);
      return moneySaved >= 100;
    },
  },
  money_saved_500: {
    type: "money_saved_500",
    title: "$500 Saved!",
    description: "Half a thousand dollars saved! What will you do with it?",
    category: "savings",
    icon: "💸",
    value: 500,
    checkCriteria: async (userId, models) => {
      const moneySaved = await calculateMoneySaved(userId, models);
      return moneySaved >= 500;
    },
  },
  money_saved_1000: {
    type: "money_saved_1000",
    title: "$1000 Saved!",
    description: "One thousand dollars! Your wallet thanks you!",
    category: "savings",
    icon: "🤑",
    value: 1000,
    checkCriteria: async (userId, models) => {
      const moneySaved = await calculateMoneySaved(userId, models);
      return moneySaved >= 1000;
    },
  },

  // Target met achievements
  target_met_7_days: {
    type: "target_met_7_days",
    title: "Week of Success!",
    description: "Met your daily targets for 7 days straight!",
    category: "streak",
    icon: "✅",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 7;
    },
  },
  target_met_30_days: {
    type: "target_met_30_days",
    title: "Month of Excellence!",
    description: "Met your daily targets for 30 days straight!",
    category: "streak",
    icon: "🎯",
    checkCriteria: async (userId, models) => {
      const streak = await calculateCurrentStreak(userId, models);
      return streak >= 30;
    },
  },

  // Journal achievements
  journal_entries_10: {
    type: "journal_entries_10",
    title: "Reflective Writer",
    description: "You've made 10 journal entries. Self-awareness is key!",
    category: "journal",
    icon: "📝",
    checkCriteria: async (userId, models) => {
      const { JournalEntry } = models;
      const count = await JournalEntry.countDocuments({ userId });
      return count >= 10;
    },
  },
  journal_entries_50: {
    type: "journal_entries_50",
    title: "Journaling Master",
    description: "50 journal entries! You're tracking your journey beautifully.",
    category: "journal",
    icon: "📚",
    checkCriteria: async (userId, models) => {
      const { JournalEntry } = models;
      const count = await JournalEntry.countDocuments({ userId });
      return count >= 50;
    },
  },

  // Health milestone achievements
  health_milestone_1_week: {
    type: "health_milestone_1_week",
    title: "One Week Healthier!",
    description: "Your body is already starting to heal after one week!",
    category: "health",
    icon: "❤️",
    checkCriteria: async (userId, models) => {
      const { User } = models;
      const user = await User.findById(userId);
      if (!user || !user.quitPlan) return false;

      const daysSinceStart = Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceStart >= 7;
    },
  },
  health_milestone_1_month: {
    type: "health_milestone_1_month",
    title: "One Month of Healing!",
    description: "Your lungs are clearing and circulation is improving!",
    category: "health",
    icon: "💚",
    checkCriteria: async (userId, models) => {
      const { User } = models;
      const user = await User.findById(userId);
      if (!user || !user.quitPlan) return false;

      const daysSinceStart = Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceStart >= 30;
    },
  },
  health_milestone_3_months: {
    type: "health_milestone_3_months",
    title: "Three Months Strong!",
    description: "Your lung function has significantly improved!",
    category: "health",
    icon: "💙",
    checkCriteria: async (userId, models) => {
      const { User } = models;
      const user = await User.findById(userId);
      if (!user || !user.quitPlan) return false;

      const daysSinceStart = Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceStart >= 90;
    },
  },
  health_milestone_1_year: {
    type: "health_milestone_1_year",
    title: "One Year of Health!",
    description: "Your heart disease risk has dropped by 50%!",
    category: "health",
    icon: "💜",
    checkCriteria: async (userId, models) => {
      const { User } = models;
      const user = await User.findById(userId);
      if (!user || !user.quitPlan) return false;

      const daysSinceStart = Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );
      return daysSinceStart >= 365;
    },
  },
};

/**
 * Calculate current streak of days within target
 */
async function calculateCurrentStreak(userId, models) {
  const { User, CigLog } = models;

  const user = await User.findById(userId);
  if (!user || !user.quitPlan) return 0;

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Check each day backwards from today
  for (let i = 0; i < 365; i++) {
    const dailyCount = await CigLog.getDailyCount(userId, currentDate);
    const dailyTarget = calculateDailyTargetForDate(
      user.quitPlan,
      currentDate
    );

    if (dailyCount <= dailyTarget) {
      streak++;
    } else {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);

    // Don't count days before quit plan started
    if (currentDate < new Date(user.quitPlan.startDate)) {
      break;
    }
  }

  return streak;
}

/**
 * Calculate money saved by user
 */
async function calculateMoneySaved(userId, models) {
  const { User, CigLog } = models;

  const user = await User.findById(userId);
  if (!user || !user.quitPlan) return 0;

  const { startDate, initialDailyAmount, cigaretteCost, packSize } =
    user.quitPlan;
  const daysSinceStart = Math.floor(
    (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceStart <= 0) return 0;

  // Calculate what would have been smoked vs actual
  const wouldHaveSmoked = initialDailyAmount * daysSinceStart;

  const actualSmoked = await CigLog.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: new Date(startDate) },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$count" },
      },
    },
  ]);

  const totalActualSmoked = actualSmoked.length > 0 ? actualSmoked[0].total : 0;
  const cigarettesSaved = Math.max(0, wouldHaveSmoked - totalActualSmoked);
  const costPerCigarette = cigaretteCost / packSize;

  return Math.round(cigarettesSaved * costPerCigarette * 100) / 100;
}

/**
 * Calculate daily target for a specific date
 */
function calculateDailyTargetForDate(quitPlan, targetDate) {
  if (!quitPlan) return 0;

  const { startDate, quitDate, initialDailyAmount, reductionMethod } = quitPlan;

  if (reductionMethod === "cold_turkey") {
    return new Date(targetDate) >= new Date(quitDate) ? 0 : initialDailyAmount;
  }

  const totalDays = Math.ceil(
    (new Date(quitDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );
  const daysPassed = Math.floor(
    (new Date(targetDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  if (daysPassed < 0) return initialDailyAmount;
  if (daysPassed >= totalDays) return 0;

  const reductionPerDay = initialDailyAmount / totalDays;
  const currentTarget = Math.max(
    0,
    initialDailyAmount - reductionPerDay * daysPassed
  );

  return Math.round(currentTarget);
}

/**
 * Check and award new achievements for a user
 */
async function checkAndAwardAchievements(userId, models) {
  const { Achievement } = models;

  // Get existing achievements
  const existingAchievements = await Achievement.find({ userId }).select(
    "type"
  );
  const earnedTypes = existingAchievements.map((a) => a.type);

  const newAchievements = [];

  // Check each achievement definition
  for (const [key, definition] of Object.entries(ACHIEVEMENT_DEFINITIONS)) {
    // Skip if already earned
    if (earnedTypes.includes(definition.type)) continue;

    // Check if criteria is met
    try {
      const criteriaMet = await definition.checkCriteria(userId, models);
      if (criteriaMet) {
        newAchievements.push({
          userId,
          type: definition.type,
          title: definition.title,
          description: definition.description,
          category: definition.category,
          icon: definition.icon,
          value: definition.value || 0,
          earnedAt: new Date(),
        });
      }
    } catch (error) {
      console.error(
        `Error checking achievement ${definition.type}:`,
        error.message
      );
    }
  }

  // Save new achievements
  if (newAchievements.length > 0) {
    await Achievement.insertMany(newAchievements);
  }

  return newAchievements;
}

/**
 * Check if user has exceeded daily limit and should receive punishment reminder
 */
async function checkPunishmentTrigger(userId, models) {
  const { User, CigLog } = models;

  const user = await User.findById(userId);
  if (!user || !user.quitPlan || !user.settings?.punishments?.enabled) {
    return null;
  }

  const today = new Date();
  const dailyCount = await CigLog.getDailyCount(userId, today);
  const dailyTarget = user.getCurrentDailyTarget();

  if (dailyCount > dailyTarget) {
    const overage = dailyCount - dailyTarget;
    return {
      triggered: true,
      overage,
      dailyTarget,
      dailyCount,
      donationAmount: user.settings.punishments.donationAmount || 10,
      charityName: user.settings.punishments.charityName || "your chosen charity",
      message: `You've exceeded your daily target by ${overage} cigarette${
        overage > 1 ? "s" : ""
      }. Consider donating $${
        user.settings.punishments.donationAmount || 10
      } to ${
        user.settings.punishments.charityName || "your chosen charity"
      } as a reminder to stay on track.`,
    };
  }

  return {
    triggered: false,
    dailyTarget,
    dailyCount,
  };
}

/**
 * Get all achievement definitions with progress for a user
 */
async function getAchievementsWithProgress(userId, models) {
  const { Achievement } = models;

  // Get earned achievements
  const earnedAchievements = await Achievement.find({ userId }).sort({
    earnedAt: -1,
  });
  const earnedTypes = earnedAchievements.map((a) => a.type);

  // Calculate current stats for progress
  const currentStreak = await calculateCurrentStreak(userId, models);
  const moneySaved = await calculateMoneySaved(userId, models);
  const { JournalEntry, User } = models;
  const journalCount = await JournalEntry.countDocuments({ userId });
  const user = await User.findById(userId);
  const daysSinceStart = user?.quitPlan
    ? Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const allAchievements = Object.values(ACHIEVEMENT_DEFINITIONS).map(
    (definition) => {
      const earned = earnedTypes.includes(definition.type);
      let progress = 0;

      // Calculate progress based on achievement type
      if (!earned) {
        if (definition.category === "streak") {
          if (definition.type === "first_day") {
            progress = Math.min(100, daysSinceStart >= 1 ? 100 : 0);
          } else if (definition.type.startsWith("streak_")) {
            const targetDays = parseInt(definition.type.split("_")[1]);
            progress = Math.min(100, Math.round((currentStreak / targetDays) * 100));
          } else if (definition.type.startsWith("target_met_")) {
            const targetDays = parseInt(definition.type.split("_")[2]);
            progress = Math.min(100, Math.round((currentStreak / targetDays) * 100));
          }
        } else if (definition.category === "savings") {
          const targetAmount = definition.value || 0;
          progress = Math.min(100, Math.round((moneySaved / targetAmount) * 100));
        } else if (definition.category === "journal") {
          if (definition.type === "journal_entries_10") {
            progress = Math.min(100, Math.round((journalCount / 10) * 100));
          } else if (definition.type === "journal_entries_50") {
            progress = Math.min(100, Math.round((journalCount / 50) * 100));
          }
        } else if (definition.category === "health") {
          if (definition.type === "health_milestone_1_week") {
            progress = Math.min(100, Math.round((daysSinceStart / 7) * 100));
          } else if (definition.type === "health_milestone_1_month") {
            progress = Math.min(100, Math.round((daysSinceStart / 30) * 100));
          } else if (definition.type === "health_milestone_3_months") {
            progress = Math.min(100, Math.round((daysSinceStart / 90) * 100));
          } else if (definition.type === "health_milestone_1_year") {
            progress = Math.min(100, Math.round((daysSinceStart / 365) * 100));
          }
        }
      } else {
        progress = 100;
      }

      return {
        type: definition.type,
        title: definition.title,
        description: definition.description,
        category: definition.category,
        icon: definition.icon,
        value: definition.value,
        earned,
        progress,
        earnedAt: earned
          ? earnedAchievements.find((a) => a.type === definition.type)?.earnedAt
          : null,
      };
    }
  );

  return {
    earned: allAchievements.filter((a) => a.earned),
    upcoming: allAchievements
      .filter((a) => !a.earned)
      .sort((a, b) => b.progress - a.progress),
    stats: {
      totalEarned: allAchievements.filter((a) => a.earned).length,
      totalAvailable: allAchievements.length,
      currentStreak,
      moneySaved,
      journalCount,
      daysSinceStart,
    },
  };
}

module.exports = {
  ACHIEVEMENT_DEFINITIONS,
  calculateCurrentStreak,
  calculateMoneySaved,
  checkAndAwardAchievements,
  checkPunishmentTrigger,
  getAchievementsWithProgress,
};
