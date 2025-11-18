const mongoose = require("mongoose");

const cigLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    count: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    notes: {
      type: String,
      maxlength: 500,
      trim: true,
    },
    location: {
      type: String,
      maxlength: 100,
      trim: true,
    },
    trigger: {
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
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
cigLogSchema.index({ userId: 1, timestamp: -1 });
cigLogSchema.index({ userId: 1, createdAt: -1 });

// Static method to get daily count
cigLogSchema.statics.getDailyCount = async function (
  userId,
  date = new Date()
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalCount: { $sum: "$count" },
      },
    },
  ]);

  return result.length > 0 ? result[0].totalCount : 0;
};

// Static method to get consumption history
cigLogSchema.statics.getConsumptionHistory = async function (
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
        timestamp: {
          $gte: startDate,
          $lte: endDate,
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
};

// Static method to get trigger statistics
cigLogSchema.statics.getTriggerStats = async function (userId, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
        trigger: { $exists: true, $ne: null },
      },
    },
    {
      $group: {
        _id: "$trigger",
        count: { $sum: 1 },
        totalCigarettes: { $sum: "$count" },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);
};

module.exports = mongoose.model("CigLog", cigLogSchema);
