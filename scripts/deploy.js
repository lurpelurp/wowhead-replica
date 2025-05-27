#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting deployment process...\n');

// Check if required environment variables are set
const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
    'SESSION_SECRET'
];

console.log('📋 Checking environment variables...');
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('\nPlease set these variables in your .env file or Vercel dashboard.');
    process.exit(1);
}

console.log('✅ All required environment variables are set.\n');

// Check if package.json exists and has correct dependencies
console.log('📦 Checking dependencies...');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found!');
    process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const requiredDeps = [
    '@supabase/supabase-js',
    'express',
    'cors',
    'helmet',
    'bcryptjs',
    'jsonwebtoken'
];

const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
if (missingDeps.length > 0) {
    console.error('❌ Missing required dependencies:');
    missingDeps.forEach(dep => {
        console.error(`   - ${dep}`);
    });
    console.error('\nRun: npm install to install missing dependencies.');
    process.exit(1);
}

console.log('✅ All required dependencies are installed.\n');

// Check if Vercel CLI is installed
console.log('🔧 Checking Vercel CLI...');
try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed.\n');
} catch (error) {
    console.log('⚠️  Vercel CLI not found. Installing...');
    try {
        execSync('npm install -g vercel', { stdio: 'inherit' });
        console.log('✅ Vercel CLI installed successfully.\n');
    } catch (installError) {
        console.error('❌ Failed to install Vercel CLI. Please install manually:');
        console.error('   npm install -g vercel');
        process.exit(1);
    }
}

// Build the project
console.log('🔨 Building project...');
try {
    // No build step needed for this Node.js project
    console.log('✅ Project ready for deployment.\n');
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}

// Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
    const deployCommand = process.argv.includes('--prod') ? 'vercel --prod' : 'vercel';
    execSync(deployCommand, { stdio: 'inherit' });
    console.log('\n✅ Deployment completed successfully!');
} catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
}

console.log('\n🎉 Deployment process completed!');
console.log('\n📝 Next steps:');
console.log('1. Set up your Supabase database using the schema in database/schema.sql');
console.log('2. Configure your environment variables in Vercel dashboard');
console.log('3. Test your API endpoints');
console.log('4. Set up your custom domain (optional)');

console.log('\n🔗 Useful links:');
console.log('- Vercel Dashboard: https://vercel.com/dashboard');
console.log('- Supabase Dashboard: https://app.supabase.com/');
console.log('- API Health Check: [your-domain]/api/health'); 