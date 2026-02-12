require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const request = require('supertest');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thelastcigarette';

async function testPlan() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean up previous test user
        await User.deleteOne({ email: 'plantest@example.com' });

        // 1. Signup
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Plan Test User',
                email: 'plantest@example.com',
                password: 'password123'
            });
        const token = signupRes.body.token;

        // 2. Setup Plan
        console.log('Testing Setup Plan...');
        const setupRes = await request(app)
            .post('/api/plan/setup')
            .set('Authorization', `Bearer ${token}`)
            .send({
                initialDailyAverage: 20,
                targetQuitDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cigaretteCost: 15
            });

        if (setupRes.status !== 200) {
            throw new Error(`Setup Plan failed: ${JSON.stringify(setupRes.body)}`);
        }
        console.log('✅ Plan setup successful');

        // 3. Get Current Plan
        console.log('Testing Get Current Plan...');
        const getRes = await request(app)
            .get('/api/plan/current')
            .set('Authorization', `Bearer ${token}`);

        if (getRes.status !== 200) {
            throw new Error(`Get Plan failed: ${JSON.stringify(getRes.body)}`);
        }
        console.log('✅ Get Plan successful');
        console.log('Current Daily Limit:', getRes.body.plan.currentDailyLimit);

        // 4. Get Targets
        console.log('Testing Get Targets...');
        const targetsRes = await request(app)
            .get('/api/plan/targets')
            .set('Authorization', `Bearer ${token}`);

        if (targetsRes.status !== 200) {
            throw new Error(`Get Targets failed: ${JSON.stringify(targetsRes.body)}`);
        }
        console.log('✅ Get Targets successful');
        console.log('Next 7 days targets:', targetsRes.body.targets.map(t => t.target));

        console.log('🎉 Plan system verified successfully!');
    } catch (err) {
        console.error('❌ Plan verification failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testPlan();
