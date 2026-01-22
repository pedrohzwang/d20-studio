# D20 Studio

> RPG Campaign Manager with AI

D20 Studio is an AI-powered web application that helps Dungeon Masters manage their RPG campaigns using Markdown files stored in Google Drive, with intelligent context extraction and AI assistance.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.17.0 (recommended: 20.x LTS)
- npm or pnpm
- Google Cloud Console account (for OAuth credentials)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd d20-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Google OAuth Credentials**
   
   Follow the detailed instructions in [`docs/Phase1.md`](docs/Phase1.md) to:
   - Create a Google Cloud project
   - Enable Google Drive API
   - Setup OAuth consent screen
   - Create OAuth 2.0 credentials

4. **Configure environment variables**
   
   Copy `.env.example` to `.env.local` and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add:
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
   - `GOOGLE_CLIENT_ID` - From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET` - From Google Cloud Console

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Components**: Hero UI v3
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Theme**: next-themes (dark/light mode)
- **Language**: TypeScript

## 📁 Project Structure

```
d20-studio/
├── app/
│   ├── (auth)/              # Authentication pages
│   │   └── login/
│   ├── (dashboard)/         # Protected dashboard pages
│   ├── api/
│   │   └── auth/           # NextAuth API routes
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── providers.tsx       # App providers
├── components/
│   └── layout/             # Layout components
│       └── Header.tsx
├── docs/                   # Documentation
│   └── Phase1.md          # Phase 1 implementation log
├── types/                  # TypeScript type definitions
│   └── next-auth.d.ts
├── .env.local             # Local environment variables (git-ignored)
├── .env.example           # Environment variables template
└── tailwind.config.ts     # Tailwind + Hero UI configuration
```

## 🎨 Features

### Phase 1 (Current - Authentication & Base UI) ✅
- [x] Next.js 14 with TypeScript setup
- [x] Hero UI v3 component library integration
- [x] Google OAuth authentication
- [x] Dark/light mode toggle
- [x] Protected routes with middleware
- [x] Responsive design
- [x] User profile management

### Upcoming Phases
- **Phase 2**: Markdown editor with Google Drive integration
- **Phase 3**: AI-powered context extraction
- **Phase 4**: Claude API integration for campaign assistance
- **Phase 5**: Voice transcription and commands

See [`RoadmapAndPlan.md`](RoadmapAndPlan.md) for complete roadmap.

## 🔐 Authentication Flow

1. User visits the app
2. Redirected to login page if not authenticated
3. Clicks "Continue with Google"
4. Grants permissions (email, profile, Google Drive)
5. Redirected to dashboard
6. Session stored as JWT token in HTTP-only cookie

## 🎨 Theme Customization

The app uses a custom color scheme based on D20 Studio brand:
- **Primary**: Purple (#9333EA) - AI, magic, creativity
- **Secondary**: Pink (#DB2777) - Energy, fun
- **Accent**: Cyan (#06B6D4) - Trust, technology

Theme configuration is in [`tailwind.config.ts`](tailwind.config.ts).

## 📚 Documentation

- [`docs/Phase1.md`](docs/Phase1.md) - Detailed implementation log with Google OAuth setup guide
- [`RoadmapAndPlan.md`](RoadmapAndPlan.md) - Complete project roadmap and technical specifications

## 🤝 Contributing

This is currently in early development (Phase 1). Contributions will be welcome once we reach beta.

## 📄 License

[To be determined]

## 🐛 Known Issues

- Node.js version must be >= 18.17.0 (Next.js 14 requirement)
- Google OAuth credentials must be configured before authentication works

## 📞 Support

For issues and questions, please refer to the documentation or create an issue in the repository.

---

**Current Status**: Phase 1 - Authentication & Base UI ✅ Complete

**Next Up**: Phase 1 Sprint 2 - Markdown Editor & Google Drive Integration
