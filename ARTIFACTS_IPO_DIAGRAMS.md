# 4. IPO DIAGRAMS (Input-Process-Output)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Software Design Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Detailed Input-Process-Output specifications for all major system functions

---

## IPO DIAGRAM TEMPLATE

```
┌─────────────────────────────────────────────────────────────┐
│                    FUNCTION: [Name]                         │
│              Module: [Module.js]                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐                ┌──────────────────┐  │
│  │     INPUT        │   PROCESS      │     OUTPUT       │  │
│  │                  │  ───────→      │                  │  │
│  │  • Parameter 1   │                │  • Return 1      │  │
│  │  • Parameter 2   │  1. Step 1     │  • Return 2      │  │
│  │  • Parameter N   │  2. Step 2     │  • Side Effects  │  │
│  │                  │  3. Step N     │  • Errors        │  │
│  │                  │                │                  │  │
│  │  Data Type: [T]  │                │  Data Type: [T]  │  │
│  │  Validation: [V] │                │  Validation: [V] │  │
│  └──────────────────┘                └──────────────────┘  │
│                                                             │
│  Dependencies: [List of modules called]                    │
│  Error Handling: [Error paths]                             │
│  Performance: [Time/Space complexity]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## IPO #1: USER LOGIN

**Function:** `AuthService.login(username, password)`
**Module:** `src/js/auth/AuthService.js`
**Called From:** `login.html` form submission

```
┌────────────────────────────────────────────────────────┐
│                   USER LOGIN (P1)                      │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌─────────┐ ┌────────────┐ │
│  │      INPUT          │  │PROCESS  │ │   OUTPUT   │ │
│  │                     │  │         │ │            │ │
│  │  • username: string │  │         │ │• token:    │ │
│  │    "admin"          │  │ 1.Fetch │ │  "eyJhbG"  │ │
│  │                     │  │  /login │ │            │ │
│  │  • password: string │  │  endpoint
 │  │• user: {          │ │
│  │    "mypassword"    │  │ 2.Hash   │ │  id: "...",│ │
│  │                     │  │  check   │ │  username, │ │
│  │  Data Type:        │  │  vs DB   │ │  role      │ │
│  │    {username, pwd} │  │          │ │            │ │
│  │                     │  │ 3.Create │ │• expiry:   │ │
│  │  Validation:        │  │  JWT     │ │  1712...   │ │
│  │    ✓ Not empty      │  │  (7 days)│ │            │ │
│  │    ✓ Pwd 8+ chars   │  │          │ │• error:    │ │
│  │    ✓ Format OK      │  │ 4.Log    │ │  null      │ │
│  │                     │  │  auth    │ │  (or err   │ │
│  │                     │  │  event   │ │  msg)      │ │
│  │                     │  │          │ │            │ │
│  │                     │  │ 5.Return │ │Data Type:  │ │
│  │                     │  │  to UI   │ │  {         │ │
│  │                     │  │          │ │    token,  │ │
│  │                     │  │          │ │    user,   │ │
│  │                     │  │          │ │    expiry, │ │
│  │                     │  │          │ │    error   │ │
│  │                     │  │          │ │  }         │ │
│  │                     │  │          │ │            │ │
│  └─────────────────────┘  └─────────┘ └────────────┘ │
│                                                        │
│ Dependencies:                                          │
│  • Backend: POST /api/auth/login                      │
│  • Database: D1 (Users table)                          │
│  • Utility: jwt.js (generateToken)                    │
│                                                        │
│ Error Handling:                                        │
│  ✗ Invalid input → Show "Invalid credentials"         │
│  ✗ User not found → Show "User does not exist"        │
│  ✗ Wrong password → Show "Incorrect password"         │
│  ✗ Network error → Show "Cannot connect to server"    │
│  ✗ Server error → Show "Login failed. Try again"      │
│                                                        │
│ Performance:                                           │
│  • Password hashing: ~300-500ms (PBKDF2 100k iter)   │
│  • Database query: ~10ms (indexed username)           │
│  • JWT generation: ~5ms                               │
│  • Total: ~320-520ms                                  │
│                                                        │
│ Side Effects:                                          │
│  • Write to D3 (Audit Logs) - "LOGIN" action          │
│  • Update D5 (Session Cache) - auth_token, user       │
│  • Redirect browser to /index.html                    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #2: FILE UPLOAD

**Function:** `FileService.uploadFile(file, encryptionRequired)`
**Module:** `src/js/modules/services/FileService.js`
**Called From:** Upload button in dashboard

```
┌────────────────────────────────────────────────────────┐
│              FILE UPLOAD (P2 + P3)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • file: Blob       │  │ 1.Validate
 │  │• fileId:    │  │
│  │    (binary)         │  │  type &  │ │  UUID str │  │
│  │    name:"report.pdf"│  │  size    │ │           │  │
│  │    size:1500000     │  │          │ │• filename:│  │
│  │    type:"app/pdf"   │  │ 2.Encrypt│ │  string   │  │
│  │                     │  │  if req'd│ │           │  │
│  │  • encrypt: boolean │  │  (call   │ │• size:    │  │
│  │    true/false       │  │  P3)     │ │  integer  │  │
│  │                     │  │          │ │           │  │
│  │  • password:string  │  │ 3.Create │ │• mimeType:│  │
│  │    (if encrypted)   │  │  FormData│ │  string   │  │
│  │    "mypassword"     │  │  object  │ │           │  │
│  │                     │  │          │ │• uploadDate
 │  │
│  │  Data Type:         │  │ 4.POST   │ │  timestamp│  │
│  │    {                │  │  /upload │ │           │  │
│  │      file: Blob,    │  │  endpoint│ │• isEncrypt
 │  │
│  │      encrypt: bool, │  │          │ │  boolean  │  │
│  │      password: str  │  │ 5.Receive│ │           │  │
│  │    }                │  │  response│ │Data Type: │  │
│  │                     │  │          │ │  {        │  │
│  │  Validation:        │  │ 6.Write  │ │   handle  │  │
│  │    ✓ File exists    │  │  D3 log  │ │   fileId, │  │
│  │    ✓ Type allowed   │  │ (UPLOAD) │ │   name,   │  │
│  │    ✓ Size < 500MB   │  │          │ │   size,   │  │
│  │    ✓ Quota OK       │  │ 7.Return │ │   date,   │  │
│  │    ✓ Pwd 8+ chars   │  │  to UI   │ │   mime,   │  │
│  │      (if encrypt)   │  │          │ │   error   │  │
│  │                     │  │          │ │  }        │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • CryptoService.encryptWithPassword() (if encrypt)   │
│  • Backend: POST /api/files/upload                    │
│  • Database: D2 (Files table), D3 (Audit Logs)        │
│  • Storage: File system or cloud storage              │
│                                                        │
│ Error Handling:                                        │
│  ✗ Invalid file type → "Unsupported file type"        │
│  ✗ File too large → "File exceeds 500MB limit"        │
│  ✗ Quota exceeded → "Storage quota exceeded"          │
│  ✗ Encryption failed → "Encryption error. Try again"  │
│  ✗ Upload failed → "Upload failed. Retry?"            │
│  ✗ Network error → "Network connection lost"          │
│                                                        │
│ Performance:                                           │
│  • File read (FileReader): 100-500ms (for 100MB)      │
│  • Encryption (AES-GCM): 1-2 seconds (for 100MB)      │
│  • Upload (network): 5-30 seconds (depends on ISP)    │
│  • Backend save: 2-5 seconds (I/O dependent)          │
│  • DB insert: ~100ms                                  │
│  • Audit log: ~50ms                                   │
│  • Total: 8-40 seconds (varies by file size, network) │
│                                                        │
│ Side Effects:                                          │
│  • Save file to disk/cloud                            │
│  • Insert record into D2 (Files DB)                   │
│  • Write audit log to D3                              │
│  • Update file list UI (P6)                           │
│  • Show progress bar during upload                    │
│  • Show success toast notification (P4)               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #3: FILE DOWNLOAD/DECRYPT

**Function:** `FileService.downloadFile(fileId, decryptPassword?)`
**Module:** `src/js/modules/services/FileService.js`
**Called From:** Download button on file

```
┌────────────────────────────────────────────────────────┐
│          FILE DOWNLOAD / DECRYPT (P2 + P3)            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • fileId: string   │  │ 1.Query  │ │• blob:    │  │
│  │    UUID "abcd1234"  │  │  D2 for  │ │  Blob obj │  │
│  │                     │  │  metadata│ │           │  │
│  │  • decryptPassword: │  │  (check  │ │• filename:│  │
│  │    string (opt)     │  │  perms)  │ │  string   │  │
│  │    "mypassword"     │  │          │ │           │  │
│  │    or null          │  │ 2.Fetch  │ │• success: │  │
│  │                     │  │  file    │ │  boolean  │  │
│  │  Data Type:         │  │  from    │ │           │  │
│  │    {                │  │  storage │ │Data Type: │  │
│  │      fileId: str,   │  │          │ │  {        │  │
│  │      password: str  │  │ 3.If     │ │   blob,   │  │
│  │    }                │  │  encrypted
 │  │   filename,│  │
│  │                     │  │  decrypt │ │   success,│  │
│  │  Validation:        │  │  (call   │ │   error   │  │
│  │    ✓ File exists    │  │  P3)     │ │  }        │  │
│  │    ✓ User owns it   │  │          │ │           │  │
│  │    ✓ File not trash │  │ 4.Create │ │Data Type: │  │
│  │    ✓ Pwd (if enc)   │  │  download│ │  Blob     │  │
│  │                     │  │  link    │ │           │  │
│  │                     │  │  (blob   │ │           │  │
│  │                     │  │  URL)    │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 5.Trigger│ │           │  │
│  │                     │  │  browser │ │           │  │
│  │                     │  │  download│ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 6.Log    │ │           │  │
│  │                     │  │  to D3   │ │           │  │
│  │                     │  │ (DOWNLOD)            │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 7.Clean  │ │           │  │
│  │                     │  │  up blob │ │           │  │
│  │                     │  │  URL     │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • CryptoService.decryptWithPassword() (if encrypted) │
│  • Backend: GET /api/files/:id                        │
│  • Database: D2 (Files table), D3 (Audit)             │
│  • Storage: File system                               │
│                                                        │
│ Error Handling:                                        │
│  ✗ File not found → "File does not exist"             │
│  ✗ File in trash → "File is in trash"                 │
│  ✗ No permission → "You don't have access"            │
│  ✗ Wrong password → "Incorrect password for decrypt"  │
│  ✗ Decrypt failed → "Decryption failed. Wrong pwd?"   │
│  ✗ Network error → "Download failed. Try again?"      │
│                                                        │
│ Performance:                                           │
│  • DB query: ~10ms (indexed user_id, file_id)         │
│  • File fetch: 1-30 seconds (depends on file size)    │
│  • Decryption: 1-2 seconds (for 100MB file)           │
│  • Audit log: ~50ms                                   │
│  • Total: 2-35 seconds (varies)                       │
│                                                        │
│ Side Effects:                                          │
│  • Download file to user's computer                   │
│  • Write audit log to D3 (DOWNLOAD action)            │
│  • Update last_download_date in D2 (optional)         │
│  • Show download progress (if supported)              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #4: FILE ENCRYPTION (CORE)

**Function:** `CryptoService.encryptWithPassword(fileBlob, password)`
**Module:** `src/js/modules/services/CryptoService.js`
**Called From:** FileService during upload (if P3 needed)

```
┌────────────────────────────────────────────────────────┐
│           FILE ENCRYPTION (P3 - Core)                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • fileBlob: Blob   │  │ 1.Generate
 │  │• encrypted
 │  │
│  │    (binary data)    │  │  random  │ │  Blob obj │  │
│  │    size: 1000000    │  │  salt    │ │           │  │
│  │                     │  │  (32b)   │ │• metadata:│  │
│  │  • password: string │  │          │ │  {        │  │
│  │    "mypassword123"  │  │ 2.PBKDF2 │ │    salt,  │  │
│  │                     │  │  derive  │ │    iv,    │  │
│  │  Data Type:         │  │  key     │ │    tag    │  │
│  │    {                │  │  from    │ │  }        │  │
│  │      file: Blob,    │  │  pwd+    │ │           │  │
│  │      password: str  │  │  salt    │ │Data Type: │  │
│  │    }                │  │  (100k   │ │  Blob     │  │
│  │                     │  │  iter)   │ │           │  │
│  │  Validation:        │  │          │ │ (cipher   │  │
│  │    ✓ File exists    │  │ 3.Generate
 │  │  text +            │  │
│  │    ✓ Pwd 8+ chars   │  │  random  │ │  metadata)│  │
│  │    ✓ Pwd complexity │  │  IV      │ │           │  │
│  │      (upper, lower, │  │  (12b)   │ │           │  │
│  │       digit,special)│  │          │ │           │  │
│  │                     │  │ 4.AES-GCM│ │           │  │
│  │                     │  │  encrypt │ │           │  │
│  │                     │  │  file    │ │           │  │
│  │                     │  │  with:   │ │           │  │
│  │                     │  │  - key   │ │           │  │
│  │                     │  │  - IV    │ │           │  │
│  │                     │  │  - auth  │ │           │  │
│  │                     │  │    tag   │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 5.Combine│ │           │  │
│  │                     │  │  cipher+ │ │           │  │
│  │                     │  │  salt+IV │ │           │  │
│  │                     │  │  + tag   │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 6.Return │ │           │  │
│  │                     │  │  encrypted
 │  │           │  │
│  │                     │  │  blob    │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • WebCrypto API (native browser crypto)              │
│  • No external libraries                              │
│                                                        │
│ Error Handling:                                        │
│  ✗ Invalid password → "Password must be 8+ chars"     │
│  ✗ Weak password → "Password too weak: add numbers"   │
│  ✗ Encryption failed → "Encryption error. Try again"  │
│  ✗ Key derivation failed → "Cannot derive key"        │
│                                                        │
│ Performance:                                           │
│  • PBKDF2 derivation: ~300-500ms (100k iterations)    │
│  • Key generation: ~50ms                              │
│  • AES-GCM encryption: 1-2 sec (for 100MB file)       │
│  • Metadata compilation: ~10ms                        │
│  • Total: ~1.3-2.5 seconds (for 100MB)                │
│                                                        │
│ Cryptography Details:                                  │
│  • Algorithm: AES-GCM-256                             │
│  • Key Length: 256 bits (32 bytes)                     │
│  • IV: 12 bytes (96 bits, GCM standard)                │
│  • Salt: 32 bytes (256 bits)                           │
│  • Auth Tag: 128 bits (16 bytes)                       │
│  • PBKDF2: SHA-256, 100,000 iterations                 │
│  • Security: Military-grade (NSA Suite B)              │
│                                                        │
│ Side Effects:                                          │
│  • Cryptographically secure password derivation       │
│  • Unique salt + IV for each encryption               │
│  • No plaintext ever persisted                        │
│  • Can only decrypt with same password                │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #5: FILE SEARCH/FILTER

**Function:** `FileService.searchFiles(query, filters)`
**Module:** `src/js/modules/services/FileService.js`
**Called From:** Search box in dashboard

```
┌────────────────────────────────────────────────────────┐
│             FILE SEARCH/FILTER (P6)                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • query: string    │  │ 1.Validate
 │  │• results:  │  │
│  │    "budget"         │  │  search  │ │  []        │  │
│  │                     │  │  text    │ │           │  │
│  │  • filters: object  │  │  (1-100  │ │• metadata:│  │
│  │    {                │  │  chars)  │ │  []        │  │
│  │      type:"pdf",    │  │          │ │           │  │
│  │      dateFrom: "...",
 │  │• count:   │  │
│  │      dateTo: "...", │  │ 2.Build  │ │  integer  │  │
│  │      sizeMin: 1000, │  │  SQL     │ │           │  │
│  │      sizeMax: 500M, │  │  WHERE   │ │Data Type: │  │
│  │      sortBy: "date" │  │  clauses │ │  {        │  │
│  │    }                │  │          │ │    results,│  │
│  │                     │  │ 3.Execute│ │    count,  │  │
│  │  Data Type:         │  │  Query   │ │    error   │  │
│  │    {                │  │  on D2   │ │  }        │  │
│  │      query: str,    │  │ (indexed)│ │           │  │
│  │      filters: obj   │  │          │ │Data Type: │  │
│  │    }                │  │ 4.Result │ │  Array[]  │  │
│  │                     │  │  set     │ │           │  │
│  │  Validation:        │  │  with    │ │  {        │  │
│  │    ✓ Query text OK  │  │  metadata│ │    id,    │  │
│  │    ✓ Filters valid  │  │          │ │    name,  │  │
│  │    ✓ Date range OK  │  │ 5.Paginate
 │  │   size,   │  │
│  │    ✓ Size range OK  │  │ (20 per  │ │    date,  │  │
│  │                     │  │  page)   │ │    mime,  │  │
│  │                     │  │          │ │    owner  │  │
│  │                     │  │ 6.Log to │ │  }        │  │
│  │                     │  │  D3      │ │           │  │
│  │                     │  │ (SEARCH) │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 7.Return │ │           │  │
│  │                     │  │  to UI   │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • Backend: GET /api/files/search                     │
│  • Database: D2 (Files table, indexed columns)        │
│  • Database: D3 (Audit Logs)                          │
│                                                        │
│ Error Handling:                                        │
│  ✗ Invalid query → "Search text too short/long"       │
│  ✗ Invalid filters → "Invalid date range"             │
│  ✗ No results → "No files match your search"          │
│  ✗ Query too broad → "Search returned 10000+ items"   │
│  ✗ DB error → "Search error. Try narrowing filters"   │
│                                                        │
│ Performance:                                           │
│  • Input validation: ~10ms                            │
│  • SQL query building: ~5ms                           │
│  • Database query (with indexes): ~50-200ms           │
│  • Pagination: ~10ms                                  │
│  • Audit logging: ~50ms                               │
│  • Total: 125-275ms                                   │
│                                                        │
│ Database Indexes Used:                                 │
│  • user_id (fast user filtering)                      │
│  • filename (ILIKE search)                            │
│  • file_type (type filter)                            │
│  • upload_date (date range filter)                    │
│  • file_size (size filter)                            │
│  • trash_date (exclude trash)                         │
│                                                        │
│ Pagination:                                            │
│  • 20 results per page                                │
│  • Total pages: ceil(count / 20)                      │
│  • Offset: (page - 1) * 20                            │
│                                                        │
│ Side Effects:                                          │
│  • Write SEARCH audit log to D3                       │
│  • Update UI with paginated results (P6)              │
│  • Show result count ("1-20 of 523 results")          │
│  • Enable/disable pagination buttons                  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #6: FILE DELETE (SOFT DELETE / TRASH)

**Function:** `FileService.deleteFile(fileId)`
**Module:** `src/js/modules/services/FileService.js`
**Called From:** Delete button on file list

```
┌────────────────────────────────────────────────────────┐
│           FILE DELETE / TRASH (P2)                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • fileId: string   │  │ 1.Fetch  │ │• success: │  │
│  │    UUID "xyz789"    │  │  metadata│ │  boolean  │  │
│  │                     │  │  from D2 │ │           │  │
│  │  Data Type:         │  │ (verify  │ │• message: │  │
│  │    string (UUID)    │  │  exist)  │ │  string   │  │
│  │                     │  │          │ │           │  │
│  │  Validation:        │  │ 2.Verify │ │• error:   │  │
│  │    ✓ File exists    │  │  perms   │ │  null     │  │
│  │    ✓ User owns it   │  │ (owner?) │ │  (or msg) │  │
│  │    ✓ Not trash      │  │          │ │           │  │
│  │                     │  │ 3.Check  │ │Data Type: │  │
│  │                     │  │  if      │ │  {        │  │
│  │                     │  │  already │ │    success,│  │
│  │                     │  │  trashed │ │    message,│  │
│  │                     │  │          │ │    error  │  │
│  │                     │  │ 4.UPDATE │ │  }        │  │
│  │                     │  │  D2:     │ │           │  │
│  │                     │  │  trash_  │ │           │  │
│  │                     │  │  date =  │ │           │  │
│  │                     │  │  NOW()   │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 5.Write  │ │           │  │
│  │                     │  │  D3 log  │ │           │  │
│  │                     │  │ (DELETE) │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 6.Notify │ │           │  │
│  │                     │  │  P4      │ │           │  │
│  │                     │  │ (toast)  │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 7.Return │ │           │  │
│  │                     │  │  to UI   │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • Backend: DELETE /api/files/:id                     │
│  • Database: D2 (Files table), D3 (Audit)             │
│                                                        │
│ Error Handling:                                        │
│  ✗ File not found → "File does not exist"             │
│  ✗ No permission → "You don't have access"            │
│  ✗ Already trash → "File already in trash"            │
│  ✗ Delete failed → "Cannot delete. Try again"         │
│                                                        │
│ Performance:                                           │
│  • DB query: ~10ms                                    │
│  • Update: ~100ms                                     │
│  • Audit log: ~50ms                                   │
│  • Total: ~160ms                                      │
│                                                        │
│ Soft Delete Details:                                   │
│  • File NOT removed from storage                      │
│  • Only trash_date timestamp is set                   │
│  • Recoverable within 30 days                         │
│  • Files > 30 days auto-deleted by cron job           │
│  • User can restore anytime within 30 days            │
│                                                        │
│ Side Effects:                                          │
│  • Update D2 (Files table) - set trash_date           │
│  • Write D3 (Audit Log) - DELETE action               │
│  • Remove from active file list (P6 UI)               │
│  • Show toast: "File moved to trash"                  │
│  • Update dashboard file count                        │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #7: FILE RESTORE FROM TRASH

**Function:** `FileService.restoreFromTrash(fileId)`
**Module:** `src/js/modules/services/FileService.js`
**Called From:** Restore button in Trash section

```
┌────────────────────────────────────────────────────────┐
│          FILE RESTORE FROM TRASH (P2)                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • fileId: string   │  │ 1.Fetch  │ │• success: │  │
│  │    UUID "trash001"  │  │  from D2 │ │  boolean  │  │
│  │                     │  │ (verify  │ │           │  │
│  │  Data Type:         │  │  in      │ │• message: │  │
│  │    string (UUID)    │  │  trash)  │ │  string   │  │
│  │                     │  │          │ │           │  │
│  │  Validation:        │  │ 2.Check  │ │• error:   │  │
│  │    ✓ File exists    │  │  age:    │ │  null     │  │
│  │    ✓ In trash       │  │  30 days?│ │  (or msg) │  │
│  │    ✓ Not expired    │  │          │ │           │  │
│  │    ✓ User owns it   │  │ 3.Verify │ │Data Type: │  │
│  │                     │  │  perms   │ │  {        │  │
│  │                     │  │          │ │    success,│  │
│  │                     │  │ 4.UPDATE │ │    message,│  │
│  │                     │  │  D2:     │ │    error  │  │
│  │                     │  │  trash_  │ │  }        │  │
│  │                     │  │  date =  │ │           │  │
│  │                     │  │  NULL    │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 5.Write  │ │           │  │
│  │                     │  │  D3 log  │ │           │  │
│  │                     │  │(RESTORE) │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 6.Notify │ │           │  │
│  │                     │  │  P4      │ │           │  │
│  │                     │  │ (toast)  │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 7.Return │ │           │  │
│  │                     │  │  to UI   │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • Backend: POST /api/files/:id/restore               │
│  • Database: D2 (Files table), D3 (Audit)             │
│                                                        │
│ Error Handling:                                        │
│  ✗ File not found → "File does not exist"             │
│  ✗ Not in trash → "File is not in trash"              │
│  ✗ Restore expired → "File expired. Cannot restore"   │
│  ✗ No permission → "You don't have access"            │
│  ✗ Failed → "Cannot restore. Try again"               │
│                                                        │
│ Performance:                                           │
│  • DB query: ~10ms (check in trash)                   │
│  • Age check: ~5ms (calc 30-day window)               │
│  • Update: ~100ms                                     │
│  • Audit log: ~50ms                                   │
│  • Total: ~165ms                                      │
│                                                        │
│ Trash Lifecycle:                                       │
│  • File soft-deleted: trash_date = NOW()              │
│  • Restoration window: 30 days                        │
│  • After 30 days: auto-deleted (hard delete)          │
│  • Manual restoration: anytime within 30 days         │
│                                                        │
│ Side Effects:                                          │
│  • Update D2 (Files table) - clear trash_date         │
│  • Write D3 (Audit Log) - RESTORE action              │
│  • Remove from trash section (P6 UI)                  │
│  • Add back to active files list                      │
│  • Show toast: "File restored"                        │
│  • Update file counts                                 │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #8: USER LOGOUT

**Function:** `AuthService.logout()` + `authGuard.logout()`
**Module:** `src/js/auth/AuthService.js, authGuard.js`
**Called From:** Logout button in navbar

```
┌────────────────────────────────────────────────────────┐
│              USER LOGOUT (P1)                          │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  None (click event) │  │ 1.Clear  │ │• success: │  │
│  │                     │  │  D5      │ │  boolean  │  │
│  │  Data Type: void    │  │  cache   │ │  true     │  │
│  │                     │  │  (token, │ │           │  │
│  │  Validation:        │  │  user)   │ │• redirected
         │  │
│  │    ✓ User logged in │  │          │ │  to login │  │
│  │    ✓ Token exists   │  │ 2.Log    │ │           │  │
│  │                     │  │  action  │ │Data Type: │  │
│  │                     │  │  to D3   │ │  {        │  │
│  │                     │  │(LOGOUT)  │ │   success:│  │
│  │                     │  │          │ │    bool,  │  │
│  │                     │  │ 3.Notify │ │   redirect│  │
│  │                     │  │  P4      │ │  }        │  │
│  │                     │  │ (toast)  │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 4.Clear  │ │           │  │
│  │                     │  │  service │ │           │  │
│  │                     │  │  caches  │ │           │  │
│  │                     │  │ (file    │ │           │  │
│  │                     │  │  list,   │ │           │  │
│  │                     │  │  etc)    │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 5.Redirect
 │  │           │  │
│  │                     │  │  to      │ │           │  │
│  │                     │  │ /login   │ │           │  │
│  │                     │  │ (replace)│ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 6.Return │ │           │  │
│  │                     │  │  success │ │           │  │
│  │                     │  │  (UI     │ │           │  │
│  │                     │  │  updated)│ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • AuthService.clearToken()                           │
│  • D5 (Session Cache - localStorage)                  │
│  • D3 (Audit Logs) - write LOGOUT                     │
│  • Browser redirect API                               │
│                                                        │
│ Error Handling:                                        │
│  ✗ Not logged in → No-op (already logged out)         │
│  ✗ Clear failed → Force redirect anyway               │
│                                                        │
│ Performance:                                           │
│  • Clear localStorage: ~20ms                          │
│  • Clear service caches: ~50ms                        │
│  • Audit log: ~100ms                                  │
│  • Browser redirect: ~200ms                           │
│  • Total: ~370ms + network                            │
│                                                        │
│ Security Details:                                      │
│  • Use window.location.replace() (no history)         │
│  • NOT window.location.href (allows back button)      │
│  • Clear ALL auth data (token, user, expiry)          │
│  • Cannot return via browser back button              │
│  • Server session also invalidated (optional)         │
│                                                        │
│ Side Effects:                                          │
│  • Clear D5 (Session Cache) completely                │
│  • Clear all service-level caches                     │
│  • Stop any in-progress file uploads                  │
│  • Write LOGOUT to D3 (Audit Logs)                    │
│  • Close all open modals                              │
│  • Redirect to /login.html                            │
│  • Show success toast (optional)                      │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #9: PASSWORD HASHING (BACKEND)

**Function:** `hashPassword(password)` / `comparePassword(pwd, hash)`
**Module:** `backend/src/utils/password.js`
**Called From:** Login validation, password reset

```
┌────────────────────────────────────────────────────────┐
│            PASSWORD HASHING (Utility)                  │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  • password: string │  │ 1.Generate
 │  │• hash: string   │  │
│  │    "MyP@ssw0rd"     │  │  random  │ │ (PBKDF2)  │  │
│  │                     │  │  salt    │ │           │  │
│  │  Data Type:         │  │  (32B)   │ │Data Type: │  │
│  │    string           │  │          │ │  string   │  │
│  │                     │  │ 2.PBKDF2 │ │  (hex)    │  │
│  │  Validation:        │  │  hash:   │ │           │  │
│  │    ✓ Not empty      │  │ SHA-256, │ │  Example: │  │
│  │    ✓ 8+ chars       │  │ 100k     │ │ "3a2d4f..." │  │
│  │    ✓ Complexity OK  │  │ iterations
 │  │           │  │
│  │      - 1 upper     │  │  with    │ │  Or:      │  │
│  │      - 1 lower     │  │  salt    │ │  boolean  │  │
│  │      - 1 digit     │  │          │ │  (true/   │  │
│  │      - 1 special   │  │ 3.Return │ │  false)   │  │
│  │                     │  │  result  │ │  for      │  │
│  │                     │  │ (for     │ │ compare   │  │
│  │                     │  │  hash)   │ │           │  │
│  │                     │  │  OR      │ │           │  │
│  │                     │  │  compare │ │           │  │
│  │                     │  │  using   │ │           │  │
│  │                     │  │  constant
 │  │           │  │
│  │                     │  │  time    │ │           │  │
│  │                     │  │  compare │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • Node.js crypto module                              │
│  • No external libraries                              │
│                                                        │
│ Error Handling:                                        │
│  ✗ Invalid password → "Password too weak"             │
│  ✗ Hashing failed → "Hash generation error"           │
│  ✗ Compare mismatch → Return false                    │
│                                                        │
│ Performance:                                           │
│  • Hash generation: 300-500ms (100k iterations)       │
│  • Comparison: 300-500ms (constant-time)              │
│  • This is intentional (slow = secure)                │
│                                                        │
│ Security:                                              │
│  • PBKDF2: NIST-approved key derivation                │
│  • SHA-256: Cryptographic hash function                │
│  • 100,000 iterations: Prevents brute-force           │
│  • 32-byte salt: Unique per password                   │
│  • Constant-time comparison: Prevents timing attacks   │
│                                                        │
│ Password Requirements:                                  │
│  • Minimum 8 characters                                │
│  • 1 uppercase letter (A-Z)                            │
│  • 1 lowercase letter (a-z)                            │
│  • 1 digit (0-9)                                       │
│  • 1 special character (!@#$%^&*)                      │
│  • Maximum 128 characters                              │
│                                                        │
│ Side Effects:                                          │
│  • Unique salt generated for each password             │
│  • Salt stored with hash in database                   │
│  • No plaintext password ever stored                   │
│  • Cannot reverse-engineer original password           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## IPO #10: JWT TOKEN GENERATION & VERIFICATION

**Function:** `generateToken(userId, username, role)` / `verifyToken(token)`
**Module:** `backend/src/utils/jwt.js`
**Called From:** Login, middleware auth check

```
┌────────────────────────────────────────────────────────┐
│          JWT TOKEN GENERATION (Backend)               │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────┐  ┌──────────┐ ┌───────────┐  │
│  │      INPUT          │  │ PROCESS  │ │  OUTPUT   │  │
│  │                     │  │          │ │           │  │
│  │  For GENERATION:    │  │ 1.Create │ │• token:   │  │
│  │                     │  │  header: │ │  "eyJhbGc
 │  │
│  │  • userId: string   │  │ {alg:    │ │  iOiJIUz..."│  │
│  │    UUID "abc123"    │  │  HS256,  │ │ (base64  │  │
│  │                     │  │  typ:JWT}│ │  encoded)│  │
│  │  • username: string │  │          │ │           │  │
│  │    "admin"          │  │ 2.Create │ │• payload: │  │
│  │                     │  │  payload:│ │ {         │  │
│  │  • role: string     │  │ {userId, │ │   userId, │  │
│  │    "admin"          │  │  username,
 │  │   username,│  │
│  │                     │  │  role,   │ │   role,   │  │
│  │  Data Type:         │  │  iat:... │ │   iat,    │  │
│  │    {userId, role}   │  │  exp:... │ │   exp     │  │
│  │                     │  │ }        │ │ }        │  │
│  │  For VERIFICATION:  │  │          │ │           │  │
│  │                     │  │ 3.Sign   │ │Data Type: │  │
│  │  • token: string    │  │  with    │ │  string   │  │
│  │    received JWT     │  │  secret: │ │  (JWT) OR │  │
│  │                     │  │  sign_   │ │  object   │  │
│  │  Data Type:         │  │  secret_│ │  (for     │  │
│  │    string           │  │  key    │ │  verify)  │  │
│  │                     │  │          │ │           │  │
│  │  Validation (Gen):  │  │ 4.Return │ │ {        │  │
│  │    ✓ userId exists  │  │  signed  │ │   userId,│  │
│  │    ✓ role valid     │  │  token   │ │   ...,   │  │
│  │                     │  │  string  │ │   iat,   │  │
│  │  Validation (Verify):
 │  │   exp    │  │
│  │    ✓ Format OK      │  │          │ │ } OR     │  │
│  │    ✓ Sig OK         │  │ For VER: │ │ boolean  │  │
│  │    ✓ Not expired    │  │ 1.Extract│ │  true    │  │
│  │                     │  │  parts   │ │ (valid)  │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 2.Verify │ │           │  │
│  │                     │  │  sig     │ │           │  │
│  │                     │  │ (using   │ │           │  │
│  │                     │  │  secret) │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 3.Check  │ │           │  │
│  │                     │  │  expiry: │ │           │  │
│  │                     │  │  exp >   │ │           │  │
│  │                     │  │  now()?  │ │           │  │
│  │                     │  │          │ │           │  │
│  │                     │  │ 4.Return │ │           │  │
│  │                     │  │  payload │ │           │  │
│  │                     │  │  OR null │ │           │  │
│  │                     │  │          │ │           │  │
│  └─────────────────────┘  └──────────┘ └───────────┘  │
│                                                        │
│ Dependencies:                                          │
│  • Node.js jsonwebtoken library (npm)                 │
│  • JWT_SECRET from .env file                          │
│                                                        │
│ Error Handling:                                        │
│  ✗ Invalid input → Throw error                        │
│  ✗ Missing secret → Throw error                       │
│  ✗ Invalid signature → Return null (verify)           │
│  ✗ Token expired → Return null (verify)               │
│  ✗ Malformed token → Return null (verify)             │
│                                                        │
│ Performance:                                           │
│  • Token generation: ~5ms                             │
│  • Token verification: ~10ms                          │
│  • Signature check: ~2ms                              │
│  • Expiry check: <1ms                                 │
│                                                        │
│ JWT Structure:                                         │
│  header.payload.signature                            │
│  └─ All base64-encoded (not encrypted)                │
│  └─ Signature proves no tampering occurred            │
│                                                        │
│ Token Expiry:                                          │
│  • Issued At (iat): Current timestamp                 │
│  • Expiry (exp): iat + 7 days                         │
│  • 7 days = 604,800 seconds                           │
│  • Auto-refresh on login (optional)                   │
│                                                        │
│ Payload Contents:                                      │
│  • userId: UUID of logged-in user                     │
│  • username: Username string                          │
│  • role: User role (admin, manager, clerk)            │
│  • iat: Issued at timestamp (seconds)                 │
│  • exp: Expiration timestamp (seconds)                │
│                                                        │
│ Security:                                              │
│  • Algorithm: HS256 (HMAC-SHA256)                     │
│  • Secret stored in .env (never in code)              │
│  • Token stored in localStorage (frontend)            │
│  • Signature prevents tampering                       │
│  • Expiry prevents indefinite access                  │
│                                                        │
│ Side Effects:                                          │
│  • Create unique token per login                      │
│  • Store token in localStorage (P5)                   │
│  • Token checked on every API request                 │
│  • Expired tokens rejected by middleware              │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## SUMMARY TABLE

| Function | Input Type | Output Type | Complexity | Performance |
|----------|-----------|-------------|-----------|-------------|
| Login | {username, password} | {token, user, error} | O(1) hash | 300-500ms |
| Upload | {file, encrypt, pwd} | {fileId, name, size} | O(n) | 8-40s |
| Download | {fileId, password?} | Blob | O(n) | 2-35s |
| Encrypt | {file, password} | Blob | O(n) | 1-2.5s |
| Search | {query, filters} | FileMetadata[] | O(log n) | 125-275ms |
| Delete | {fileId} | {success, msg} | O(1) | ~160ms |
| Restore | {fileId} | {success, msg} | O(1) | ~165ms |
| Logout | void | void | O(n) | ~370ms |
| Hash Password | string | string | O(1) PBKDF2 | 300-500ms |
| JWT Token | {userId, role} | string | O(1) | ~5-10ms |

---

**END OF IPO DIAGRAMS**
