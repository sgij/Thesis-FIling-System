# 2. PROGRAM FLOWCHARTS
## St. Clare Filing System - Capstone Project

**Document Classification:** IEEE 1016 - Software Design Documentation
**Version:** 1.0
**Date:** April 4, 2026
**Author:** Capstone Team
**Purpose:** Detailed step-by-step control flow for 6 major processes using ANSI flowchart symbols

---

## FLOWCHART LEGEND

```
┌─────────────┐  =  Terminal/Start/Stop (oval)
│   START     │
└─────────────┘

┌─────────────┐  =  Process/Action (rectangle)
│   Process   │
└─────────────┘

      ◇       =  Decision/Condition (diamond)
     / \
    /   \

┌─────────────┐  =  Data/Input/Output (parallelogram)
╱             ╲
 │   Input    │
 ╲             ╱
  └─────────────┘

[   Database   ] = Data Store (parallel lines)

     │         =  Flow arrows
     ▼
```

---

## FLOWCHART 1: USER LOGIN PROCESS

```
                        ┌──────────┐
                        │  START   │
                        └────┬─────┘
                             │
                    ┌────────▼────────┐
                    │ User enters     │
                    │ username &      │
                    │ password        │
                    └────────┬────────┘
                             │
               ┌─────────────▼──────────────┐
               │   Validate Input Format    │
               │   (not empty, 8+ chars)    │
               └──────────┬────────┬────────┘
                          │        │
                    YES   │        │   NO
                          │        │
                    ┌─────▼┐  ┌──▼──────────────┐
                    │      │  │ Show Error:     │
                    ▼      │  │ "Invalid Input" │
           ┌──────────────┐│  └────────┬────────┘
           │   D1 USERS   ││           │
           │ DATABASE     │▼           │
           └──────┬───────┘            │
                  │                    │
        ┌─────────▼─────────┐          │
        │ SELECT user       │          │
        │ WHERE username=?  │          │
        └────┬────────┬─────┘          │
             │        │                │
       FOUND │        │ NOT FOUND      │
             │        │                │
        ┌────▼┐   ┌───▼────────┐      │
        │     │   │ Show Error:│      │
        ▼     │   │ "User does │      │
   ┌────────┐│   │ not exist" │      │
   │ User   ││   └────┬───────┘      │
   │Record? ││        │              │
   └────────┘│        │              │
             │        │              │
        ┌────▼──────────────┐         │
        │  Hash Input Pswd  │         │
        │  with PBKDF2      │         │
        │  (100k iterations)│         │
        └────┬──────────────┘         │
             │                        │
        ┌────▼─────────────────────┐  │
        │ Compare Hashes:          │  │
        │ Input Hash == Stored?    │  │
        └──┬──────────┬────────────┘  │
           │          │               │
      MATCH│          │MISMATCH       │
           │          │               │
          ▼           └────┬──────────┐
                           ▼          │
              ┌─────────────────────┐ │
              │ Show Error:         │ │
              │ "Incorrect Password"│ │
              └────┬────────────────┘ │
                   │                  │
        ┌──────────┴──────────────────┘
        │
        ▼
   ┌─────────────────────────┐
   │  Generate JWT Token     │
   │  - Algorithm: HS256     │
   │  - Expiry: 7 days       │
   │  - Payload: userId,     │
   │    username, role       │
   └────┬────────────────────┘
        │
        ▼
   ┌──────────────────┐
   │ Write Audit Log  │
   │ to D3            │
   │ (Action: LOGIN,  │
   │  Status: SUCCESS)│
   └────┬─────────────┘
        │
   ┌────▼────────────────────┐
   │ Return Token +           │
   │ User Object To UI        │
   └────┬────────────────────┘
        │
   ┌────▼────────────────────┐
   │ P6 UI: Store Token       │
   │ in D5 Cache              │
   │ (localStorage)           │
   │ + Set Expiry Timestamp   │
   └────┬────────────────────┘
        │
   ┌────▼────────────────────┐
   │ Redirect to Dashboard    │
   │ (index.html)             │
   └────┬────────────────────┘
        │
   ┌────▼──────┐
   │    END    │
   └───────────┘
```

**Key Decision Points:**
1. Input validation (empty, length, format)
2. User exists in D1 database
3. Password hash matches stored hash

**Error Handling:**
- Invalid input format → Show toast + Stay on login page
- User not found → Show toast + Stay on login page
- Password incorrect → Show toast + Stay on login page
- Network error → Show toast + Retry option

**Performance Notes:**
- Password hashing takes ~300-500ms (intentional delay for security)
- Database query uses indexed username column (~10ms)
- Token generation: ~5ms

---

## FLOWCHART 2: FILE UPLOAD PROCESS

```
                        ┌──────────┐
                        │  START   │
                        └────┬─────┘
                             │
              ┌──────────────▼─────────────┐
              │ User Selects Files via:    │
              │ A) Drag-drop, OR           │
              │ B) File browser button     │
              └──────┬────────────┬────────┘
                     │            │
                A    │            │    B
                     │            │
            ┌────────▼┐    ┌──────▼──────────┐
            │Drag-Drop│    │ Click Browse    │
            │Zone     │    │ Button          │
            │Listener │    └────────┬────────┘
            └────┬────┘             │
                 │      ┌──────────┘
                 │      │
           ┌─────▼──────▼─────────────┐
           │ Get File List from Event │
           │ (files array)            │
           └────┬────────────┬────────┘
                │            │
           YES  │            │  NO/EMPTY
                │            │
           ┌────▼─────────────▼──────────┐
           │  Validate File Types:       │
           │  - PDF, DOC, DOCX           │
           │  - XLS, XLSX, PPT, PPTX     │
           │  - JPG, PNG, TXT            │
           └────┬────────────┬───────────┘
                │            │
          VALID │            │ INVALID
                │            │
           ┌────▼┐      ┌────▼──────────────┐
           │     │      │ Show Error Toast: │
           ▼     │      │ "Unsupported      │
        ┌──────┐│      │ file type"        │
        │Valid?││      └────┬───────────────┘
        └──────┘│           │
               │            │
        ┌──────▼─────────────▼──────────────┐
        │  Validate File Size:              │
        │  - Single: Max 500MB              │
        │  - Total: Max 2GB per user        │
        └────┬────────────┬─────────────────┘
             │            │
        OK   │            │ TOO LARGE
             │            │
        ┌────▼┐      ┌────▼──────────────┐
        │     │      │ Show Error Toast: │
        ▼     │      │ "File too large"  │
    ┌───────┐│      └────┬───────────────┘
    │ Size │││           │
    │Check?││            │
    └───────┘│           │
             │           │
        ┌────▼───────────▼──────────────┐
        │ For Each File in Selection:   │
        └─────────┬────────────────────┘
                  │
           ┌──────▼──────────────┐
           │ Get File Binary     │
           │ Data via             │
           │ FileReader API      │
           └────┬────────────────┘
                │
        ┌───────▼──────────┐
        │ Show Progress    │
        │ Bar Display:     │
        │ "Preparing..."   │
        └───────┬──────────┘
                │
        ┌───────▼────────────────────┐
        │ Should Encrypt File?       │
        │ [User choice on modal]     │
        └──┬───────────────┬──────────┘
           │               │
      YES  │               │ NO
           │               │
      ┌────▼────────┐ ┌───▼──────────────┐
      │ Call P3     │ │ Skip Encryption  │
      │ Encryption  │ │ (plaintext)      │
      │ Service     │ └───┬──────────────┘
      └────┬────────┘     │
           │              │
      ┌────▼──────────────▼──────────┐
      │ Create FormData Object:      │
      │ - file=<binary>              │
      │ - filename=<string>          │
      │ - is_encrypted=<boolean>     │
      │ - user_id=<from token>       │
      └────┬───────────────────────┬─┘
           │                       │
           │ ┌─────────────────────▼─────────────┐
           │ │ Show Progress Bar:                │
           │ │ "Uploading... 0%"                 │
           │ └──────────────────────────────────┘
           │
      ┌────▼────────────────────────────┐
      │ HTTP POST to Backend:            │
      │ /api/files/upload                │
      │ Headers:                         │
      │ - Authorization: Bearer <token>  │
      │ Body: FormData (multipart)       │
      │ Progress: Track upload %         │
      └────┬─────────────┬───────────────┘
           │             │
      OK   │             │ ERROR
      200  │             │ (4xx/5xx)
           │             │
      ┌────▼──────────────▼──────────┐
      │ Backend Processing:          │
      │ 1. Verify JWT token (valid?) │
      │ 2. Check file size again     │
      │ 3. Generate file ID (UUID)   │
      │ 4. Check disk space          │
      └────┬───────────────┬─────────┘
           │               │
          OK               ERROR
           │               │
      ┌────▼────────┐ ┌───▼──────────────┐
      │             │ │ Return Error 422 │
      ▼             │ │ "Upload failed"  │
    ┌──────────┐   │ └───┬──────────────┘
    │ Save to  │   │     │
    │ File     │   │     │
    │ System  │   │     │
    │ Storage  │   │     │
    └────┬─────┘   │     │
         │         │     │
    ┌────▼────────────┐  │
    │ Record in D2    │  │
    │ FILES DB:       │  │
    │ - file_id       │  │
    │ - filename      │  │
    │ - file_size     │  │
    │ - upload_date   │  │
    │ - user_id       │  │
    │ - is_encrypted  │  │
    └────┬────────────┘  │
         │               │
    ┌────▼────────────────▼──────────┐
    │ Write Audit Log to D3:         │
    │ - Action: UPLOAD               │
    │ - File_ID: <new UUID>          │
    │ - Status: SUCCESS/FAILURE      │
    │ - Timestamp: Now               │
    │ - User_ID: <from token>        │
    └────┬───────────┬───────────────┘
         │           │
        OK           ERROR
         │           │
    ┌────▼───────────▼──────────┐
    │ Notify P4 Logger:         │
    │ Create toast message      │
    └────┬────────────┬─────────┘
         │            │
      SUCCESS      FAILURE
         │            │
    ┌────▼───┐  ┌─────▼──────────────┐
    │ "File  │  │ "Upload failed:    │
    │uploaded│  │ [error details]"   │
    │success"│  └─────┬──────────────┘
    └────┬───┘        │
         │            │
    ┌────▼────────────▼──────────┐
    │ Return Response to UI:     │
    │ - file_id (if success)     │
    │ - error_msg (if failure)   │
    └────┬───────────────────────┘
         │
    ┌────▼──────────────────┐
    │ P6 UI: Update File    │
    │ List Display          │
    │ Add new file to table  │
    │ Hide progress bar     │
    └────┬──────────────────┘
         │
    ┌────▼───────────────────┐
    │ Clear file input       │
    │ Allow next upload      │
    └────┬──────────────────┘
         │
    ┌────▼──────┐
    │    END    │
    └───────────┘
```

**Key Decision Points:**
1. File type validation (allowed extensions)
2. File size validation (individual + total quota)
3. Encryption choice (user preference)
4. Successful upload confirmation
5. Error handling and retry logic

**Performance Notes:**
- Binary file read: async FileReader API (~100-500ms for large files)
- Encryption: ~1-2s for 100MB file (AES-GCM)
- Backend storage: ~2-5s for 100MB (depends on I/O)
- Frontend progress updates: 250ms intervals

---

## FLOWCHART 3: FILE DOWNLOAD/DECRYPTION PROCESS

```
                        ┌──────────┐
                        │  START   │
                        └────┬─────┘
                             │
              ┌──────────────▼──────────────┐
              │ User Clicks Download Icon   │
              │ on file in list             │
              └──────┬─────────────┬────────┘
                     │             │
                     │ fileID      │
                     │             │
              ┌──────▼─────────────▼────────┐
              │ Verify User Authentication  │
              │ Check JWT token in D5 Cache │
              │ - Token exists?             │
              │ - Token not expired?        │
              └────┬───────────────┬────────┘
                   │               │
              VALID│               │INVALID
                   │               │
              ┌────▼───┐     ┌─────▼──────────┐
              │         │     │ Redirect to:   │
              ▼         │     │ /login.html    │
          ┌────────┐   │     └─────┬──────────┘
          │  Auth  │   │           │
          │Valid? │   │           │
          └────────┘   │      ┌────▼──────┐
                       │      │    END    │
                       │      └───────────┘
              ┌────────▼──────────────────┐
              │ Query D2 FILES DB:        │
              │ SELECT * WHERE            │
              │ file_id = ? AND           │
              │ user_id = ? AND           │
              │ trash_date IS NULL        │
              └────┬───────────┬──────────┘
                   │           │
              FOUND│           │NOT FOUND
                   │           │
              ┌────▼───┐  ┌────▼──────────┐
              │         │  │ Error 404:    │
              ▼         │  │ "File not     │
          ┌────────┐   │  │ found"        │
          │  File  │   │  └────┬──────────┘
          │Exists? │   │       │
          └────────┘   │       │
                       │       │
              ┌────────▼───────▼────────┐
              │ Get File Metadata:      │
              │ - is_encrypted?         │
              │ - file_size             │
              │ - file_path             │
              └────┬────────────┬───────┘
                   │            │
              YES  │            │ NO
              Enc? │            │
                   │            │
              ┌────▼────────────▼──────────┐
              │ Retrieve File Content      │
              │ from OS Filesystem         │
              │ (async stream)             │
              └────┬──────────────────────┘
                   │
        ┌──────────▼──────────┐
        │ If Encrypted:       │
        │ Call P3 Decryption  │
        │ Service             │
        └────┬────────────────┘
             │
        ┌────▼───────────────────────────┐
        │ Prompt User for Password       │
        │ (show modal dialog)             │
        │ "Enter password to decrypt"     │
        └────┬────────────┬──────────────┘
             │            │
          OK │            │ CANCEL
             │            │
        ┌────▼─────┐ ┌────▼──────────┐
        │           │ │ Hide modal    │
        ▼           │ │ Stop download │
    ┌────────────┐ │ └────┬──────────┘
    │ User       │ │      │
    │Entered Pwd?│ │      │
    └────────────┘ │  ┌───▼──────┐
                   │  │    END   │
                   │  └──────────┘
        ┌──────────▼─────────────────┐
        │ P3 Decryption Process:     │
        │ 1. Extract salt from file  │
        │ 2. PBKDF2 derive key from  │
        │    password + salt         │
        │ 3. AES-GCM decrypt         │
        └────┬────────┬──────────────┘
             │        │
           OK│        │FAIL
             │        │
        ┌────▼────────▼──────────┐
        │ Decryption successful? │
        └────┬────────┬──────────┘
             │        │
           YES│       │NO
             │        │
        ┌────▼────┐┌──▼──────────┐
        │          ││ Error Modal:│
        ▼          ││ "Wrong pwd" │
    ┌────────┐    │└──┬──────────┘
    │Decrypt │    │   │
    │ OK?    │    │   │
    └────────┘    │   │
                  │   │
        ┌─────────▼───▼──────────┐
        │ Decrypted File Content │
        │ in Memory (blob)       │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ Create Download Link:  │
        │ object.createObjectURL│
        │(blob)                 │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ Create <a> element:   │
        │ href = blob URL       │
        │ download = filename   │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ Trigger Browser:      │
        │ link.click()          │
        │ (start download)      │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ Write to D3 Audit Log:│
        │ - Action: DOWNLOAD    │
        │ - File_ID             │
        │ - Status: SUCCESS     │
        │ - Timestamp           │
        │ - User_ID             │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ P4 Notification:      │
        │ Show Toast:           │
        │ "Download started"    │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ Cleanup:              │
        │ Revoke blob URL       │
        │ Clear memory          │
        └────┬──────────────────┘
             │
        ┌────▼──────┐
        │    END    │
        └───────────┘
```

**Key Decision Points:**
1. User authentication (valid token)
2. File exists + belongs to user
3. File is encrypted or plaintext
4. Correct password provided (if encrypted)

**Error Handling:**
- File not found → Error modal
- Wrong password → Error modal + Retry option
- Network error → Show error + Retry
- Quota exceeded → Show error

---

## FLOWCHART 4: FILE DELETE/TRASH PROCESS

```
                        ┌──────────┐
                        │  START   │
                        └────┬─────┘
                             │
              ┌──────────────▼──────────────┐
              │ User Clicks Delete/Trash    │
              │ Icon on file                │
              └──────┬─────────────┬────────┘
                     │             │
                     │ fileID      │
                     │             │
              ┌──────▼─────────────▼────────┐
              │ Show Confirmation Modal:    │
              │ "Move to trash?"             │
              │ [Cancel] [Delete]           │
              └────┬───────────────┬────────┘
                   │               │
              CANCEL│               │CONFIRM
                   │               │
              ┌────▼───┐      ┌────▼──────────┐
              │         │      │               │
              ▼         │      ▼               │
          ┌────────┐   │   ┌─────────┐       │
          │Confirm?│   │   │ User    │       │
          └────────┘   │   │Confirmed│      │
                       │   └─────────┘      │
              ┌────────▼───────────────────┘
              │
        ┌─────▼──────────────────┐
        │ Query D2 FILES DB:     │
        │ SELECT * WHERE         │
        │ file_id = ? AND        │
        │ user_id = ?            │
        └────┬────────┬──────────┘
             │        │
         FOUND│       │NOT FOUND
             │        │
        ┌────▼───┐┌──▼──────────┐
        │         ││ Error 404:  │
        ▼         ││ "File not   │
    ┌────────┐   ││ found"      │
    │ Found? │   │└──┬──────────┘
    └────────┘   │   │
                 │   │
        ┌────────▼───▼──────────┐
        │ Check if Already      │
        │ in Trash:             │
        │ trash_date IS NOT NULL│
        └────┬────────┬─────────┘
             │        │
          NO │        │YES
             │        │
        ┌────▼───┐┌──▼──────────┐
        │         ││ Show Error: │
        ▼         ││ "Already    │
    ┌────────┐   ││ in trash"   │
    │ In     │   │└──┬──────────┘
    │Trash? │   │   │
    └────────┘   │  ┌▼──────┐
                 │  │  END  │
                 │  └───────┘
        ┌────────▼────────────────┐
        │ Update D2 DATABASE:     │
        │ UPDATE files SET        │
        │ trash_date = NOW()      │
        │ WHERE file_id = ?       │
        └────┬───────────┬────────┘
             │           │
           OK│           │ERROR
             │           │
        ┌────▼────┐┌─────▼──────┐
        │          ││ DB Error:  │
        ▼          ││ Rollback   │
    ┌────────┐    │└─┬──────────┘
    │ Update │    │  │
    │  OK?   │    │  │
    └────────┘    │  │
                  │  │
        ┌─────────▼──▼──────────┐
        │ Write Audit Log (D3): │
        │ - Action: DELETE      │
        │ - File_ID             │
        │ - Status: SUCCESS/FAIL│
        │ - User_ID             │
        │ - Timestamp           │
        └────┬────────┬─────────┘
             │        │
           OK│        │ERROR
             │        │
        ┌────▼────────▼──────────┐
        │ Notify P4 Logger:      │
        │ Create Toast Message   │
        └────┬────────┬──────────┘
             │        │
          SUCCESS  FAILURE
             │        │
        ┌────▼────────▼──────────┐
        │ Show Toast:            │
        │ "File moved to trash"  │
        │ OR "Delete failed"     │
        └────┬──────────────────┘
             │
        ┌────▼──────────────────┐
        │ P6 UI: Refresh List   │
        │ Hide file from        │
        │ active files section   │
        │ (trash_date not null) │
        └────┬──────────────────┘
             │
        ┌────▼──────┐
        │    END    │
        └───────────┘
```

**Key Decision Points:**
1. User confirmation (avoid accidental deletion)
2. File exists and belongs to user
3. File not already in trash
4. Database update successful

**Note:** This is a **soft delete** - file is still recoverable from trash for 30 days.

---

## FLOWCHART 5: FILE RESTORE FROM TRASH PROCESS

```
                        ┌──────────┐
                        │  START   │
                        └────┬─────┘
                             │
              ┌──────────────▼──────────────┐
              │ User Navigates to Trash     │
              │ Section in UI (P6)          │
              └────┬─────────────────────────┘
                   │
              ┌────▼──────────────────────┐
              │ P6 Loads Trash Page:      │
              │ Query D2 WHERE            │
              │ user_id = ? AND           │
              │ trash_date IS NOT NULL    │
              └────┬────────┬─────────────┘
                   │        │
              FILES│        │NO FILES
              FOUND│        │IN TRASH
                   │        │
              ┌────▼─┐ ┌───▼──────────────┐
              │      │ │ Show Message:    │
              ▼      │ │ "Trash is empty" │
          ┌────────┐ │ └───┬──────────────┘
          │ Files? │ │     │
          └────────┘ │    ┌▼──────┐
                     │    │  END  │
                     │    └───────┘
          ┌──────────▼─────────────────┐
          │ Display File List in       │
          │ Trash Section with:        │
          │ - Filename                 │
          │ - Delete date              │
          │ - Restore button           │
          │ - Permanent delete button  │
          └────┬─────────────┬─────────┘
               │             │
               │ USER CLICKS │
               │ RESTORE BTN │
               │             │
          ┌────▼─────────────▼────────┐
          │ Show Confirmation Modal:  │
          │ "Restore this file?"      │
          │ [Cancel] [Restore]        │
          └────┬───────────┬──────────┘
               │           │
          CANCEL│          │CONFIRM
               │           │
          ┌────▼───┐  ┌────▼──────────┐
          │         │  │               │
          ▼         │  ▼               │
      ┌────────┐   │ ┌──────────┐    │
      │Restore?│   │ │ User     │    │
      └────────┘   │ │ Confirmed│   │
                   │ └──────────┘    │
          ┌────────▼────────────────┐
          │ Query D2 DATABASE:      │
          │ SELECT * WHERE          │
          │ file_id = ? AND         │
          │ user_id = ? AND         │
          │ trash_date IS NOT NULL  │
          └────┬────────┬───────────┘
               │        │
           FOUND│       │NOT FOUND
               │        │
          ┌────▼──┐┌───▼──────────┐
          │        ││ Error 404:   │
          ▼        ││ "File not in │
      ┌────────┐  ││ trash"       │
      │ Found? │  │└──┬───────────┘
      └────────┘  │   │
                  │   │
          ┌───────▼───▼──────────┐
          │ Check Trash Age:     │
          │ trash_date + 30 days │
          │ >= NOW()?            │
          └────┬────────┬────────┘
               │        │
            OK │        │EXPIRED
               │        │
          ┌────▼──┐┌───▼──────────┐
          │        ││ Error:       │
          ▼        ││ "File too    │
      ┌────────┐  ││ old to       │
      │Valid?  │  ││ restore      │
      └────────┘  │└──┬───────────┘
                  │   │
          ┌───────▼───▼──────────┐
          │ Update D2 DATABASE:  │
          │ UPDATE files SET     │
          │ trash_date = NULL    │
          │ WHERE file_id = ?    │
          └────┬─────┬──────────┘
               │     │
             OK│     │ERROR
               │     │
          ┌────▼──┐┌─▼───────────┐
          │        ││ DB Error:   │
          ▼        ││ Rollback    │
      ┌────────┐  │└──┬──────────┘
      │Update  │  │   │
      │  OK?   │  │   │
      └────────┘  │   │
                  │   │
          ┌───────▼───▼──────────┐
          │ Write Audit Log (D3):│
          │ - Action: RESTORE    │
          │ - File_ID            │
          │ - Status: SUCCESS    │
          │ - User_ID            │
          │ - Timestamp          │
          └────┬─────────────────┘
               │
          ┌────▼──────────────────┐
          │ Notify P4:            │
          │ Show Toast:           │
          │ "File restored"       │
          └────┬──────────────────┘
               │
          ┌────▼──────────────────┐
          │ P6 UI:                │
          │ Refresh Both:         │
          │ - Remove from trash   │
          │ - Add to active files │
          └────┬──────────────────┘
               │
          ┌────▼──────┐
          │    END    │
          └───────────┘
```

**Key Decision Points:**
1. File exists in trash
2. File is not expired (within 30-day window)
3. Successful database update

**Permanent Deletion (30-day limit):**
- Files in trash > 30 days auto-deleted
- User can manually permanently delete anytime

---

## FLOWCHART 6: FILE SEARCH/FILTER PROCESS

```
                        ┌──────────┐
                        │  START   │
                        └────┬─────┘
                             │
              ┌──────────────▼──────────────┐
              │ User Types in Search Box    │
              │ and/or Selects Filters      │
              └────┬─────────────┬─────────┘
                   │             │
              TEXT │             │FILTER SELECTION
              ENTERED          (Date/Size/Type)
                   │             │
          ┌────────▼─────────────▼────────┐
          │ Get Search Parameters:        │
          │ - search_text (if any)        │
          │ - filter_type (pdf/doc/etc)   │
          │ - filter_date (today/week)    │
          │ - sort_by (name/date/size)    │
          └────┬───────────┬──────────────┘
               │           │
          TEXT │           │NO TEXT
             ENTERED       │
               │           │
          ┌────▼────────────▼──────────┐
          │ Validate Search Input:     │
          │ - Not empty                │
          │ - Length 1-100 chars       │
          │ - No SQL injection         │
          └────┬────────┬──────────────┘
               │        │
           VALID│       │INVALID
               │        │
          ┌────▼────┐┌──▼──────────┐
          │          ││ Show Error: │
          ▼          ││ "Invalid    │
      ┌────────┐    ││ search text"│
      │Valid?  │    │└──┬──────────┘
      └────────┘    │   │
                    │   │
          ┌─────────▼───▼──────────┐
          │ Build SQL Query:       │
          │ SELECT * FROM files    │
          │ WHERE user_id = ?      │
          │ AND trash_date IS NULL │
          │ (add filters as needed)│
          └────┬──────┬───────────┘
               │      │
           FILTERS    NO FILTERS
               │      │
          ┌────▼──────▼──────────────┐
          │ Add WHERE Clauses:       │
          │ - IF text_search:        │
          │   AND filename ILIKE ?   │
          │ - IF type_filter:        │
          │   AND file_type = ?      │
          │ - IF date_filter:        │
          │   AND upload_date >      │
          │   DATE(?) to DATE(?)     │
          └────┬────────────────────┘
               │
          ┌────▼────────────────────┐
          │ Add Sort Clause:        │
          │ - ORDER BY [sort_field] │
          │ - ASC or DESC           │
          └────┬────────────────────┘
               │
          ┌────▼────────────────────┐
          │ Add Pagination:         │
          │ - LIMIT 20 OFFSET ?     │
          │ (20 items per page)     │
          └────┬────────────────────┘
               │
          ┌────▼─────────────────────────┐
          │ Execute Query on D2:         │
          │ Run SQL against PostgreSQL   │
          │ with parameters (safe)       │
          └────┬─────────┬───────────────┘
               │         │
            OK │         │NO RESULTS
               │         │
          ┌────▼────┐┌──▼──────────────┐
          │          ││ Show Message:   │
          ▼          ││ "No files match │
      ┌────────┐    ││ your search"    │
      │Results?│   │└──┬──────────────┘
      └────────┘    │   │
                    │   │
          ┌─────────▼───▼──────────┐
          │ Process Results:       │
          │ - Get result count     │
          │ - Calculate pages      │
          │ - Extract metadata     │
          └────┬──────────────────┘
               │
          ┌────▼────────────────────┐
          │ P6 Rendering:           │
          │ Populate results in     │
          │ UI table with:          │
          │ - Checkbox              │
          │ - Filename              │
          │ - Size                  │
          │ - Upload date           │
          │ - Actions (download,    │
          │   delete, etc)          │
          └────┬────────────────────┘
               │
          ┌────▼────────────────────┐
          │ Add Pagination:         │
          │ - Page buttons          │
          │ - Result count display  │
          │ - "X of Y results"      │
          └────┬────────────────────┘
               │
          ┌────▼────────────────────┐
          │ Write Audit Log (D3):   │
          │ - Action: SEARCH        │
          │ - Search_text           │
          │ - Filters_applied       │
          │ - Results_count         │
          │ - User_ID               │
          │ - Timestamp             │
          └────┬────────────────────┘
               │
          ┌────▼──────┐
          │    END    │
          └───────────┘
```

**Key Decision Points:**
1. Search text entered (if empty, show all active files)
2. Search text validation (prevent SQL injection)
3. Filter selection (optional, can combine multiple)
4. Results found

**Performance Notes:**
- Database indexes on: user_id, trash_date, filename
- Full-text search: ILIKE operator (case-insensitive LIKE)
- Result pagination: 20 items per page to reduce memory
- Query execution time: typically <100ms with indexes

---

## SUMMARY TABLE

| Flowchart | Entry Point | Key Decisions | Error Paths | Exit Condition |
|-----------|------------|---------------|------------|-----------------|
| 1. Login | /login.html | Credentials valid? | Invalid input, wrong pwd, user not found | Redirect to dashboard |
| 2. Upload | Dashboard | File type OK? Size OK? Encrypt? | Upload failed, quota exceeded | File in list, audit logged |
| 3. Download | File list | User auth OK? File exists? Encrypted? | File not found, wrong pwd | File downloaded locally |
| 4. Delete | File list | Confirm OK? Already trash? | File not found, DB error | Moved to trash section |
| 5. Restore | Trash | File in trash? Not expired? | File not found, expired | Moved back to active list |
| 6. Search | Dashboard | Text valid? | No results, invalid input | Results displayed, paginated |

---

## ALGORITHM COMPLEXITY

| Process | Time Complexity | Space Complexity | Limiting Factor |
|---------|-----------------|-----------------|-----------------|
| Login (step 3-5) | O(1) password hash | O(n) salt+hash | PBKDF2 iterations (100k) |
| Upload (binary read) | O(n) file size | O(n) in memory | File size (max 500MB) |
| Encryption (AES-GCM) | O(n) file size | O(n) buffer | CPU speed, file size |
| Download (stream) | O(n) file size | O(1) stream buffer | Network bandwidth |
| Delete (soft delete) | O(1) UPDATE | O(1) | DB write speed |
| Search (SQL) | O(n log n) with index | O(k) k=result size | Index efficiency |

---

**END OF FLOWCHART DOCUMENT**
