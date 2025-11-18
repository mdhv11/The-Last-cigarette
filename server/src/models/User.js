const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const quitPlanSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true,
  },
  quitDate: {
    type: Date,
    required: true,
  },
  initialDailyAmount: {
    type: Number,
    required: true,
    min: 1,
  },
  reductionMethod: {
    type: String,
    enum: ["gradual", "cold_turkey"],
    default: "gradual",
  },
  cigaretteCost: {
    type: Number,
    required: true,
    min: 0,
  },
  packSize: {
    type: Number,
    default: 20,
    min: 1,
  },
});

const settingsSchema = new mongoose.Schema({
  notifications: {
    dailyReminders: {
      type: Boolean,
      default: true,
    },
    achievementAlerts: {
      type: Boolean,
      default: true,
    },
    cravingSupport: {
      type: Boolean,
      default: true,
    },
  },
  punishments: {
    enabled: {
      type: Boolean,
      default: false,
    },
    donationAmount: {
      type: Number,
      default: 10,
      min: 0,
    },
    charityName: {
      type: String,
      default: "",
    },
  },
  rewards: [
    {
      name: {
        type: String,
        required: true,
      },
      cost: {
        type: Number,
        required: true,
        min: 0,
      },
    },
  ],
});

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (password) {
          // Only validate on new passwords (not hashed ones)
          if (this.isModified("password") && !password.startsWith("$2")) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password);
          }
          return true;
        },
        message:
          "Password must contain at least one lowercase letter, one uppercase letter, and one number",
      },
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quitPlan: {
      type: quitPlanSchema,
      required: false,
    },
    settings: {
      type: settingsSchema,
      default: () => ({}),
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    // Use higher salt rounds for better security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Calculate current daily target based on quit plan
userSchema.methods.getCurrentDailyTarget = function () {
  if (!this.quitPlan) return 0;

  const { startDate, quitDate, initialDailyAmount, reductionMethod } =
    this.quitPlan;

  if (reductionMethod === "cold_turkey") {
    return new Date() >= new Date(quitDate) ? 0 : initialDailyAmount;
  }

  // Use Math.floor for consistency across the application
  const totalDays = Math.floor(
    (new Date(quitDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );
  const daysPassed = Math.floor(
    (new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24)
  );

  if (daysPassed < 0) return initialDailyAmount;
  if (daysPassed >= totalDays) return 0;

  const reductionPerDay = initialDailyAmount / totalDays;
  const currentTarget = Math.max(
    0,
    initialDailyAmount - reductionPerDay * daysPassed
  );

  return Math.round(currentTarget);
};

// Indexes for better performance
// Note: email index is already created via unique: true in schema
userSchema.index({ createdAt: 1 });
userSchema.index({ lastLogin: 1 });

module.exports = mongoose.model("User", userSchema);
