const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./src/app');
const User = require('./src/models/User');
const Achievement = require('./src/models/Achievement');
const CigLog = require('./src/models/CigLog');
const JournalEntry = require('./src/models/JournalEntry');

require('dotenv').config();

const TEST_USER = {
    email: 'achiever@test.com',
    password: 'password123',
    name: 'Achiever'
};

const TEST_PLAN = {
    cigarettesPerDay: 20,
    packCost: 10,
    cigarettesPerPack: 20,
    quitDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

let token;
let userId;

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Cleanup
        await User.deleteMany({ email: TEST_USER.email });
        await CigLog.deleteMany({}); // Warning: Deletes all logs, use with caution in dev
        await JournalEntry.deleteMany({});
        await Achievement.deleteMany({});

        // 1. Signup
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send(TEST_USER);
        token = signupRes.body.token;
        userId = signupRes.body.user.id;

        // 2. Setup Plan
        await request(app)
            .post('/api/plan/setup')
            .set('Authorization', `Bearer ${token}`)
            .send(TEST_PLAN);

        // 3. Check Initial Achievements (Should be empty)
        const initialRes = await request(app)
            .get('/api/stats/achievements')
            .set('Authorization', `Bearer ${token}`);

        // 4. Trigger "Tracker" Achievement (Log a cigarette)
        await request(app)
            .post('/api/cigs/log')
            .set('Authorization', `Bearer ${token}`)
            .send({ count: 1 });

        // 5. Trigger "Reflector" Achievement (Create journal entry)
        await request(app)
            .post('/api/journal/entry')
            .set('Authorization', `Bearer ${token}`)
            .send({ mood: 'happy', cravingIntensity: 5, note: 'Feeling good' });

        // 6. Check Achievements Again
        const finalRes = await request(app)
            .get('/api/stats/achievements')
            .set('Authorization', `Bearer ${token}`);

        const achievements = finalRes.body.achievements;
        const hasTracker = achievements.some(a => a.name === 'Tracker');
        const hasReflector = achievements.some(a => a.name === 'Reflector');


    } catch (error) {
        console.error('Test Error:', error);
    } finally {
        await mongoose.connection.close();
    }
};

runTests();
