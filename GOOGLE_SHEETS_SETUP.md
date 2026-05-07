# 📊 AUTO-SAVE USER LOGINS TO GOOGLE SHEETS - SETUP GUIDE

When users login → Their data automatically saves to your Google Sheet ✅

---

## STEP 1: Install Package

In `backend/` folder, run:

```bash
npm install googleapis
```

---

## STEP 2: Create Google Sheet

1. Go to **Google Sheets**: https://sheets.google.com
2. Click **"+ New"** → Create blank spreadsheet
3. Name it: **"FreightFlow_Beta_Logins"**
4. Copy the **Spreadsheet ID** from the URL:
   - URL looks like: `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f/edit`
   - **ID** is: `1a2b3c4d5e6f`

---

## STEP 3: Get API Key

1. Go to **Google Cloud Console**: https://console.cloud.google.com/
2. Create a **New Project** (if you don't have one)
3. Search for **"Google Sheets API"**
4. Click **"ENABLE"**
5. Go to **"Credentials"** → Click **"+ CREATE CREDENTIALS"**
6. Choose **"API Key"**
7. Copy your **API Key** (long string like: `AIzaSyB...`)

---

## STEP 4: Make Sheet Public (for API Key access)

1. Open your Google Sheet
2. Click **"Share"** (top right)
3. Change from "Restricted" to **"Anyone with the link"**
4. Click **"Share"**

---

## STEP 5: Update .env File

Add to `backend/.env`:

```
GOOGLE_SHEETS_ID=1a2b3c4d5e6f
GOOGLE_SHEETS_API_KEY=AIzaSyB...
```

Replace with your actual IDs.

---

## STEP 6: Restart Backend

```bash
cd backend
npm start
```

Check console output - you should see:
```
✅ Google Sheets Service initialized
```

---

## DONE! 🎉

Now when users **login**:
- Their name, email, company, phone automatically save to the sheet
- Sheet row shows: `[Name] [Email] [Company] [Phone] [Plan] [Login Time] [Active]`

### To View Logins:
Open your Google Sheet → See all logins in real-time!

---

## TROUBLESHOOTING

### "Google Sheets API key or spreadsheet ID not configured"
- Check .env file has both `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_API_KEY`
- Restart backend after adding to .env

### "Permission denied"
- Make sure sheet is shared as "Anyone with the link"

### Nothing appearing in sheet
- Check sheet name is "Beta_Logins" (exactly)
- Make sure first row has headers: Name, Email, Company, Phone, Plan, Login Time, Status

---

## ADVANCED: Use Service Account (More Secure)

If you want more security instead of API Key:

1. Create **Service Account** in Google Cloud
2. Download JSON credentials
3. Share the Google Sheet with the service account email
4. Use `google.auth.getClient()` with the JSON file

(Let me know if you want help with this)

---

**That's it! Auto-tracking is now live.** ✅
