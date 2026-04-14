# 7. USER MANUAL OUTLINE (Documentation)
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - User Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Audience:** End users (administrators, managers, clerks)
**Purpose:** Task-based step-by-step operational guide

---

## TABLE OF CONTENTS

1. **Introduction** (1-2 pages)
2. **Getting Started** (3-4 pages)
3. **Core Features** (15-20 pages)
4. **Advanced Features** (5-10 pages)
5. **Troubleshooting** (3-5 pages)
6. **FAQ** (2-3 pages)
7. **Appendix** (glossary, shortcuts, etc.)

**Total Expected Length: 30-50 pages (with screenshots)**

---

## SECTION 1: INTRODUCTION (1-2 pages)

**1.1 Overview**
- What is St. Clare Filing System?
- Key benefits: Organized file storage, encrypted backups, audit trails
- Who should use it: Administrative staff, department heads, archivists
- System requirements: Modern web browser (Chrome, Firefox, Safari, Edge)

**1.2 Key Features Summary**
- Drag-and-drop file upload
- Optional file encryption (AES-256)
- File search and filtering
- Soft-delete with trash recovery
- Audit logs for compliance
- Dark mode / Light mode theme
- Cross-device access

**1.3 Document Conventions**
- **Bold text** = Menu items or buttons to click
- `Code font` = Filenames, passwords, URLs
- [Brackets] = Optional entries
- ⚠️ = Important warnings
- 💡 = Helpful tips
- Screenshots shown with yellow boxes highlighting actions

---

## SECTION 2: GETTING STARTED (3-4 pages)

**2.1 Logging In**

*Task: Access the St. Clare Filing System*

**Step-by-step (with annotated screenshot):**

1. Open web browser and navigate to:
   ```
   http://filing.stclare.edu
   ```

   📸 Screenshot: Login page with username/password fields
   - Yellow box around username field
   - Yellow box around password field
   - Yellow box around LOGIN button

2. Enter your **username** (provided by IT department)
   - Example: `john.smith`
   - Username is case-sensitive

3. Enter your **password**
   - Initial password provided by IT (you'll change on first login)
   - Password must be 8+ characters with numbers, symbols

4. (Optional) Click **[Show password]** to verify you typed correctly

5. Click **[LOGIN]** button
   - Blue button on right side of form
   - Login takes 3-5 seconds while server verifies credentials

6. On success: Dashboard appears automatically
   - See file list, Upload button, Trash section

**Common Issues:**
- ❌ "User not found" → Check spelling of username
- ❌ "Incorrect password" → Check caps lock, try resetting password
- ❌ Cannot connect → Check internet connection

---

**2.2 Changing Your Password**

*Task: Update password on first login*

1. Click your **username** in top-right corner
2. Select **[Settings]** from dropdown menu
3. Click **[Change Password]** button
4. Enter:
   - Current Password: `[your existing password]`
   - New Password: `[must be 8+ chars, 1 upper, 1 lower, 1 digit, 1 special]`
   - Confirm New Password: `[retype new password]`
5. Click **[Update Password]**
6. Green success message appears: "Password changed"

⚠️ **IMPORTANT:** Write down your new password in a secure location!

---

**2.3 Understanding the Dashboard**

*Task: Learn the main interface layout*

📸 Screenshot: Main dashboard with annotations

| Area | What It Shows | Actions |
|------|---------------|---------|
| **Top Navbar** | Your name, theme toggle, logout | Profile menu, theme switch |
| **Left Sidebar** | Navigation menu | Click to switch pages |
| **Main Content** | Files, stats, quick actions | Upload files, view list |
| **Quick Upload Zone** | Drag-drop area | Upload multiple files |
| **Statistics** | Total files, storage used, encrypted count | View at a glance |
| **Recent Uploads** | Last 5 files you uploaded | Quick access |

💡 **Tip:** Sidebar collapses on mobile. Click ☰ hamburger menu to expand.

---

## SECTION 3: CORE FEATURES (15-20 pages)

**3.1 Uploading Files**

*Task: Upload a PDF document to the filing system*

**Method 1: Drag and Drop (Easiest)**

1. Open file explorer (Windows: File Explorer, Mac: Finder)
2. Find the file you want to upload (e.g., `report.pdf`)
3. Go back to St. Clare Filing System browser window
4. Drag the file onto the **[Drag files here to upload]** zone
   - Zone will highlight in blue when you drag over it
5. File upload begins automatically
   - Green progress bar shows (0% to 100%)
   - "Uploading report.pdf..." message appears
6. When done: Green checkmark ✓ and toast message "File uploaded successfully!"

📸 Screenshot: Drag-drop zone with highlighted border, progress bar

---

**Method 2: Browse Button**

1. Click **[📁 Browse]** button
2. File picker dialog opens
3. Navigate to desired folder
4. Select file (hold Ctrl/Cmd to select multiple files)
5. Click **[Open]** or **[Choose]**
6. Upload begins with progress indicator

---

**Upload Options:**

| Option | What It Does | When to Use |
|--------|-------------|------------|
| **Encryption** | Locks file with password (AES-256) | For sensitive docs like budgets |
| **Auto-backup** | Creates copy on schedule | Optional, for important files |
| **Description** | Add notes about file | Help remember file purpose |

**Encryption Workflow (if enabled):**

1. Select files to upload
2. Toggle **[○ Encryption OFF] → [● Encryption ON]**
3. Click **[Set Password]**
4. Enter encryption password:
   - Must be 8+ characters
   - Use mix of letters, numbers, symbols: `MyReport@2024`
5. Strength meter shows: 🟢 Strong / 🟡 Medium / 🔴 Weak
6. Confirm password in second field
7. Click **[Upload with Encryption]**
8. ⚠️ Important: Remember this password! You need it to download the file later.

---

**3.2 Searching and Finding Files**

*Task: Find a specific file by name or date*

**Quick Search (Top of page):**

1. Click search box: **[🔍 ________________]**
2. Type part of filename:
   - Search: `budget` → finds "budget_2024.xlsx", "budget_draft.pdf"
   - Search: `report` → finds all files with "report" in name
3. Press **[Enter]** or click **[🔍 Search]** button
4. Results appear below showing matching files
5. Click on result to view file details

📸 Screenshot: Search box with example queries and result list

---

**Advanced Filtering:**

1. Click **[Filters]** button (funnel icon ⊥)
2. Filtering panel appears with options:
   - **Type:** All / PDF / Word / Excel / Image / Other
   - **Date:** Any / Today / This Week / This Month / This Year
   - **Size:** Any / Tiny (< 1MB) / Small (1-10MB) / Large (10-100MB) / Huge (>100MB)
3. Select desired filters (can combine multiple)
4. Click **[Apply Filters]**
5. File list updates to show only matching files
6. Click **[Reset]** to clear filters

📸 Screenshot: Dropdown menus for each filter type

---

**3.3 Downloading Files**

*Task: Download a file to your computer*

**Simple Download (no encryption):**

1. Find file in list
2. Click file name or **[⬇️ Download]** button
3. Browser downloads file to Downloads folder
4. Notification appears: "Download started"
5. You can open immediately or find in Downloads folder

---

**Encrypted File Download:**

1. Find encrypted file (shows 🔒 lock icon)
2. Click **[⬇️ Download]**
3. Password prompt appears: "Enter password to decrypt"
4. Type the password you used when uploading:
   - **⚠️ Passwords are case-sensitive!**
5. Click **[Decrypt & Download]**
   - Takes 2-10 seconds depending on file size
6. File downloads to your computer
   - Original filename restored automatically

📸 Screenshot: Password entry dialog with masked password field

---

**3.4 Managing Files (View Details)**

*Task: See file information and options*

1. Click file name to select it
2. Click **[ℹ️ Details]** or right-click → **View Details**
3. Details panel shows:
   - Filename and type icon
   - File size
   - Upload date and time
   - Who uploaded it
   - Encryption status: 🔒 YES / ○ NO
   - Number of downloads
   - Description (if any)
4. Actions available:
   - **[⬇️ Download]** - Download this file
   - **[✏️ Rename]** - Change filename
   - **[📎 Copy Link]** - Share link (if sharing enabled)
   - **[🔒 Lock]** - Encrypt plaintext file
   - **[🗑️ Delete]** - Move to trash
   - **[ℹ️ More Info]** - View version history, access log

---

**3.5 Deleting Files (Moving to Trash)**

*Task: Delete a file you no longer need*

**Soft Delete (Recoverable):**

1. Find file in list
2. Click **[🗑️]** delete icon
3. Confirmation dialog: "Move file to trash? (Can restore within 30 days)"
4. Click **[Continue]** to confirm
5. Green toast: "File moved to trash"
6. File disappears from main list
7. File appears in **[🗑️ Trash]** sidebar section

💡 **Tip:** Soft delete is safer. File stays 30 days before auto-removal.

---

**Viewing Trash:**

1. Click **[🗑️ Trash]** in sidebar
2. See all deleted files with dates:
   - "Deleted 5 days ago" - "25 days to recover" ← Safe to restore
   - "Deleted 28 days ago" - "2 days to recover" ← Expiring soon!
3. For each file, choose:
   - **[↩️ Restore]** - Move back to active files
   - **[⊗ Permanently Delete]** - Unrecoverable (cannot undo!)

---

**Permanent Deletion:**

⚠️ **WARNING: This cannot be undone!**

1. Click **[⊗ Permanently Delete]**
2. Confirmation: "Are you sure? This file will be deleted permanently."
3. Type filename to confirm deletion (prevents accidents)
4. Click **[Confirm Permanent Delete]**
5. File is gone from system and storage

---

**3.6 Using Dark Mode**

*Task: Switch to dark theme for night reading*

1. Click sun/moon icon in top-right: **[☀️]** or **[🌙]**
2. Theme switches immediately
3. Colors invert:
   - Light backgrounds → Dark backgrounds
   - Dark text → Light text
4. Setting saved automatically in your browser
5. Next login: Your preference remembered

---

## SECTION 4: ADVANCED FEATURES (5-10 pages)

**4.1 Sharing Files (If Enabled)**

*Task: Share a file link with colleague*

1. Open file details
2. Click **[📎 Copy Link]**
3. Shareable link copied to clipboard
4. Share via email: `Share this: [link]`
5. Recipient clicks link and enters password if encrypted
6. Optional: Set expiry date on share (expires after 7 days)

---

**4.2 File Versioning (If Enabled)**

*Task: Recover an older version of a file*

1. Click file → **[ℹ️ More Info]**
2. "Version History" section shows:
   - v3 (Current) - March 28, 2026 - 123.5 KB ← You edit this
   - v2 - March 25, 2026 - 120.2 KB
   - v1 - March 22, 2026 - 118.0 KB
3. Click previous version to download or restore it

---

**4.3 Audit Logs (Admin Only)**

*Task: View who accessed files when (compliance)*

1. Click **[📊 Analytics]** in sidebar
2. Click **[📜 Audit Logs]**
3. Table shows all file actions:

| User | Action | File | Date | Status |
|------|--------|------|------|--------|
| admin | LOGIN | - | 28 Mar 14:32 | SUCCESS |
| john | UPLOAD | budget.xlsx | 28 Mar 14:35 | SUCCESS |
| jane | DOWNLOAD | budget.xlsx | 28 Mar 15:00 | SUCCESS |
| admin | DELETE | old_doc.pdf | 29 Mar 09:00 | SUCCESS |

4. Filter by: User, Action, Date Range
5. Export as CSV for reports
6. Shows IP address and fingerprint for security

---

## SECTION 5: TROUBLESHOOTING (3-5 pages)

**Common Problems & Solutions:**

| Problem | Causes | Solution |
|---------|--------|----------|
| **"File too large"** | File > 500MB | Split file into smaller parts OR request quota increase |
| **Wrong password error** | Encrypted file, wrong pwd | Check caps lock, try again. No reset available (pwd not stored) |
| **Upload won't start** | Browser cache, connection | Clear browser cache, refresh page, retry |
| **Download very slow** | Large file, slow connection | Download during off-peak hours, try different network |
| **Can't find file** | Might be in trash | Check trash folder for deleted file |
| **Logout happens suddenly** | Token expired (7 days) | Login again, sessions auto-clear for security |
| **Can't access from new device** | Browser cache, cookies | Clear cookies, login again |

---

**Contacting IT Support:**

- **Email:** itsupport@stclare.edu
- **Phone:** (555) 123-4567 ext. 2000
- **Hours:** Monday-Friday 8 AM - 6 PM EST
- **Include in ticket:** Error message, browser name, filename (if safe to share)

---

## SECTION 6: FAQ (2-3 pages)

**Q1: Is my password stored somewhere?**
A: No. Passwords are hashed with PBKDF2-SHA256 using 100,000 iterations. No plaintext password is ever saved.

**Q2: Can IT read my encrypted files?**
A: No. Files encrypted with your password cannot be decrypted without the password. IT cannot recover lost passwords.

**Q3: How long do files stay in trash?**
A: 30 days. After 30 days, files are automatically and permanently deleted. You can restore anytime within those 30 days.

**Q4: Can I access files from my phone?**
A: Yes. St. Clare Filing System works on iPhone and Android browsers. Tap ☰ menu to navigate.

**Q5: What file types are supported?**
A: PDF, Word (DOC, DOCX), Excel (XLS, XLSX), PowerPoint (PPT, PPTX), JPG, PNG, TXT

**Q6: Is my upload data private?**
A: Yes. Files are encrypted in transit (HTTPS) and at rest (optional AES-256). Only you can access your files unless you share a link.

**Q7: Can I download multiple files at once?**
A: Select multiple files with checkboxes, then click **[⬇️ Download All]**. They download as a ZIP file.

**Q8: I forgot my login password. How do I reset it?**
A: Click "Forgot your password?" on login page. An email with reset link is sent to your email address on file.

---

## SECTION 7: APPENDIX

**A. Keyboard Shortcuts**

| Shortcut | Action |
|----------|--------|
| Ctrl+F (or Cmd+F) | Focus search box |
| Ctrl+U (or Cmd+U) | Open upload dialog |
| Delete or Backspace | Delete selected file |
| R | Restore file from trash |
| Escape (Esc) | Close dialog or modal |
| T | Toggle theme (light/dark) |

---

**B. Glossary**

- **Encryption:** Mathematical process that locks file content with a password
- **Token:** Security credential that proves you're logged in (expires after 7 days)
- **Soft Delete:** Remove from list but keep in trash for 30 days
- **Audit Log:** Permanent record of who did what and when (compliance)
- **PBKDF2:** Password-based cryptographic key derivation function
- **AES-256:** Military-grade encryption algorithm
- **Quota:** Maximum storage space allowed (2 GB per user)
- **Hash:** One-way encryption of password (cannot unhash)

---

**C. System Requirements**

| Requirement | Minimum | Recommended |
|------------|---------|-------------|
| **Browser** | Chrome 80+, Firefox 75+ | Latest version |
| **Internet** | 2 Mbps | 10 Mbps |
| **Device** | Smartphone | Desktop/Laptop |
| **OS** | Windows 7, Mac OS 10.12, iOS 11, Android 6 | Windows 10+, Mac OS 10.14+, iOS 14+, Android 9+ |

---

**D. Contact Information**

**IT Support Desk:**
- Email: itsupport@stclare.edu
- Phone: (555) 123-4567 ext. 2000
- Hours: Mon-Fri 8 AM - 6 PM EST
- Avg. Response Time: 2 hours

**Documentation Updates:**
- Latest version: April 4, 2026
- Check for updates: www.stclare.edu/filing-system/docs

---

**End of User Manual Outline**

*Expected completion: 30-50 pages when filled with screenshots, detailed workflows, and troubleshooting guides.*
