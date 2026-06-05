const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

// Login endpoint: 5 requests per IP per 15 minutes
exports.loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many login attempts, please try again after 15 minutes' }
});

// Password reset: 3 requests per email per hour
exports.passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 3,
    keyGenerator: (req, res) => req.body.email || ipKeyGenerator(req, res),
    message: { success: false, message: 'Too many password reset requests for this email. Try again in an hour.' }
});

// All API endpoints: 200 requests per user per minute
exports.apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    keyGenerator: (req, res) => req.user?.id || ipKeyGenerator(req, res),
    message: { success: false, message: 'Too many requests, please try again later.' }
});

// Report generation: 5 per user per hour
exports.reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req, res) => req.user?.id || ipKeyGenerator(req, res),
    message: { success: false, message: 'Report generation limit reached (5 per hour).' }
});

// Backup restore: Infinite for testing (revert to 3 per day before push)
exports.backupLimiter = (req, res, next) => next();
