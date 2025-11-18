const express = require("express");
const { body, validationResult } = require("express-validator");
const { User } = require("../models");
const auth = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/plan/setup
// @desc    Create initial quit plan for user
// @access  Private
router.post(
  "/setup",
  auth,
  [
    body("startDate")
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("quitDate").isISO8601().withMessage("Quit date must be a valid date"),
    body("initialDailyAmount")
      .isInt({ min: 1 })
      .withMessage("Initial daily amount must be at least 1"),
    body("reductionMethod")
      .isIn(["gradual", "cold_turkey"])
      .withMessage("Reduction method must be 'gradual' or 'cold_turkey'"),
    body("cigaretteCost")
      .isFloat({ min: 0 })
      .withMessage("Cigarette cost must be a positive number"),
    body("packSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Pack size must be at least 1"),
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

      const {
        startDate,
        quitDate,
        initialDailyAmount,
        reductionMethod,
        cigaretteCost,
        packSize = 20,
      } = req.body;

      // Validate dates
      const start = new Date(startDate);
      const quit = new Date(quitDate);

      if (quit <= start) {
        return res.status(400).json({
          error: "Quit date must be after start date",
        });
      }

      // Update user with quit plan
      const user = await User.findByIdAndUpdate(
        req.user._id,
        {
          quitPlan: {
            startDate: start,
            quitDate: quit,
            initialDailyAmount,
            reductionMethod,
            cigaretteCost,
            packSize,
          },
        },
        { new: true }
      );

      res.json({
        message: "Quit plan created successfully",
        quitPlan: user.quitPlan,
      });
    } catch (error) {
      console.error("Setup plan error:", error);
      res.status(500).json({
        error: "Server error during plan setup",
      });
    }
  }
);

// @route   PUT /api/plan/update
// @desc    Update existing quit plan
// @access  Private
router.put(
  "/update",
  auth,
  [
    body("startDate")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid date"),
    body("quitDate")
      .optional()
      .isISO8601()
      .withMessage("Quit date must be a valid date"),
    body("initialDailyAmount")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Initial daily amount must be at least 1"),
    body("reductionMethod")
      .optional()
      .isIn(["gradual", "cold_turkey"])
      .withMessage("Reduction method must be 'gradual' or 'cold_turkey'"),
    body("cigaretteCost")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Cigarette cost must be a positive number"),
    body("packSize")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Pack size must be at least 1"),
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

      const user = await User.findById(req.user._id);
      if (!user.quitPlan) {
        return res.status(400).json({
          error: "No quit plan found. Please create a plan first.",
        });
      }

      // Update only provided fields
      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (req.body[key] !== undefined) {
          updates[`quitPlan.${key}`] = req.body[key];
        }
      });

      // Validate dates if both are provided or being updated
      if (req.body.startDate || req.body.quitDate) {
        const startDate = req.body.startDate
          ? new Date(req.body.startDate)
          : user.quitPlan.startDate;
        const quitDate = req.body.quitDate
          ? new Date(req.body.quitDate)
          : user.quitPlan.quitDate;

        if (quitDate <= startDate) {
          return res.status(400).json({
            error: "Quit date must be after start date",
          });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      );

      res.json({
        message: "Quit plan updated successfully",
        quitPlan: updatedUser.quitPlan,
      });
    } catch (error) {
      console.error("Update plan error:", error);
      res.status(500).json({
        error: "Server error during plan update",
      });
    }
  }
);

// @route   GET /api/plan/current
// @desc    Get current quit plan and progress
// @access  Private
router.get("/current", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.quitPlan) {
      return res.status(404).json({
        error: "No quit plan found",
      });
    }

    const currentTarget = user.getCurrentDailyTarget();
    const daysSinceStart = Math.max(
      0,
      Math.floor(
        (new Date() - new Date(user.quitPlan.startDate)) / (1000 * 60 * 60 * 24)
      )
    );
    const totalDays = Math.ceil(
      (new Date(user.quitPlan.quitDate) - new Date(user.quitPlan.startDate)) /
        (1000 * 60 * 60 * 24)
    );

    res.json({
      quitPlan: user.quitPlan,
      progress: {
        currentDailyTarget: currentTarget,
        daysSinceStart,
        totalDays,
        progressPercentage: Math.min(
          100,
          Math.round((daysSinceStart / totalDays) * 100)
        ),
      },
    });
  } catch (error) {
    console.error("Get current plan error:", error);
    res.status(500).json({
      error: "Server error while fetching plan",
    });
  }
});

// @route   GET /api/plan/targets
// @desc    Get daily targets for a date range
// @access  Private
router.get("/targets", auth, async (req, res) => {
  try {
    const { startDate, endDate, days = 30 } = req.query;

    const user = await User.findById(req.user._id);
    if (!user.quitPlan) {
      return res.status(404).json({
        error: "No quit plan found",
      });
    }

    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - parseInt(days));
    }

    const targets = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const daysSinceQuitStart = Math.floor(
        (currentDate - new Date(user.quitPlan.startDate)) /
          (1000 * 60 * 60 * 24)
      );

      let dailyTarget;
      if (daysSinceQuitStart < 0) {
        dailyTarget = user.quitPlan.initialDailyAmount;
      } else {
        // Calculate target for this specific date
        const totalDays = Math.ceil(
          (new Date(user.quitPlan.quitDate) -
            new Date(user.quitPlan.startDate)) /
            (1000 * 60 * 60 * 24)
        );

        if (user.quitPlan.reductionMethod === "cold_turkey") {
          dailyTarget =
            currentDate >= new Date(user.quitPlan.quitDate)
              ? 0
              : user.quitPlan.initialDailyAmount;
        } else {
          if (daysSinceQuitStart >= totalDays) {
            dailyTarget = 0;
          } else {
            const reductionPerDay =
              user.quitPlan.initialDailyAmount / totalDays;
            dailyTarget = Math.max(
              0,
              user.quitPlan.initialDailyAmount -
                reductionPerDay * daysSinceQuitStart
            );
            dailyTarget = Math.round(dailyTarget);
          }
        }
      }

      targets.push({
        date: new Date(currentDate),
        target: dailyTarget,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({ targets });
  } catch (error) {
    console.error("Get targets error:", error);
    res.status(500).json({
      error: "Server error while fetching targets",
    });
  }
});

module.exports = router;
