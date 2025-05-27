# 🚀 Complete Setup Guide for Wowhead Replica

This guide will walk you through setting up the complete Wowhead Replica application with Supabase backend and Vercel deployment.

## 📋 Prerequisites

- Node.js v16+ installed
- Git installed
- A Supabase account (free tier available)
- A Vercel account (free tier available)
- Basic knowledge of JavaScript and SQL

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/log in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `wowhead-replica`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

### 1.2 Configure Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the entire contents of `database/schema.sql` from this project
3. Paste it into the SQL Editor
4. Click **Run** to execute the schema
5. Verify tables were created in the **Table Editor**

### 1.3 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## 💻 Step 2: Local Development Setup

### 2.1 Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd wowhead-replica

# Install dependencies
npm install
```

### 2.2 Environment Configuration

1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your Supabase credentials:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRE=7d
   
   # Session Configuration
   SESSION_SECRET=your-super-secret-session-key-change-this
   ```

### 2.3 Start Development Server

```bash
# Start the development server
npm run dev

# The server will start on http://localhost:5000
```

### 2.4 Verify Setup

1. Open your browser to `http://localhost:5000`
2. Check the API health: `http://localhost:5000/api/health`
3. You should see the Wowhead replica homepage

## 🌐 Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Deploy the Application

```bash
# Login to Vercel
vercel login

# Deploy to preview
npm run deploy

# Or deploy directly to production
npm run deploy:prod
```

### 3.3 Configure Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from your `.env` file:

   ```
   NODE_ENV = production
   SUPABASE_URL = https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY = your-anon-key
   SUPABASE_SERVICE_ROLE_KEY = your-service-role-key
   JWT_SECRET = your-production-jwt-secret
   SESSION_SECRET = your-production-session-secret
   FRONTEND_URL = https://your-domain.vercel.app
   ```

5. Click **Save** for each variable

### 3.4 Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

## 🔧 Step 4: Configure Supabase for Production

### 4.1 Update CORS Settings

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Add your Vercel domain to **Site URL**:
   ```
   https://your-domain.vercel.app
   ```
3. Add to **Redirect URLs**:
   ```
   https://your-domain.vercel.app/auth/callback
   ```

### 4.2 Configure Row Level Security (RLS)

The schema already includes RLS policies, but verify they're enabled:

1. Go to **Authentication** → **Policies**
2. Ensure policies are active for all tables
3. Test with a sample user registration

## 🧪 Step 5: Testing Your Deployment

### 5.1 Test API Endpoints

```bash
# Health check
curl https://your-domain.vercel.app/api/health

# API documentation
curl https://your-domain.vercel.app/api
```

### 5.2 Test Database Connection

1. Try registering a new user through the frontend
2. Check if the user appears in Supabase **Table Editor** → **users**
3. Test login functionality

### 5.3 Test File Uploads

1. Try uploading an avatar image
2. Verify files are stored in Supabase Storage

## 🔐 Step 6: Security Configuration

### 6.1 Update JWT Secrets

Generate strong, unique secrets for production:

```bash
# Generate random secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6.2 Configure HTTPS

Vercel automatically provides HTTPS, but ensure:
- All API calls use HTTPS
- No mixed content warnings
- Secure cookies are enabled

### 6.3 Set Up Rate Limiting

The application includes rate limiting, but consider:
- Adjusting limits based on your needs
- Adding IP-based blocking for abuse
- Monitoring unusual traffic patterns

## 📊 Step 7: Monitoring and Analytics

### 7.1 Supabase Monitoring

1. Go to **Settings** → **Usage**
2. Monitor database usage, API calls, and storage
3. Set up alerts for quota limits

### 7.2 Vercel Analytics

1. Enable Vercel Analytics in your project settings
2. Monitor performance and user behavior
3. Set up custom events for key actions

## 🚀 Step 8: Optional Enhancements

### 8.1 Custom Domain

1. In Vercel, go to **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update environment variables with new domain

### 8.2 Email Configuration

For user verification and notifications:

1. Set up an SMTP service (Gmail, SendGrid, etc.)
2. Add email configuration to environment variables
3. Test email sending functionality

### 8.3 File Storage Configuration

For larger file uploads:

1. Configure Supabase Storage buckets
2. Set up CDN for faster file delivery
3. Implement image optimization

## 🐛 Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Ensure all environment variables are set correctly
   - Check for typos in variable names

2. **Database connection errors**
   - Verify Supabase project is active
   - Check if you're using the correct API keys
   - Ensure RLS policies allow your operations

3. **Deployment fails**
   - Check Vercel build logs
   - Ensure all dependencies are in package.json
   - Verify environment variables are set in Vercel

4. **CORS errors**
   - Update Supabase CORS settings
   - Ensure frontend URL matches exactly

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Vercel Documentation](https://vercel.com/docs)
- Create an issue in this repository
- Join the community Discord

## 🎉 Congratulations!

You now have a fully functional Wowhead replica running on:
- **Frontend**: Vercel (with global CDN)
- **Backend**: Node.js/Express on Vercel
- **Database**: PostgreSQL on Supabase
- **Authentication**: JWT with Supabase Auth
- **File Storage**: Supabase Storage

Your application is production-ready and can scale to handle thousands of users!

## 📚 Next Steps

1. **Content Creation**: Start adding guides and content
2. **User Testing**: Invite beta users to test functionality
3. **SEO Optimization**: Add meta tags and sitemaps
4. **Performance Monitoring**: Set up monitoring and alerts
5. **Feature Development**: Add new features based on user feedback

---

**Need help?** Create an issue or reach out to the community! 