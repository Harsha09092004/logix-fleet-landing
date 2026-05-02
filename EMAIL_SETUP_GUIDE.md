# 📧 FreightFlow Email Configuration Guide

## Overview

The FreightFlow application includes a robust email service that supports:
- **Gmail SMTP** (easiest to set up)
- **Custom SMTP** (Outlook, SendGrid, AWS SES, etc.)
- **Mock Mode** (for development/testing without email credentials)

## Current Email Service Status

The email service will display its status on server startup. Look for one of these messages:

```
✅ Email Service: Gmail configured and verified
✅ Email Service: Custom SMTP configured and verified
⚠️  Email Service: Mock mode enabled (no real emails will be sent)
```

## Quick Start: Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication (if not already enabled)
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** and **Windows Computer** (or your device)
3. Click **Generate**
4. Copy the 16-character password

### Step 3: Configure .env File
1. Copy `.env.example` to `.env` (in the `backend/` directory)
2. Fill in these values:
   ```env
   EMAIL_PROVIDER=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # (paste your 16-char app password)
   EMAIL_FROM=your-email@gmail.com
   ```
3. Save the file

### Step 4: Verify Configuration
1. Start the server: `npm start`
2. Check the console output for email service status
3. If successful, you'll see: `✅ Email Service: Gmail configured and verified`

### Step 5: Test Email Sending
Try inviting a user through the Settings page. You should receive the invitation email.

---

## Alternative: Custom SMTP Setup

### For Outlook/Microsoft 365:
```env
EMAIL_PROVIDER=custom
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-outlook-password
EMAIL_FROM=your-email@outlook.com
```

### For SendGrid:
1. Sign up at https://sendgrid.com
2. Get your API key from Settings > API Keys
3. Configure:
   ```env
   EMAIL_PROVIDER=custom
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASSWORD=SG.your-very-long-api-key
   EMAIL_FROM=noreply@yourcompany.com
   ```

### For Amazon SES:
1. Set up AWS SES in your region
2. Create SMTP credentials in AWS Console
3. Configure:
   ```env
   EMAIL_PROVIDER=custom
   EMAIL_HOST=email-smtp.region.amazonaws.com
   EMAIL_PORT=587
   EMAIL_USER=your-ses-username
   EMAIL_PASSWORD=your-ses-password
   EMAIL_FROM=noreply@yourcompany.com
   ```

---

## Development Mode: Mock Email

If you don't want to set up email credentials, the system will automatically run in **mock mode**.

In mock mode:
- Email invitations are logged to the console
- No actual emails are sent
- Perfect for development and testing
- Users see a warning that emails are in MOCK MODE

Example console output:
```
📧 ═══════════════════════════════════════════════════════
   [MOCK EMAIL - MOCK_MODE] Invite sent to user@example.com
   Invite Link: http://localhost:5500/index.html#accept-invite?token=abc123
   Token: abc123token
   User: John Doe
📧 ═══════════════════════════════════════════════════════
```

---

## Features Implemented

### ✅ User Invitations
- Send email invitations with unique token
- Invitation links with expiration (7 days)
- WhatsApp integration support

### ✅ Password Reset
- Request password reset via email
- Reset link expires in 1 hour
- Beautiful HTML email templates

### ✅ Error Handling
- Connection verification on startup
- Graceful fallback to mock mode on errors
- Detailed error logs for troubleshooting
- User-friendly error messages

### ✅ Email Status Monitoring
- Check email service status via API
- Endpoint: `GET /api/email/status`
- Real-time service diagnostics

---

## Troubleshooting

### Issue: Email service stuck in Mock Mode

**Solution:**
1. Check your `.env` file is properly configured
2. For Gmail: Verify you used an App Password (not your main password)
3. Check for typos in EMAIL_USER and EMAIL_PASSWORD
4. Verify your SMTP provider's credentials are correct

### Issue: "FAILED TO SEND EMAIL" Error

**Solution:**
1. Check the console error message for details
2. Verify SMTP credentials are correct
3. For Gmail: Ensure 2FA is enabled and App Password is used
4. For custom SMTP: Test credentials with a mail client first
5. Check firewall/network block of SMTP port (usually 587)

### Issue: Emails not received after configuration

**Solution:**
1. Check spam/junk folder
2. Verify EMAIL_FROM address is correct
3. Check from SMTP logs
4. For Gmail: Verify Email_USER and EMAIL_FROM are the same
5. Test with GET `/api/email/status` endpoint

### Issue: "Error: socket hang up" or Connection Timeouts

**Solution:**
1. Check internet connection
2. Verify SMTP SERVER and PORT are correct
3. Try disabling TLS: Set `secure: false` in emailService.js (risky)
4. Check if ISP blocks port 587 (try port 465 with TLS)
5. For AWS/corporates: Check if they support basic auth

---

## API Endpoints

### Check Email Service Status
```
GET /api/email/status

Response:
{
  "status": "active_gmail",
  "isActive": true,
  "provider": "gmail",
  "message": "Email service is active"
}
```

### Send User Invitation
```
POST /auth/invite
Headers: Authorization: Bearer <token>

Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "manager",
  "phone": "+91xxxxxxxxx" (optional)
}

Response:
{
  "success": true,
  "invite_token": "abc123...",
  "email": {
    "status": "sent|mock|error",
    "email": "user@example.com",
    "message": "...",
    "isMocked": false
  }
}
```

### Request Password Reset
```
POST /auth/request-reset

Body:
{
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "reset_token": "def456...",
  "email_status": "sent|mock|error",
  "message": "Password reset instructions sent to..."
}
```

---

## Security Notes

⚠️ **Important:**
1. Never commit `.env` file to git (already in `.gitignore`)
2. For Gmail, ALWAYS use App Password, not your main password
3. Keep JWT_SECRET secret in production
4. Use environment variables for all sensitive data
5. Rotate API keys periodically
6. Use HTTPS in production

---

## Email Templates

The system includes professionally designed HTML email templates for:
- User Invitations
- Password Reset
- Styled with FreightFlow branding
- Responsive and mobile-friendly

Templates can be customized in `backend/emailService.js` in the `sendInviteEmail()` and `sendPasswordResetEmail()` functions.

---

## Additional Resources

- [Gmail App Passwords Help](https://support.google.com/accounts/answer/185833)
- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/integrating-with-the-smtp-api)
- [AWS SES Setup](https://docs.aws.amazon.com/ses/latest/dg/setting-up.html)

---

## Support

If you encounter issues:
1. Check the server console for detailed error messages
2. Verify your SMTP provider's documentation
3. Test credentials with a dedicated email client
4. Enable debug logging in emailService.js (add `console.log` statements)

---

**Last Updated:** April 2026
