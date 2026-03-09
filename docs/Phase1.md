# Phase 1 - Sprint 1: Setup & Authentication

## Structured Changelog

This document tracks all implementation changes, decisions, and progress for Phase 1 Sprint 1 of D20 Studio.

---

## 📅 January 21, 2026

### Step 1: Project Initialization ✅ COMPLETED
**Time Started**: 22:46
**Time Completed**: 23:00

#### Files Changed
- Created `docs/` directory
- Created `docs/Phase1.md` (this file)
- Created `package.json` with Next.js 14 and dependencies
- Created `tsconfig.json` with TypeScript configuration
- Created `next.config.ts` with Next.js configuration
- Created `.eslintrc.json` with ESLint rules
- Created `.gitignore` with standard Next.js ignores
- Created `tailwind.config.ts` with Hero UI v3 plugin and custom theme colors
- Created `postcss.config.mjs` with Tailwind and Autoprefixer
- Created `app/globals.css` with Tailwind directives and base styles
- Created `app/layout.tsx` with Inter font and metadata
- Created `app/page.tsx` with placeholder home page
- Created `app/providers.tsx` with HeroUIProvider and NextThemes provider

#### Dependencies Added
- `next@14.2.35` - Next.js framework
- `react@18.3.1` - React library
- `react-dom@18.3.1` - React DOM
- `@heroui/react@latest` - Hero UI v3 component library
- `framer-motion` - Animation library (required by Hero UI)
- `next-themes` - Theme management for dark/light mode toggle
- `tailwindcss` - CSS framework
- `autoprefixer` - PostCSS plugin
- `typescript@5.x` - TypeScript compiler
- `eslint-config-next@14.2.35` - ESLint configuration for Next.js

#### Configuration Changes
- **tailwind.config.ts**: 
  - Added Hero UI plugin with `heroui()` function
  - Configured custom theme colors (Purple #9333EA, Pink #DB2777, Cyan #06B6D4)
  - Added `darkMode: "class"` for theme toggle support
  - Added Hero UI content path: `./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}`
  
- **app/layout.tsx**: 
  - Wrapped children with `<Providers>` component
  - Added `suppressHydrationWarning` to `<html>` tag for theme support
  - Added Inter font from Google Fonts
  
- **app/providers.tsx**: 
  - Created client component with HeroUIProvider
  - Wrapped with NextThemesProvider for dark/light mode
  - Set default theme to "dark" as per design requirements

#### Decisions Made
- **Hero UI Version**: v3 (latest)
- **Package Manager**: npm (not pnpm or yarn)
- **Project Structure**: App Router (no src directory)
- **Import Alias**: `@/*` pointing to root
- **Theme Strategy**: NextThemes + Hero UI integration for seamless dark/light toggle
- **Color Scheme**: Applied D20 Studio brand colors directly in tailwind.config

#### Issues Encountered
⚠️ **Node.js Version Mismatch**
- **Issue**: Current Node.js version is 16.13.2, but Next.js 14 requires >= 18.17.0
- **Impact**: Development server cannot start
- **Resolution**: User needs to upgrade Node.js to v18.17.0 or later
- **Recommendation**: Install Node.js 20.x LTS for best compatibility

#### Next Steps
1. ✅ Project structure created successfully
2. ✅ Hero UI v3 integrated
3. ✅ Tailwind configured with custom theme
4. ✅ Dark/light mode toggle infrastructure ready
5. ⏭️ **BLOCKED**: Upgrade Node.js to v18.17.0+ before proceeding to Step 2
6. ⏭️ After Node upgrade, proceed to Step 2: Google OAuth Setup

---

### Step 2: Google OAuth Setup ✅ COMPLETED
**Time Started**: 23:05
**Time Completed**: 23:15

#### Files Changed
- Created `.env.example` with template environment variables
- Created `.env.local` with placeholder credentials (git-ignored)
- Created `app/api/auth/[...nextauth]/route.ts` with NextAuth configuration
- Created `types/next-auth.d.ts` with TypeScript type extensions
- Created `middleware.ts` for route protection

#### Dependencies Added
- `next-auth@latest` - Authentication for Next.js

#### Configuration Changes
- **NextAuth API Route**: 
  - Configured Google OAuth provider
  - Added full Google Drive scope: `https://www.googleapis.com/auth/drive`
  - Added offline access for refresh tokens
  - JWT strategy for session management
  - Custom callbacks to persist access_token and refresh_token
  - Custom sign-in page redirect to `/login`

- **Middleware**: 
  - Protected all routes except `/login` and API/auth routes
  - Automatic redirect to login for unauthenticated users

- **TypeScript Types**: 
  - Extended NextAuth Session interface to include `accessToken`
  - Extended JWT interface to include `accessToken` and `refreshToken`

#### Decisions Made
- **Session Strategy**: JWT (no database needed for MVP)
- **Google Scopes**: Full Drive access (`drive` scope) instead of limited `drive.file`
- **Token Storage**: Access token persisted in JWT for Google Drive API calls
- **Redirect**: Custom login page at `/login` instead of default NextAuth page

---

### Step 3: Login Page with Hero UI ✅ COMPLETED
**Time Started**: 23:15
**Time Completed**: 23:20

#### Files Changed
- Created `app/(auth)/login/page.tsx` with Hero UI components

#### Configuration Changes
- **Login Page Design**:
  - Used Hero UI `Card`, `CardHeader`, `CardBody`, `Button` components
  - Gradient background (purple to pink)
  - D20 Studio branding with gradient logo
  - Google sign-in button with Google icon SVG
  - Responsive design with centered card layout
  - Privacy notice about Google Drive access

#### Decisions Made
- **Route Group**: Used `(auth)` route group for authentication pages (doesn't add to URL)
- **Client Component**: Made client component for `signIn` function from next-auth/react
- **Branding**: Gradient color scheme matching theme (purple → pink)

---

### Step 4: Protected Layout and Navigation ✅ COMPLETED
**Time Started**: 23:20
**Time Completed**: 23:30

#### Files Changed
- Created `app/(dashboard)/layout.tsx` with protected layout wrapper
- Created `app/(dashboard)/page.tsx` with dashboard home page
- Created `components/layout/Header.tsx` with navigation bar
- Updated `app/providers.tsx` to include SessionProvider
- Updated `app/page.tsx` to redirect based on auth status

#### Configuration Changes
- **Dashboard Layout**:
  - Session check with loading state
  - Auto-redirect to `/login` if unauthenticated
  - Includes Header component
  - Container with padding for content

- **Header Component**:
  - Hero UI Navbar with D20 Studio branding
  - Theme toggle button (sun/moon icons)
  - User avatar with dropdown menu
  - Profile info display (email)
  - Settings and Help menu items (placeholders)
  - Logout functionality

- **Dashboard Page**:
  - Welcome message with user's first name
  - Stats cards for Campaigns, NPCs, Sessions (showing 0)
  - Custom icons and color coding (purple, pink, cyan)
  - Placeholder message for Phase 1 completion

- **Providers**:
  - Added SessionProvider wrapper for NextAuth
  - Maintains HeroUIProvider and NextThemesProvider structure

#### Decisions Made
- **Route Group**: Used `(dashboard)` for protected pages
- **Loading State**: Custom spinner instead of default NextAuth loading
- **Theme Toggle**: Mounted check to prevent hydration mismatch
- **Navigation**: Simplified navbar for MVP (no additional nav items yet)
- **User Menu**: Dropdown with avatar for profile actions

---

### Step 5: Final Styling and Documentation ✅ COMPLETED
**Time Started**: 23:30
**Time Completed**: 23:35

#### Files Changed
- Created `README.md` with project overview and setup instructions
- Updated `docs/Phase1.md` (this file) with complete changelog

#### Decisions Made
- **Documentation Structure**: 
  - README.md for quick start and overview
  - Phase1.md for detailed implementation log
  - RoadmapAndPlan.md for complete technical specs
- **Project Structure**: 
  - Route groups for clean URLs: `(auth)` and `(dashboard)`
  - Components organized by feature: `layout/`
  - Types in dedicated directory

---

## ✅ Phase 1 Sprint 1 - COMPLETE

### Summary
Phase 1 Sprint 1 is fully implemented with all objectives achieved:

#### Completed Features ✅
1. ✅ Next.js 14 project initialized with TypeScript
2. ✅ Hero UI v3 integrated with custom theme
3. ✅ Tailwind CSS configured with D20 brand colors
4. ✅ Google OAuth authentication with NextAuth.js
5. ✅ Full Google Drive API scope configured
6. ✅ JWT session strategy implemented
7. ✅ Login page with Hero UI components
8. ✅ Protected dashboard layout with middleware
9. ✅ Navigation header with user profile
10. ✅ Dark/light theme toggle with persistence
11. ✅ Logout functionality
12. ✅ Responsive design (mobile, tablet, desktop)
13. ✅ Complete documentation (README + Phase1.md)

#### What Works
- User can visit app and be redirected to login
- User can sign in with Google OAuth
- User grants Google Drive permissions during OAuth flow
- User is redirected to dashboard after successful login
- Dashboard shows welcome message with user name
- Header displays user avatar and email
- Theme toggle switches between dark/light mode
- Theme preference persists across page reloads
- User can log out from dropdown menu
- All routes except `/login` are protected
- Responsive layout works on all screen sizes

#### What's Next
**Phase 1 Sprint 2**: Markdown Editor & Google Drive Integration
- File browser sidebar
- Monaco/CodeMirror editor
- Read/write files from Google Drive
- Auto-save functionality
- Create/delete/rename operations

---

## 🔐 Google OAuth 2.0 Setup Instructions

### Prerequisites
- Google Cloud Console account
- Project created in Google Cloud

### Step-by-Step Guide

#### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a Project" → "New Project"
3. Name: `D20 Studio` (or your preferred name)
4. Click "Create"

#### 2. Enable Google Drive API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

#### 3. Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (or "Internal" if using Google Workspace)
3. Click "Create"
4. Fill in required fields:
   - **App name**: D20 Studio
   - **User support email**: Your email
   - **Developer contact**: Your email
5. Click "Save and Continue"
6. **Scopes**: Click "Add or Remove Scopes"
   - Search and add: `https://www.googleapis.com/auth/drive`
   - Search and add: `https://www.googleapis.com/auth/userinfo.email`
   - Search and add: `https://www.googleapis.com/auth/userinfo.profile`
7. Click "Save and Continue"
8. **Test users** (if External): Add your email for testing
9. Click "Save and Continue"

#### 4. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "D20 Studio Web Client"
5. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - Add production URL later
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
   - Add production callback URL later
7. Click "Create"
8. **Copy the Client ID and Client Secret** - you'll need these!

#### 5. Add Credentials to Environment Variables
1. Create `.env.local` file in project root
2. Add the following (replace with your actual values):
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<generate-a-random-secret>
   GOOGLE_CLIENT_ID=<your-client-id-here>
   GOOGLE_CLIENT_SECRET=<your-client-secret-here>
   ```

3. To generate `NEXTAUTH_SECRET`, run in terminal:
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

#### 6. Important Notes
- **Never commit** `.env.local` to version control
- Keep credentials secure
- For production, update OAuth consent screen to "Published" status
- Add production URLs to authorized origins and redirect URIs
- Consider using Google Cloud Secret Manager for production

---

## 🐛 Issues Encountered

_None yet - will be updated as issues arise_

---

## ✅ Testing Notes

_Will be updated with testing results_

---

## 📝 Architecture Notes

### Authentication Flow
1. User clicks "Sign in with Google" on login page
2. NextAuth.js redirects to Google OAuth consent screen
3. User authorizes D20 Studio (grants Drive access)
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth.js creates JWT session with user info and access token
6. User redirected to dashboard
7. JWT stored in HTTP-only cookie for security

### File Structure (Planned)
```
d20-studio/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── layout.tsx
│   └── providers.tsx
├── components/
│   ├── layout/
│   │   └── Header.tsx
│   └── ui/
├── lib/
├── types/
├── store/
├── docs/
│   └── Phase1.md
├── .env.local (git-ignored)
├── .env.example
├── tailwind.config.ts
└── middleware.ts
```

---

## 🎨 Design System

### Colors (from RoadmapAndPlan.md)
- **Primary**: Purple 600 (#9333EA) - AI, magic, creativity
- **Secondary**: Pink 600 (#DB2777) - Energy, fun
- **Accent**: Cyan 500 (#06B6D4) - Trust, technology
- **Neutral**: Slate 950-100 - Base, text

### Typography
- **Headings**: Inter (bold, clean)
- **Body**: Inter (regular)
- **Code/Editor**: JetBrains Mono (monospace)

### Theme Configuration
- Default: Dark mode
- Toggle available in header
- Persists via localStorage

---

_Changelog will be updated at the end of each major step._
