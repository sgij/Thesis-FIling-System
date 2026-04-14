# Quick Reference - Modular Filing System API

## Initialization

```javascript
import App from './js/modules/core/App.js'

const app = new App()
await app.init()  // Checks JWT and initializes services
```

## File Operations

```javascript
// Upload
await app.fileService.uploadFile(file, {
  encrypt: true,
  password: 'secret',
  name: 'custom-name.pdf'
})

// Get all files
const files = app.fileService.getAllFiles()

// Get specific file
const file = app.fileService.getFile(fileId)

// Delete (soft delete to trash)
await app.fileService.deleteFile(fileId)

// Search
const results = app.fileService.searchFiles('query')

// Statistics
const stats = app.fileService.getStats()
// { totalFiles, secureFiles, recentFiles, downloadsToday, trashCount, totalStorageSize }

// Trash operations
const trash = app.fileService.getTrash()
await app.fileService.restoreFromTrash(fileId)
await app.fileService.permanentlyDelete(fileId)
await app.fileService.emptyTrash()
```

## Encryption

```javascript
// Encrypt data
const encrypted = await app.crypto.encryptWithPassword(data, password)

// Decrypt data
const decrypted = await app.crypto.decryptWithPassword(encrypted, password)

// Generate password
const pwd = app.crypto.generateSecurePassword(12)

// Validate password
const strength = app.crypto.validatePasswordStrength(password)
// { score: 0-4, label: 'Weak'|'Fair'|'Good'|'Strong' }
```

## Storage

```javascript
// Get auth token
const token = app.storage.getAuthToken()

// Save auth token
app.storage.saveAuthToken(token)

// Clear auth (logout)
app.storage.clearAuthToken()

// Get activity logs
const activities = app.storage.getActivities()

// Add activity
app.storage.addActivity({
  type: 'upload',
  description: 'Uploaded file.pdf',
  timestamp: new Date().toISOString()
})

// Get settings
const settings = app.storage.getSettings()

// Save settings
app.storage.saveSettings({ theme: 'dark' })

// Get trash files
const trash = app.storage.getTrash()
```

## Notifications

```javascript
// Show notification
app.notifications.success('File uploaded')
app.notifications.error('Upload failed')
app.notifications.warning('Low storage')
app.notifications.info('Processing...')

// Add with options
app.notifications.add('Message', 'success', { timeout: 5000 })

// Get all notifications
const all = app.notifications.getAll()

// Filter
const errors = app.notifications.getByType('error')

// Clear
app.notifications.clear()
```

## UI Rendering

```javascript
// Page navigation
app.ui.switchPage('files')  // 'dashboard', 'files', 'upload', 'recent', 'secure', 'trash', 'backup', 'analytics', 'settings'

// Update displays
app.ui.updateStatsDisplay({
  totalFiles: 42,
  secureFiles: 10,
  recentFiles: 5,
  downloadsToday: 3
})

app.ui.updateStorageDisplay({
  percentage: 45,
  used: '45 MB',
  total: '100 MB'
})

// Render content
app.ui.renderFilesGrid(files, 'filesGrid', 'Empty message')
app.ui.renderActivityList(activities, 'recentActivity')

// Theme
app.ui.toggleTheme()
app.ui.setTheme('dark')  // or 'light'

// Modals
app.ui.showModal('fileModal')
app.ui.hideModal('fileModal')
app.ui.closeAllModals()

// User profile
app.ui.updateUserProfile({ name: 'Admin', role: 'Administrator' })
```

## Application Control

```javascript
// Get statistics
const stats = app.fileService.getStats()

// Update all stats
app.updateStats()

// Boot app after auth
app.bootApp()

// Logout
app.logout()
```

## Event Listening

```javascript
// File events
app.fileService.on('file:uploaded', (file) => {})
app.fileService.on('file:downloaded', (file) => {})
app.fileService.on('file:deleted', (file) => {})
app.fileService.on('file:restored', (file) => {})
app.fileService.on('trash:emptied', (count) => {})

// Notification events
app.notifications.on('notification:added', (notif) => {})
app.notifications.on('notifications:cleared', () => {})

// UI events
app.ui.on('page:switched', (page) => {})
app.ui.on('theme:changed', (theme) => {})

// App events
app.on('app:initialized', () => {})
app.on('app:booted', () => {})
app.on('app:logout', () => {})
```

## Logging

```javascript
import { createLogger } from './js/modules/utils/logger.js'

const logger = createLogger('MyModule')
logger.debug('Debug message', debugData)
logger.info('Info message', infoData)
logger.warn('Warning message', warning)
logger.error('Error message', error)
```

## Configuration

```javascript
import { CONFIG } from './js/modules/utils/config.js'

CONFIG.LIMITS.MAX_FILES_IN_MEMORY           // 1000
CONFIG.LIMITS.MAX_NOTIFICATIONS             // 20
CONFIG.LIMITS.TRASH_RETENTION_DAYS          // 30
CONFIG.LIMITS.RECENT_FILES_HOURS            // 24

CONFIG.CRYPTO.ALGORITHM                     // 'AES-GCM'
CONFIG.CRYPTO.PBKDF2_ITERATIONS             // 100,000

CONFIG.UI.TOAST_DURATION_SUCCESS            // 4000ms
CONFIG.FILES.MAX_FILE_SIZE_MB               // 500

CONFIG.STORAGE_KEYS.FILES                   // 'modernFilingFiles'
CONFIG.STORAGE_KEYS.AUTH_TOKEN              // 'auth_token'
```

## Global Functions (HTML Compatibility)

```javascript
// Page navigation
switchPage('dashboard')

// File operations
openFile(fileId)
downloadFile(fileId)
deleteFile(fileId)

// Trash
restoreFromTrash(fileId)
permanentlyDelete(fileId)
emptyTrash()

// Theme
toggleTheme()

// Password handling
togglePasswordInput()
togglePasswordVisibility('inputId')
copyGeneratedPassword()
generateSecurePassword()

// Backup
exportData()
importData(file)

// Storage
selectStorageFolder()
setQuickLimit(250, 'GB')
confirmStorageSetup()
openStorageSetupModal()

// Logout
performLogout()

// Security
verifyAccess()

// Access app directly
window.filingSystem.fileService.getAllFiles()
```

## Common Patterns

### Upload Files with Encryption

```javascript
const fileInput = document.getElementById('fileInput')
fileInput.addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    try {
      await app.fileService.uploadFile(file, {
        encrypt: true,
        password: 'secure-password'
      })
      app.notifications.success(`${file.name} uploaded`)
      app.updateStats()
    } catch (error) {
      app.notifications.error(error.message)
    }
  }
})
```

### Delete File with Confirmation

```javascript
async function deleteFile(fileId) {
  if (confirm('Move to trash?')) {
    try {
      const file = app.fileService.getFile(fileId)
      await app.fileService.deleteFile(fileId)
      app.notifications.success(`${file.name} moved to trash`)
      app.updateStats()
    } catch (error) {
      app.notifications.error(error.message)
    }
  }
}
```

### Search Files

```javascript
const query = document.getElementById('searchInput').value
const results = app.fileService.searchFiles(query)
app.ui.renderFilesGrid(results, 'searchResults', 'No files found')
```

### Listen for Updates

```javascript
app.fileService.on('file:uploaded', (file) => {
  console.log('New file:', file.name)
  app.updateStats()
  app.ui.renderFilesGrid(app.fileService.getAllFiles())
})
```

---

**Quick Reference Version:** 2.0
**Last Updated:** April 2026

For detailed documentation see: `ARCHITECTURE.md` and `MIGRATION_GUIDE.md`
