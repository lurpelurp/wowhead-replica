const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Import Supabase configuration
const { supabase, supabaseAdmin } = require('./config/supabase');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const guideRoutes = require('./routes/guides');
const commentRoutes = require('./routes/comments');
const ratingRoutes = require('./routes/ratings');
const searchRoutes = require('./routes/search');
const uploadRoutes = require('./routes/uploads');
const professionRoutes = require('./routes/professions');
const delveRoutes = require('./routes/delves');
const adminRoutes = require('./routes/admin');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { notFound } = require('./middleware/notFound');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts, please try again later.'
    }
});

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
}));

app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session configuration (without MongoDB store for now)
app.use(session({
    secret: process.env.SESSION_SECRET || 'wowhead-replica-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('count')
            .limit(1);
        
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        console.log('✅ Supabase connected successfully');
    } catch (err) {
        console.log('⚠️  Supabase not available - running in standalone mode');
        console.log('   Website will work without database features');
        console.log('   Error:', err.message);
    }
}

testSupabaseConnection();

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/delves', delveRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: require('./package.json').version
    });
});

// API documentation endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Wowhead Replica API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            guides: '/api/guides',
            comments: '/api/comments',
            ratings: '/api/ratings',
            search: '/api/search',
            uploads: '/api/uploads',
            professions: '/api/professions',
            delves: '/api/delves',
            admin: '/api/admin',
            health: '/api/health'
        },
        documentation: '/api/docs'
    });
});

// Serve specific pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/database', (req, res) => {
    res.sendFile(path.join(__dirname, 'database.html'));
});

app.get('/guides', (req, res) => {
    res.sendFile(path.join(__dirname, 'guides.html'));
});

app.get('/news', (req, res) => {
    res.sendFile(path.join(__dirname, 'news.html'));
});

app.get('/tools', (req, res) => {
    res.sendFile(path.join(__dirname, 'tools.html'));
});

app.get('/more', (req, res) => {
    res.sendFile(path.join(__dirname, 'more.html'));
});

// Serve frontend for all other non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    // Supabase connections are handled automatically
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    // Supabase connections are handled automatically
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API available at: http://localhost:${PORT}/api`);
});

module.exports = app; 