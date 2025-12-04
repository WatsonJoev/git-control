// Encryption utilities for securing sensitive data
// Uses Web Crypto API (AES-GCM) for encryption/decryption

const ENCRYPTION_KEY = Deno.env.get('ENCRYPTION_KEY');

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required');
}

// Convert base64 key to CryptoKey
async function getCryptoKey(): Promise<CryptoKey> {
  const keyData = Uint8Array.from(atob(ENCRYPTION_KEY), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// Generate a random IV (Initialization Vector)
function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

/**
 * Encrypts a string value using AES-GCM
 * Returns base64 encoded string: IV (12 bytes) + encrypted data
 */
export async function encrypt(value: string): Promise<string> {
  if (!value) {
    return value;
  }

  const key = await getCryptoKey();
  const iv = generateIV();
  const encoder = new TextEncoder();
  const data = encoder.encode(value);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    data
  );

  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a base64 encoded encrypted string
 * Expects format: IV (12 bytes) + encrypted data
 */
export async function decrypt(encryptedValue: string): Promise<string> {
  if (!encryptedValue) {
    return encryptedValue;
  }

  try {
    const key = await getCryptoKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt value. The encryption key may be incorrect.');
  }
}

