# 3. VTOC DIAGRAM (Visual Table of Contents / Module Hierarchy)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Software Design Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Show hierarchical relationships between all software modules and components

---

## HIERARCHICAL VTOC DIAGRAM (3-Level Structure)

```
┌────────────────────────────────────────────────────────────────────┐
│                   ST. CLARE FILING SYSTEM                          │
│                    APPLICATION (ROOT)                              │
│              [Monolithic JavaScript App + Node.js Server]          │
└────────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
    │  FRONTEND    │    │  BACKEND     │    │  DATABASE    │
    │ (Browser)    │    │ (Node.js)    │    │(PostgreSQL)  │
    │              │    │              │    │              │
    │  Vite @ :5173│    │Express @ 3001│    │  Prisma ORM  │
    └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
           │                   │                   │
           ▼                   ▼                   ▼
    ┌────────────────────────────┐┌────────────┐┌─────────────┐
    │ 6 Main Modules             ││3 Main      ││  5 Tables   │
    │ (browser-side)             ││Routes      ││ (schema)    │
    ├────────────────────────────┤├────────────┤├─────────────┤
    │  1. App (orchestrator)     ││ Auth       ││ - users     │
    │  2. AuthService            ││ Files      ││ - files     │
    │  3. FileService            ││ Admin      ││ - audit_logs│
    │  4. CryptoService          │└────────────┤- enc_keys   │
    │  5. StorageManager         │             ├ sessions    │
    │  6. UIRenderer             │             └─────────────┘
    └────────────────────────────┘
```

---

## LEVEL 2: FRONTEND MODULE BREAKDOWN

```
┌──────────────────────────────────────────────────────────────────┐
│              FRONTEND (JavaScript Application)                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 1: ENTRY POINT & ORCHESTRATION                   │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  src/js/modules/core/App.js                             │  │
│  │  ├─ Initializes all services                            │  │
│  │  ├─ Manages app lifecycle (init, cleanup)               │  │
│  │  ├─ Coordinates inter-service communication             │  │
│  │  └─ Error handling & recovery                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│           │                                                      │
│           ├────────────┬────────────┬────────────┬────────────┤
│           │            │            │            │            │
│           ▼            ▼            ▼            ▼            ▼
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─── ... ─┐
│  │  LAYER 2A   │ │  LAYER 2B    │ │  LAYER 2C   │ │(more)   │
│  │  Storage    │ │  Crypto      │ │  Files      │ │         │
│  │  Management │ │  Service     │ │  Service    │ │         │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─── ... ─┘
│        │                │                │
│  ┌─────────────┐  ┌────────────┐  ┌────────────┐
│  │localStorage │  │ Web Crypto │  │HTTP Client │
│  │IndexedDB    │  │  API (AES) │  │ (fetch)    │
│  │File System  │  │ PBKDF2     │  │            │
│  └─────────────┘  └────────────┘  └────────────┘
│
│  ┌──────────────────────────────────────────────────────────┐
│  │  LAYER 3: AUTHENTICATION & AUTHORIZATION                │
│  ├──────────────────────────────────────────────────────────┤
│  │  src/js/auth/AuthService.js                             │
│  │  ├─ JWT token management                                │
│  │  ├─ User session state                                  │
│  │  ├─ Token expiry verification                           │
│  │  └─ Login/logout coordination                           │
│  │                                                          │
│  │  src/js/auth/authGuard.js                               │
│  │  ├─ Protect routes (require authentication)             │
│  │  ├─ Redirect unauthorized users                         │
│  │  └─ Navbar/profile UI setup                             │
│  └──────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────┐
│  │  LAYER 4: USER INTERFACE & RENDERING                    │
│  ├──────────────────────────────────────────────────────────┤
│  │  src/js/modules/ui/UIRenderer.js                        │
│  │  ├─ Page switching (login/dashboard/trash/etc)          │
│  │  ├─ File list rendering                                 │
│  │  ├─ Modal dialogs (file details, encryption)            │
│  │  ├─ File search & filtering                             │
│  │  ├─ Theme switching (light/dark)                        │
│  │  └─ Drag-drop zone setup                                │
│  │                                                          │
│  │  index.html / login.html (DOM Structure)                │
│  │  ├─ Navbar (user profile, logout)                       │
│  │  ├─ Sidebar (navigation menu)                           │
│  │  ├─ Main content area (dynamic pages)                   │
│  │  ├─ Modals (file details, encryption)                   │
│  │  └─ Toast notifications container                       │
│  │                                                          │
│  │  src/css/style.css (Styling)                            │
│  │  ├─ Layout & grid system                                │
│  │  ├─ Component styles                                    │
│  │  ├─ Responsive design                                   │
│  │  └─ Light/dark theme variables                          │
│  └──────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────┐
│  │  LAYER 5: UTILITIES & INFRASTRUCTURE                    │
│  ├──────────────────────────────────────────────────────────┤
│  │  src/js/modules/utils/config.js                         │
│  │  ├─ Application constants                               │
│  │  ├─ Database connection URLs                            │
│  │  ├─ Encryption algorithm parameters                     │
│  │  └─ UI configuration                                    │
│  │                                                          │
│  │  src/js/modules/utils/logger.js                         │
│  │  ├─ Console logging (dev/prod)                          │
│  │  ├─ Error tracking                                      │
│  │  └─ Performance metrics                                 │
│  │                                                          │
│  │  src/js/modules/core/EventEmitter.js                    │
│  │  ├─ Pub/Sub communication between services              │
│  │  ├─ Decoupled event handling                            │
│  │  └─ Custom event system                                 │
│  │                                                          │
│  │  src/js/init/compatibility.js                           │
│  │  ├─ Global window.* API exposure                        │
│  │  ├─ HTML event handler bindings                         │
│  │  └─ Backward compatibility layer                        │
│  └──────────────────────────────────────────────────────────┘
└──────────────────────────────────────────────────────────────────┘
```

---

## LEVEL 2: BACKEND MODULE BREAKDOWN

```
┌──────────────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express Server)                  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 1: APPLICATION ENTRY POINT                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  backend/src/server.js                                  │  │
│  │  ├─ Express app initialization                          │  │
│  │  ├─ Middleware setup (CORS, body parser, auth)          │  │
│  │  ├─ Route registration                                  │  │
│  │  ├─ Error handling                                      │  │
│  │  └─ Server listening on port 3001                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 2: ROUTING & CONTROLLERS                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                          │  │
│  │  backend/src/routes/authRoutes.js                       │  │
│  │  ├─ POST /api/auth/login (username, password)           │  │
│  │  ├─ POST /api/auth/logout                               │  │
│  │  ├─ GET /api/auth/me (current user)                     │  │
│  │  └─ POST /api/auth/refresh-token                        │  │
│  │                                                          │  │
│  │  backend/src/routes/fileRoutes.js                       │  │
│  │  ├─ POST /api/files/upload (multipart)                  │  │
│  │  ├─ GET /api/files (list)                               │  │
│  │  ├─ GET /api/files/:id (download)                       │  │
│  │  ├─ DELETE /api/files/:id (soft delete)                 │  │
│  │  ├─ POST /api/files/:id/restore (from trash)            │  │
│  │  └─ DELETE /api/files/:id/permanent (hard delete)       │  │
│  │                                                          │  │
│  │  backend/src/controllers/authController.js              │  │
│  │  ├─ login(req, res)                                     │  │
│  │  ├─ logout(req, res)                                    │  │
│  │  └─ getCurrentUser(req, res)                            │  │
│  │                                                          │  │
│  │  backend/src/controllers/fileController.js              │  │
│  │  ├─ upload(req, res)                                    │  │
│  │  ├─ list(req, res)                                      │  │
│  │  ├─ download(req, res)                                  │  │
│  │  ├─ delete(req, res)                                    │  │
│  │  ├─ restore(req, res)                                   │  │
│  │  └─ search(req, res)                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 3: MIDDLEWARE & SECURITY                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  backend/src/middleware/auth.js                         │  │
│  │  ├─ verifyToken(req, res, next)                         │  │
│  │  ├─ Check Authorization header                          │  │
│  │  ├─ Validate JWT signature & expiry                     │  │
│  │  ├─ Attach user to req.user                             │  │
│  │  └─ Return 401 if invalid                               │  │
│  │                                                          │  │
│  │  CORS Middleware                                        │  │
│  │  └─ Allow localhost:5173 (frontend dev server)          │  │
│  │                                                          │  │
│  │  Error Handler Middleware                               │  │
│  │  └─ Catch errors, return JSON responses                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 4: UTILITIES & HELPERS                            │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  backend/src/utils/jwt.js                               │  │
│  │  ├─ generateToken(userId, username, role)               │  │
│  │  ├─ verifyToken(token)                                  │  │
│  │  └─ Constants: algorithm, secret, expiry                │  │
│  │                                                          │  │
│  │  backend/src/utils/password.js                          │  │
│  │  ├─ hashPassword(password) -> PBKDF2 hash               │  │
│  │  ├─ comparePassword(pwd, hash) -> boolean               │  │
│  │  └─ Constants: iterations (100k), salt length (32)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LAYER 5: DATABASE & ORM                                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  backend/prisma/schema.prisma                           │  │
│  │  ├─ User model                                          │  │
│  │  ├─ File model                                          │  │
│  │  ├─ AuditLog model                                      │  │
│  │  ├─ EncryptionKey model                                 │  │
│  │  └─ Session model                                       │  │
│  │                                                          │  │
│  │  Prisma Client (ORM)                                    │  │
│  │  ├─ Database connection                                 │  │
│  │  ├─ Query builder                                       │  │
│  │  ├─ Migrations runner                                   │  │
│  │  └─ Schema validation                                   │  │
│  │                                                          │  │
│  │  PostgeSQL Database                                     │  │
│  │  ├─ Tables (5): users, files, audit_logs, enc_keys, ... │  │
│  │  ├─ Indexes on: user_id, file_id, timestamps            │  │
│  │  └─ Constraints: FK, NOT NULL, UNIQUE                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## DEPENDENCY MATRIX

Shows which modules depend on which:

```
┌──────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┐
│ Module               │ App  │ Auth │File  │Crypto│Store │UI    │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ App (Orchestrator)   │  -   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ AuthService          │      │  -   │      │      │  ✓   │      │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ FileService          │      │  ✓   │  -   │  ✓   │  ✓   │      │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ CryptoService        │      │      │      │  -   │      │      │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ StorageManager       │      │      │  ✓   │      │  -   │      │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ UIRenderer (UI)      │      │      │  ✓   │      │  ✓   │  -   │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ EventEmitter (Util)  │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
├──────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┤
│ Logger (Util)        │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │  ✓   │
└──────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┘

Legend:
  ✓ = Module X depends on Module Y
  - = Self reference (not applicable)
  Empty = No dependency
```

---

## DETAILED MODULE SPECIFICATIONS

### **LEVEL 1: APP.js (Root Orchestrator)**

**File Path:** `src/js/modules/core/App.js`

**Responsibilities:**
1. Initialize all child services
2. Coordinate inter-service communication
3. Manage application lifecycle
4. Handle global error recovery

**Constructor:**
```javascript
constructor() {
  this.services = {
    storageManager: new StorageManager(),
    cryptoService: new CryptoService(),
    fileService: new FileService(),
    notificationService: new NotificationService(),
    uiRenderer: new UIRenderer()
  };
  this.eventEmitter = new EventEmitter();
}
```

**Key Methods:**
- `init()` - Boot sequence
- `setupServiceCommunication()` - Register event listeners
- `shutdown()` - Cleanup on logout

**Dependencies:**
- Imports 5 service classes
- Uses EventEmitter for pub/sub
- Uses Logger for debugging

---

### **LEVEL 2A: StorageManager.js**

**File Path:** `src/js/modules/services/StorageManager.js`

**Responsibilities:**
1. Abstract file storage across backends
2. Manage localStorage for session data
3. Manage IndexedDB for cached files
4. Detect and use available APIs

**Public Methods:**
- `saveToLocalStorage(key, value)` → void
- `getFromLocalStorage(key)` → value
- `saveToIndexedDB(key, file)` → Promise
- `getFromIndexedDB(key)` → Promise<file>
- `saveToFileSystem(filename, blob)` → Promise
- `getFromFileSystem(filename)` → Promise<blob>

**Data Structures:**
```javascript
// D5: Session Cache Structure
{
  auth_token: "eyJhbGciOiJIUzI1NiIs...",
  auth_token_expiry: 1712500958000,
  current_user: {
    id: "cmnj...",
    username: "admin",
    role: "admin"
  },
  theme_preference: "light",
  cache: {
    fileList: [...],
    userPrefs: {...}
  }
}
```

**Dependencies:**
- Web Storage API (localStorage)
- IndexedDB API
- File System API

---

### **LEVEL 2B: CryptoService.js**

**File Path:** `src/js/modules/services/CryptoService.js`

**Responsibilities:**
1. Encrypt files with AES-GCM-256
2. Decrypt encrypted files
3. Derive keys using PBKDF2
4. Manage encryption metadata

**Public Methods:**
```javascript
encryptWithPassword(fileBlob, password, salt)
  → Promise<{
    ciphertext: ArrayBuffer,
    iv: Uint8Array,
    salt: Uint8Array,
    algorithm: "AES-GCM"
  }>

decryptWithPassword(encryptedBlob, password, salt, iv)
  → Promise<decryptedBlob>

deriveKeyFromPassword(password, salt)
  → Promise<CryptoKey>

generateSalt()
  → Uint8Array(32)
```

**Algorithm Constants:**
```javascript
{
  algorithm: "AES-GCM",
  keyLength: 256, // bits
  ivLength: 12,   // bytes
  saltLength: 32, // bytes
  tagLength: 128, // bits
  pbkdf2: {
    name: "PBKDF2",
    hash: "SHA-256",
    iterations: 100000,
    saltLength: 32
  }
}
```

**Dependencies:**
- WebCrypto API (native browser)
- No external crypto libraries

---

### **LEVEL 2C: FileService.js**

**File Path:** `src/js/modules/services/FileService.js`

**Responsibilities:**
1. Upload files to backend
2. Download files from backend
3. Delete files (soft delete)
4. Restore from trash
5. Search/filter files
6. Get file metadata

**Public Methods:**
```javascript
uploadFile(file, encryptionRequired)
  → Promise<{id, filename, size, uploadDate}>

downloadFile(fileId, decryptionPassword?)
  → Promise<Blob>

deleteFile(fileId) // Soft delete (trash)
  → Promise<{status: "success"}>

restoreFromTrash(fileId)
  → Promise<{status: "success"}>

listFiles(filters?)
  → Promise<FileMetadata[]>

searchFiles(query, filters)
  → Promise<FileMetadata[]>

permanentlyDelete(fileId) // Hard delete
  → Promise<{status: "success"}>
```

**API Endpoints Called:**
```
POST /api/files/upload
GET /api/files
GET /api/files/:id
DELETE /api/files/:id
POST /api/files/:id/restore
DELETE /api/files/:id/permanent
GET /api/files/search?q=...
```

**Dependencies:**
- Communicates with Backend API
- Uses CryptoService for encryption
- Uses StorageManager for caching
- Uses NotificationService for feedback

---

### **LEVEL 3A: AuthService.js**

**File Path:** `src/js/auth/AuthService.js`

**Responsibilities:**
1. Manage JWT tokens
2. Store/retrieve user profile
3. Validate token expiry
4. Check authentication status

**Public Methods:**
```javascript
// Token Management
getToken() → string | null

setToken(token) → void

clearToken() → void

isTokenValid() → boolean

isAuthenticated() → boolean

// User Management
getUser() → {id, username, role} | null

setUser(userObject) → void

getCurrentUserId() → string | null
```

**Data Structure (localStorage):**
```javascript
{
  auth_token: "JWT_STRING",
  auth_token_expiry: 1712500958000, // milliseconds
  current_user: {
    id: "user_uuid",
    username: "admin",
    role: "admin"
  }
}
```

**Dependencies:**
- StorageManager (for localStorage)
- JWT decoding (extract expiry)

---

### **LEVEL 3B: authGuard.js**

**File Path:** `src/js/auth/authGuard.js`

**Responsibilities:**
1. Protect index.html from unauthorized access
2. Redirect unauthenticated users to login
3. Setup logout button handlers
4. Display user profile in navbar

**Initialization:**
```javascript
// Runs on page load (DOMContentLoaded)
window.addEventListener('DOMContentLoaded', () => {
  authGuard.initAuthGuard();
  authGuard.setupLogout();
  authGuard.updateUserUI();
});
```

**Functions:**
```javascript
initAuthGuard()
  // Check AuthService.isAuthenticated()
  // If false: window.location.replace('/login.html')
  // If true: Allow page load

logout()
  // Clear token: AuthService.clearToken()
  // Redirect: window.location.replace('/login.html')

updateUserUI()
  // Get user from AuthService.getUser()
  // Display in navbar (username, role badge)

setupLogout()
  // Find '.logout-action' button
  // Attach click handler to logout()
```

**Dependencies:**
- AuthService (check auth status)
- Event listeners (DOM interaction)

---

### **LEVEL 4: UIRenderer.js**

**File Path:** `src/js/modules/ui/UIRenderer.js`

**Responsibilities:**
1. Render all UI pages
2. Update file lists
3. Show modals & dialogs
4. Handle page navigation
5. Theme switching
6. Drag-drop setup

**Public Methods:**
```javascript
// Navigation
switchPage(pageName)
  // pageName: 'dashboard' | 'trash' | 'settings'

// File List Rendering
updateFilesList(files)

renderFileTable(files)

addFileToTable(file)

removeFileFromTable(fileId)

// Modals
showFileDetailsModal(fileId)

showEncryptionModal(fileId)

closeModal()

// Dashboard Stats
updateDashboardStats()

// Theme
toggleTheme()

// Drag-drop
setupDragDropZone()
```

**Page Templates:**
```javascript
pages = {
  dashboard: () => {...},    // File list, stats
  trash: () => {...},        // Deleted files
  settings: () => {...},     // User settings
  search: () => {...}        // Search results
}
```

**Dependencies:**
- DOM elements (HTML)
- CSS styles
- FileService (get file data)
- CryptoService (encrypt modal)
- StorageManager (theme preference)

---

### **LEVEL 5: Utilities**

#### **config.js**
```javascript
export const API_BASE_URL = 'http://localhost:3001/api';
export const JWT_EXPIRY_DAYS = 7;
export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  // ... etc
];
export const ENCRYPTION_CONFIG = {
  algorithm: 'AES-GCM',
  keyLength: 256,
  iterations: 100000
};
```

#### **logger.js**
```javascript
export const createLogger = (moduleName) => ({
  log: (msg) => console.log(`[${moduleName}] ${msg}`),
  error: (msg) => console.error(`[${moduleName}] ERROR: ${msg}`),
  warn: (msg) => console.warn(`[${moduleName}] WARN: ${msg}`),
  debug: (msg) => {
    if (process.env.DEBUG) console.debug(msg);
  }
});
```

#### **EventEmitter.js**
```javascript
export class EventEmitter {
  on(eventName, callback) {...}
  off(eventName, callback) {...}
  emit(eventName, data) {...}
}
```

#### **compatibility.js**
```javascript
// Global window.* API for HTML event handlers
window.switchPage = (pageName) => app.uiRenderer.switchPage(pageName);
window.downloadFile = (fileId) => app.fileService.downloadFile(fileId);
window.deleteFile = (fileId) => app.fileService.deleteFile(fileId);
// ... etc
```

---

## BACKEND MODULES (Summary)

### **server.js**
- Express app setup
- Middleware registration
- Route mounting
- Error handlers

### **authController.js**
- login(): Query D1, hash password, generate JWT
- logout(): Clear session
- getCurrentUser(): Return req.user from auth middleware

### **fileController.js**
- upload(): Multipart parsing, file system save, D2 insert
- list(): D2 query, pagination, return metadata
- download(): D2 query, stream file, DELETE on trash
- delete(): D2 soft delete (update trash_date)
- restore(): Clear trash_date
- search(): D2 LIKE query with filters

### **auth.js (Middleware)**
- Extract Authorization header
- Verify JWT (signature + expiry)
- Attach user to req.user
- Return 401 if invalid

### **password.js**
- hashPassword(): PBKDF2 hash
- comparePassword(): Constant-time comparison

### **jwt.js**
- generateToken(): HS256 signed token
- verifyToken(): Verify signature + expiry

---

## COMMUNICATION PATTERNS

### **Frontend Inter-Service Communication**

```
┌────────────┐  emit()  ┌──────────────────┐
│FileService├────────→ │   EventEmitter   │
└────────────┘  on()    └────────┬─────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
            ┌──────────────┐        ┌──────────────┐
            │UIRenderer    │        │NotifyService │
            └──────────────┘        └──────────────┘
```

### **Frontend to Backend Communication**

```
FileService.uploadFile()
  │
  └─► fetch(POST /api/files/upload)
      ├─ Headers: Authorization: Bearer <token>
      ├─ Body: FormData (multipart)
      │
      └─► Backend fileController.upload()
         ├─ auth.js verifies JWT
         ├─ Save to disk
         ├─ Insert to D2
         │
         └─► Response: {file_id, filename, size}
            │
            └─► UIRenderer.updateFilesList()
```

---

## SUMMARY

| Layer | Module | Type | Purpose |
|-------|--------|------|---------|
| 1 | App.js | Orchestrator | Bootstrap all services |
| 2A | StorageManager | Service | Abstract storage backends |
| 2B | CryptoService | Service | AES-GCM encryption/decryption |
| 2C | FileService | Service | Upload/download/delete files |
| 3A | AuthService | Auth | Token & user management |
| 3B | authGuard.js | Auth | Protect routes, logout |
| 4 | UIRenderer | UI | Render pages & modals |
| 5 | config.js | Util | Constants |
| 5 | logger.js | Util | Logging |
| 5 | EventEmitter.js | Util | Pub/Sub pattern |
| 5 | compatibility.js | Util | Global API |

---

**END OF VTOC DOCUMENT**
