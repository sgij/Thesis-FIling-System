# PostgreSQL + Express File Storage - Quick Reference

## What's Been Set Up

✅ **Backend Structure:**
- Express server with CORS configured
- Prisma ORM with PostgreSQL
- 3 data models: `File`, `SecureFile`, `ActivityLog`
- Full CRUD controllers for file operations
- RESTful API routes at `/api/files/*`

✅ **Frontend Service:**
- `FileService.js` - Complete API client library
- Base64 file encoding
- Authentication token handling
- Download blob generation

---

## Step 1: Database Setup

### 1. Ensure PostgreSQL is Running
```bash
# Windows
net start postgresql-*

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### 2. Create Database
```bash
createdb st_clare_filing_system
```

### 3. Configure Backend `.env`
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/st_clare_filing_system"
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
```

### 4. Run Migrations
```bash
cd backend
npm install  # if not already done
npm run prisma:migrate
```

---

## Step 2: Start the Backend

```bash
cd backend
npm run dev    # Runs with auto-reload
# or
npm start      # Standard Node.js server
```

**Expected Output:**
```
🚀 St. Clare Filing System API Server
📍 Running on http://localhost:3001
🌍 Environment: development
🔐 CORS enabled for: http://localhost:5173
Server listening on port 3001
```

---

## Step 3: Use FileService in Frontend

### Basic Upload Example
```javascript
import FileService from './js/services/FileService.js';

const fileInput = document.getElementById('fileInput');
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  try {
    const response = await FileService.uploadFile(file);
    console.log('Uploaded:', response.file);
    alert('File uploaded successfully!');
  } catch (error) {
    alert('Upload failed: ' + error.message);
  }
});
```

### Upload with Encryption
```javascript
const password = 'secure123';
const response = await FileService.uploadFile(file, password);
```

### List Files
```javascript
const response = await FileService.getFiles({
  type: 'pdf',
  sortBy: 'date'
});
console.log('Files:', response.files);
```

### Download File
```javascript
await FileService.downloadFile(fileId);
// Browser will automatically download the file
```

### Secure File Access
```javascript
const password = prompt('Enter password:');
await FileService.accessSecureFile(fileId, password);
```

### Delete File
```javascript
await FileService.deleteFile(fileId);
```

### Get Statistics
```javascript
const response = await FileService.getFileStats();
console.log(`Total files: ${response.stats.totalFiles}`);
console.log(`Storage used: ${response.stats.totalSizeFormatted}`);
```

---

## Step 4: Testing Endpoints

### Using cURL (Command Line)

**1. Get auth token first (from your login endpoint)**
```bash
BEARER_TOKEN="your_jwt_token_here"
```

**2. Upload a file**
```bash
curl -X POST http://localhost:3001/api/files/upload \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test.pdf",
    "type": "pdf",
    "size": 1024,
    "mimeType": "application/pdf",
    "contentBase64": "JVBERi0xLjQ...",
    "isEncrypted": false
  }'
```

**3. List files**
```bash
curl http://localhost:3001/api/files \
  -H "Authorization: Bearer $BEARER_TOKEN"
```

**4. Download file**
```bash
curl http://localhost:3001/api/files/FILE_ID/download \
  -H "Authorization: Bearer $BEARER_TOKEN" \
  -o downloaded_file.pdf
```

**5. Delete file**
```bash
curl -X DELETE http://localhost:3001/api/files/FILE_ID \
  -H "Authorization: Bearer $BEARER_TOKEN"
```

**6. Get stats**
```bash
curl http://localhost:3001/api/files/stats \
  -H "Authorization: Bearer $BEARER_TOKEN"
```

### Using Postman
1. Import collection or create new requests
2. Set `Authorization` header to `Bearer YOUR_JWT_TOKEN`
3. Use URLs like `http://localhost:3001/api/files`
4. Set `Content-Type: application/json` for POST requests

---

## Step 5: Update Your UI

### Integrate with Existing Upload Form
```html
<!-- In your index.html upload section -->
<div class="upload-zone" id="uploadZone">
  <input type="file" id="fileInput" multiple>
  <button onclick="handleUpload()">Upload</button>
</div>

<script type="module">
import FileService from './js/services/FileService.js';

window.handleUpload = async function() {
  const files = document.getElementById('fileInput').files;

  for (const file of files) {
    try {
      const response = await FileService.uploadFile(file);
      console.log('✓ Uploaded:', response.file.name);
    } catch (error) {
      console.error('✗ Failed:', error);
    }
  }
};
</script>
```

### List Uploaded Files
```html
<div id="filesList"></div>

<script type="module">
import FileService from './js/services/FileService.js';

async function loadFiles() {
  const response = await FileService.getFiles();
  const html = response.files.map(file => `
    <div class="file-item">
      <span>${file.name}</span>
      <button onclick="downloadFile('${file.id}')">Download</button>
      <button onclick="deleteFile('${file.id}')">Delete</button>
    </div>
  `).join('');

  document.getElementById('filesList').innerHTML = html;
}

window.downloadFile = async (id) => {
  await FileService.downloadFile(id);
};

window.deleteFile = async (id) => {
  await FileService.deleteFile(id);
  loadFiles(); // Refresh list
};

loadFiles(); // Initial load
</script>
```

---

## File Structure Recap

```
backend/
├── src/
│   ├── server.js                 ← Express app (updated with file routes)
│   ├── controllers/
│   │   ├── authController.js
│   │   └── fileController.js    ← NEW: File operations
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── fileRoutes.js        ← NEW: File endpoints
│   └── middleware/
│       └── auth.js
├── prisma/
│   └── schema.prisma            ← Already has File models
└── .env                         ← Your config

src/
├── js/
│   └── services/
│       ├── AuthService.js
│       └── FileService.js       ← NEW: Frontend API client
└── index.html                   ← Use FileService here
```

---

## API Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/files/upload` | Upload file |
| GET | `/api/files` | List regular files |
| GET | `/api/files/secure` | List encrypted files |
| GET | `/api/files/stats` | Get file statistics |
| GET | `/api/files/:id/download` | Download file |
| POST | `/api/files/:id/access` | Access encrypted file |
| DELETE | `/api/files/:id` | Delete file |
| DELETE | `/api/files/secure/:id` | Delete encrypted file |

---

## Next Steps

1. ✅ Run `npm run prisma:migrate` in backend folder
2. ✅ Start backend with `npm run dev`
3. ✅ Update your upload form to use FileService
4. ✅ Test with sample files
5. ✅ Verify files are stored in PostgreSQL
6. ✅ Implement encryption if needed
7. ✅ Add file size validation
8. ✅ Deploy to production

---

## Debugging

### Check if Backend is Running
```bash
curl http://localhost:3001/health
# Should return: { "status": "ok", ... }
```

### Check Database Connection
```bash
npm run prisma:studio
# Opens visual database explorer
```

### View Database Contents
```bash
npm run prisma:studio
# Or use: psql -U postgres -d st_clare_filing_system
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Auth token invalid | Ensure you're logged in and token hasn't expired |
| 404 Not Found | Check endpoint URL matches exactly |
| CORS error | Check CORS_ORIGIN in `.env` matches your frontend URL |
| Database connection error | Check DATABASE_URL in `.env` is correct |
| File not found | Verify file ID exists and belongs to current user |

---

**Questions?** Check the detailed guide in `FILE_STORAGE_GUIDE.md`
