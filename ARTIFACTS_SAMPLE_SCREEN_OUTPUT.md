# 5. SAMPLE SCREEN OUTPUT (UI MOCKUPS)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Software Design Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Annotated UI mockups showing all screens and user interactions

---

## SCREEN 1: LOGIN PAGE (/login.html)

**Description:** Initial entry point, unauthenticated users only

```
┌─────────────────────────────────────────────────────────────────┐
│  ST. CLARE FILING SYSTEM - Capstone Project                    │
│                                                                 │
│                                                                 │
│         ┌───────────────────────────────────────┐              │
│         │                                       │              │
│         │      ST. CLARE FILING SYSTEM         │              │
│         │      Welcome Back                     │              │
│         │                                       │              │
│         │  ┌─────────────────────────────────┐  │              │
│         │  │ Username or Email               │  │② Input Fields:
 │              │
│         │  │ [________________]              │  │   - Username
 │              │
│         │  └─────────────────────────────────┘  │   - Password
 │              │
│         │  ┌─────────────────────────────────┐  │   - Validation
 │              │
│         │  │ Password                        │  │     on submit  │
│         │  │ [________________]              │  │               │
│         │  │ [Show password icon]            │  │               │
│         │  └─────────────────────────────────┘  │               │
│         │                                       │  ③ Authentication
         │
│         │  ┌─────────────────────────────────┐  │   - PBKDF2    │
│         │  │     [LOGIN]                     │  │     hash      │
│         │  └─────────────────────────────────┘  │   - JWT token │
│         │                                       │   - 7-day exp  │
│         │  Forgot your password?               │               │
│         │  [Click to reset]                     │               │
│         │                                       │  ④ Error Msgs:│
│         │  ┌─────────────────────────────────┐  │   - "Invalid  │
│         │  │ ⚠ Error message appears here   │  │     credentials"
         │
│         │  │ when login fails (red bg)       │  │   - "User not │
│         │  └─────────────────────────────────┘  │     found"    │
│         │                                       │   - "Cannot   │
│         │  © 2026 St. Clare University          │     connect"  │
│         │                                       │               │
│         └───────────────────────────────────────┘               │
│                                                                 │
│  ① Page Structure:                                             │
│     - Centered card layout                                     │
│     - Responsive (mobile: 100%, tablet: 80%, desktop: 400px)  │
│     - Light/dark theme toggle (top-right corner)              │
│     - No navigation (unauthenticated)                          │
│                                                                 │
│  ② Form Validation (Client-side):                              │
│     ✓ Username: Not empty, 3-20 chars                          │
│     ✓ Password: Not empty, 8+ characters                       │
│     ✓ Real-time feedback (red border if invalid)               │
│     ✓ Submit button disabled until both valid                  │
│                                                                 │
│  ③ On Submit:                                                  │
│     1. POST /api/auth/login {username, password}               │
│     2. Backend hashes password with PBKDF2                     │
│     3. Backend returns JWT token + user object                 │
│     4. Frontend stores in localStorage                         │
│     5. Sets 7-day expiry timestamp                             │
│     6. Redirects to /index.html                                │
│                                                                 │
│  ④ Data Models (Sent to Backend):                              │
│     POST body: {                                               │
│       "username": "admin",                                     │
│       "password": "hashedWith_PBKDF2_100k_iter"                │
│     }                                                           │
│     Response: {                                                │
│       "token": "eyJhbGciOiJIUzI1NiIs...",                     │
│       "user": {                                                │
│         "id": "cmnj...",                                       │
│         "username": "admin",                                   │
│         "role": "admin"                                        │
│       }                                                         │
│     }                                                           │
│                                                                 │
│  ⑤ Color Scheme:                                               │
│     - Primary: #0066CC (blue)                                  │
│     - Error: #CC0000 (red)                                     │
│     - Background: #FFFFFF (light) / #1a1a1a (dark)             │
│     - Input border: #CCCCCC → #0066CC (focus)                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Interaction Flow:**
1. User enters username "admin"
2. User enters password
3. User clicks LOGIN button
4. (300-500ms delay for password hashing on backend)
5. If success: Toast "Login successful!" → Redirect to dashboard
6. If error: Show error message, prompt retry

---

## SCREEN 2: MAIN DASHBOARD (/index.html - Dashboard Page)

**Description:** Primary authenticated user interface

```
┌────────────────────────────────────────────────────────────────────┐
│ ═══════════════════════════════════════════════════════════════ │
│ │ ST. CLARE FILING │ [☀️Dark] [👤 admin ▼] [🚪 Logout] │           │
│ ═══════════════════════════════════════════════════════════════ │
│                                                                    │
│  ┌─────────────────┐  ┌──────────────────────────────────────────┐
│  │ SIDEBAR         │  │ MAIN CONTENT AREA                       │
│  ├─────────────────┤  ├──────────────────────────────────────────┤
│  │                 │  │                                          │
│  │ 📁 Dashboard    │  │ DASHBOARD                                │
│  │ 📤 Upload       │  │                                          │
│  │ 🗑️  Trash       │  │ ┌─ Quick Upload ─────────────────────┐  │
│  │ ⚙️  Settings    │  │ │                                     │  │
│  │ 📊 Analytics    │  │ │  [📁 Drag files here to upload]†  │  │
│  │ 📜 Audit Logs   │  │ │       (or click to browse)        │  │
│  │                 │  │ │                                     │  │
│  │ Shortcuts:      │  │ │ [Browse Button]                     │  │
│  │ [Recent Files]  │  │ │                                     │  │
│  │ [Starred Files] │  │ │ ┌─────────────────────────┐        │  │
│  │ [My Uploads]    │  │ │ │ Encryption: [○ Off ● On]│        │  │
│  │                 │  │ │ │ (Optional user choice) │        │  │
│  │                 │  │ │ └─────────────────────────┘        │  │
│  │                 │  │ └─────────────────────────────────────┘  │
│  │                 │  │                                          │
│  │                 │  │ Statistics:                              │
│  │                 │  │ ┌─────────────────────────────────────┐  │
│  │                 │  │ │ Total Files: 42                   │  │
│  │                 │  │ │ Storage Used: 523 MB / 2 GB       │  │
│  │                 │  │ │ Encrypted Files: 28               │  │
│  │                 │  │ │ Trash Items: 5 (7 days to delete) │  │
│  │                 │  │ └─────────────────────────────────────┘  │
│  │                 │  │                                          │
│  │                 │  │ Recent Uploads:                          │
│  │                 │  │ ┌─────────────────────────────────────┐  │
│  │                 │  │ │ 📄 budget_2024.xlsx                 │  │
│  │                 │  │ │    123.5 KB · 2 hours ago           │  │
│  │                 │  │ │ 📄 proposal.pdf                     │  │
│  │                 │  │ │    456.2 KB · 5 hours ago           │  │
│  │                 │  │ │ ... (show 5 recent)                 │  │
│  │                 │  │ └─────────────────────────────────────┘  │
│  │                 │  │                                          │
│  └─────────────────┘  └──────────────────────────────────────────┘
│                                                                    │
│ † Drag-drop zone shows:                                           │
│   - Highlight border (dashed, blue) when dragging files          │
│   - Accepts: .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx,       │
│              .jpg, .png, .txt                                    │
│   - Rejects: Folders, .exe, .app, other executables              │
│   - Max file: 500 MB each, Max total: 2 GB per user              │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ NAVBAR COMPONENTS:                                                 │
├────────────────────────────────────────────────────────────────────┤
│ 1. Brand/Logo: "ST. CLARE FILING SYSTEM"                          │
│ 2. Theme Toggle: ☀️🌙 (light/dark mode)                            │
│ 3. User Profile:                                                   │
│    - Avatar (initials: 'A' for admin)                             │
│    - Username: "admin"                                             │
│    - Role badge: "Administrator" (blue)                           │
│    - Dropdown: Settings, Change Password, Logout                  │
│ 4. Logout Button: 🚪 Logout                                        │
│    - On click: Clear token, redirect to /login.html               │
│    - Toast: "You have been logged out"                            │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ SIDEBAR NAVIGATION:                                                │
├────────────────────────────────────────────────────────────────────┤
│ • Dashboard (current page)        [highlightedwith blue bg]       │
│ • Upload                          [onclick: show upload modal]    │
│ • Trash (with red badge: 5)       [onclick: show trash section]  │
│ • Settings                        [onclick: show user settings]   │
│ • Analytics                       [onclick: show usage charts]    │
│ • Audit Logs (Admin only)         [onclick: show audit logs]      │
│                                                                    │
│ SHORTCUTS (collapsible):                                          │
│ • Recent Files (last 10 accessed)                                │
│ • Starred Files (user favorites)                                 │
│ • My Uploads (user's uploaded files)                             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## SCREEN 3: FILE MANAGEMENT - FILE LIST WITH SEARCH/FILTERS

**Description:** Search and browse all files

```
┌────────────────────────────────────────────────────────────────────┐
│ [← BACK] FILES BROWSER                                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ┌─ Search & Filter ───────────────────────────────────────────┐  │
│ │ Search: [🔍 ________________]                              │  │
│ │                                                             │  │
│ │ Filters:                                                    │  │
│ │ Type: [All ▼] | Date: [Any ▼] | Size: [Any ▼]             │  │
│ │ Sort: [Name ▼] [↓ Descending]  [🔄 Reset]                 │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ Results: Showing 1-20 of 42 files                                 │
│                                                                    │
│ ┌─────────────────────────────────────────────────────────────┐  │
│ │ ☐ NAME             │ SIZE    │ DATE       │ ENCRYPTED │ ACT │  │
│ ├─────────────────────────────────────────────────────────────┤  │
│ │ ☐ 📄 budget.xlsx   │ 123 KB  │ 28 Mar    │ 🔒 Yes    │ ⋯ │  │
│ │ ☐ 📄 proposal.pdf  │ 456 KB  │ 25 Mar    │ ○ No      │ ⋯ │  │
│ │ ☐ 📄 report.docx   │ 234 KB  │ 20 Mar    │ 🔒 Yes    │ ⋯ │  │
│ │ ☐ 📰 news.txt      │ 12 KB   │ 15 Mar    │ ○ No      │ ⋯ │  │
│ │ ☐ 📷 photo.jpg     │ 2.5 MB  │ 10 Mar    │ ○ No      │ ⋯ │  │
│ │ ... (15 more files)                                     │  │
│ └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│ Pagination:  [< Prev] [1] [2] [3] [...] [10] [Next >] (Page 1)   │
│                                                                    │
│ Bulk Actions (if selected):                                       │
│ [⬇️ Download All] [🗑️ Delete Selected] [🔒 Encrypt Selected]  │  │
│                                                                    │
│ ⋯ Menu (on each row opens):                                      │
│    • Preview/View Details                                         │
│    • Download                                                     │
│    • Move to Trash                                                │
│    • Share (optional feature)                                     │
│    • Rename                                                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## SCREEN 4: FILE DETAILS MODAL

**Description:** View file info, download, delete

```
┌────────────────────────────────────────────────────────────────────┐
│ MODAL BACKGROUND (Darked overlay, clickable to close)             │
│                                                                    │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ [X Close]              FILE DETAILS                 │     │
│     ├─────────────────────────────────────────────────────────┤  │
│     │                                                         │  │
│     │ ┌──────────────────────────────────────────────────┐   │  │
│     │ │ [📄] budget_2024.xlsx                            │   │  │
│     │ └──────────────────────────────────────────────────┘   │  │
│     │                                                         │  │
│     │ Metadata:                                              │  │
│     │ • File ID: abc-def-ghi-jkl                            │  │
│     │ • Type: application/vnd.ms-excel                      │  │
│     │ • Size: 123.5 KB                                      │  │
│     │ • Uploaded: March 28, 2026 @ 14:32 UTC               │  │
│     │ • Uploaded By: admin                                  │  │
│     │ • Encryption: YES (AES-GCM-256)                       │  │
│     │ • Access Control: Private (owner only)                │  │
│     │ • Last Modified: March 28, 2026                       │  │
│     │ • Downloads: 3                                        │  │
│     │                                                         │  │
│     │ Description (Optional):                                │  │
│     │ [Annual budget proposal for 2024 fiscal year]         │  │
│     │                                                         │  │
│     │ Actions:                                               │  │
│     │ ┌──────────────────────────────────────────────────┐   │  │
│     │ │ [⬇️ Download]  [🔒 Lock]  [📎 Copy Link]        │   │  │
│     │ │ [✏️ Rename]     [🗑️ Delete]  [ℹ️ More Info]      │   │  │
│     │ └──────────────────────────────────────────────────┘   │  │
│     │                                                         │  │
│     │ Preview (if supported, e.g., PDF, images):             │  │
│     │ ┌──────────────────────────────────────────────────┐   │  │
│     │ │                                                  │   │  │
│     │ │ [📄 Preview not available for this file type]   │   │  │
│     │ │                                                  │   │  │
│     │ └──────────────────────────────────────────────────┘   │  │
│     │                                                         │  │
│     │ Version History (if enabled):                           │  │
│     │ • Current (v3) - March 28, 2026 - 123.5 KB            │  │
│     │ • v2 - March 25, 2026 - 120.2 KB                      │  │
│     │ • v1 - March 22, 2026 - 118.0 KB                      │  │
│     │                                                         │  │
│     │ [Cancel] [Confirm Deletion if Delete clicked]         │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## SCREEN 5: TRASH/RECYCLE BIN

**Description:** Soft-deleted files with restore/permanent delete

```
┌────────────────────────────────────────────────────────────────────┐
│ [← BACK] TRASH                                                    │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ⚠️  Files deleted more than 30 days ago are automatically removed  │
│                                                                    │
│ ┌────────────────────────────────────────────────────────────────┐│
│ │ ☐ NAME             │ DELETED      │ REMAINING │ ACTIONS      ││
│ ├────────────────────────────────────────────────────────────────┤│
│ │ ☐ 📄 old_doc.pdf   │ 5 days ago   │ 25 days   │ ↩️ ⊗        ││
│ │ ☐ 📄 test.xls      │ 10 days ago  │ 20 days   │ ↩️ ⊗        ││
│ │ ☐ 📄 backup.zip    │ 15 days ago  │ 15 days   │ ↩️ ⊗        ││
│ │ ☐ 📷 unused.jpg    │ 28 days ago  │ 2 days    │ ↩️ ⊗ [SOON] ││
│ │ ☐ 📰 archive.txt   │ 20 days ago  │ 10 days   │ ↩️ ⊗        ││
│ │                                                   │
│ ├────────────────────────────────────────────────────────────────┤│
│ │ Bulk Actions: [↩️ Restore Selected] [⊗ Permanently Delete]   ││
│ │ [Empty Trash] (⚠️ Confirmation required)                     ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
│ Legend:                                                            │
│ ↩️  = Restore file (move back to active list)                    │
│ ⊗ = Permanently delete (unrecoverable)                           │
│                                                                    │
│ [Empty Trash] Button:                                             │
│ ┌────────────────────────────────────────────────────────────────┐│
│ │ CONFIRMATION DIALOG                                           ││
│ ├────────────────────────────────────────────────────────────────┤│
│ │                                                                ││
│ │ Are you sure you want to permanently delete all items in    ││
│ │ trash? This cannot be undone.                               ││
│ │                                                                ││
│ │ Files to delete: 5                                           ││
│ │ Space to be freed: 45 MB                                    ││
│ │                                                                ││
│ │ [Cancel] [Permanently Delete]                               ││
│ │                                                                ││
│ └────────────────────────────────────────────────────────────────┘│
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## SCREEN 6: UPLOAD DIALOG (SIMPLIFIED)

**Description:** File upload interface

```
┌────────────────────────────────────────────────────────────────────┐
│ MODAL BACKGROUND                                                  │
│                                                                    │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ [X] UPLOAD FILES                                   │     │
│     ├─────────────────────────────────────────────────────────┤  │
│     │                                                         │  │
│     │  Drop files here or click to browse                     │  │
│     │  ↙️                                                      │  │
│     │  ┌───────────────────────────────────────┐             │  │
│     │  │                                       │             │  │
│     │  │  [📁 Choose Files]                     │             │  │
│     │  │     (or drag & drop)                   │             │  │
│     │  │                                       │             │  │
│     │  │  Supported: PDF, DOC, DOCX, XLS,     │             │  │
│     │  │  XLSX, PPT, PPTX, JPG, PNG, TXT      │             │  │
│     │  │  Max file: 500 MB                     │             │  │
│     │  │                                       │             │  │
│     │  └───────────────────────────────────────┘             │  │
│     │                                                         │  │
│     │  Encryption Option:                                     │  │
│     │  [○ No encryption] [● Use encryption]                  │  │
│     │   (User can toggle before upload)                       │  │
│     │                                                         │  │
│     │  Selected Files (preview list):                         │  │
│     │  ┌───────────────────────────────────────┐             │  │
│     │  │ ✓ budget.xlsx        - 123.5 KB      │             │  │
│     │  │ ✓ report.pdf         - 456.2 KB      │             │  │
│     │  │ Total: 579.7 KB of 2 GB available    │             │  │
│     │  └───────────────────────────────────────┘             │  │
│     │                                                         │  │
│     │  Progress (during upload):                              │  │
│     │  ┌───────────────────────────────────────┐             │  │
│     │  │ Uploading: budget.xlsx (50%)          │             │  │
│     │  │ [████████░░░░░░░░] 2/4 files        │             │  │
│     │  │ Elapsed: 00:15  |  Est. remaining: 00:10            │             │  │
│     │  └───────────────────────────────────────┘             │  │
│     │                                                         │  │
│     │  [Upload] [Cancel]                                     │  │
│     │                                                         │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## SCREEN 7: SETTINGS PAGE

**Description:** User preferences and account settings

```
┌────────────────────────────────────────────────────────────────────┐
│ [← BACK] SETTINGS                                                 │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│ ACCOUNT SETTINGS                                                  │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Username: admin                                           │   │
│ │ Email: admin@stclare.edu                                  │   │
│ │ Role: Administrator                                       │   │
│ │ Joined: January 1, 2024                                   │   │
│ │                                                            │   │
│ │ [✏️ Edit Profile]  [🔐 Change Password]                  │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ PREFERENCES                                                       │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Theme: [Light ● Dark ○]                                  │   │
│ │ Default Encryption: [On] [Off]                            │   │
│ │ Notifications: [✓ Email] [✓ In-App] [✗ SMS]              │   │
│ │ File Preview: [On] [Off]                                  │   │
│ │ Show Deleted Files: [On] [Off]                            │   │
│ │ Items per page: [10 / 20 / 50]                            │   │
│ │                                                            │   │
│ │ [Save Preferences]                                        │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ STORAGE & QUOTA                                                   │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Used: 523 MB / 2 GB (26%)                                │   │
│ │ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░ (visual bar)         │   │
│ │ Remaining: 1.5 GB                                         │   │
│ │ [Request Quota Increase]                                  │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ SECURITY                                                          │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ Two-Factor Authentication: [Not enabled]                  │   │
│ │ [Enable 2FA] (future feature)                             │   │
│ │                                                            │   │
│ │ Active Sessions:                                          │   │
│ │ • Chrome on Windows (current) - Last active: now          │   │
│ │ • Safari on iPhone - Last active: 2 hours ago             │   │
│ │ [Sign out of all other sessions]                          │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
│ DANGER ZONE                                                       │
│ ┌────────────────────────────────────────────────────────────┐   │
│ │ [Delete Account] (⚠️ Irreversible - all data lost)        │   │
│ └────────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## TOAST NOTIFICATIONS (SYSTEM FEEDBACK)

**Description:** Temporary non-blocking messages

```
┌─────────────────────────────────────────────────────────────────────┐
│ Example #1: SUCCESS (Green, auto-dismiss in 3 seconds)             │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐               │
│ │ ✓ File uploaded successfully!                   │ [X]           │
│ └─────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Example #2: ERROR (Red, stays until dismissed)                     │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐               │
│ │ ✗ Upload failed: File too large (> 500MB)      │ [X]           │
│ └─────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Example #3: INFO (Blue, auto-dismiss in 5 seconds)                 │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐               │
│ │ ℹ Downloading file... This may take a moment   │ [X]           │
│ └─────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│ Example #4: WARNING (Orange, auto-dismiss in 5 seconds)            │
├─────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────┐               │
│ │ ⚠ You are using 85% of your storage quota     │ [X]           │
│ └─────────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## COLOR PALETTE & TYPOGRAPHY

```
COLORS:
├─ Primary Blue: #0066CC (buttons, links, highlights)
├─ Dark BG (night mode): #1a1a1a
├─ Light BG (day mode): #FFFFFF
├─ Secondary Gray: #666666
├─ Light Gray: #CCCCCC
├─ Success Green: #00AA00
├─ Error Red: #CC0000
├─ Warning Orange: #FFAA00
└─ Dark Text: #333333

TYPOGRAPHY:
├─ Headings: 24px / 20px / 18px (H1/H2/H3)
├─ Body: 14px (regular text)
├─ Small: 12px (secondary text, metadata)
└─ Font Family: System defaults (Segoe UI, Roboto, San Francisco)

SPACING:
├─ Padding: 8px, 16px, 24px, 32px
├─ Margins: 16px, 24px, 32px
├─ Gap (grid): 16px
└─ Border Radius: 4px (small), 8px (medium), 12px (large)

SHADOWS (depth):
├─ Level 1: 0 1px 3px rgba(0,0,0,0.12)
├─ Level 2: 0 3px 6px rgba(0,0,0,0.16)
└─ Level 3: 0 10px 20px rgba(0,0,0,0.19)
```

---

## RESPONSIVE BEHAVIOR

**Mobile (< 768px):**
- Sidebar hidden (hamburger menu ☰)
- Single-column layout
- Touch-friendly buttons (min 44px height)
- Full-width modals

**Tablet (768px - 1024px):**
- Sidebar collapsible (compact icons)
- Two-column layout (sidebar + content)
- Table columns auto-hide (priority: name, actions)

**Desktop (> 1024px):**
- Full sidebar always visible
- Three+ column layouts
- Hover effects on interactive elements
- Tooltips on truncated text

---

**END OF SCREEN OUTPUT DOCUMENT**
