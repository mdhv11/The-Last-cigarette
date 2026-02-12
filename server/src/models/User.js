const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    profile: {
        name: { type: String, trim: true },
        joinDate: { type: Date, default: Date.now },
        timezone: { type: String, default: 'UTC' }
    },
    quitPlan: {
        startDate: { type: Date },
        targetQuitDate: { type: Date },
        initialDailyAverage: { type: Number },
        currentDailyLimit: { type: Number },
        dailyThreshold: { type: Number }, // User-set warning threshold
        reductionFrequency: { type: Number }, // days
        reductionAmount: { type: Number },
        cigaretteCost: { type: Number }
    },
    settings: {
        remindersEnabled: { type: Boolean, default: true },
        punishmentsEnabled: { type: Boolean, default: false },
        donationAmount: { type: Number, default: 0 },
        treatsList: [{ type: String }],
        checkInTimes: [{ type: String }] // Array of "HH:MM" strings
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
