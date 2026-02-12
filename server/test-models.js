require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const CigLog = require('./src/models/CigLog');
const JournalEntry = require('./src/models/JournalEntry');
const Achievement = require('./src/models/Achievement');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thelastcigarette';

async function testModels() {
    try {
        await mongoose.connect(MONGODB_URI);

        // 1. Create User
        const user = new User({
            email: `test-${Date.now()}@example.com`,
            passwordHash: 'hashed_password_123',
            profile: { name: 'Test User' },
            quitPlan: {
                startDate: new Date(),
                targetQuitDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                initialDailyAverage: 20,
                currentDailyLimit: 20,
                reductionFrequency: 7,
                reductionAmount: 2,
                cigaretteCost: 15
            }
        });
        await user.save();

        // 2. Create CigLog
        const log = new CigLog({
            userId: user._id,
            count: 1,
            location: 'Home',
            trigger: 'Coffee'
        });
        await log.save();

        // 3. Create JournalEntry
        const entry = new JournalEntry({
            userId: user._id,
            mood: 'neutral',
            cravingIntensity: 5,
            notes: 'Feeling okay',
            triggers: ['Stress']
        });
        await entry.save();

        // 4. Create Achievement
        const achievement = new Achievement({
            userId: user._id,
            type: 'milestone',
            name: 'First Step',
            description: 'Created an account',
            value: 0
        });
        await achievement.save();

    } catch (err) {
        console.error('❌ Model verification failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testModels();
