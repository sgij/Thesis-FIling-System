# 6. PROGRAM LISTING (Code Structure & Pseudocode)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Software Design Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Detailed code structure, class hierarchies, and key algorithm pseudocode

---

## PART A: FRONTEND MODULE STRUCTURE

### App.js (Orchestrator) - ~80 lines

```javascript
/**
 * App - Main application orchestrator
 * Initializes all services and coordinates communication
 */
export class App {

  constructor() {
    // Initialize all services
    this.storageManager = new StorageManager();
    this.cryptoService = new CryptoService();
    this.fileService = new FileService();
    this.notificationService = new NotificationService();
    this.uiRenderer = new UIRenderer();
    this.eventEmitter = new EventEmitter();

    this.logger = createLogger('App');
  }

  /**
   * Bootstrap application
   * 1. Initialize storage
   * 2. Load cached data
   * 3. Setup UI
   * 4. Register event listeners
   */
  async init() {
    try {
      this.logger.log('Initializing application...');

      // Step 1: Initialize storage layers
      await this.storageManager.init();

      // Step 2: Load initial data
      const cachedFiles = await this.storageManager.getAll('files');

      // Step 3: Render UI
      this.uiRenderer.init(document.getElementById('app'));

      // Step 4: Setup inter-service communication
      this.setupServiceCommunication();

      this.logger.log('Application initialized');
    } catch (error) {
      this.logger.error(`Init failed: ${error.message}`);
      throw error;
    }
  }

  setupServiceCommunication() {
    // FileService → UIRenderer (file list updated)
    this.eventEmitter.on('files:updated', (files) => {
      this.uiRenderer.updateFilesList(files);
    });

    // FileService → NotificationService (progress)
    this.eventEmitter.on('upload:progress', (percent) => {
      this.notificationService.show(`Uploading... ${percent}%`);
    });

    // Any service → NotificationService (errors)
    this.eventEmitter.on('error', (error) => {
      this.notificationService.showError(error);
    });
  }

  shutdown() {
    // Cleanup on logout
    this.storageManager.clear();
    this.uiRenderer.destroy();
    this.logger.log('Application shutdown complete');
  }
}
```

---

### FileService.js - ~250 lines

```javascript
/**
 * FileService - Handles file operations
 * Manages upload, download, delete, restore, search
 */
export class FileService {

  constructor(cryptoService, storageManager, eventEmitter) {
    this.crypto = cryptoService;
    this.storage = storageManager;
    this.events = eventEmitter;
    this.logger = createLogger('FileService');
    this.apiBase = config.API_BASE_URL;
  }

  /**
   * Upload file to server with optional encryption
   *
   * PSEUDOCODE:
   * Function uploadFile(file, encryptRequired):
   *   1. Validate file size and type
   *   2. If encryptRequired:
   *      2a. Prompt user for password
   *      2b. Call CryptoService.encrypt()
   *      2c. Create encrypted blob
   *   3. Create FormData with file + metadata
   *   4. POST /api/files/upload
   *   5. Monitor progress
   *   6. On success: emit 'files:updated' event
   *   7. Return {fileId, filename, size}
   */
  async uploadFile(file, encryptionRequired) {
    try {
      // Validate
      if (file.size > config.MAX_FILE_SIZE) {
        throw new Error(`File exceeds ${config.MAX_FILE_SIZE} bytes`);
      }

      if (!this.isAllowedType(file.type)) {
        throw new Error('File type not allowed');
      }

      let fileToUpload = file;
      let isEncrypted = false;

      // Encrypt if required
      if (encryptionRequired) {
        const password = prompt('Enter encryption password:');
        const encrypted = await this.crypto.encryptWithPassword(
          file,
          password
        );
        fileToUpload = encrypted.blob;
        isEncrypted = true;
        this.logger.debug('File encrypted successfully');
      }

      // Create FormData
      const formData = new FormData();
      formData.append('file', fileToUpload);
      formData.append('filename', file.name);
      formData.append('isEncrypted', isEncrypted);

      // Upload with progress
      const response = await fetch(`${this.apiBase}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AuthService.getToken()}`
        },
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          this.events.emit('upload:progress', percent);
        }
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();

      // Emit event to update UI
      this.events.emit('file:uploaded', result);

      return result;

    } catch (error) {
      this.logger.error(`Upload failed: ${error.message}`);
      this.events.emit('error', error);
      throw error;
    }
  }

  /**
   * Download file (optionally decrypt if encrypted)
   *
   * PSEUDOCODE:
   * Function downloadFile(fileId, password=null):
   *   1. Verify user owns file (check JWT)
   *   2. GET /api/files/:fileId (fetch binary)
   *   3. If encrypted:
   *      3a. Prompt for password if not provided
   *      3b. Call CryptoService.decrypt()
   *   4. Create blob URL
   *   5. Trigger browser download (link.click())
   *   6. Log download action to D3
   *   7. Emit 'file:downloaded' event
   */
  async downloadFile(fileId, decryptPassword = null) {
    try {
      this.logger.log(`Downloading file: ${fileId}`);

      // Fetch file
      const response = await fetch(
        `${this.apiBase}/files/${fileId}`,
        {
          headers: {
            'Authorization': `Bearer ${AuthService.getToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('File not found');

      let blob = await response.blob();

      // Check if encrypted (metadata in response header)
      const isEncrypted = response.headers.get('x-encrypted') === 'true';

      if (isEncrypted) {
        if (!decryptPassword) {
          decryptPassword = prompt('Enter decryption password:');
        }
        blob = await this.crypto.decryptWithPassword(blob, decryptPassword);
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers.get('x-filename') || 'file';

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Log action
      this.events.emit('file:downloaded', fileId);

    } catch (error) {
      this.logger.error(`Download failed: ${error.message}`);
      this.events.emit('error', error);
      throw error;
    }
  }

  /**
   * Soft delete file (move to trash)
   *
   * PSEUDOCODE:
   * Function deleteFile(fileId):
   *   1. Confirm with user
   *   2. DELETE /api/files/:fileId
   *   3. On backend: UPDATE files SET trash_date=NOW()
   *   4. Emit 'file:deleted' event
   *   5. Show toast notification
   */
  async deleteFile(fileId) {
    try {
      if (!confirm('Move file to trash?')) return;

      const response = await fetch(
        `${this.apiBase}/files/${fileId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${AuthService.getToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('Delete failed');

      this.events.emit('file:deleted', fileId);

    } catch (error) {
      this.logger.error(`Delete failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restore file from trash
   *
   * PSEUDOCODE:
   * Function restoreFromTrash(fileId):
   *   1. Verify file is in trash
   *   2. POST /api/files/:fileId/restore
   *   3. On backend: UPDATE files SET trash_date=NULL
   *   4. Emit 'file:restored' event
   */
  async restoreFromTrash(fileId) {
    try {
      const response = await fetch(
        `${this.apiBase}/files/${fileId}/restore`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AuthService.getToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('Restore failed');

      this.events.emit('file:restored', fileId);

    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search and filter files
   *
   * PSEUDOCODE:
   * Function searchFiles(query, filters):
   *   1. Validate search text (1-100 chars)
   *   2. Build query parameters
   *   3. GET /api/files/search?q=text&type=pdf&...
   *   4. Parse paginated results
   *   5. Return results to caller
   */
  async searchFiles(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query || '',
        ...filters
      });

      const response = await fetch(
        `${this.apiBase}/files/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${AuthService.getToken()}`
          }
        }
      );

      if (!response.ok) throw new Error('Search failed');

      return await response.json();

    } catch (error) {
      this.logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  isAllowedType(mimeType) {
    return config.ALLOWED_FILE_TYPES.includes(mimeType);
  }
}
```

---

### CryptoService.js - ~180 lines

```javascript
/**
 * CryptoService - Encryption/Decryption using WebCrypto API
 * AES-GCM-256 with PBKDF2 key derivation
 */
export class CryptoService {

  constructor() {
    this.logger = createLogger('CryptoService');
    this.config = config.ENCRYPTION_CONFIG;
  }

  /**
   * Encrypt file with password
   *
   * PSEUDOCODE:
   * Function encryptWithPassword(fileBlob, password):
   *   1. Generate random 32-byte salt
   *   2. Generate random 12-byte IV
   *   3. PBKDF2 derive key from password + salt (100k iterations)
   *   4. AES-GCM encrypt fileBlob with key + IV
   *   5. Combine: salt + IV + ciphertext + authTag
   *   6. Return as new Blob
   */
  async encryptWithPassword(fileBlob, password) {
    try {
      const salt = this.generateSalt();
      const iv = this.generateIV();

      // Derive key from password
      const key = await this.deriveKey(password, salt);

      // Read file as ArrayBuffer
      const fileBuffer = await fileBlob.arrayBuffer();

      // Encrypt
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        fileBuffer
      );

      // Combine salt + IV + ciphertext
      const combined = new Uint8Array(
        salt.length + iv.length + ciphertext.byteLength
      );

      combined.set(salt, 0);
      combined.set(iv, salt.length);
      combined.set(new Uint8Array(ciphertext), salt.length + iv.length);

      return new Blob([combined], {type: 'application/octet-stream'});

    } catch (error) {
      this.logger.error(`Encryption failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Decrypt file with password
   *
   * PSEUDOCODE:
   * Function decryptWithPassword(encryptedBlob, password):
   *   1. Read blob as ArrayBuffer
   *   2. Extract salt (first 32 bytes)
   *   3. Extract IV (next 12 bytes)
   *   4. Extract ciphertext (remainder)
   *   5. PBKDF2 derive key from password + salt
   *   6. AES-GCM decrypt ciphertext with key + IV
   *   7. Return decrypted content as Blob
   */
  async decryptWithPassword(encryptedBlob, password) {
    try {
      const buffer = await encryptedBlob.arrayBuffer();
      const data = new Uint8Array(buffer);

      // Extract components
      const salt = data.slice(0, 32);
      const iv = data.slice(32, 44);
      const ciphertext = data.slice(44);

      // Derive key
      const key = await this.deriveKey(password, salt);

      // Decrypt
      const plaintext = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        key,
        ciphertext
      );

      return new Blob([new Uint8Array(plaintext)]);

    } catch (error) {
      this.logger.error(`Decryption failed: ${error.message}`);
      throw new Error('Decryption failed - wrong password?');
    }
  }

  /**
   * PBKDF2 key derivation
   *
   * PSEUDOCODE:
   * Function deriveKey(password, salt):
   *   1. Convert password to UTF-8 bytes
   *   2. Import as PBKDF2 key
   *   3. Derive 256-bit key using:
   *      - Algorithm: PBKDF2, SHA-256
   *      - Iterations: 100,000
   *      - Salt: provided
   *   4. Return CryptoKey
   */
  async deriveKey(password, salt) {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: 'SHA-256',
        salt: salt,
        iterations: 100000
      },
      passwordKey,
      256 // 256 bits = 32 bytes
    );

    return crypto.subtle.importKey(
      'raw',
      derivedKey,
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }

  generateSalt(length = 32) {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  generateIV(length = 12) {
    return crypto.getRandomValues(new Uint8Array(length));
  }
}
```

---

### AuthService.js - ~60 lines

```javascript
/**
 * AuthService - JWT and user session management
 */
export class AuthService {

  static getToken() {
    return localStorage.getItem('auth_token');
  }

  static setToken(token) {
    localStorage.setItem('auth_token', token);

    // Set expiry: 7 days from now
    const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('auth_token_expiry', expiryTime.toString());
  }

  static clearToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expiry');
    localStorage.removeItem('current_user');
  }

  /**
   * Check if token is still valid
   *
   * PSEUDOCODE:
   * Function isTokenValid():
   *   1. Get token from localStorage
   *   2. If not exists, return false
   *   3. Get expiry timestamp
   *   4. If expiry < NOW(), return false (expired)
   *   5. Return true (valid)
   */
  static isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    const expiry = parseInt(localStorage.getItem('auth_token_expiry'));
    if (!expiry) return false;

    return Date.now() < expiry;
  }

  static isAuthenticated() {
    return this.isTokenValid() && !!this.getUser();
  }

  static getUser() {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  static setUser(userObject) {
    localStorage.setItem('current_user', JSON.stringify(userObject));
  }
}
```

---

## PART B: BACKEND CODE STRUCTURE

### server.js - ~50 lines

```javascript
/**
 * Express server initialization
 */
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import { verifyToken } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors({origin: 'http://localhost:5173'}));
app.use(express.json());
app.use(express.urlencoded({limit: '500mb'}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', verifyToken, fileRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: err.message});
});

app.listen(3001, () => console.log('Server on :3001'));
```

---

### authController.js - ~40 lines

```javascript
/**
 * Authentication controller
 * Handles login, logout, getCurrentUser
 */
import prisma from '../db/client.js';
import {hashPassword, comparePassword} from '../utils/password.js';
import {generateToken} from '../utils/jwt.js';

export async function login(req, res) {
  try {
    const {username, password} = req.body;

    // Find user in D1
    const user = await prisma.user.findUnique({
      where: {username}
    });

    if (!user) {
      return res.status(401).json({error: 'User not found'});
    }

    // Verify password
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({error: 'Invalid password'});
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username, user.role);

    // Log to D3 (Audit)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        status: 'SUCCESS'
      }
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}
```

---

### fileController.js - ~80 lines

```javascript
/**
 * File operations controller
 * Handles upload, download, delete, restore, search
 */
import prisma from '../db/client.js';
import fs from 'fs/promises';

export async function upload(req, res) {
  try {
    const {filename, isEncrypted} = req.body;
    const file = req.file;
    const userId = req.user.id;

    // Validate
    if (!file) return res.status(400).json({error: 'No file'});
    if (file.size > 500 * 1024 * 1024) {
      return res.status(413).json({error: 'File too large'});
    }

    // Save to disk
    const fileId = generateUUID();
    const filepath = `./uploads/${fileId}`;
    await fs.writeFile(filepath, file.buffer);

    // Record in D2 (Files DB)
    const fileRecord = await prisma.file.create({
      data: {
        id: fileId,
        userId,
        filename,
        file_size: file.size,
        file_type: file.mimetype,
        is_encrypted: isEncrypted === 'true',
        upload_date: new Date()
      }
    });

    // Log to D3 (Audit)
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'UPLOAD',
        resource_id: fileId,
        status: 'SUCCESS'
      }
    });

    res.json(fileRecord);

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export async function download(req, res) {
  try {
    const {id} = req.params;
    const userId = req.user.id;

    // Get file metadata from D2
    const file = await prisma.file.findUnique({
      where: {id}
    });

    if (!file || file.userId !== userId) {
      return res.status(404).json({error: 'Not found'});
    }

    // Stream file to client
    const filepath = `./uploads/${id}`;
    const data = await fs.readFile(filepath);

    // Log to D3
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DOWNLOAD',
        resource_id: id,
        status: 'SUCCESS'
      }
    });

    res.download(filepath, file.filename);

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}

export async function deleteFile(req, res) {
  try {
    const {id} = req.params;
    const userId = req.user.id;

    // Soft delete: set trash_date
    const updated = await prisma.file.update({
      where: {id},
      data: {trash_date: new Date()}
    });

    // Log to D3
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        resource_id: id,
        status: 'SUCCESS'
      }
    });

    res.json({success: true});

  } catch (error) {
    res.status(500).json({error: error.message});
  }
}
```

---

## PART C: DATABASE SCHEMA (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  username      String    @unique
  password_hash String
  email         String?
  role          String    @default("clerk")
  created_at    DateTime  @default(now())

  files         File[]
  auditLogs     AuditLog[]
}

model File {
  id              String    @id @default(cuid())
  userId          String
  filename        String
  file_size       Int
  file_type       String
  upload_date     DateTime  @default(now())
  is_encrypted    Boolean   @default(false)
  encryption_salt String?
  trash_date      DateTime?

  user            User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([trash_date])
}

model AuditLog {
  id            String    @id @default(cuid())
  userId        String
  action        String
  resource_id   String?
  timestamp     DateTime  @default(now())
  status        String
  ip_address    String?

  user          User      @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([action])
}
```

---

## CLASS HIERARCHY DIAGRAM

```
EventEmitter (base class for pub/sub)
  │
  ├─ App (orchestrator) *uses all*
  │
  ├─ FileService
  │   ├─ uses: CryptoService
  │   ├─ uses: StorageManager
  │   └─ uses: EventEmitter
  │
  ├─ CryptoService
  │   └─ uses: WebCrypto API
  │
  ├─ StorageManager
  │   └─ uses: localStorage, IndexedDB, FileSystem
  │
  ├─ UIRenderer
  │   ├─ uses: FileService
  │   ├─ uses: StorageManager
  │   └─ uses: EventEmitter
  │
  ├─ AuthService
  │   └─ uses: StorageManager
  │
  └─ NotificationService
      └─ uses: DOM APIs
```

---

## COMPLEXITY ANALYSIS

| Function | Time | Space | Key Operation |
|----------|------|-------|----------------|
| uploadFile | O(n) | O(n) | File read + encryption |
| downloadFile | O(n) | O(n) | File stream + decryption |
| encryptWithPassword | O(n) | O(n) | PBKDF2 + AES-GCM on file |
| deriveKey | O(1) | O(1) | PBKDF2 (fixed iterations) |
| deleteFile | O(1) | O(1) | Single DB UPDATE |
| searchFiles | O(log n) | O(k) | DB index + result set |
| login | O(1) | O(1) | Hash comparison |

---

**END OF PROGRAM LISTING**
