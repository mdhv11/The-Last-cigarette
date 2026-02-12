const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    mood: {
        type: String,
        enum: ['happy', 'neutral', 'sad', 'angry', 'stressed', 'anxious', 'excited', 'bored'],
        required: true
    },
    cravingIntensity: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    notes: {
        type: String
    },
    triggers: [{
        type: String
    }]
}, {
    timestamps: true
});

JournalEntrySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
