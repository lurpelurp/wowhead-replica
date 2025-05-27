# Wowhead Replica - Full Stack Application

A comprehensive full-stack application replicating Wowhead's functionality for World of Warcraft: The War Within expansion, featuring user management, guide creation, comments, ratings, and more. Built with modern technologies including Supabase and Vercel.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based auth with role management
- **Guide Management** - Create, edit, and publish comprehensive guides
- **Comment System** - Threaded comments with moderation and voting
- **Rating System** - 5-star rating system for guides
- **Search & Filtering** - Advanced search with multiple filters
- **File Upload** - Image and video upload with processing
- **Admin Panel** - Complete admin interface for content management

### WoW-Specific Features
- **Character Profiles** - Link Battle.net accounts and character data
- **Profession Tracking** - Track profession levels and specializations
- **Delve Progress** - Monitor delve completions and achievements
- **Achievement System** - Track and display WoW achievements
- **Expansion Content** - Dedicated sections for The War Within content

### Technical Features
- **RESTful API** - Clean, documented API endpoints
- **Database Integration** - PostgreSQL with Supabase
- **Rate Limiting** - Protect against abuse and spam
- **Input Validation** - Comprehensive data validation
- **Error Handling** - Centralized error management
- **Security** - Helmet.js, CORS, and security best practices
- **Logging** - Request logging with Morgan
- **Session Management** - Secure session handling
- **Real-time Features** - Live updates with Supabase subscriptions

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer + Sharp (image processing)
- **Validation**: express-validator
- **Security**: Helmet.js, CORS, rate limiting
- **Logging**: Morgan
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with custom properties
- **Build**: No build step required
- **Icons**: Font Awesome / Custom SVGs

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **File Storage**: Supabase Storage
- **CDN**: Vercel Edge Network

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wowhead-replica
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and API keys
   - Run the SQL schema from `database/schema.sql` in your Supabase SQL editor

4. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   
   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Verify installation**
   Visit `http://localhost:5000` to see the application running.
   Check `http://localhost:5000/api/health` for API status.

## 🌐 Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy using our script**
   ```bash
   # Deploy to preview
   npm run deploy
   
   # Deploy to production
   npm run deploy:prod
   ```

3. **Manual deployment**
   ```bash
   vercel --prod
   ```

4. **Set environment variables in Vercel**
   - Go to your Vercel dashboard
   - Navigate to your project settings
   - Add all environment variables from your `.env` file

### Environment Variables for Production
```env
NODE_ENV=production
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-production-jwt-secret
SESSION_SECRET=your-production-session-secret
FRONTEND_URL=https://your-domain.vercel.app
```

## 📊 Database Schema

The application uses PostgreSQL with Supabase. The complete schema is available in `database/schema.sql`.

### Key Tables
- **users** - User accounts and profiles
- **guides** - Guide content and metadata
- **comments** - User comments with threading
- **ratings** - Guide ratings (1-5 stars)
- **uploads** - File upload tracking
- **professions** - WoW profession data
- **delves** - Delve information and progress
- **user_game_data** - WoW-specific user data

### Features
- **Row Level Security (RLS)** - Secure data access
- **Automatic timestamps** - Created/updated tracking
- **Full-text search** - PostgreSQL search capabilities
- **Triggers** - Automatic stat updates
- **Indexes** - Optimized query performance

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Guide Endpoints
- `GET /api/guides` - Get all guides (with filtering)
- `GET /api/guides/:id` - Get guide by ID
- `GET /api/guides/slug/:slug` - Get guide by slug
- `POST /api/guides` - Create new guide
- `PUT /api/guides/:id` - Update guide
- `DELETE /api/guides/:id` - Delete guide
- `GET /api/guides/featured` - Get featured guides
- `GET /api/guides/popular` - Get popular guides
- `POST /api/guides/:id/view` - Increment view count

### Comment Endpoints
- `GET /api/comments/guide/:guideId` - Get comments for a guide
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Toggle like on comment

### Rating Endpoints
- `GET /api/ratings/guide/:guideId` - Get ratings for guide
- `POST /api/ratings` - Create/update rating
- `DELETE /api/ratings/:id` - Delete rating

### Search Endpoints
- `GET /api/search/guides` - Search guides
- `GET /api/search/users` - Search users

### Upload Endpoints
- `POST /api/uploads/image` - Upload image
- `POST /api/uploads/avatar` - Upload user avatar
- `GET /api/uploads/:filename` - Get uploaded file

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
├── server.js              # Main server file
├── config/                 # Configuration files
│   └── supabase.js        # Supabase client setup
├── routes/                 # API route definitions
│   ├── auth.js
│   ├── users.js
│   ├── guides.js
│   ├── comments.js
│   └── ...
├── models/                 # Database models (Supabase)
│   ├── User.js
│   ├── Guide.js
│   ├── Comment.js
│   └── ...
├── middleware/             # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── ...
├── utils/                  # Utility functions
├── database/               # Database schema and migrations
│   └── schema.sql
├── scripts/                # Deployment and setup scripts
│   └── deploy.js
├── public/                 # Static files
├── uploads/                # File upload directory
├── *.html                  # Frontend pages
├── styles.css              # Main stylesheet
├── script.js               # Frontend JavaScript
└── vercel.json            # Vercel configuration
```

## 🔧 Development

### Code Style
This project follows standard JavaScript conventions:
- ES6+ features
- Async/await for promises
- Consistent naming conventions
- Comprehensive error handling

### Adding New Features
1. Create database tables/columns in `database/schema.sql`
2. Add model classes in `models/`
3. Create API routes in `routes/`
4. Add frontend functionality in `script.js`
5. Update styles in `styles.css`

### Database Migrations
When updating the database schema:
1. Update `database/schema.sql`
2. Run the new SQL in your Supabase dashboard
3. Test with sample data
4. Update models and API endpoints accordingly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write tests for new features
- Follow existing code style
- Update documentation
- Test thoroughly before submitting

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Create an issue on GitHub
- **Discussions**: Use GitHub Discussions for questions

## 🔗 Links

- **Live Demo**: [Your Vercel URL]
- **Supabase Dashboard**: https://app.supabase.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **API Health Check**: [Your Domain]/api/health

---

Built with ❤️ for the World of Warcraft community 