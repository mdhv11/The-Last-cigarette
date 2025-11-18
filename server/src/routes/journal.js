const express = require("express");
const mongoose = require("mongoose");
const { JournalEntry } = require("../models");
const auth = require("../middleware/auth");
const { validateJournalEntry } = require("../utils/validation");

const router = express.Router();

// @route   POST /api/journal/entry
// @desc    Create a new journal entry
// @access  Private
router.post("/entry", auth, async (req, res) => {
  try {
    const { mood, cravingIntensity, notes, triggers, copingStrategies, successfulDelay, delayDuration } = req.body;

    // Validate input
    const validation = validateJournalEntry(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Create journal entry
    const entry = new JournalEntry({
      userId: req.user._id,
      date: new Date(),
      mood,
      cravingIntensity,
      notes: notes?.trim(),
      triggers: triggers || [],
      copingStrategies: copingStrategies || [],
      successfulDelay: successfulDelay || false,
      delayDuration: delayDuration || 0,
    });

    await entry.save();

    res.status(201).json({
      message: "Journal entry created successfully",
      entry: {
        id: entry._id,
        date: entry.date,
        mood: entry.mood,
        cravingIntensity: entry.cravingIntensity,
        notes: entry.notes,
        triggers: entry.triggers,
        copingStrategies: entry.copingStrategies,
        successfulDelay: entry.successfulDelay,
        delayDuration: entry.delayDuration,
        createdAt: entry.createdAt,
      },
    });
  } catch (error) {
    console.error("Create journal entry error:", error);
    res.status(500).json({
      error: "Server error while creating journal entry",
    });
  }
});

// @route   GET /api/journal/entries
// @desc    Get journal entries with optional date filtering
// @access  Private
router.get("/entries", auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get entries
    const entries = await JournalEntry.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await JournalEntry.countDocuments(query);

    res.json({
      entries: entries.map((entry) => ({
        id: entry._id,
        date: entry.date,
        mood: entry.mood,
        cravingIntensity: entry.cravingIntensity,
        notes: entry.notes,
        triggers: entry.triggers,
        copingStrategies: entry.copingStrategies,
        successfulDelay: entry.successfulDelay,
        delayDuration: entry.delayDuration,
        createdAt: entry.createdAt,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get journal entries error:", error);
    res.status(500).json({
      error: "Server error while fetching journal entries",
    });
  }
});

// @route   GET /api/journal/entry/:id
// @desc    Get a specific journal entry
// @access  Private
router.get("/entry/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    res.json({
      entry: {
        id: entry._id,
        date: entry.date,
        mood: entry.mood,
        cravingIntensity: entry.cravingIntensity,
        notes: entry.notes,
        triggers: entry.triggers,
        copingStrategies: entry.copingStrategies,
        successfulDelay: entry.successfulDelay,
        delayDuration: entry.delayDuration,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get journal entry error:", error);
    res.status(500).json({
      error: "Server error while fetching journal entry",
    });
  }
});

// @route   PUT /api/journal/entry/:id
// @desc    Update a journal entry
// @access  Private
router.put("/entry/:id", auth, async (req, res) => {
  try {
    const { mood, cravingIntensity, notes, triggers, copingStrategies, successfulDelay, delayDuration } = req.body;

    // Validate input
    const validation = validateJournalEntry(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
    }

    // Find and update entry
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    // Update fields
    if (mood !== undefined) entry.mood = mood;
    if (cravingIntensity !== undefined) entry.cravingIntensity = cravingIntensity;
    if (notes !== undefined) entry.notes = notes?.trim();
    if (triggers !== undefined) entry.triggers = triggers;
    if (copingStrategies !== undefined) entry.copingStrategies = copingStrategies;
    if (successfulDelay !== undefined) entry.successfulDelay = successfulDelay;
    if (delayDuration !== undefined) entry.delayDuration = delayDuration;

    await entry.save();

    res.json({
      message: "Journal entry updated successfully",
      entry: {
        id: entry._id,
        date: entry.date,
        mood: entry.mood,
        cravingIntensity: entry.cravingIntensity,
        notes: entry.notes,
        triggers: entry.triggers,
        copingStrategies: entry.copingStrategies,
        successfulDelay: entry.successfulDelay,
        delayDuration: entry.delayDuration,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update journal entry error:", error);
    res.status(500).json({
      error: "Server error while updating journal entry",
    });
  }
});

// @route   DELETE /api/journal/entry/:id
// @desc    Delete a journal entry
// @access  Private
router.delete("/entry/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({
        error: "Journal entry not found",
      });
    }

    res.json({
      message: "Journal entry deleted successfully",
    });
  } catch (error) {
    console.error("Delete journal entry error:", error);
    res.status(500).json({
      error: "Server error while deleting journal entry",
    });
  }
});

// @route   GET /api/journal/trends
// @desc    Get mood and craving trends
// @access  Private
router.get("/trends", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const trends = await JournalEntry.getMoodTrends(req.user._id, parseInt(days));

    res.json({
      trends: trends.map((trend) => ({
        date: trend.date,
        averageMood: Math.round(trend.avgMood * 10) / 10,
        averageCraving: Math.round(trend.avgCraving * 10) / 10,
        entryCount: trend.entryCount,
      })),
    });
  } catch (error) {
    console.error("Get trends error:", error);
    res.status(500).json({
      error: "Server error while fetching trends",
    });
  }
});

// @route   GET /api/journal/triggers
// @desc    Get common triggers analysis
// @access  Private
router.get("/triggers", auth, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const triggers = await JournalEntry.getCommonTriggers(req.user._id, parseInt(days));

    res.json({
      triggers: triggers.map((trigger) => ({
        name: trigger._id,
        count: trigger.count,
      })),
    });
  } catch (error) {
    console.error("Get triggers error:", error);
    res.status(500).json({
      error: "Server error while fetching triggers",
    });
  }
});

module.exports = router;
