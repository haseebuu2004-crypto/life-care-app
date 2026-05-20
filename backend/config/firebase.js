const admin = require('firebase-admin');
require('dotenv').config();

try {
    // If you have a service account JSON file, you can load it directly
    // const serviceAccount = require('./serviceAccountKey.json');
    // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

    // Alternatively, using environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Handle newlines in the private key string from .env
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            })
        });
        console.log('Firebase Admin SDK initialized securely.');
    } else {
        console.warn('Firebase Admin SDK: Missing configuration. Google Sign-In backend verification will fail until configured.');
    }
} catch (error) {
    console.error('Firebase Admin SDK Initialization Error:', error);
}

module.exports = admin;
