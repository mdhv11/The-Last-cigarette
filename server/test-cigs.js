require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const CigLog = require('./src/models/CigLog');
const request = require('supertest');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thelastcigarette';

async function testCigs() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Clean up previous test user
        await User.deleteOne({ email: 'cigtest@example.com' });
        await CigLog.deleteMany({}); // Be careful with this in prod, okay for dev/test

        // 1. Signup & Setup Plan
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Cig Test User',
                email: 'cigtest@example.com',
                password: 'password123'
            });
        const token = signupRes.body.token;

        await request(app)
            .post('/api/plan/setup')
            .set('Authorization', `Bearer ${token}`)
            .send({
                initialDailyAverage: 10,
                targetQuitDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cigaretteCost: 1
            });

        // 2. Log Cigarette
        const logRes = await request(app)
            .post('/api/cigs/log')
            .set('Authorization', `Bearer ${token}`)
            .send({
                count: 1,
                location: 'Home',
                trigger: 'Stress'
            });

        if (logRes.status !== 201) {
            throw new Error(`Log Cigarette failed: ${JSON.stringify(logRes.body)}`);
        }

        // 3. Get Today Count
        const todayRes = await request(app)
            .get('/api/cigs/today')
            .set('Authorization', `Bearer ${token}`);

        if (todayRes.status !== 200) {
            throw new Error(`Get Today Count failed: ${JSON.stringify(todayRes.body)}`);
        }
        if (todayRes.body.count !== 1) {
            throw new Error(`Incorrect count: ${todayRes.body.count}`);
        }

        // 4. Get History
        const historyRes = await request(app)
            .get('/api/cigs/history')
            .set('Authorization', `Bearer ${token}`);

        if (historyRes.status !== 200) {
            throw new Error(`Get History failed: ${JSON.stringify(historyRes.body)}`);
        }
        if (historyRes.body.logs.length !== 1) {
            throw new Error(`Incorrect history length: ${historyRes.body.logs.length}`);
        }

    } catch (err) {
        console.error('❌ Cigarette verification failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testCigs();
