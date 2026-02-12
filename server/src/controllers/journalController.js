const JournalEntry = require('../models/JournalEntry');

exports.createEntry = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { mood, cravingIntensity, notes, triggers } = req.body;

        const entry = new JournalEntry({
            userId,
            mood,
            cravingIntensity,
            notes,
            triggers,
            date: new Date()
        });

        await entry.save();

        res.status(201).json({ success: true, entry });
    } catch (error) {
        console.error('Create Journal Entry Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.getEntries = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { limit = 20, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        const entries = await JournalEntry.find({ userId })
            .sort({ timestamp: -1 })
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const total = await JournalEntry.countDocuments({ userId });

        res.json({
            success: true,
            entries,
            totalPages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Get Journal Entries Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

exports.deleteEntry = async (req, res) => {
    try {
        const userId = req.user.userId;
        const entryId = req.params.id;

        const entry = await JournalEntry.findOneAndDelete({ _id: entryId, userId });

        if (!entry) {
            return res.status(404).json({ success: false, error: 'Entry not found' });
        }

        res.json({ success: true, message: 'Entry deleted' });
    } catch (error) {
        console.error('Delete Journal Entry Error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
};
