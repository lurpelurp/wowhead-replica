// Error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('Error:', err);

    // Supabase/PostgreSQL errors
    if (err.code === '23505') { // Unique constraint violation
        const message = 'Resource already exists';
        error = {
            message,
            statusCode: 400
        };
    }

    if (err.code === '23503') { // Foreign key constraint violation
        const message = 'Referenced resource not found';
        error = {
            message,
            statusCode: 400
        };
    }

    if (err.code === '23502') { // Not null constraint violation
        const message = 'Required field missing';
        error = {
            message,
            statusCode: 400
        };
    }

    if (err.code === 'PGRST116') { // Supabase not found
        const message = 'Resource not found';
        error = {
            message,
            statusCode: 404
        };
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = {
            message,
            statusCode: 401
        };
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = {
            message,
            statusCode: 401
        };
    }

    // File upload errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        const message = 'File too large';
        error = {
            message,
            statusCode: 400
        };
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        const message = 'Unexpected file field';
        error = {
            message,
            statusCode: 400
        };
    }

    // Rate limiting errors
    if (err.status === 429) {
        const message = 'Too many requests, please try again later';
        error = {
            message,
            statusCode: 429
        };
    }

    // Database connection errors
    if (err.message && err.message.includes('connection')) {
        const message = 'Database connection error';
        error = {
            message,
            statusCode: 503
        };
    }

    // Default to 500 server error
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Server Error';

    // Send error response
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: err.stack,
            error: err
        })
    });
};

// 404 Not Found handler
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Custom error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Validation error helper
const validationError = (message, field = null) => {
    const error = new AppError(message, 400);
    if (field) {
        error.field = field;
    }
    return error;
};

// Authentication error helper
const authError = (message = 'Authentication required') => {
    return new AppError(message, 401);
};

// Authorization error helper
const authorizationError = (message = 'Insufficient permissions') => {
    return new AppError(message, 403);
};

// Not found error helper
const notFoundError = (resource = 'Resource') => {
    return new AppError(`${resource} not found`, 404);
};

// Conflict error helper
const conflictError = (message = 'Resource already exists') => {
    return new AppError(message, 409);
};

// Server error helper
const serverError = (message = 'Internal server error') => {
    return new AppError(message, 500);
};

module.exports = {
    errorHandler,
    notFound,
    asyncHandler,
    AppError,
    validationError,
    authError,
    authorizationError,
    notFoundError,
    conflictError,
    serverError
}; 