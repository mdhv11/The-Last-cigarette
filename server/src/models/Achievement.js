const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "first_day",
        "streak_3_days",
        "streak_7_days",
        "streak_30_days",
        "streak_90_days",
        "streak_365_days",
        "money_saved_50",
        "money_saved_100",
        "money_saved_500",
        "money_saved_1000",
        "target_met_7_days",
        "target_met_30_days",
        "journal_entries_10",
        "journal_entries_50",
        "craving_delayed_10_times",
        "health_milestone_1_week",
        "health_milestone_1_month",
        "health_milestone_3_months",
        "health_milestone_1_year",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    earnedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    value: {
      type: Number, // For money-based achievements
      default: 0,
    },
    icon: {
      type: String,
      default: "🏆",
    },
    category: {
      type: String,
      enum: ["streak", "savings", "health", "journal", "support"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
achievementSchema.index({ userId: 1, earnedAt: -1 });
achievementSchema.index({ userId: 1, type: 1 });

// Static method to check and award achievements
achievementSchema.statics.checkAndAwardAchievements = async function (userId) {
  const User = mongoose.model("User");
  const CigLog = mongoose.model("CigLog");
  const JournalEntry = mongoose.model("JournalEntry");

  const user = await User.findById(userId);
  if (!user || !user.quitPlan) return [];

  const existingAchievements = await this.find({ userId }).select("type");
  const earnedTypes = existingAchievements.map((a) => a.type);

  const newAchievements = [];

  // Calculate days since quit start
  const daysSinceStart = Math.floor(
    (new Date() - new Date(user.quitPlan.startDate)) / (1000 * 60 * 60 * 24)
  );

  // First day achievement
  if (daysSinceStart >= 1 && !earnedTypes.includes("first_day")) {
    newAchievements.push({
      userId,
      type: "first_day",
      title: "First Day Complete!",
      description:
        "You made it through your first day of quitting. Great start!",
      category: "streak",
      icon: "🌟",
    });
  }

  // Streak achievements (simplified - would need more complex logic for actual streaks)
  const streakDays = await this.calculateCurrentStreak(userId);

  if (streakDays >= 3 && !earnedTypes.includes("streak_3_days")) {
    newAchievements.push({
      userId,
      type: "streak_3_days",
      title: "3-Day Streak!",
      description: "Three days smoke-free! You're building momentum.",
      category: "streak",
      icon: "🔥",
    });
  }

  if (streakDays >= 7 && !earnedTypes.includes("streak_7_days")) {
    newAchievements.push({
      userId,
      type: "streak_7_days",
      title: "One Week Strong!",
      description: "A full week without smoking. Your body is already healing!",
      category: "streak",
      icon: "💪",
    });
  }

  // Money saved achievements
  const moneySaved = await this.calculateMoneySaved(userId);

  if (moneySaved >= 50 && !earnedTypes.includes("money_saved_50")) {
    newAchievements.push({
      userId,
      type: "money_saved_50",
      title: "$50 Saved!",
      description: "You've saved $50 by not smoking. Treat yourself!",
      category: "savings",
      value: 50,
      icon: "💰",
    });
  }

  // Journal achievements
  const journalCount = await JournalEntry.countDocuments({ userId });

  if (journalCount >= 10 && !earnedTypes.includes("journal_entries_10")) {
    newAchievements.push({
      userId,
      type: "journal_entries_10",
      title: "Reflective Writer",
      description: "You've made 10 journal entries. Self-awareness is key!",
      category: "journal",
      icon: "📝",
    });
  }

  // Save new achievements
  if (newAchievements.length > 0) {
    await this.insertMany(newAchievements);
  }

  return newAchievements;
};

// Helper method to calculate current streak
achievementSchema.statics.calculateCurrentStreak = async function (userId) {
  const User = mongoose.model("User");
  const CigLog = mongoose.model("CigLog");

  const user = await User.findById(userId);
  if (!user || !user.quitPlan) return 0;

  let streak = 0;
  let currentDate = new Date();

  // Check each day backwards from today
  for (let i = 0; i < 365; i++) {
    // Max check 1 year
    const dailyCount = await CigLog.getDailyCount(userId, currentDate);
    const dailyTarget = user.getCurrentDailyTarget();

    if (dailyCount <= dailyTarget) {
      streak++;
    } else {
      break;
    }

    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

// Helper method to calculate money saved
achievementSchema.statics.calculateMoneySaved = async function (userId) {
  const User = mongoose.model("User");
  const CigLog = mongoose.model("CigLog");

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
};

module.exports = mongoose.model("Achievement", achievementSchema);
