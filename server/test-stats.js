require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const CigLog = require('./src/models/CigLog');
const request = require('supertest');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thelastcigarette';

async function testStats() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Clean up previous test user
        await User.deleteOne({ email: 'statstest@example.com' });
        await CigLog.deleteMany({});

        // 1. Signup & Setup Plan
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Stats Test User',
                email: 'statstest@example.com',
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
        await request(app)
            .post('/api/cigs/log')
            .set('Authorization', `Bearer ${token}`)
            .send({ count: 2 });

        // 3. Get Dashboard Stats
        const dashRes = await request(app)
            .get('/api/stats/dashboard')
            .set('Authorization', `Bearer ${token}`);

        if (dashRes.status !== 200) {
            throw new Error(`Get Dashboard Stats failed: ${JSON.stringify(dashRes.body)}`);
        }

        // 4. Get Progress Stats
        const progRes = await request(app)
            .get('/api/stats/progress')
            .set('Authorization', `Bearer ${token}`);

        if (progRes.status !== 200) {
            throw new Error(`Get Progress Stats failed: ${JSON.stringify(progRes.body)}`);
        }

        // 5. Get Savings Stats
        const savRes = await request(app)
            .get('/api/stats/savings')
            .set('Authorization', `Bearer ${token}`);

        if (savRes.status !== 200) {
            throw new Error(`Get Savings Stats failed: ${JSON.stringify(savRes.body)}`);
        }

    } catch (err) {
        console.error('❌ Stats verification failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testStats();
