const mongoose = require('mongoose');

const CigLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    count: {
        type: Number,
        default: 1
    },
    location: {
        type: String
    },
    trigger: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying of logs by user and time
CigLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('CigLog', CigLogSchema);
