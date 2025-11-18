const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const { User, CigLog } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/cigs/log
// @desc    Log cigarettes smoked
// @access  Private
router.post(
  "/log",
  auth,
  [
    body("count").isInt({ min: 1 }).withMessage("Count must be at least 1"),
    body("timestamp")
      .optional()
      .isISO8601()
      .withMessage("Timestamp must be a valid date"),
    body("notes")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Notes cannot exceed 500 characters"),
    body("location")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Location cannot exceed 100 characters"),
    body("trigger")
      .optional()
      .isIn([
        "stress",
        "social",
        "habit",
        "boredom",
        "alcohol",
        "coffee",
        "work",
        "anxiety",
        "other",
      ])
      .withMessage("Invalid trigger type"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { count, timestamp, notes, location, trigger } = req.body;

      // Get user and check if they have a quit plan
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
        });
      }
      if (!user.quitPlan) {
        return res.status(400).json({
          error: "No quit plan found. Please set up your quit plan first.",
        });
      }

      // Use provided timestamp or current time
      const logTimestamp = timestamp ? new Date(timestamp) : new Date();

      // Validate count is reasonable
      if (count > 100) {
        return res.status(400).json({
          error: "Count seems unreasonably high. Please enter a valid number.",
        });
      }

      // Additional validation for timestamp
      if (timestamp) {
        const logDate = new Date(timestamp);
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (logDate > now) {
          return res.status(400).json({
            error: "Cannot log cigarettes for future dates.",
          });
        }

        if (logDate < oneWeekAgo) {
          return res.status(400).json({
            error: "Cannot log cigarettes older than one week.",
          });
        }
      }

      // Check daily limit
      const dailyCount = await CigLog.getDailyCount(req.user._id, logTimestamp);
      const dailyTarget = user.getCurrentDailyTarget();
      const newDailyCount = dailyCount + count;

      // Create cigarette log entry
      const cigLog = new CigLog({
        userId: req.user._id,
        count,
        timestamp: logTimestamp,
        notes,
        location,
        trigger,
      });

      await cigLog.save();

      // Check if user exceeded their daily target
      const exceeded = newDailyCount > dailyTarget;
      const remaining = Math.max(0, dailyTarget - newDailyCount);

      res.status(201).json({
        message: "Cigarettes logged successfully",
        cigLog: {
          id: cigLog._id,
          count: cigLog.count,
          timestamp: cigLog.timestamp,
          notes: cigLog.notes,
          location: cigLog.location,
          trigger: cigLog.trigger,
        },
        dailyStats: {
          totalToday: newDailyCount,
          dailyTarget,
          remaining,
          exceeded,
          overageCount: exceeded ? newDailyCount - dailyTarget : 0,
        },
      });
    } catch (error) {
      console.error("Log cigarettes error:", error);
      res.status(500).json({
        error: "Server error during cigarette logging",
      });
    }
  }
);

// @route   GET /api/cigs/today
// @desc    Get today's cigarette count and stats
// @access  Private
router.get("/today", auth, async (req, res) => {
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

    const today = new Date();
    const dailyCount = await CigLog.getDailyCount(req.user._id, today);
    const dailyTarget = user.getCurrentDailyTarget();
    const remaining = Math.max(0, dailyTarget - dailyCount);
    const exceeded = dailyCount > dailyTarget;

    // Get today's logs for detailed view
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const todaysLogs = await CigLog.find({
      userId: req.user._id,
      timestamp: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).sort({ timestamp: -1 });

    res.json({
      date: today.toISOString().split("T")[0],
      dailyStats: {
        totalToday: dailyCount,
        dailyTarget,
        remaining,
        exceeded,
        overageCount: exceeded ? dailyCount - dailyTarget : 0,
        progressPercentage:
          dailyTarget > 0 ? Math.round((dailyCount / dailyTarget) * 100) : 0,
      },
      logs: todaysLogs.map((log) => ({
        id: log._id,
        count: log.count,
        timestamp: log.timestamp,
        notes: log.notes,
        location: log.location,
        trigger: log.trigger,
      })),
    });
  } catch (error) {
    console.error("Get today's count error:", error);
    res.status(500).json({
      error: "Server error while fetching today's data",
    });
  }
});

// @route   GET /api/cigs/history
// @desc    Get cigarette consumption history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { days = 30, startDate, endDate } = req.query;

    let consumptionHistory;

    if (startDate && endDate) {
      // Use specific date range
      consumptionHistory = await CigLog.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(req.user._id),
            timestamp: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$timestamp" },
              month: { $month: "$timestamp" },
              day: { $dayOfMonth: "$timestamp" },
            },
            date: {
              $first: {
                $dateFromParts: {
                  year: { $year: "$timestamp" },
                  month: { $month: "$timestamp" },
                  day: { $dayOfMonth: "$timestamp" },
                },
              },
            },
            totalCount: { $sum: "$count" },
            logCount: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
        },
      ]);
    } else {
      // Use days parameter
      consumptionHistory = await CigLog.getConsumptionHistory(
        req.user._id,
        parseInt(days)
      );
    }

    // Get user's quit plan for target calculations
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Add daily targets to history
    const historyWithTargets = consumptionHistory.map((day) => {
      let dailyTarget = 0;

      if (user.quitPlan) {
        const daysSinceStart = Math.floor(
          (new Date(day.date) - new Date(user.quitPlan.startDate)) /
            (1000 * 60 * 60 * 24)
        );

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
      }

      return {
        ...day,
        dailyTarget,
        exceeded: day.totalCount > dailyTarget,
        remaining: Math.max(0, dailyTarget - day.totalCount),
      };
    });

    res.json({
      history: historyWithTargets,
      summary: {
        totalDays: consumptionHistory.length,
        totalCigarettes: consumptionHistory.reduce(
          (sum, day) => sum + day.totalCount,
          0
        ),
        averagePerDay:
          consumptionHistory.length > 0
            ? Math.round(
                (consumptionHistory.reduce(
                  (sum, day) => sum + day.totalCount,
                  0
                ) /
                  consumptionHistory.length) *
                  10
              ) / 10
            : 0,
      },
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({
      error: "Server error while fetching history",
    });
  }
});

module.exports = router;
