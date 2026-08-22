// Global Error Handler Middleware
function globalErrorHandler(err, req, res, next) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} -`, err);

    // If headers have already been sent, delegate to Express default error handler
    if (res.headersSent) {
        return next(err);
    }

    // Default status code and message
    let statusCode = err.status || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific PostgreSQL errors
    if (err.code) {
        switch (err.code) {
            case '23505': // unique_violation
                statusCode = 409;
                message = 'A record with this information already exists.';
                break;
            case '23503': // foreign_key_violation
                statusCode = 400;
                message = 'Referenced record does not exist.';
                break;
            case '22P02': // invalid_text_representation
                statusCode = 400;
                message = 'Invalid data format provided.';
                break;
            case 'ECONNREFUSED':
                statusCode = 503;
                message = 'Database connection failed. Please try again later.';
                break;
        }
    }

    // Include stack trace only in development
    const response = {
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).json(response);
}

module.exports = globalErrorHandler;
