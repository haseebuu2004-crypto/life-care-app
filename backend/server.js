process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || '16';
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const path = require('path');
const apiRoutes = require('./routes/api');
const db = require('./config/db');
const cronService = require('./shared/services/cronService');

const helmet = require('helmet');

const app = express();
app.set('trust proxy', 1); // Required for express-rate-limit behind Render reverse proxy
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
    contentSecurityPolicy: true,
    frameguard: { action: 'deny' },
    noSniff: true,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}));

// Initialize background scheduled backups
cronService.init();

const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like server-to-server or mobile apps)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        
        // Allow common deployment subdomains automatically
        if (origin.endsWith('.vercel.app') || origin.endsWith('.netlify.app') || origin.endsWith('.onrender.com') || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
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
app.use(cookieParser());
app.use(express.json());

// Log all incoming requests
app.use((req, res, next) => {
    console.log(`[INCOMING] ${req.method} ${req.url}`);
    next();
});

// Health Check Endpoint
app.get('/health', async (req, res) => {
    try {
        // Verify database connectivity
        await db.query('SELECT 1');
        res.status(200).json({ 
            status: 'ok', 
            database: 'connected', 
            timestamp: new Date().toISOString() 
        });
    } catch (error) {
        console.error('Health Check Failed:', error.message);
        res.status(503).json({ 
            status: 'error', 
            database: 'disconnected', 
            timestamp: new Date().toISOString() 
        });
    }
});

// API Routes
app.use('/api', apiRoutes);

// Serve Static Frontend for production / multi-container 
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback error handling
app.use('/api', (req, res) => {
    res.status(404).json({ error: "API Endpoint Not Found" });
});

// React Router Fallback
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Global Error Handler (must be the last middleware)
const globalErrorHandler = require('./shared/middleware/errorHandler');
app.use(globalErrorHandler);

// Catch unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Do not exit the process, let it continue or gracefully restart depending on the env
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
    // Usually it's safer to restart the process here in production
    // process.exit(1); 
});

// We export `app` for testing purposes
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`server running on port ${PORT}`);
    });
}

module.exports = app;
