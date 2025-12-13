# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial open source release
- GitHub repository collaborator management dashboard
- Dual access modes: Repository-based and User-based views
- Secure OAuth integration with GitHub
- Token encryption at rest using AES-GCM
- Row Level Security (RLS) for database access control
- Real-time collaboration management
- Bulk user removal across repositories
- Responsive design with modern UI components

### Security
- Encrypted token storage in Supabase
- Server-side token handling via Edge Functions
- No client-side exposure of secrets
- Comprehensive RLS policies

## [1.0.0] - 2025-01-XX

### Added
- Initial release of CollabManager
- Repository collaborator management
- User access aggregation view
- GitHub OAuth authentication
- Supabase backend integration
- Edge Functions for secure API proxying
- Modern React + TypeScript frontend
- Tailwind CSS + shadcn/ui components

[Unreleased]: https://github.com/WatsonJoev/git-control/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/WatsonJoev/git-control/releases/tag/v1.0.0
