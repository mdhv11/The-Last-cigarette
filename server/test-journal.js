require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const JournalEntry = require('./src/models/JournalEntry');
const request = require('supertest');
const app = require('./src/app');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thelastcigarette';

async function testJournal() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean up previous test user
        await User.deleteOne({ email: 'journaltest@example.com' });
        await JournalEntry.deleteMany({});

        // 1. Signup
        const signupRes = await request(app)
            .post('/api/auth/signup')
            .send({
                name: 'Journal Test User',
                email: 'journaltest@example.com',
                password: 'password123'
            });
        const token = signupRes.body.token;

        // 2. Create Entry
        console.log('Testing Create Entry...');
        const createRes = await request(app)
            .post('/api/journal/entry')
            .set('Authorization', `Bearer ${token}`)
            .send({
                mood: 'stressed',
                cravingIntensity: 8,
                notes: 'Had a tough meeting',
                triggers: ['Work', 'Stress']
            });

        if (createRes.status !== 201) {
            throw new Error(`Create Entry failed: ${JSON.stringify(createRes.body)}`);
        }
        console.log('✅ Create Entry successful');
        const entryId = createRes.body.entry._id;

        // 3. Get Entries
        console.log('Testing Get Entries...');
        const getRes = await request(app)
            .get('/api/journal/entries')
            .set('Authorization', `Bearer ${token}`);

        if (getRes.status !== 200) {
            throw new Error(`Get Entries failed: ${JSON.stringify(getRes.body)}`);
        }
        if (getRes.body.entries.length !== 1) {
            throw new Error(`Incorrect entries length: ${getRes.body.entries.length}`);
        }
        console.log('✅ Get Entries successful');

        // 4. Delete Entry
        console.log('Testing Delete Entry...');
        const delRes = await request(app)
            .delete(`/api/journal/entry/${entryId}`)
            .set('Authorization', `Bearer ${token}`);

        if (delRes.status !== 200) {
            throw new Error(`Delete Entry failed: ${JSON.stringify(delRes.body)}`);
        }
        console.log('✅ Delete Entry successful');

        console.log('🎉 Journal system verified successfully!');
    } catch (err) {
        console.error('❌ Journal verification failed:', err);
    } finally {
        await mongoose.connection.close();
    }
}

testJournal();
