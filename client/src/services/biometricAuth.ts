/**
 * Biometric Authentication Service using Web Authentication API (WebAuthn)
 * Supports fingerprint, Face ID, and other platform authenticators
 */

import { triggerHaptic } from '@/hooks/useHapticFeedback';

export interface BiometricCredential {
  id: string;
  publicKey: string;
  counter: number;
  createdAt: string;
  lastUsedAt: string;
  deviceName: string;
}

export interface BiometricAuthResult {
  success: boolean;
  credentialId?: string;
  error?: string;
}

/**
 * Check if biometric authentication is supported on this device
 */
export function isBiometricSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.PublicKeyCredential !== undefined &&
    typeof window.PublicKeyCredential === 'function'
  );
}

/**
 * Check if platform authenticator (Touch ID, Face ID, Windows Hello) is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isBiometricSupported()) {
    return false;
  }

  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return available;
  } catch (error) {
    console.error('[BiometricAuth] Error checking platform authenticator:', error);
    return false;
  }
}

/**
 * Register a new biometric credential for the user
 */
export async function registerBiometric(
  userId: string,
  username: string,
  displayName: string
): Promise<BiometricAuthResult> {
  try {
    if (!isBiometricSupported()) {
      return {
        success: false,
        error: 'Biometric authentication is not supported on this device',
      };
    }

    // Generate a challenge (in production, this should come from the server)
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Create credential options
    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: 'SmartPro',
        id: window.location.hostname,
      },
      user: {
        id: new TextEncoder().encode(userId),
        name: username,
        displayName: displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },  // ES256
        { alg: -257, type: 'public-key' }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Use platform authenticator (Touch ID, Face ID)
        userVerification: 'required',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    };

    // Create the credential
    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      return {
        success: false,
        error: 'Failed to create credential',
      };
    }

    // Get the credential data
    const response = credential.response as AuthenticatorAttestationResponse;
    const credentialId = arrayBufferToBase64(credential.rawId);
    const publicKey = arrayBufferToBase64(response.getPublicKey()!);

    // Store credential info in localStorage (in production, send to server)
    const credentialData: BiometricCredential = {
      id: credentialId,
      publicKey,
      counter: 0,
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString(),
      deviceName: getDeviceName(),
    };

    const existingCredentials = getBiometricCredentials(userId);
    existingCredentials.push(credentialData);
    localStorage.setItem(`biometric_credentials_${userId}`, JSON.stringify(existingCredentials));

    triggerHaptic('success');

    return {
      success: true,
      credentialId,
    };
  } catch (error: any) {
    console.error('[BiometricAuth] Registration error:', error);
    triggerHaptic('error');
    
    return {
      success: false,
      error: error.message || 'Failed to register biometric authentication',
    };
  }
}

/**
 * Authenticate using biometric credential
 */
export async function authenticateWithBiometric(userId: string): Promise<BiometricAuthResult> {
  try {
    if (!isBiometricSupported()) {
      return {
        success: false,
        error: 'Biometric authentication is not supported on this device',
      };
    }

    // Get stored credentials
    const credentials = getBiometricCredentials(userId);
    if (credentials.length === 0) {
      return {
        success: false,
        error: 'No biometric credentials found. Please register first.',
      };
    }

    // Generate a challenge (in production, this should come from the server)
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    // Create assertion options
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: credentials.map((cred) => ({
        id: base64ToArrayBuffer(cred.id),
        type: 'public-key',
        transports: ['internal'] as AuthenticatorTransport[],
      })),
      userVerification: 'required',
      timeout: 60000,
    };

    // Get the credential
    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    }) as PublicKeyCredential;

    if (!assertion) {
      return {
        success: false,
        error: 'Authentication failed',
      };
    }

    const credentialId = arrayBufferToBase64(assertion.rawId);

    // Update last used timestamp
    const updatedCredentials = credentials.map((cred) => {
      if (cred.id === credentialId) {
        return {
          ...cred,
          lastUsedAt: new Date().toISOString(),
          counter: cred.counter + 1,
        };
      }
      return cred;
    });
    localStorage.setItem(`biometric_credentials_${userId}`, JSON.stringify(updatedCredentials));

    triggerHaptic('success');

    return {
      success: true,
      credentialId,
    };
  } catch (error: any) {
    console.error('[BiometricAuth] Authentication error:', error);
    triggerHaptic('error');
    
    return {
      success: false,
      error: error.message || 'Authentication failed',
    };
  }
}

/**
 * Get all biometric credentials for a user
 */
export function getBiometricCredentials(userId: string): BiometricCredential[] {
  try {
    const stored = localStorage.getItem(`biometric_credentials_${userId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('[BiometricAuth] Error getting credentials:', error);
    return [];
  }
}

/**
 * Remove a biometric credential
 */
export function removeBiometricCredential(userId: string, credentialId: string): boolean {
  try {
    const credentials = getBiometricCredentials(userId);
    const filtered = credentials.filter((cred) => cred.id !== credentialId);
    localStorage.setItem(`biometric_credentials_${userId}`, JSON.stringify(filtered));
    triggerHaptic('medium');
    return true;
  } catch (error) {
    console.error('[BiometricAuth] Error removing credential:', error);
    return false;
  }
}

/**
 * Check if user has biometric credentials registered
 */
export function hasBiometricCredentials(userId: string): boolean {
  return getBiometricCredentials(userId).length > 0;
}

// Helper functions

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function getDeviceName(): string {
  const userAgent = navigator.userAgent;
  
  if (/iPhone/.test(userAgent)) return 'iPhone';
  if (/iPad/.test(userAgent)) return 'iPad';
  if (/Android/.test(userAgent)) return 'Android Device';
  if (/Mac/.test(userAgent)) return 'Mac';
  if (/Windows/.test(userAgent)) return 'Windows PC';
  
  return 'Unknown Device';
}
