# 📱 WhatsApp Integration Setup Guide

## Overview

FreightFlow includes **Twilio-powered WhatsApp integration** for sending automatic invitations and notifications via WhatsApp. 

### Features:
- ✅ Send user invitations via WhatsApp
- ✅ Automatic message formatting
- ✅ Phone number validation
- ✅ Error handling with fallback to mock mode
- ✅ Real-time status monitoring

---

## Current Status

When you start the server, you'll see:

```
📱 WhatsApp Service: mock (mock)
```

This means WhatsApp is in **mock mode** - messages are logged to console instead of sent via Twilio.

To enable **real WhatsApp messaging**, follow the setup guide below.

---

## Quick Start: Enable WhatsApp (5 Minutes)

### Step 1: Create a Twilio Account

1. Go to (.venv) PS C:\Users\RESHMA B\Downloads\Logix\backend> twilio api:core:credentials:list
twilio : The term 'twilio' is not recognized as the name of a cmdlet, function, script file, or 
operable program. Check the spelling of the name, or if a path was included, verify that the path    
is correct and try again.
At line:1 char:1
+ twilio api:core:credentials:list
+ ~~~~~~
    + CategoryInfo          : ObjectNotFound: (twilio:String) [], CommandNotFoundException
    + FullyQualifiedErrorId : CommandNotFoundException

(.venv) PS C:\Users\RESHMA B\Downloads\Logix\backend> GET http://127.0.0.1:5500/index.html 404 (Not Found)
Connecting to 'http://127.0.0.1:5500/.well-known/appspecific/com.chrome.devtools.json' violates the following Content Security Policy directive: "default-src 'none'". The request has been blocked. Note that 'connect-src' was not explicitly set, so 'default-src' is used as a fallback.
2. Click **Sign up** (Free trial included)
3. Verify your email and phone number
4. Create a new project

### Step 2: Get Your Credentials

1. Go to **Twilio Console Dashboard** (https://console.twilio.com)
2. Find your **Account SID** - copy it
3. Find your **Auth Token** - copy it (keep this secret!)
4. Click on **Messaging** → **Services** in the left sidebar

### Step 3: Set Up WhatsApp Sender

1. In Twilio Console, go to **Messaging** → **Senders** (or **Try it out** → **Try WhatsApp**)
2. Click **Create WhatsApp Sender**
3. Complete the verification process:
   - Verify your business phone number
   - You'll get a **WhatsApp-enabled phone number** (sometimes a temporary one for testing)
4. Copy this phone number (format: `+1234567890`)

### Step 4: Configure Environment Variables

1. In your `backend/` directory, open or create `.env` file
2. Add these lines:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+1234567890
```

**Get these values from:**
- **TWILIO_ACCOUNT_SID**: Twilio Console → Account Info
- **TWILIO_AUTH_TOKEN**: Twilio Console → Auth Tokens (⚠️ Keep it secret!)
- **TWILIO_WHATSAPP_NUMBER**: From WhatsApp Sender setup above

### Step 5: Restart the Backend Server

```bash
cd backend
npm start
```

You should now see:
```
✅ WhatsApp Service: active (twilio)
   Phone: +1234567890
```

✅ **WhatsApp is now enabled!**

---

## How to Use WhatsApp Integration

### Sending Invitations with WhatsApp

1. **Login to FreightFlow**
2. Go to **Settings** → **Invite User**
3. **Fill in the form:**
   - Email: `user@example.com`
   - Name: `John Doe`
   - Role: `Finance Manager`
   - **WhatsApp Phone** (optional): `+919876543210` ← Required for WhatsApp
4. Click **Send Invitation**

### What Happens Next

**If WhatsApp is enabled:**
- ✅ Email invitation is sent (if email is configured)
- ✅ WhatsApp message is sent with the invitation link
- ✅ User receives both messages with the same invitation token

**If WhatsApp is in mock mode:**
- ✅ Email invitation is sent
- ⚠️ WhatsApp message is logged to console (not sent)
- Useful for development/testing

---

## Phone Number Format

### Accepted Formats:
```
+919876543210      ✅ Correct (with +)
919876543210       ✅ Auto-converted to +919876543210
9876543210         ✅ Auto-converted to +919876543210
+1-987-654-3210    ❌ Error (special characters)
```

### Getting Phone Numbers:
- **India**: `+91` + 10-digit mobile number
- **US**: `+1` + 10-digit phone number
- **UK**: `+44` + phone number
- Other countries: Find the country code at https://en.wikipedia.org/wiki/List_of_country_calling_codes

---

## API Endpoints

### Check WhatsApp Service Status

```bash
curl http://localhost:5000/api/whatsapp/status
```

**Response (Active):**
```json
{
  "status": "active",
  "isActive": true,
  "provider": "twilio",
  "phone": "+1234567890",
  "message": "WhatsApp service is active"
}
```

**Response (Mock Mode):**
```json
{
  "status": "mock",
  "isActive": false,
  "provider": "mock",
  "phone": "not configured",
  "message": "WhatsApp service is in mock mode"
}
```

---

## Troubleshooting

### Issue: "WhatsApp Service: Mock mode (Twilio credentials not set)"

**Solution:**
1. Check that `.env` file exists in `backend/` directory
2. Verify all three variables are set:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
3. No spaces before/after the `=` sign
4. Restart the backend server: `npm start`

### Issue: "WhatsApp message failed to send"

**Solution:**
1. Verify phone number format (should start with `+`)
2. Verify Twilio account is not in trial mode (trial limitations apply)
3. Check Twilio console for errors
4. Ensure your WhatsApp sender is verified and active

### Issue: "Auth error" or "401 Unauthorized"

**Solution:**
1. Copy credentials directly from Twilio Console (avoid typos)
2. Make sure Auth Token is not expired
3. For production, set Auth Token properly in `.env`

### Issue: User didn't receive WhatsApp message

**Possible reasons:**
1. **Phone number format incorrect** - verify with country code
2. **Twilio trial limitations** - can only send to verified numbers
3. **Message blocked** - Twilio may block spam-like messages
4. **User not opted in** - They must approve WhatsApp communication first
5. **Network issues** - Check Twilio console for delivery status

---

## WhatsApp Message Content

When a user is invited via WhatsApp, they receive:

```
Hi [Name], you have been invited to join FreightFlow as a [Role].

Accept invitation: [invitation_link]

Invite Token: [token]
```

### Example:
```
Hi John Doe, you have been invited to join FreightFlow as a Finance Manager.

Accept invitation: http://localhost:5500/index.html#accept-invite?token=abc123def456

Invite Token: abc123def456
```

---

## Server Console Logs

### WhatsApp Enable (Active):
```
📱 WhatsApp Service: active (twilio)
   Phone: +1234567890
```

### WhatsApp Sending Message:
```
📱 ═══════════════════════════════════════════════════
   Sending WhatsApp message to +919876543210
✅ WhatsApp message sent successfully
   SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   Status: queued
📱 ═══════════════════════════════════════════════════
```

### WhatsApp Mock Mode:
```
📱 [MOCK WHATSAPP - MOCK] Message for +919876543210
   Message: Hi John Doe, you have been invited...
```

---

## Security Best Practices

⚠️ **Important:**
1. **Never commit `.env` file** to git (already in `.gitignore`)
2. **Keep Auth Token secret** - if exposed, regenerate immediately
3. **Use environment variables** in production
4. **Enable IP whitelisting** in Twilio console for production
5. **Monitor Twilio usage** to avoid unexpected charges

---

## Twilio Pricing

### Free Trial:
- ✅ $15 free credits
- ✅ Can use for testing
- ⚠️ Can only send to verified numbers

### Production Pricing:
- WhatsApp messages: ~$0.005 - $0.015 per message (varies by country)
- SMS fallback: ~$0.01 per SMS
- No monthly charges - pay per message

**Monitor your usage:** https://console.twilio.com/billing/usage

---

## Production Checklist

- [ ] Auth Token is securely stored in environment variables
- [ ] `.env` file is NOT committed to git
- [ ] WhatsApp sender is business-verified in Twilio
- [ ] Server shows `✅ WhatsApp Service: active (twilio)`
- [ ] Test message sent and received successfully
- [ ] Phone numbers include country codes
- [ ] Error handling verified in console logs
- [ ] Billing alerts set up in Twilio console

---

## Support & Resources

- **Twilio Documentation**: https://www.twilio.com/docs/whatsapp
- **Twilio Console**: https://console.twilio.com
- **Country Codes**: https://en.wikipedia.org/wiki/List_of_country_calling_codes
- **WhatsApp Business API**: https://www.twilio.com/whatsapp-api

---

## Next Steps

1. ✅ Create a Twilio account
2. ✅ Set up WhatsApp sender
3. ✅ Add credentials to `.env`
4. ✅ Restart backend server
5. ✅ Test by sending an invitation with phone number
6. ✅ Verify message received via WhatsApp

**Enjoy real-time notifications via WhatsApp!** 📱✨

---

**Last Updated:** April 2026
