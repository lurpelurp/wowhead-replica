const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs').promises;

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Email templates
const emailTemplates = {
    emailVerification: {
        subject: 'Verify Your Wowhead Account',
        html: (data) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verify Your Email</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 35px; color: #2c3e50; font-size: 16px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); transition: transform 0.2s ease; }
                    .button:hover { transform: translateY(-2px); }
                    .footer { background: #2c3e50; color: #bdc3c7; padding: 25px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
                    .container { border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
                    @media (prefers-color-scheme: dark) {
                        .content { background: #1e1e1e; color: #e0e0e0; }
                        body { background-color: #121212; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Welcome to Wowhead!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.username}!</h2>
                        <p>Thank you for registering with Wowhead. To complete your registration and verify your email address, please click the button below:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${data.verificationUrl}" class="button">Verify Email Address</a>
                        </p>
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">
                            ${data.verificationUrl}
                        </p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account with us, please ignore this email.</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Wowhead Replica. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },

    passwordReset: {
        subject: 'Password Reset Request',
        html: (data) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 35px; color: #2c3e50; font-size: 16px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); transition: transform 0.2s ease; }
                    .button:hover { transform: translateY(-2px); }
                    .footer { background: #2c3e50; color: #bdc3c7; padding: 25px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
                    .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 18px; border-radius: 8px; margin: 25px 0; color: #856404; }
                    @media (prefers-color-scheme: dark) {
                        .content { background: #1e1e1e; color: #e0e0e0; }
                        body { background-color: #121212; }
                        .warning { background: #2d2a1f; border-color: #4a4419; color: #f4e4a6; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.username}!</h2>
                        <p>We received a request to reset your password for your Wowhead account. If you made this request, click the button below to reset your password:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${data.resetUrl}" class="button">Reset Password</a>
                        </p>
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">
                            ${data.resetUrl}
                        </p>
                        <div class="warning">
                            <strong>⚠️ Security Notice:</strong>
                            <ul>
                                <li>This link will expire in 1 hour for security reasons</li>
                                <li>If you didn't request this reset, please ignore this email</li>
                                <li>Your password will remain unchanged until you create a new one</li>
                            </ul>
                        </div>
                        <p>For security reasons, we recommend choosing a strong password that includes:</p>
                        <ul>
                            <li>At least 8 characters</li>
                            <li>A mix of uppercase and lowercase letters</li>
                            <li>At least one number</li>
                            <li>At least one special character</li>
                        </ul>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Wowhead Replica. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },

    welcomeEmail: {
        subject: 'Welcome to Wowhead!',
        html: (data) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Wowhead</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 35px; color: #2c3e50; font-size: 16px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); transition: transform 0.2s ease; margin: 12px; }
                    .button:hover { transform: translateY(-2px); }
                    .footer { background: #2c3e50; color: #bdc3c7; padding: 25px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
                    .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #ff6b35; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
                    @media (prefers-color-scheme: dark) {
                        .content { background: #1e1e1e; color: #e0e0e0; }
                        body { background-color: #121212; }
                        .feature { background: #2a2a2a; color: #e0e0e0; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Wowhead!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.username}!</h2>
                        <p>Your email has been verified and your account is now active! Welcome to the Wowhead community.</p>
                        
                        <h3>🚀 Get Started</h3>
                        <p>Here's what you can do now:</p>
                        
                        <div class="feature">
                            <h4>💬 Join the Discussion</h4>
                            <p>Comment on guides, share your experiences, and help other players.</p>
                        </div>
                        
                        <div class="feature">
                            <h4>⭐ Rate Content</h4>
                            <p>Rate guides and help the community find the best content.</p>
                        </div>
                        
                        <div class="feature">
                            <h4>📸 Share Screenshots</h4>
                            <p>Upload screenshots to showcase your achievements and discoveries.</p>
                        </div>
                        
                        <div class="feature">
                            <h4>🎮 Track Your Progress</h4>
                            <p>Keep track of your characters, achievements, and profession progress.</p>
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}" class="button">Explore Wowhead</a>
                            <a href="${process.env.FRONTEND_URL}/profile" class="button">Complete Your Profile</a>
                        </p>
                        
                        <h3>💎 Consider Premium</h3>
                        <p>Upgrade to Wowhead Premium for an ad-free experience and exclusive features!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Wowhead Replica. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    },

    commentNotification: {
        subject: 'New Reply to Your Comment',
        html: (data) => `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Reply</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
                    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 25px; text-align: center; border-radius: 8px 8px 0 0; }
                    .content { background: #ffffff; padding: 35px; color: #2c3e50; font-size: 16px; }
                    .button { display: inline-block; background: linear-gradient(45deg, #ff6b35, #f7931e); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3); transition: transform 0.2s ease; }
                    .button:hover { transform: translateY(-2px); }
                    .footer { background: #2c3e50; color: #bdc3c7; padding: 25px; text-align: center; font-size: 14px; border-radius: 0 0 8px 8px; }
                    .comment { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 20px 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); }
                    @media (prefers-color-scheme: dark) {
                        .content { background: #1e1e1e; color: #e0e0e0; }
                        body { background-color: #121212; }
                        .comment { background: #2a2a2a; color: #e0e0e0; border-left-color: #58a6ff; }
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>💬 New Reply</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${data.username}!</h2>
                        <p><strong>${data.replyAuthor}</strong> replied to your comment on <strong>${data.guideTitle}</strong>:</p>
                        
                        <div class="comment">
                            <h4>Your comment:</h4>
                            <p>"${data.originalComment}"</p>
                        </div>
                        
                        <div class="comment">
                            <h4>${data.replyAuthor} replied:</h4>
                            <p>"${data.replyContent}"</p>
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${data.commentUrl}" class="button">View Reply</a>
                        </p>
                        
                        <p><small>You can manage your notification preferences in your account settings.</small></p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2024 Wowhead Replica. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    }
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
    try {
        const transporter = createTransporter();

        // Verify transporter configuration
        await transporter.verify();

        let emailHtml = html;
        let emailSubject = subject;

        // Use template if provided
        if (template && emailTemplates[template]) {
            emailHtml = emailTemplates[template].html(data);
            emailSubject = emailTemplates[template].subject;
        }

        const mailOptions = {
            from: {
                name: 'Wowhead',
                address: process.env.EMAIL_USER
            },
            to,
            subject: emailSubject,
            html: emailHtml,
            text: text || stripHtml(emailHtml)
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', result.messageId);
        return result;

    } catch (error) {
        console.error('Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

// Send bulk emails
const sendBulkEmails = async (emails) => {
    const results = [];
    const errors = [];

    for (const email of emails) {
        try {
            const result = await sendEmail(email);
            results.push({ email: email.to, success: true, messageId: result.messageId });
        } catch (error) {
            errors.push({ email: email.to, success: false, error: error.message });
        }
    }

    return { results, errors };
};

// Utility function to strip HTML tags
const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
};

// Email validation
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Queue email for later sending (useful for high-volume scenarios)
const queueEmail = async (emailData) => {
    // In a production environment, you might use Redis or a message queue
    // For now, we'll just send immediately
    return await sendEmail(emailData);
};

// Send notification emails
const sendNotificationEmail = async (type, recipients, data) => {
    const notifications = {
        'comment-reply': {
            template: 'commentNotification',
            subject: 'New Reply to Your Comment'
        },
        'welcome': {
            template: 'welcomeEmail',
            subject: 'Welcome to Wowhead!'
        }
    };

    const notification = notifications[type];
    if (!notification) {
        throw new Error(`Unknown notification type: ${type}`);
    }

    const emails = recipients.map(recipient => ({
        to: recipient.email,
        template: notification.template,
        data: { ...data, username: recipient.username }
    }));

    return await sendBulkEmails(emails);
};

module.exports = {
    sendEmail,
    sendBulkEmails,
    sendNotificationEmail,
    queueEmail,
    isValidEmail,
    emailTemplates
}; 