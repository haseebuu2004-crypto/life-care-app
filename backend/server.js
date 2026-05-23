require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like server-to-server or mobile apps)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow all Vercel preview and production URLs automatically
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }
        
        console.warn(`Blocked CORS request from origin: ${origin}`);
        return callback(new Error('CORS policy violation: Origin not allowed'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(compression());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Serve Static Frontend for production / multi-container 
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback error handling
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API Endpoint Not Found" });
});

// React Router Fallback
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// We export `app` for testing purposes
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}

module.exports = app;
