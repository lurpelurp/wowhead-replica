const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authMiddleware = async (req, res, next) => {
    try {
        let token;

        // Get token from cookie or Authorization header
        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        // Get user from database
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Token is not valid. User not found.'
            });
        }

        // Check if user account is locked
        if (user.isLocked) {
            return res.status(423).json({
                success: false,
                message: 'Account is temporarily locked due to security reasons.'
            });
        }

        // Add user to request object
        req.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            isPremium: user.isPremium,
            isEmailVerified: user.verification.isEmailVerified
        };

        // Update last active timestamp
        user.updateLastActive();

        next();

    } catch (error) {
        console.error('Auth middleware error:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error in authentication.'
        });
    }
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Get token from cookie or Authorization header
        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.substring(7);
        }

        if (!token) {
            req.user = null;
            return next();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        // Get user from database
        const user = await User.findById(decoded.id).select('-password');

        if (user && !user.isLocked) {
            req.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isPremium: user.isPremium,
                isEmailVerified: user.verification.isEmailVerified
            };

            // Update last active timestamp
            user.updateLastActive();
        } else {
            req.user = null;
        }

        next();

    } catch (error) {
        // If token is invalid, just continue without user
        req.user = null;
        next();
    }
};

// Role-based authorization middleware
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        next();
    };
};

// Premium subscription middleware
const requirePremium = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }

    if (!req.user.isPremium) {
        return res.status(403).json({
            success: false,
            message: 'Premium subscription required to access this feature.'
        });
    }

    next();
};

// Email verification middleware
const requireEmailVerification = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }

    if (!req.user.isEmailVerified) {
        return res.status(403).json({
            success: false,
            message: 'Email verification required to access this feature.'
        });
    }

    next();
};

// Rate limiting by user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
        if (!req.user) {
            return next();
        }

        const userId = req.user.id;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        if (requests.has(userId)) {
            const userRequests = requests.get(userId);
            const validRequests = userRequests.filter(time => time > windowStart);
            requests.set(userId, validRequests);
        }

        // Check current requests
        const currentRequests = requests.get(userId) || [];
        
        if (currentRequests.length >= maxRequests) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please try again later.'
            });
        }

        // Add current request
        currentRequests.push(now);
        requests.set(userId, currentRequests);

        next();
    };
};

module.exports = {
    authMiddleware,
    optionalAuth,
    authorize,
    requirePremium,
    requireEmailVerification,
    userRateLimit
}; 