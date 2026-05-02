# FreightFlow Testing Guide

## Server Status
✅ **Backend Server**: Running on http://localhost:5000
✅ **Frontend**: Running on http://127.0.0.1:5500
✅ **Database**: In-memory mode (MongoDB not required)

---

## Authentication Testing

### Demo Account (Admin)
- **Email**: demo@freightflow.in
- **Password**: demo1234
- **Role**: Admin
- **Permissions**: Can send team invitations

### Test User Account 
- **Email**: harsha17116@gmail.com
- **Password**: Logix@123
- **Role**: Admin
- **Permissions**: Can send team invitations

---

## Testing Team Invitations

### ✅ How to Send an Invitation

1. **Login** to the system with demo@freightflow.in / demo1234
2. Go to **Settings** tab
3. Click **"Invite Team"** button
4. Fill in the form:
   - **Email**: Use a NEW email that doesn't exist (see examples below)
   - **Name**: Any name for the new user
   - **WhatsApp Phone**: Optional (format: +country code + number)
   - **Role**: Select from dropdown (Manager, Finance Manager, Operations, Auditor)

5. Click **"Send Invitation"**
6. ✅ Success! The user will receive an invite with a token

### 📧 Test Emails (These Don't Exist Yet)

Use ANY of these emails to test invitations:
- `manager@company.com`
- `finance@company.com`  
- `ops@company.com`
- `john.doe@example.com`
- `jane.smith@test.org`
- `new.employee@logix.com`

### ❌ What NOT to Do

**Don't try to invite these emails** (they already exist in the system):
- ❌ `demo@freightflow.in` → Returns 409 Conflict
- ❌ `harsha17116@gmail.com` → Returns 409 Conflict

**Error Message**: "User with email already exists. Please use a different email address."

---

## API Endpoints Testing

### Login
```bash
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "demo@freightflow.in",
  "password": "demo1234"
}

Response: { token: "...", ...user }
```

### Send Invitation
```bash
POST http://localhost:5000/auth/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "name": "New Manager",
  "role": "manager",
  "phone": "+919876543210"
}

Response: { success: true, invite_token: "...", whatsapp: {...} }
```

### Get Invite Form
```bash
GET http://localhost:5000/auth/invite?token=test123

Response: { status: "invite_form", message: "...", token: "test123" }
```

### Accept Invitation
```bash
POST http://localhost:5000/auth/accept-invite
Content-Type: application/json

{
  "invite_token": "...",
  "password": "newpassword123"
}

Response: { success: true }
```

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 403 Forbidden | User doesn't have admin role | Login with demo@freightflow.in |
| 409 Conflict | Email already exists in system | Use a different email address |
| 401 Unauthorized | Missing or invalid token | Login first, then use token |
| No auth header | Token not passed in request | Add `Authorization: Bearer <token>` header |

---

## Verified Features ✅

- ✅ User authentication (login/signup)
- ✅ Admin role validation  
- ✅ Team invitation system
- ✅ Invite token generation
- ✅ WhatsApp integration ready
- ✅ Error handling & validation
- ✅ Form submission & clearing
- ✅ Success/error notifications
- ✅ Multi-tenant support

---

## Next Steps

1. **Test inviting a new user** (e.g., `manager@company.com`)
2. **Verify invite token** is returned
3. **Accept invite** with new password
4. **Login with new account** to verify access

