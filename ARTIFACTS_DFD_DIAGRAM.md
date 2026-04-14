# 1. DATA FLOW DIAGRAM (DFD)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Software Design Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Show data flows between external entities, processes, and data stores

---

## CONTEXT-LEVEL DFD (Level 0)

```
                         ┌─────────────────────────┐
                         │   ST. CLARE FILING      │
                         │      SYSTEM (P0)        │
          ┌──────────────┤  - Authentication       ├─────────────┐
          │              │  - File Management      │             │
          │              │  - Encryption/Decrypt   │             │
          │              │  - UI Dashboard         │             │
          │              └─────────────────────────┘             │
          │                                                       │
    ┌─────▼────────┐                                    ┌────────▼──────┐
    │   END USER   │                                    │  SYSTEM ADMIN │
    │  - Clerk     │                                    │  - IT Staff    │
    │  - Manager   │                                    │  - Dev Team    │
    └──────────────┘                                    └────────────────┘

Data Flows from Context:
- User Credentials → System (P0)
- Uploaded Files → System (P0)
- Encrypted Data ← System (P0)
- File List/Metadata ← System (P0)
- Download Request → System (P0)
- File Data ← System (P0)
```

**Description:**
The context diagram shows the filing system as a single process (P0) with two external entities:
- **END USERS** (Clerks, Managers): Upload files, download files, manage documents
- **SYSTEM ADMIN** (IT Staff): Monitor logs, manage users, maintain database

All data flows are bidirectional, representing requests and responses.

---

## LEVEL-1 EXPANDED DFD

Shows 6 main processes that break down P0:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    ST. CLARE FILING SYSTEM (P0)                         │
│                                                                         │
│  ┌──────────────────┐      ┌──────────────────┐      ┌──────────────┐ │
│  │   P1: USER       │◄────►│   P2: FILE       │◄────►│   P3: DATA   │ │
│  │  AUTHENTICATION  │      │   MANAGEMENT     │      │ ENCRYPTION   │ │
│  │                  │      │                  │      │              │ │
│  │ - Login User     │      │ - Upload File    │      │ - Encrypt    │ │
│  │ - Validate Token │      │ - List Files     │      │ - Decrypt    │ │
│  │ - Create Session │      │ - Download File  │      │ - Key Mgmt   │ │
│  └──────────────────┘      │ - Delete File    │      └──────────────┘ │
│         │                  │ - Move to Trash  │             │         │
│         │                  │ - Restore File   │             │         │
│         │                  └──────────────────┘             │         │
│         │                           │                       │         │
│         │       ┌───────────────────┼───────────────────┐   │         │
│         │       │                   │                   │   │         │
│         └──────►│   P4: LOGGING &   │◄──────────────────┘   │         │
│                 │   NOTIFICATIONS   │                       │         │
│         ┌──────►│                   │◄──────────────────────┘         │
│         │       │ - Log Events      │                                 │
│         │       │ - Show Toast Msgs │                                 │
│         │       │ - Track Actions   │                                 │
│         │       └─────────┬─────────┘                                 │
│         │                 │                                           │
│         │       ┌─────────▼─────────┐          ┌──────────────────┐   │
│         │       │   P5: STORAGE     │◄────────►│   P6: UI/UX      │   │
│         │       │   MANAGEMENT      │          │   RENDERING      │   │
│         │       │                   │          │                  │   │
│         └──────►│ - localStorage    │          │ - Show Login Pg  │   │
│                 │ - IndexedDB       │          │ - Show Dashboard │   │
│                 │ - File System     │          │ - Show File List │   │
│                 │ - Cache Data      │          │ - Show Modals    │   │
│                 └─────────┬─────────┘          └──────────────────┘   │
│                           │                            ▲               │
│                           └────────────────────────────┘               │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │              D1: USERS DATABASE (PostgreSQL)                   │   │
│  │  - user_id, username, password_hash, role, created_at         │   │
│  │  ◄────────────────────────────────────────────────────────────┤   │
│  │ (Accessed by: P1 Auth, P4 Logging)                            │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │             D2: FILES DATABASE (PostgreSQL)                    │   │
│  │  - file_id, filename, file_size, upload_date, user_id         │   │
│  │  - is_encrypted, trash_date, original_path                    │   │
│  │  ◄────────────────────────────────────────────────────────────┤   │
│  │ (Accessed by: P2 File Mgmt, P3 Encryption, P4 Logging)       │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │           D3: AUDIT LOGS (PostgreSQL)                          │   │
│  │  - log_id, user_id, action, timestamp, ip_address, status     │   │
│  │  ◄────────────────────────────────────────────────────────────┤   │
│  │ (Accessed by: P1, P2, P3, P4)                                 │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │         D4: ENCRYPTION KEYS (Secure Storage)                  │   │
│  │  - master_key, user_encrypted_keys, key_derivation_salt       │   │
│  │  ◄────────────────────────────────────────────────────────────┤   │
│  │ (Accessed by: P3 Encryption, P1 Auth)                         │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐   │
│  │        D5: SESSION CACHE (localStorage/Browser)               │   │
│  │  - auth_token, auth_token_expiry, current_user, theme_pref    │   │
│  │  ◄────────────────────────────────────────────────────────────┤   │
│  │ (Accessed by: P1 Auth, P6 UI/UX)                              │   │
│  └────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL ENTITIES                                 │
│                                                                          │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │   END USER      │     │  SYSTEM ADMIN   │     │  EMAIL SERVICE  │   │
│  │  (Clerk/Mgr)    │     │  (IT Staff)     │     │  (Notifications)│   │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘   │
│         │                        │                        ▲             │
│         │ - Login/Logout         │ - View Logs            │             │
│         │ - Upload Files         │ - Monitor System       │             │
│         │ - Download Files       │ - Manage Users         │             │
│         │ - View Dashboard       │                        │             │
│         │ - Search Files         │                  - Send Email        │
│         │ - Delete/Restore       │                    Alerts            │
│         │ - Get Notifications    │                                     │
│         └─────────────────────────────────────────────────────────────┘
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## PROCESS SPECIFICATIONS

### **P1: USER AUTHENTICATION**
**Purpose:** Validate user credentials and maintain session state

| Input | Processing | Output | Data Store |
|-------|-----------|--------|-----------|
| Username, Password | Hash password → Compare DB | JWT Token (7-day expiry) | D1: Users DB |
| Token | Verify signature & expiry | User Role, Permissions | D5: Cache |
| Login Request | Validate user exists | Auth Status (Success/Fail) | D3: Audit Logs |

**Inputs:**
- Username (string)
- Password (string, hashed with PBKDF2 100k iterations)

**Outputs:**
- JWT Token (HS256 signed, 7-day expiry)
- User Object (id, username, role)
- Error Message (if auth fails)

**Data Stores Used:**
- D1 (Users Database) - Read password_hash
- D3 (Audit Logs) - Write login attempt
- D5 (Session Cache) - Store token locally

---

### **P2: FILE MANAGEMENT**
**Purpose:** Handle file uploads, downloads, deletion, restoration

| Input | Processing | Output | Data Store |
|-------|-----------|--------|-----------|
| File Data | Validate type → Store → Index | File ID, Metadata | D2: Files DB |
| File ID | Retrieve from storage | File Content (binary) | D1, D2, D3 |
| File ID | Mark as deleted (soft delete) | Trash Entry | D2: Files DB |
| File ID | Restore from trash | File Restored | D3: Audit Logs |

**Inputs:**
- File object (multipart/form-data)
- File ID (UUID)
- User ID (from token)

**Outputs:**
- File metadata (id, filename, size, upload_date)
- File content (binary stream)
- Success/error status

**Data Stores Used:**
- D2 (Files Database) - CRUD operations
- D3 (Audit Logs) - Log all operations
- System file storage (OS filesystem)

---

### **P3: DATA ENCRYPTION/DECRYPTION**
**Purpose:** Encrypt/decrypt files using AES-GCM-256 with user passwords

| Input | Processing | Output | Data Store |
|-------|-----------|--------|-----------|
| File + Password | PBKDF2 derive key → AES-GCM encrypt | Encrypted Blob | D4: Keys |
| Encrypted File + Password | Derive key → AES-GCM decrypt | Plaintext File | D3: Audit |
| Password | Generate random salt → Derive key | Master Encryption Key | D4: Keys |

**Inputs:**
- File data (binary blob)
- User password (string)
- Encryption algorithm config

**Outputs:**
- Encrypted file blob (ciphertext + IV + salt)
- Decrypted file content
- Encryption status metadata

**Data Stores Used:**
- D4 (Encryption Keys) - Store derived keys
- D3 (Audit Logs) - Log encrypt/decrypt attempts

---

### **P4: LOGGING & NOTIFICATIONS**
**Purpose:** Track all system events and notify users

| Input | Processing | Output | Data Store |
|-------|-----------|--------|-----------|
| Event (login/upload/etc) | Create log entry | Audit Record | D3: Audit Logs |
| Success/Error | Format message | Browser Toast | None |
| Critical Event | Check Recipients | Email Alert | External Email |

**Inputs:**
- Event type (string: 'LOGIN', 'UPLOAD', 'DELETE', etc.)
- User context (user_id, ip_address)
- Event details (file_id, file_size, etc.)

**Outputs:**
- Audit log entry (persistent)
- Toast notification (UI)
- Email notification (external)

**Data Stores Used:**
- D3 (Audit Logs) - Write event records
- External: Email service

---

### **P5: STORAGE MANAGEMENT**
**Purpose:** Abstract file storage across multiple backends

| Input | Processing | Output | Data Store |
|-------|-----------|--------|-----------|
| File Data | Determine storage → Save | File Path/Key | OS FS, IndexedDB |
| File Key | Retrieve from storage | File Data | D5: Cache |
| Cache Data | Serialize → Compress | Stored Object | localStorage |

**Inputs:**
- File binary data
- Storage location preference
- Cache keys

**Outputs:**
- File path (OS filesystem)
- Storage key (IndexedDB/localStorage)
- Cache hit/miss status

**Data Stores Used:**
- D5 (Session Cache) - Store session data
- OS Filesystem - Store file uploads
- Browser storage - IndexedDB, localStorage

---

### **P6: UI/UX RENDERING**
**Purpose:** Display all UI pages and handle user interactions

| Input | Processing | Output | Data Store |
|-------|-----------|--------|-----------|
| Page Name | Load template → Inject data | HTML/CSS/JS | D5: Cache |
| User Data | Render navbar/sidebar | Personalized UI | None |
| File List | Create table → Add listeners | Clickable Grid | D2: Files DB |

**Inputs:**
- Page identifier (string)
- Data objects (user, files, settings)
- Browser events (click, drag-drop)

**Outputs:**
- Rendered HTML/CSS/JavaScript
- Interactive UI elements
- Event listener setup

**Data Stores Used:**
- D5 (Session Cache) - Load theme, user prefs
- D1, D2 - Display user/file data

---

## DATA STORE SPECIFICATIONS

### **D1: USERS DATABASE**
- **Technology:** PostgreSQL
- **Records:** ~100-1000 users expected
- **Fields:**
  - user_id (UUID, primary key)
  - username (unique string)
  - password_hash (bcrypt/PBKDF2)
  - email (unique)
  - role (enum: admin, manager, clerk)
  - created_at, updated_at
  - is_active (boolean)

### **D2: FILES DATABASE**
- **Technology:** PostgreSQL
- **Records:** ~10,000-100,000 files expected
- **Fields:**
  - file_id (UUID, primary key)
  - user_id (FK to D1)
  - filename (string)
  - file_size (integer)
  - file_type (MIME type)
  - upload_date (timestamp)
  - is_encrypted (boolean)
  - encryption_salt (if encrypted)
  - trash_date (NULL if not in trash)
  - original_path (string)

### **D3: AUDIT LOGS**
- **Technology:** PostgreSQL
- **Records:** ~100,000+ expected (write-heavy)
- **Fields:**
  - log_id (UUID)
  - user_id (FK to D1)
  - action (enum: LOGIN, LOGOUT, UPLOAD, DOWNLOAD, DELETE, RESTORE, ENCRYPT, DECRYPT)
  - resource_id (file_id or NULL)
  - timestamp (datetime)
  - status (SUCCESS, FAILURE)
  - ip_address (string)
  - error_details (JSON)

### **D4: ENCRYPTION KEYS**
- **Technology:** Secure Key Store (OS Keyring / .env encrypted)
- **Records:** 1 master key + per-user derived keys
- **Fields:**
  - master_key_id (string)
  - encrypted_master_key (AES-256-GCM encrypted)
  - user_key_derivations (PBKDF2 salt storage)
  - key_algorithm (AES-GCM-256)
  - key_version (int for key rotation)

### **D5: SESSION CACHE**
- **Technology:** Browser localStorage + IndexedDB
- **Records:** Per-browser (single user session)
- **Fields:**
  - auth_token (JWT string)
  - auth_token_expiry (timestamp)
  - current_user (JSON object)
  - theme_preference (light/dark)
  - last_sync (timestamp)
  - offline_queue (pending uploads)

---

## DATA FLOW SEQUENCES

### **Sequence 1: User Login Flow**
```
User → P1 (Auth)
  ├─ Validate credentials vs D1 (Users DB)
  ├─ Generate JWT token (7-day expiry)
  └─ Write audit log to D3
      └─ Return token to P6 (UI)
         └─ Store in D5 (Cache)
            └─ Redirect to Dashboard
```

### **Sequence 2: File Upload Flow**
```
User → P2 (File Mgmt)
  ├─ Validate file type/size
  └─ Check P3 (Encryption) needed
      └─ If encrypted: P3 encrypts file
         └─ Save encrypted blob to storage
      └─ If not encrypted: Save plaintext
         └─ Record metadata in D2 (Files DB)
            └─ Write to D3 (Audit Logs)
               └─ P4 (Logging) shows toast notification
                  └─ Return file_id to UI (P6)
```

### **Sequence 3: File Download Flow**
```
User → P2 (File Mgmt)
  ├─ Retrieve file metadata from D2
  ├─ Check if encrypted
  └─ If encrypted: P3 decrypts file
  └─ If plaintext: Stream directly
     └─ Log download to D3
        └─ P4 (Logging) tracks download
           └─ Return file blob to browser
              └─ P6 (UI) triggers download
```

### **Sequence 4: File Delete Flow (Soft Delete)**
```
User → P2 (File Mgmt)
  ├─ Mark file trash_date in D2
  └─ Create audit entry in D3
     └─ P4 notifies user (toast)
        └─ Hide file from active list in P6 (UI)
           └─ Show in Trash section instead
```

### **Sequence 5: File Restore Flow**
```
User → P2 (File Mgmt)
  ├─ Clear trash_date in D2
  └─ Create audit entry in D3
     └─ P4 notifies user
        └─ Move from Trash section to active list in P6 (UI)
```

---

## EXTERNAL INTERFACES

### **End User → System**
- HTTP POST `/api/auth/login` (credentials)
- HTTP POST `/api/files/upload` (multipart file data)
- HTTP GET `/api/files/download/:id` (file ID)
- HTTP DELETE `/api/files/:id` (file ID)
- WebSocket/Polling for real-time notifications

### **System → Email Service** (Future Enhancement)
- SMTP POST to send password reset emails
- Send upload success/failure notifications
- Send audit alerts to admin

### **System ↔ Database**
- Prisma ORM queries to PostgreSQL
- Connection pooling with 20 concurrent connections

---

## VALIDATION & CONSTRAINTS

### **Data Validation Rules**
- Username: 3-20 alphanumeric characters
- Password: Min 8 chars, 1 upper, 1 lower, 1 number, 1 special
- File upload: Max 500MB per file, max 2GB per user
- Allowed file types: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, TXT

### **Security Constraints**
- All passwords hashed with PBKDF2 (100k iterations)
- JWT tokens expire after 7 days
- Encryption uses AES-GCM-256 with unique salt per file
- All file operations logged with user ID + timestamp
- Soft delete ensures data recovery within 30 days

### **Performance Constraints**
- File upload: Async, show progress bar
- File list rendering: Pagination (20 items per page)
- Audit logs: Indexed on user_id, timestamp, status
- Cache: LRU eviction after 100MB or 7 days

---

## SUMMARY TABLE

| Process | Input | Output | Stores | Users |
|---------|-------|--------|--------|-------|
| P1 Auth | Credentials | JWT Token | D1, D3, D5 | All |
| P2 Files | File/ID | Metadata | D2, D3 | All |
| P3 Crypto | File+Pwd | Encrypted/Plain | D4, D3 | Optional |
| P4 Logging | Event | Log Entry | D3 | System |
| P5 Storage | File Data | Path/Key | D5, FS | System |
| P6 UI | Page Name | HTML/CSS/JS | D5, All | All |

---

## ASSUMPTIONS & NOTES

1. **Offline-First Design:** D5 (Session Cache) allows offline file access
2. **Soft Deletes:** D2 records never permanently deleted (30-day trash)
3. **Encryption Optional:** User can choose plaintext or AES-GCM encryption per file
4. **Synchronous API:** Current design uses synchronous REST API (future: WebSocket)
5. **Single Server:** DFD assumes single-server deployment (future: distributed)
6. **No Real-Time Sync:** P6 requires refresh to show updates (future: Server-Sent Events)

---

**END OF DFD DOCUMENT**
