-- Migration: Add note about encryption
-- This migration documents that access_token field now stores encrypted values
-- The encryption is handled by Edge Functions using AES-GCM

-- Note: No schema changes needed
-- The access_token column already exists and will store encrypted base64 strings
-- Encryption/decryption is handled in Edge Functions:
-- - github-oauth: Encrypts tokens before storing
-- - github-api: Decrypts tokens when retrieving

-- To enable encryption, ensure ENCRYPTION_KEY environment variable is set
-- in Supabase Edge Functions settings

COMMENT ON COLUMN public.github_tokens.access_token IS 
'Encrypted GitHub access token. Encrypted using AES-GCM with ENCRYPTION_KEY. ' ||
'Stored as base64-encoded string (IV + encrypted data). ' ||
'Decryption handled by Edge Functions only.';

