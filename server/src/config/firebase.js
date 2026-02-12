const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
// Expects GOOGLE_APPLICATION_CREDENTIALS environment variable to be set
// OR a serviceAccountKey.json file in the config directory
try {
    let serviceAccount;
    try {
        serviceAccount = require('./serviceAccountKey.json');
    } catch (e) {
        // If file not found, check if we can use default credentials or env vars
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        // Use default application credentials (good for GCP hosting)
        // or check for FIREBASE_SERVICE_ACCOUNT env var which might contain the JSON
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            const serviceAccountJSON = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountJSON)
            });
        } else {
             admin.initializeApp();
        }
    }
} catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
}

module.exports = admin;
