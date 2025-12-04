#!/usr/bin/env node

/**
 * Generate a secure encryption key for token encryption
 * 
 * Usage:
 *   node scripts/generate-encryption-key.js
 * 
 * This will output a base64-encoded 32-byte key suitable for AES-GCM encryption
 */

const crypto = require('crypto');

// Generate a 32-byte (256-bit) key for AES-GCM
const key = crypto.randomBytes(32);
const base64Key = key.toString('base64');

console.log('\n🔐 Encryption Key Generated\n');
console.log('Add this to your environment variables:');
console.log(`ENCRYPTION_KEY=${base64Key}\n`);
console.log('⚠️  Keep this key secure and never commit it to version control!\n');
console.log('For Supabase Edge Functions:');
console.log('1. Go to Supabase Dashboard → Edge Functions → Settings');
console.log('2. Add ENCRYPTION_KEY as an environment variable');
console.log('3. Use the value shown above\n');

