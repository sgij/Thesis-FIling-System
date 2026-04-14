/**
 * Crypto Service
 * Handles AES-GCM encryption/decryption with PBKDF2 key derivation
 * @module services/CryptoService
 */

import { createLogger } from '../utils/logger.js';
import { CONFIG } from '../utils/config.js';

const logger = createLogger('CryptoService');

export class CryptoService {
  constructor() {
    this.logger = logger;
    this.crypto = window.crypto;
    this.subtle = window.crypto.subtle;
  }

  /**
   * Verify crypto API is available
   */
  isAvailable() {
    return !!this.crypto && !!this.subtle;
  }

  /**
   * Generate random bytes
   */
  getRandomBytes(length) {
    const bytes = new Uint8Array(length);
    this.crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Derive encryption key from password
   * Uses PBKDF2-SHA256
   */
  async deriveKey(password, salt) {
    try {
      // Import password as raw key
      const baseKey = await this.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
      );

      // Derive bits using PBKDF2
      const derivedBits = await this.subtle.deriveBits(
        {
          name: 'PBKDF2',
          hash: `SHA-${CONFIG.CRYPTO.PBKDF2_HASH.split('-')[1]}`,
          salt: salt,
          iterations: CONFIG.CRYPTO.PBKDF2_ITERATIONS
        },
        baseKey,
        CONFIG.CRYPTO.KEY_LENGTH
      );

      // Import derived bits as AES key
      return await this.subtle.importKey(
        'raw',
        derivedBits,
        'AES-GCM',
        false,
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      this.logger.error('Error deriving key:', error);
      throw new Error('Failed to derive encryption key');
    }
  }

  /**
   * Encrypt data with password
   * Returns: { iv, salt, ciphertext, tag } as base64 encoded object
   */
  async encryptWithPassword(data, password) {
    try {
      if (!this.isAvailable()) {
        throw new Error('Web Crypto API not available');
      }

      // Generate salt and IV
      const salt = this.getRandomBytes(CONFIG.CRYPTO.PBKDF2_SALT_LENGTH);
      const iv = this.getRandomBytes(CONFIG.CRYPTO.IV_LENGTH);

      // Derive encryption key
      const key = await this.deriveKey(password, salt);

      // Encrypt data
      const dataBuffer = new TextEncoder().encode(data);
      const encryptedData = await this.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        dataBuffer
      );

      // Return encrypted package
      return {
        iv: this._bytesToBase64(iv),
        salt: this._bytesToBase64(salt),
        ciphertext: this._bytesToBase64(new Uint8Array(encryptedData)),
        algorithm: CONFIG.CRYPTO.ALGORITHM
      };
    } catch (error) {
      this.logger.error('Encryption error:', error);
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data with password
   * Accepts: { iv, salt, ciphertext } as base64 encoded
   */
  async decryptWithPassword(encryptedPackage, password) {
    try {
      if (!this.isAvailable()) {
        throw new Error('Web Crypto API not available');
      }

      // Decode base64 components
      const iv = this._base64ToBytes(encryptedPackage.iv);
      const salt = this._base64ToBytes(encryptedPackage.salt);
      const ciphertext = this._base64ToBytes(encryptedPackage.ciphertext);

      // Derive decryption key
      const key = await this.deriveKey(password, salt);

      // Decrypt data
      const decryptedData = await this.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        ciphertext
      );

      // Return decrypted text
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      this.logger.error('Decryption error:', error);
      throw new Error('Decryption failed - invalid password or corrupted data');
    }
  }

  /**
   * Generate secure random password
   */
  generateSecurePassword(length = 12) {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one from each category
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
    password += '0123456789'[Math.floor(Math.random() * 10)]; // number
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special

    // Fill rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Validate password strength
   * Returns: { score (0-4), label (Weak, Fair, Good, Strong) }
   */
  validatePasswordStrength(password) {
    if (!password || password.length === 0) {
      return { score: 0, label: 'Empty' };
    }

    if (password.length < 6) {
      return { score: 1, label: 'Too Short' };
    }

    let complexity = 0;
    if (/[a-z]/.test(password)) complexity++;
    if (/[A-Z]/.test(password)) complexity++;
    if (/\d/.test(password)) complexity++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) complexity++;
    if (password.length >= 12) complexity++;

    if (complexity < 2) {
      return { score: 1, label: 'Weak' };
    } else if (complexity < 3) {
      return { score: 2, label: 'Fair' };
    } else if (complexity < 4) {
      return { score: 3, label: 'Good' };
    } else {
      return { score: 4, label: 'Strong' };
    }
  }

  /**
   * Encrypt file content (for File System API)
   * Returns ArrayBuffer suitable for file storage
   */
  async encryptFileContent(fileContent, password) {
    const encryptedData = await this.encryptWithPassword(
      this._arrayBufferToBase64(fileContent),
      password
    );
    return JSON.stringify(encryptedData);
  }

  /**
   * Decrypt file content (from File System API)
   */
  async decryptFileContent(encryptedContent, password) {
    const encryptedData = JSON.parse(encryptedContent);
    const decryptedBase64 = await this.decryptWithPassword(encryptedData, password);
    return this._base64ToArrayBuffer(decryptedBase64);
  }

  /**
   * Helper: Convert bytes to base64
   */
  _bytesToBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: Convert base64 to bytes
   */
  _base64ToBytes(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Helper: Convert ArrayBuffer to base64
   */
  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Helper: Convert base64 to ArrayBuffer
   */
  _base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

export default CryptoService;
