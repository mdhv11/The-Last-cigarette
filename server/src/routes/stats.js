const express = require("express");
const mongoose = require("mongoose");
const { User, CigLog, Achievement } = require("../models");
const auth = require("../middleware/auth");
const { calculateMoneySaved } = require("../utils/calculations");

const router = express.Router();

// @route   GET /api/stats/progress
// @desc    Get consumption progress data for graphs
// @access  Private
router.get("/progress", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.quitPlan) {
      return res.status(400).json({
        error: "No quit plan found",
      });
    }

    // Get consumption history
    const consumptionHistory = await CigLog.getConsumptionHistory(
      req.user._id,
      parseInt(days)
    );

    // Calculate targets for each day
    const progressData = consumptionHistory.map((day) => {
      const daysSinceStart = Math.floor(
        (new Date(day.date) - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );

      let dailyTarget = 0;

      if (daysSinceStart >= 0) {
        const totalDays = Math.ceil(
          (new Date(user.quitPlan.quitDate) -
            new Date(user.quitPlan.startDate)) /
            (1000 * 60 * 60 * 24)
        );

        if (user.quitPlan.reductionMethod === "cold_turkey") {
          dailyTarget =
            new Date(day.date) >= new Date(user.quitPlan.quitDate)
              ? 0
              : user.quitPlan.initialDailyAmount;
        } else {
          if (daysSinceStart >= totalDays) {
            dailyTarget = 0;
          } else {
            const reductionPerDay =
              user.quitPlan.initialDailyAmount / totalDays;
            dailyTarget = Math.max(
              0,
              user.quitPlan.initialDailyAmount -
                reductionPerDay * daysSinceStart
            );
            dailyTarget = Math.round(dailyTarget);
          }
        }
      } else {
        dailyTarget = user.quitPlan.initialDailyAmount;
      }

      return {
        date: day.date,
        actual: day.totalCount,
        target: dailyTarget,
        exceeded: day.totalCount > dailyTarget,
        difference: day.totalCount - dailyTarget,
      };
    });

    // Calculate overall statistics
    const totalActual = progressData.reduce((sum, day) => sum + day.actual, 0);
    const totalTarget = progressData.reduce((sum, day) => sum + day.target, 0);
    const daysUnderTarget = progressData.filter((day) => !day.exceeded).length;
    const daysOverTarget = progressData.filter((day) => day.exceeded).length;

    res.json({
      progressData,
      summary: {
        totalDays: progressData.length,
        totalActual,
        totalTarget,
        daysUnderTarget,
        daysOverTarget,
        averageActual:
          progressData.length > 0
            ? Math.round((totalActual / progressData.length) * 10) / 10
            : 0,
        averageTarget:
          progressData.length > 0
            ? Math.round((totalTarget / progressData.length) * 10) / 10
            : 0,
        overallPerformance:
          totalTarget > 0
            ? Math.round(((totalTarget - totalActual) / totalTarget) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      error: "Server error while fetching progress data",
    });
  }
});

// @route   GET /api/stats/savings
// @desc    Get money saved calculations
// @access  Private
router.get("/savings", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.quitPlan) {
      return res.status(400).json({
        error: "No quit plan found",
      });
    }

    const { startDate, initialDailyAmount, cigaretteCost, packSize } =
      user.quitPlan;
    const costPerCigarette = cigaretteCost / packSize;

    // Calculate days since start
    const daysSinceStart = Math.max(
      0,
      Math.floor(
        (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)
      )
    );

    // Calculate what would have been smoked without quit plan
    const wouldHaveSmoked = initialDailyAmount * daysSinceStart;

    // Get actual consumption since start
    const actualConsumption = await CigLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
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

    const totalActualSmoked =
      actualConsumption.length > 0 ? actualConsumption[0].total : 0;
    const cigarettesSaved = Math.max(0, wouldHaveSmoked - totalActualSmoked);
    const totalSaved = cigarettesSaved * costPerCigarette;

    // Calculate today's savings
    const todayCount = await CigLog.getDailyCount(req.user._id, new Date());
    const todayTarget = user.getCurrentDailyTarget();
    const todaySaved =
      Math.max(0, initialDailyAmount - todayCount) * costPerCigarette;

    // Calculate weekly savings
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekConsumption = await CigLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          timestamp: { $gte: weekAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    const weekActual =
      weekConsumption.length > 0 ? weekConsumption[0].total : 0;
    const weekWouldHave = initialDailyAmount * 7;
    const weekSaved = Math.max(0, weekWouldHave - weekActual) * costPerCigarette;

    // Calculate monthly savings
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthConsumption = await CigLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          timestamp: { $gte: monthAgo },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
        },
      },
    ]);

    const monthActual =
      monthConsumption.length > 0 ? monthConsumption[0].total : 0;
    const monthWouldHave = initialDailyAmount * 30;
    const monthSaved =
      Math.max(0, monthWouldHave - monthActual) * costPerCigarette;

    res.json({
      totalSaved: Math.round(totalSaved * 100) / 100,
      cigarettesSaved,
      costPerCigarette: Math.round(costPerCigarette * 100) / 100,
      daysSinceStart,
      breakdown: {
        today: Math.round(todaySaved * 100) / 100,
        thisWeek: Math.round(weekSaved * 100) / 100,
        thisMonth: Math.round(monthSaved * 100) / 100,
      },
      projections: {
        nextWeek:
          Math.round(
            (cigarettesSaved / Math.max(1, daysSinceStart)) *
              7 *
              costPerCigarette *
              100
          ) / 100,
        nextMonth:
          Math.round(
            (cigarettesSaved / Math.max(1, daysSinceStart)) *
              30 *
              costPerCigarette *
              100
          ) / 100,
        nextYear:
          Math.round(
            (cigarettesSaved / Math.max(1, daysSinceStart)) *
              365 *
              costPerCigarette *
              100
          ) / 100,
      },
    });
  } catch (error) {
    console.error("Get savings error:", error);
    res.status(500).json({
      error: "Server error while calculating savings",
    });
  }
});

// @route   GET /api/stats/achievements
// @desc    Get user achievements and milestone tracking
// @access  Private
router.get("/achievements", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Get earned achievements
    const earnedAchievements = await Achievement.find({
      userId: req.user._id,
    }).sort({ earnedAt: -1 });

    // Calculate current streak
    const currentStreak = await Achievement.calculateCurrentStreak(
      req.user._id
    );

    // Calculate money saved for achievement tracking
    const moneySaved = await Achievement.calculateMoneySaved(req.user._id);

    // Define all possible achievements with progress
    const allAchievements = [
      {
        type: "first_day",
        title: "First Day Complete!",
        description: "Complete your first day of quitting",
        category: "streak",
        icon: "🌟",
        earned: earnedAchievements.some((a) => a.type === "first_day"),
        progress: currentStreak >= 1 ? 100 : 0,
      },
      {
        type: "streak_3_days",
        title: "3-Day Streak!",
        description: "Maintain your targets for 3 consecutive days",
        category: "streak",
        icon: "🔥",
        earned: earnedAchievements.some((a) => a.type === "streak_3_days"),
        progress: Math.min(100, Math.round((currentStreak / 3) * 100)),
      },
      {
        type: "streak_7_days",
        title: "One Week Strong!",
        description: "Maintain your targets for 7 consecutive days",
        category: "streak",
        icon: "💪",
        earned: earnedAchievements.some((a) => a.type === "streak_7_days"),
        progress: Math.min(100, Math.round((currentStreak / 7) * 100)),
      },
      {
        type: "streak_30_days",
        title: "One Month Milestone!",
        description: "Maintain your targets for 30 consecutive days",
        category: "streak",
        icon: "🏆",
        earned: earnedAchievements.some((a) => a.type === "streak_30_days"),
        progress: Math.min(100, Math.round((currentStreak / 30) * 100)),
      },
      {
        type: "money_saved_50",
        title: "$50 Saved!",
        description: "Save $50 by reducing cigarette consumption",
        category: "savings",
        icon: "💰",
        earned: earnedAchievements.some((a) => a.type === "money_saved_50"),
        progress: Math.min(100, Math.round((moneySaved / 50) * 100)),
      },
      {
        type: "money_saved_100",
        title: "$100 Saved!",
        description: "Save $100 by reducing cigarette consumption",
        category: "savings",
        icon: "💵",
        earned: earnedAchievements.some((a) => a.type === "money_saved_100"),
        progress: Math.min(100, Math.round((moneySaved / 100) * 100)),
      },
      {
        type: "money_saved_500",
        title: "$500 Saved!",
        description: "Save $500 by reducing cigarette consumption",
        category: "savings",
        icon: "💸",
        earned: earnedAchievements.some((a) => a.type === "money_saved_500"),
        progress: Math.min(100, Math.round((moneySaved / 500) * 100)),
      },
      {
        type: "money_saved_1000",
        title: "$1000 Saved!",
        description: "Save $1000 by reducing cigarette consumption",
        category: "savings",
        icon: "🤑",
        earned: earnedAchievements.some((a) => a.type === "money_saved_1000"),
        progress: Math.min(100, Math.round((moneySaved / 1000) * 100)),
      },
    ];

    // Separate earned and upcoming achievements
    const earned = allAchievements.filter((a) => a.earned);
    const upcoming = allAchievements.filter((a) => !a.earned);

    res.json({
      earned: earned.map((a) => ({
        ...a,
        earnedAt: earnedAchievements.find((ea) => ea.type === a.type)?.earnedAt,
      })),
      upcoming: upcoming.sort((a, b) => b.progress - a.progress),
      stats: {
        totalEarned: earned.length,
        totalAvailable: allAchievements.length,
        currentStreak,
        moneySaved: Math.round(moneySaved * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      error: "Server error while fetching achievements",
    });
  }
});

// @route   GET /api/stats/streaks
// @desc    Get streak information for consecutive successful days
// @access  Private
router.get("/streaks", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (!user.quitPlan) {
      return res.status(400).json({
        error: "No quit plan found",
      });
    }

    // Calculate current streak
    const currentStreak = await Achievement.calculateCurrentStreak(
      req.user._id
    );

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let currentDate = new Date(user.quitPlan.startDate);
    const today = new Date();

    while (currentDate <= today) {
      const dailyCount = await CigLog.getDailyCount(req.user._id, currentDate);
      
      // Calculate target for this specific date
      const daysSinceStart = Math.floor(
        (currentDate - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );
      const totalDays = Math.ceil(
        (new Date(user.quitPlan.quitDate) -
          new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );

      let dailyTarget;
      if (user.quitPlan.reductionMethod === "cold_turkey") {
        dailyTarget =
          currentDate >= new Date(user.quitPlan.quitDate)
            ? 0
            : user.quitPlan.initialDailyAmount;
      } else {
        if (daysSinceStart >= totalDays) {
          dailyTarget = 0;
        } else {
          const reductionPerDay =
            user.quitPlan.initialDailyAmount / totalDays;
          dailyTarget = Math.max(
            0,
            user.quitPlan.initialDailyAmount - reductionPerDay * daysSinceStart
          );
          dailyTarget = Math.round(dailyTarget);
        }
      }

      if (dailyCount <= dailyTarget) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate total successful days
    const totalDaysSinceStart = Math.floor(
      (new Date() - new Date(user.quitPlan.startDate)) /
        (1000 * 60 * 60 * 24)
    );

    // Get successful days count
    const successfulDays = await CigLog.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user._id),
          timestamp: { $gte: new Date(user.quitPlan.startDate) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$timestamp" },
            month: { $month: "$timestamp" },
            day: { $dayOfMonth: "$timestamp" },
          },
          totalCount: { $sum: "$count" },
        },
      },
    ]);

    res.json({
      currentStreak,
      longestStreak,
      totalSuccessfulDays: successfulDays.length,
      totalDaysSinceStart: Math.max(0, totalDaysSinceStart),
      successRate:
        totalDaysSinceStart > 0
          ? Math.round((successfulDays.length / totalDaysSinceStart) * 100)
          : 0,
      streakMilestones: {
        next3Days: currentStreak < 3 ? 3 - currentStreak : 0,
        next7Days: currentStreak < 7 ? 7 - currentStreak : 0,
        next30Days: currentStreak < 30 ? 30 - currentStreak : 0,
        next90Days: currentStreak < 90 ? 90 - currentStreak : 0,
      },
    });
  } catch (error) {
    console.error("Get streaks error:", error);
    res.status(500).json({
      error: "Server error while calculating streaks",
    });
  }
});

module.exports = router;
