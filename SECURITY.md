# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability, please follow these steps:

1. **Do NOT** open a public GitHub issue
2. Email security concerns to: [mailtowilliam93@gmail.com]
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

We will respond within 48 hours and work with you to resolve the issue before public disclosure.

## Security Best Practices

### For Users

1. **Environment Variables**: Never commit `.env` files or expose API keys
2. **GitHub OAuth**: Use strong, unique credentials for your GitHub OAuth app
3. **Supabase**: Keep your Supabase service role key secure and never expose it client-side
4. **Tokens**: GitHub access tokens are stored securely in Supabase with Row Level Security (RLS)

### For Developers

1. **Secrets Management**: All secrets should be stored as environment variables
2. **Client-Side**: Never expose service role keys or client secrets in client-side code
3. **Database**: RLS policies ensure users can only access their own tokens
4. **API Keys**: Use Supabase anon key (public) for client, service role key only in Edge Functions

## Known Security Features

- ✅ Row Level Security (RLS) enabled on all sensitive tables
- ✅ GitHub tokens encrypted using AES-GCM before database storage
- ✅ Encryption key stored only in Edge Functions environment variables
- ✅ OAuth secrets stored only in Edge Functions (server-side)
- ✅ No sensitive data exposed in client-side code
- ✅ CORS properly configured for Edge Functions
- ✅ Input validation using Zod schemas
- ✅ Tokens decrypted only when needed for API calls

## Security Considerations

### GitHub OAuth Scopes

The application requests the following GitHub scopes:
- `repo` - Full control of private repositories
- `user` - Read user profile data
- `read:org` - Read organization membership
- `admin:org` - Full control of organization membership

**Note**: Users should review these permissions carefully before authorizing.

### Data Storage

- GitHub access tokens are encrypted using AES-GCM before storage
- Encryption uses a 32-byte key stored in Edge Functions environment variables
- Encrypted tokens are stored as base64 strings in the database
- Tokens are decrypted only in Edge Functions when needed for API calls
- RLS policies prevent users from accessing other users' tokens
- Even with database access, tokens remain encrypted without the encryption key
- Tokens can be revoked at any time via GitHub settings

### Edge Functions

Edge Functions handle sensitive operations:
- OAuth token exchange (uses client secret)
- GitHub API requests (uses stored access tokens)
- Service role key is only used server-side

## Updates

Security updates will be released as patch versions (1.0.x). Always update to the latest version to receive security fixes.

