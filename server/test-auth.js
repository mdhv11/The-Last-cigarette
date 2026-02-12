require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const request = require('supertest');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thelastcigarette';

async function testAuth() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Clean up previous test user
        await User.deleteOne({ email: 'authtest@example.com' });

        // 1. Test Signup
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Auth Test User',
                email: 'authtest@example.com',
                password: 'password123'
            });

        if (signupRes.status !== 201) {
            throw new Error(`Signup failed: ${JSON.stringify(signupRes.body)}`);
        }
        const token = signupRes.body.token;

        // 2. Test Login
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'authtest@example.com',
                password: 'password123'
            });

        if (loginRes.status !== 200) {
            throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
        }

        // 3. Test Protected Route (Get Me)
        const meRes = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        if (meRes.status !== 200) {
            throw new Error(`Get Me failed: ${JSON.stringify(meRes.body)}`);
        }

    } catch (err) {
        console.error('❌ Auth verification failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testAuth();
