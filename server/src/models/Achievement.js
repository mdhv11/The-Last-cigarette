const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['streak', 'savings', 'reduction', 'milestone'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    unlockedAt: {
        type: Date,
        default: Date.now
    },
    value: {
        type: Number
    }
}, {
    timestamps: true
});

AchievementSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Achievement', AchievementSchema);
