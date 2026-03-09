# Testing Checklist for Phase 1

## Prerequisites

Before testing, ensure you have:

1. ✅ Node.js 20.14.0 installed and active
2. ⚠️ Google OAuth credentials configured
3. ⚠️ Environment variables set in `.env.local`

---

## Setup Google OAuth (Required Before Testing)

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create new project named "D20 Studio"
3. Select the project

### 2. Enable Google Drive API
1. Go to "APIs & Services" → "Library"
2. Search "Google Drive API"
3. Click "Enable"

### 3. Configure OAuth Consent Screen
1. "APIs & Services" → "OAuth consent screen"
2. Choose "External" → Create
3. Fill in:
   - App name: `D20 Studio`
   - User support email: (your email)
   - Developer contact: (your email)
4. Scopes → Add or Remove Scopes:
   - ✅ `https://www.googleapis.com/auth/drive`
   - ✅ `https://www.googleapis.com/auth/userinfo.email`
   - ✅ `https://www.googleapis.com/auth/userinfo.profile`
5. Test users → Add your email
6. Save and Continue

### 4. Create OAuth Client ID
1. "APIs & Services" → "Credentials"
2. "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "D20 Studio Web Client"
5. Authorized JavaScript origins:
   - `http://localhost:3000`
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
7. Click "Create"
8. **COPY the Client ID and Client Secret!**

### 5. Update .env.local
1. Open `.env.local`
2. Replace values:
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<run: openssl rand -base64 32>
   GOOGLE_CLIENT_ID=<paste your client ID>
   GOOGLE_CLIENT_SECRET=<paste your client secret>
   ```

---

## Testing Steps

### 1. Start Development Server
```bash
npm run dev
```

Expected output:
```
✓ Ready in [X]ms
○ Local: http://localhost:3000
```

### 2. Test Login Flow
1. Open http://localhost:3000
2. Should redirect to http://localhost:3000/login
3. Click "Continue with Google"
4. Google consent screen appears
5. Select your Google account
6. Grant permissions for:
   - Email
   - Profile
   - Google Drive
7. Should redirect back to dashboard

### 3. Test Dashboard
- ✅ Shows welcome message with your name
- ✅ Shows 3 stat cards (Campaigns: 0, NPCs: 0, Sessions: 0)
- ✅ Header shows D20 Studio logo
- ✅ Header shows your avatar (top right)

### 4. Test Theme Toggle
1. Click sun/moon icon in header
2. Theme should switch (dark ↔ light)
3. Refresh page
4. Theme should persist

### 5. Test User Menu
1. Click your avatar (top right)
2. Dropdown shows:
   - Your email
   - Settings (placeholder)
   - Help & Feedback (placeholder)
   - Log Out
3. Click "Log Out"
4. Should redirect to login page

### 6. Test Protected Routes
1. Log out
2. Try to visit http://localhost:3000/
3. Should redirect to /login automatically

### 7. Test Responsive Design
- Open DevTools (F12)
- Toggle device toolbar (Ctrl+Shift+M)
- Test mobile view (375px)
- Test tablet view (768px)
- Test desktop view (1920px)

---

## Expected Results

### ✅ All Tests Pass
If everything works:
- Authentication flow is complete
- Dashboard loads correctly
- Theme toggle works
- Logout works
- Protected routes redirect properly
- Responsive design looks good

### ⚠️ Common Issues

#### "Error: NEXTAUTH_SECRET is not set"
- Generate secret: `openssl rand -base64 32`
- Add to `.env.local`

#### "Error: Google OAuth credentials invalid"
- Check Client ID and Secret in `.env.local`
- Verify credentials in Google Cloud Console
- Ensure redirect URI matches exactly

#### "Error: Redirect URI mismatch"
- Check authorized redirect URIs in Google Console
- Must be: `http://localhost:3000/api/auth/callback/google`

#### "Access denied" during Google consent
- Add your email to test users in OAuth consent screen
- If using Workspace, check admin settings

#### Page doesn't load / white screen
- Check browser console (F12) for errors
- Check terminal for server errors
- Verify Node.js version: `node -v` (should be 20.x)

---

## Success Criteria

Phase 1 is fully functional when:

- [x] User can sign in with Google
- [x] User grants Drive permissions
- [x] Dashboard loads with user data
- [x] Theme toggle works
- [x] User can log out
- [x] Routes are protected
- [x] UI is responsive

---

## Next Phase

Once Phase 1 testing is complete, we'll proceed to:
**Phase 1 Sprint 2**: Markdown Editor & Google Drive Integration

Features:
- File browser sidebar
- Markdown editor (Monaco/CodeMirror)
- Read/write Google Drive files
- Auto-save functionality
- CRUD operations (create, rename, delete)

---

**Ready to test!** Follow the steps above and report any issues.
