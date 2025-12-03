# CollabManager

A powerful, intuitive dashboard for managing GitHub repository collaborators. Streamline your team's access management with two flexible access modes: repository-based and user-based control.

![CollabManager](https://img.shields.io/badge/CollabManager-GitHub%20Management-blue)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF?logo=vite)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Development](#development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

CollabManager is a modern web application that simplifies GitHub collaborator management. Whether you need to manage access per repository or track users across all your repositories, CollabManager provides a clean, professional interface to handle all your collaboration needs.

### Key Capabilities

- **Repository-Based Access**: Manage collaborators for individual repositories
- **User-Based Access**: View and manage all collaborators across all repositories
- **Bulk Operations**: Remove users from multiple repositories simultaneously
- **Real-time Updates**: Instant synchronization with GitHub
- **Secure Authentication**: Enterprise-grade OAuth integration with encrypted token storage

## ✨ Features

### Repository Access Mode
- Browse and search through all your repositories
- View collaborators and pending invitations for each repository
- Invite new collaborators with specific permissions (Read, Write, Admin)
- Remove collaborators from individual repositories
- Track permission levels for each collaborator

### User Access Mode
- Aggregate view of all unique collaborators across repositories
- See which repositories each user has access to
- Expandable user cards showing detailed repository access
- Bulk removal: Remove a user from all repositories with a single action
- Permission overview for each user across all repositories

### Additional Features
- **Secure OAuth**: GitHub OAuth integration with encrypted token storage
- **Real-time Sync**: Automatic updates when changes are made
- **Search Functionality**: Quick search across repositories and users
- **Professional UI**: Clean, monochrome design optimized for productivity
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Error Handling**: Comprehensive error messages and recovery options

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **React Router 6.30.1** - Client-side routing
- **TanStack Query 5.83.0** - Data fetching and caching
- **Zod 3.25.76** - Schema validation
- **Sonner** - Toast notifications

### Backend & Services
- **Supabase** - Backend-as-a-Service (Authentication, Database, Edge Functions)
- **GitHub API** - Repository and collaborator management
- **Supabase Edge Functions** - Serverless functions for GitHub API integration

### Development Tools
- **ESLint** - Code linting
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
git-control/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── Dashboard.tsx   # Main dashboard with dual access modes
│   │   ├── LandingPage.tsx # Landing page with authentication
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication hook
│   │   └── use-mobile.tsx  # Mobile detection hook
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client and types
│   ├── lib/                # Utility functions
│   │   ├── github.ts       # GitHub API wrapper
│   │   └── utils.ts        # General utilities
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Main page router
│   │   └── NotFound.tsx   # 404 page
│   ├── App.tsx             # Root component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── github-api/     # GitHub API proxy
│   │   └── github-oauth/   # OAuth handler
│   └── migrations/         # Database migrations
├── package.json            # Dependencies and scripts
├── tailwind.config.ts     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **npm** or **pnpm** or **bun**
- **Supabase Account** - For backend services
- **GitHub Account** - For OAuth and repository access

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd git-control
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Configure Supabase**
   
   - Create a new Supabase project
   - Set up the database schema (see `supabase/migrations/`)
   - Configure Edge Functions for GitHub API and OAuth
   - Set up GitHub OAuth App in GitHub settings

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📖 Usage Guide

### First Time Setup

1. **Sign Up / Sign In**
   - Create an account using email and password
   - Or sign in if you already have an account

2. **Connect GitHub**
   - Click "Connect with GitHub" button
   - Authorize the application to access your repositories
   - Grant necessary permissions for collaborator management

3. **Choose Access Mode**
   - **Repository Access**: Manage collaborators per repository
   - **User Access**: View and manage all collaborators across repositories

### Repository Access Mode

1. **Select a Repository**
   - Browse the list of repositories on the left
   - Use the search bar to filter repositories
   - Click on a repository to view its collaborators

2. **Manage Collaborators**
   - View current collaborators and their permissions
   - Click "Invite" to add a new collaborator
   - Enter GitHub username and select permission level
   - Remove collaborators using the remove button

### User Access Mode

1. **View All Collaborators**
   - Switch to "User Access" tab
   - See all unique collaborators across all repositories
   - View how many repositories each user has access to

2. **Expand User Details**
   - Click on a user card to expand and see all repositories
   - View permission levels for each repository

3. **Bulk Removal**
   - Click "Remove from all" button on any user
   - Confirm the action in the dialog
   - The user will be removed from all listed repositories

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Formatting**: Prettier (via ESLint)
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS utility classes

### Key Components

- **Dashboard**: Main application interface with dual access modes
- **LandingPage**: Authentication and onboarding
- **github.ts**: GitHub API integration layer
- **useAuth**: Authentication state management

## 🚢 Deployment

### Deploy to Vercel

Vercel is the recommended deployment platform for this application. You can deploy using the Vercel CLI or through the Vercel dashboard.

#### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add the following:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be live at `https://your-project.vercel.app`

#### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel (first time only)
vercel login

# Deploy (follow the prompts)
vercel

# For production deployment
vercel --prod
```

#### Vercel Configuration

The project includes a `vercel.json` configuration file that:
- Sets up proper routing for React Router
- Configures build settings for Vite
- Handles SPA routing correctly

### Deploy to Other Platforms

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

#### Other Platforms

Since this is a static Vite application, you can deploy to any static hosting service:
- **Cloudflare Pages**: Connect your GitHub repo
- **AWS Amplify**: Import from GitHub
- **GitHub Pages**: Use GitHub Actions for deployment
- **Any static host**: Upload the `dist` folder after running `npm run build`

### Environment Variables

Ensure the following environment variables are set in your deployment platform:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## 🔐 Environment Variables

Required environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

Optional environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID (if not using Supabase Edge Functions) |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write meaningful commit messages
- Add comments for complex logic
- Ensure all tests pass (if applicable)
- Update documentation as needed

## 📝 License

This project is private and proprietary.

## 🔗 Links

- **GitHub**: [Repository URL]
- **Live Demo**: [Add your Vercel deployment URL]
- **Documentation**: [Add documentation link if available]

## 🙏 Acknowledgments

- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Backend powered by [Supabase](https://supabase.com)
- Deployed on [Vercel](https://vercel.com)

---

**Made with ❤️ for efficient GitHub collaboration management**
