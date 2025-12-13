# CollabManager

<div align="center">

**A powerful, intuitive dashboard for managing GitHub repository collaborators**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)](https://vitejs.dev/)

[Features](#-features) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

### 🔀 Dual Access Modes

**Repository-Based Access**
- Manage collaborators for individual repositories
- Invite and remove collaborators with specific permissions
- Track pending invitations
- View permission levels (Read, Write, Admin)

**User-Based Access**
- Aggregate view of all collaborators across repositories
- See which repositories each user has access to
- Bulk removal: Remove users from all repositories at once
- Expandable user cards with detailed repository access

### 🔒 Security

- **Secure OAuth**: GitHub OAuth integration with encrypted token storage
- **Row Level Security**: Database-level access control via Supabase RLS
- **Token Encryption**: GitHub tokens encrypted at rest
- **No Client Secrets**: All sensitive operations handled server-side

### 🚀 Performance

- **Real-time Updates**: Instant synchronization with GitHub
- **Fast Search**: Quick filtering across repositories and users
- **Optimized Queries**: Efficient data fetching with React Query
- **Responsive Design**: Works seamlessly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([install with nvm](https://github.com/nvm-sh/nvm))
- A [Supabase](https://supabase.com) account
- A [GitHub OAuth App](https://github.com/settings/developers)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/WatsonJoev/git-control.git
   cd git-control
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/20251203174919_*.sql`
   - Configure Edge Functions (see [Setup Guide](#-setup-guide))

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit `http://localhost:5173`

## 📖 Setup Guide

### Supabase Configuration

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Link Supabase Project (for local development)**
   
   If using Supabase CLI for local development:
   ```bash
   # Link to your remote Supabase project
   supabase link --project-ref your-project-ref
   ```
   
   This automatically sets `project_id` in `config.toml`.
   
   Alternatively, create `supabase/config.local.toml`:
   ```toml
   project_id = "your-project-id"
   ```
   
   **Note**: `project_id` is only needed for local CLI operations. Production Edge Functions use `SUPABASE_URL` environment variable instead.

3. **Run Database Migration**
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually run the SQL file in Supabase Dashboard:
   # Go to SQL Editor → New Query → Paste contents of supabase/migrations/20251203174919_*.sql
   ```

4. **Generate Encryption Key**

   Generate a secure encryption key for token encryption:
   ```bash
   node scripts/generate-encryption-key.js
   ```
   
   Or manually:
   ```bash
   # Using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   
   # Using OpenSSL
   openssl rand -base64 32
   ```

5. **Configure Edge Functions**

   Set these environment variables in Supabase Dashboard → Edge Functions → Settings:
   - `GITHUB_CLIENT_ID` - Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET` - Your GitHub OAuth App Client Secret
   - `ENCRYPTION_KEY` - Your base64-encoded 32-byte encryption key (generated above)
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   
   **Important**: The same `ENCRYPTION_KEY` must be used for all Edge Functions that need to encrypt/decrypt tokens.

6. **Deploy Edge Functions**
   ```bash
   supabase functions deploy github-oauth
   supabase functions deploy github-api
   ```

### GitHub OAuth App Setup

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: CollabManager
   - **Homepage URL**: `http://localhost:5173` (dev) or your production URL
   - **Authorization callback URL**: `http://localhost:5173` (dev) or your production URL
4. Copy the **Client ID** and create a **Client Secret**
5. Add these to your Supabase Edge Functions environment variables

## 📚 Documentation

### Project Structure

```
git-control/
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── LandingPage.tsx   # Landing page
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility functions
│   │   └── github.ts   # GitHub API wrapper
│   ├── integrations/   # Third-party integrations
│   │   └── supabase/   # Supabase client
│   └── pages/          # Page components
├── supabase/
│   ├── functions/      # Edge Functions
│   └── migrations/     # Database migrations
└── public/             # Static assets
```

### Usage

#### Repository Access Mode

1. Select a repository from the list
2. View current collaborators and their permissions
3. Click "Invite" to add a new collaborator
4. Remove collaborators using the remove button

#### User Access Mode

1. Switch to "User Access" tab
2. Browse all unique collaborators
3. Expand user cards to see repository access
4. Use "Remove from all" for bulk operations

### API Reference

The application uses Supabase Edge Functions to interact with GitHub API:

- `github-oauth`: Handles OAuth flow and token exchange
- `github-api`: Proxies GitHub API requests with user tokens

See `supabase/functions/` for implementation details.

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **State**: TanStack Query, React Router
- **Validation**: Zod

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

See [vercel.json](./vercel.json) for configuration.

### Other Platforms

This is a static Vite app, deployable to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages
- Any static host

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed
- Follow the existing code style

## 🔐 Security

We take security seriously. Please review our [Security Policy](SECURITY.md) before reporting vulnerabilities.

**Important**: Never commit `.env` files or expose API keys. All secrets should be environment variables.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- [Lucide](https://lucide.dev) - Icon library
- [Supabase](https://supabase.com) - Backend infrastructure
- [Vercel](https://vercel.com) - Deployment platform

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/WatsonJoev/git-control/issues)
- **Discussions**: [GitHub Discussions](https://github.com/WatsonJoev/git-control/discussions)
- **Email**: mailtowilliam93@gmail.com

---

<div align="center">

**Made with ❤️ for efficient GitHub collaboration management**

[⭐ Star us on GitHub](https://github.com/WatsonJoev/git-control) • [📖 Documentation](#-documentation) • [🐛 Report Bug](https://github.com/WatsonJoev/git-control/issues)

</div>
