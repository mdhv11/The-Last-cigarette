const express = require("express");
const { User, CigLog, Achievement, JournalEntry } = require("../models");
const auth = require("../middleware/auth");
const {
  checkAndAwardAchievements,
  checkPunishmentTrigger,
  getAchievementsWithProgress,
} = require("../utils/achievements");

const router = express.Router();

// @route   POST /api/achievements/check
// @desc    Check and award new achievements for the user
// @access  Private
router.post("/check", auth, async (req, res) => {
  try {
    const models = { User, CigLog, Achievement, JournalEntry };
    const newAchievements = await checkAndAwardAchievements(
      req.user._id,
      models
    );

    res.json({
      success: true,
      newAchievements,
      count: newAchievements.length,
    });
  } catch (error) {
    console.error("Check achievements error:", error);
    res.status(500).json({
      error: "Server error while checking achievements",
    });
  }
});

// @route   GET /api/achievements
// @desc    Get all achievements with progress for the user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const models = { User, CigLog, Achievement, JournalEntry };
    const achievementsData = await getAchievementsWithProgress(
      req.user._id,
      models
    );

    res.json(achievementsData);
  } catch (error) {
    console.error("Get achievements error:", error);
    res.status(500).json({
      error: "Server error while fetching achievements",
    });
  }
});

// @route   GET /api/achievements/punishment
// @desc    Check if punishment reminder should be triggered
// @access  Private
router.get("/punishment", auth, async (req, res) => {
  try {
    const models = { User, CigLog, Achievement, JournalEntry };
    const punishmentStatus = await checkPunishmentTrigger(
      req.user._id,
      models
    );

    res.json(punishmentStatus);
  } catch (error) {
    console.error("Check punishment error:", error);
    res.status(500).json({
      error: "Server error while checking punishment trigger",
    });
  }
});

// @route   GET /api/achievements/recent
// @desc    Get recently earned achievements (last 7 days)
// @access  Private
router.get("/recent", auth, async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAchievements = await Achievement.find({
      userId: req.user._id,
      earnedAt: { $gte: sevenDaysAgo },
    }).sort({ earnedAt: -1 });

    res.json({
      achievements: recentAchievements,
      count: recentAchievements.length,
    });
  } catch (error) {
    console.error("Get recent achievements error:", error);
    res.status(500).json({
      error: "Server error while fetching recent achievements",
    });
  }
});

// @route   GET /api/achievements/stats
// @desc    Get achievement statistics for the user
// @access  Private
router.get("/stats", auth, async (req, res) => {
  try {
    const totalEarned = await Achievement.countDocuments({
      userId: req.user._id,
    });

    const achievementsByCategory = await Achievement.aggregate([
      {
        $match: {
          userId: req.user._id,
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = {};
    achievementsByCategory.forEach((cat) => {
      categoryStats[cat._id] = cat.count;
    });

    // Get most recent achievement
    const mostRecent = await Achievement.findOne({
      userId: req.user._id,
    }).sort({ earnedAt: -1 });

    res.json({
      totalEarned,
      categoryStats,
      mostRecent,
    });
  } catch (error) {
    console.error("Get achievement stats error:", error);
    res.status(500).json({
      error: "Server error while fetching achievement statistics",
    });
  }
});

module.exports = router;
