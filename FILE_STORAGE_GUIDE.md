# File Storage with PostgreSQL & Express Setup Guide

This guide explains how to use the new PostgreSQL file storage system integrated with Express.

## Architecture Overview

```
Frontend (HTML5 + JavaScript)
    ↓
FileService.js (API Client)
    ↓
Express Server (Node.js)
    ↓
Controllers (Business Logic)
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

## Database Schema

Your Prisma schema includes three main models for file management:

### 1. **File Model** (Regular Files)
```prisma
model File {
  id              String    @id @default(cuid())
  userId          String    // User who uploaded the file
  user            User      @relation(fields: [userId], references: [id])

  name            String    @db.VarChar(255)
  type            String    @db.VarChar(50)  // pdf, doc, image, etc.
  size            BigInt    // Size in bytes
  mimeType        String    @db.VarChar(100)

  contentBase64   String?   @db.Text          // Base64 encoded file content
  storagePath     String?   @db.Text          // Path to file on disk

  uploadedAt      DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime? // Soft delete support
}
```

### 2. **SecureFile Model** (Encrypted Files)
```prisma
model SecureFile {
  id              String    @id @default(cuid())
  userId          String

  name            String    @db.VarChar(255)
  type            String    @db.VarChar(50)
  size            BigInt
  mimeType        String    @db.VarChar(100)

  encrypted       Boolean   @default(true)
  encryptedContent String   @db.Text         // Encrypted content in Base64
  iv              String    @db.VarChar(255) // Initialization vector
  salt            String    @db.VarChar(255)

  uploadedAt      DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  deletedAt       DateTime?
}
```

### 3. **ActivityLog Model**
```prisma
model ActivityLog {
  id          String    @id @default(cuid())
  userId      String

  type        String    @db.VarChar(50)  // upload, download, delete, access
  description String    @db.Text

  createdAt   DateTime  @default(now())
}
```

## API Endpoints

All endpoints require authentication with a valid JWT token in the `Authorization` header.

### Upload Files

**Endpoint:** `POST /api/files/upload`

**Request Body:**
```json
{
  "name": "document.pdf",
  "type": "pdf",
  "size": 1024000,
  "mimeType": "application/pdf",
  "contentBase64": "JVBERi0xLjQKJeLjz9M...",
  "isEncrypted": false,
  "iv": "optional_iv_if_encrypted",
  "salt": "optional_salt_if_encrypted"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "id": "file_uuid",
    "name": "document.pdf",
    "size": "1024000",
    "uploadedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get All Files

**Endpoint:** `GET /api/files?type=pdf&sortBy=date`

**Query Parameters:**
- `type` (optional): Filter by file type (pdf, doc, image, xlsx, etc.)
- `sortBy` (optional): Sort by 'name', 'size', or 'date' (default: date)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "files": [
    {
      "id": "file_uuid",
      "name": "document.pdf",
      "type": "pdf",
      "size": "1024000",
      "mimeType": "application/pdf",
      "uploadedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Secure Files

**Endpoint:** `GET /api/files/secure`

**Response:** Same structure as regular files

### Download File

**Endpoint:** `GET /api/files/:id/download`

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_uuid",
    "name": "document.pdf",
    "content": "base64_encoded_content",
    "mimeType": "application/pdf",
    "size": "1024000"
  }
}
```

### Access Secure File

**Endpoint:** `POST /api/files/:id/access`

**Request Body:**
```json
{
  "password": "user_password"
}
```

**Response:** Same as download, but verifies password first

### Delete File

**Endpoint:** `DELETE /api/files/:id`

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### Delete Secure File

**Endpoint:** `DELETE /api/files/secure/:id`

**Response:** Same as regular delete

### Get File Statistics

**Endpoint:** `GET /api/files/stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalFiles": 10,
    "secureFiles": 3,
    "totalSize": 5242880,
    "totalSizeFormatted": "5 MB"
  }
}
```

## Frontend Usage

### Using FileService in Your JavaScript Code

```javascript
import FileService from './js/services/FileService.js';

// Upload a file
async function handleFileUpload(file, password = null) {
  try {
    const response = await FileService.uploadFile(file, password);
    console.log('File uploaded:', response.file);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// Get all files
async function loadFiles() {
  try {
    const response = await FileService.getFiles({
      type: 'pdf',
      sortBy: 'date'
    });
    console.log('Files:', response.files);
  } catch (error) {
    console.error('Failed to load files:', error);
  }
}

// Download a file
async function downloadFile(fileId) {
  try {
    await FileService.downloadFile(fileId);
  } catch (error) {
    console.error('Download failed:', error);
  }
}

// Delete a file
async function removeFile(fileId) {
  try {
    const response = await FileService.deleteFile(fileId);
    console.log('File deleted:', response.message);
  } catch (error) {
    console.error('Deletion failed:', error);
  }
}

// Get stats
async function getStats() {
  try {
    const response = await FileService.getFileStats();
    console.log('Stats:', response.stats);
  } catch (error) {
    console.error('Failed to get stats:', error);
  }
}
```

### Integrating with Upload Form

```html
<form id="uploadForm">
  <input type="file" id="fileInput" multiple>
  <label>
    <input type="checkbox" id="encryptCheckbox">
    Encrypt this file
  </label>
  <input type="password" id="encryptPassword" style="display:none;" placeholder="Password">
  <button type="submit">Upload</button>
</form>

<script type="module">
import FileService from './js/services/FileService.js';

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const files = document.getElementById('fileInput').files;
  const shouldEncrypt = document.getElementById('encryptCheckbox').checked;
  const password = shouldEncrypt ? document.getElementById('encryptPassword').value : null;

  for (const file of files) {
    try {
      const response = await FileService.uploadFile(file, password);
      console.log('Uploaded:', response.file.name);
    } catch (error) {
      console.error('Upload failed:', error.message);
    }
  }
});

// Show password input when encrypt is checked
document.getElementById('encryptCheckbox').addEventListener('change', (e) => {
  document.getElementById('encryptPassword').style.display =
    e.target.checked ? 'block' : 'none';
});
</script>
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
createdb st_clare_filing_system
```

### 2. Configure Environment Variables

Create `.env` file in the `backend/` folder:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/st_clare_filing_system"

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this

# CORS
CORS_ORIGIN=http://localhost:5173
```

### 3. Run Migrations

```bash
cd backend
npm run prisma:migrate
```

This creates all tables in PostgreSQL.

### 4. Reset Database (if needed)

```bash
npm run prisma:reset
```

## File Storage Strategies

### Option 1: Base64 in Database (Current)
**Pros:** Simple, no separate storage needed
**Cons:** Slower for large files, uses more database space
**Best for:** Documents < 5 MB

**Implementation:** Content stored in `contentBase64` field

### Option 2: Hybrid (Database + Disk)
Store metadata in PostgreSQL, actual files on disk or S3.

**Implementation:**
```javascript
// In controller
const uploadPath = `/uploads/${userId}/${fileId}`;
// Save file to disk
await fs.writeFile(uploadPath, buffer);
// Save reference to DB
await prisma.file.create({
  data: {
    storagePath: uploadPath,
    // ... other fields
  }
});
```

### Option 3: File Storage Service
Use AWS S3, Google Cloud Storage, or similar services.

## Security Considerations

1. **Encryption:** Implement proper file encryption before uploading
2. **Password Protection:** Use bcryptjs to hash passwords
3. **Access Control:** Verify user ownership before returning files
4. **File Validation:** Validate file types and sizes on backend
5. **Audit Logging:** Track all file operations in ActivityLog

## Performance Tips

1. **Pagination:** Implement pagination for large file lists
   ```javascript
   GET /api/files?skip=0&take=20
   ```

2. **Compression:** Compress files before uploading
   ```javascript
   const compressed = await compressFile(file);
   ```

3. **Caching:** Cache frequently accessed files
   ```javascript
   app.use(express.static('cache'));
   ```

4. **Database Indexing:** Already added for userId and uploadedAt

## Troubleshooting

### File Upload Fails
- Check `contentBase64` encoding
- Verify JWT token is valid
- Check PostgreSQL connection

### File Not Found
- Verify file ID exists
- Check user ownership
- Check if file is soft-deleted

### Performance Issues
- Query too many large files at once
- Consider pagination or filtering
- Check database indexing

---

**Next Steps:**
1. Migrate your database: `npm run prisma:migrate`
2. Review and adjust the Prisma schema for your needs
3. Implement file encryption using crypto library
4. Add file size validation and type checking
5. Deploy to production with proper error handling
