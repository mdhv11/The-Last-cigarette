const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    mood: {
      type: String,
      enum: ["very_sad", "sad", "neutral", "happy", "very_happy"],
      required: true,
    },
    cravingIntensity: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    notes: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    triggers: [
      {
        type: String,
        enum: [
          "stress",
          "social",
          "habit",
          "boredom",
          "alcohol",
          "coffee",
          "work",
          "anxiety",
          "other",
        ],
      },
    ],
    copingStrategies: [
      {
        type: String,
        enum: [
          "breathing",
          "exercise",
          "distraction",
          "support_call",
          "meditation",
          "other",
        ],
      },
    ],
    successfulDelay: {
      type: Boolean,
      default: false,
    },
    delayDuration: {
      type: Number, // minutes
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
journalEntrySchema.index({ userId: 1, date: -1 });
journalEntrySchema.index({ userId: 1, createdAt: -1 });

// Static method to get mood trends
journalEntrySchema.statics.getMoodTrends = async function (userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
        },
        date: { $first: "$date" },
        avgMood: {
          $avg: {
            $switch: {
              branches: [
                { case: { $eq: ["$mood", "very_sad"] }, then: 1 },
                { case: { $eq: ["$mood", "sad"] }, then: 2 },
                { case: { $eq: ["$mood", "neutral"] }, then: 3 },
                { case: { $eq: ["$mood", "happy"] }, then: 4 },
                { case: { $eq: ["$mood", "very_happy"] }, then: 5 },
              ],
              default: 3,
            },
          },
        },
        avgCraving: { $avg: "$cravingIntensity" },
        entryCount: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 },
    },
  ]);
};

// Static method to get common triggers
journalEntrySchema.statics.getCommonTriggers = async function (
  userId,
  days = 30
) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      },
    },
    {
      $unwind: "$triggers",
    },
    {
      $group: {
        _id: "$triggers",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
