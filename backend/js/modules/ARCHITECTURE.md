# St. Clare College Filing System - Modular Architecture Documentation

## Overview

The Filing System has been refactored from a monolithic `main.js` (~2000+ lines) into a modular, production-ready architecture with clear separation of concerns. This document provides guidance on the new structure, how to use it, and how to extend it.

## Architecture Summary

### Design Patterns

- **Pub/Sub (Event Emitter)**: Core state management using reactive event system
- **Service-Oriented**: Specialized services for different concerns (Storage, Crypto, Files, Notifications)
- **Dependency Injection**: Services are passed to modules that depend on them
- **UI Abstraction**: DOM manipulation centralized in UIRenderer service
- **Backward Compatibility**: Global functions wrapper ensuring HTML compatibility without refactoring templates

## Folder Structure

```
src/js/
├── modules/
│   ├── core/
│   │   ├── App.js                 # Main application orchestrator
│   │   └── EventEmitter.js        # Pub/Sub state management system
│   ├── services/
│   │   ├── StorageManager.js      # Unified storage interface (localStorage + FileSystem API)
│   │   ├── CryptoService.js       # AES-GCM encryption/decryption
│   │   ├── FileService.js         # File operations (upload, download, delete, etc.)
│   │   └── NotificationService.js # Toast notifications and notification panel
│   ├── ui/
│   │   └── UIRenderer.js          # DOM rendering and manipulation
│   └── utils/
│       ├── config.js              # Centralized configuration constants
│       └── logger.js              # Structured logging system
├── init/
│   └── compatibility.js           # Backward-compatibility wrapper for global functions
├── auth/
│   ├── AuthService.js             # API client for authentication
│   └── authGuard.js               # Route protection middleware
├── storage/
│   └── FileSystemService.js       # File System Access API integration
└── main.js                        # (Deprecated - kept for reference only)

_backup_pre_refactor/
└── main.js.bak                    # Original monolithic file (backup)
```

## Module Descriptions

### Core Modules

#### `App.js` - Application Orchestrator
Main class that coordinates all services and manages application lifecycle.

**Key Methods:**
```javascript
// Initialize application
await app.init()

// Boot after authentication
app.bootApp()

// Update statistics
app.updateStats()

// Logout
app.logout()
```

**Responsibilities:**
- Coordinate service initialization
- Manage authentication state
- Handle page rendering
- Emit application-level events

#### `EventEmitter.js` - State Management
Implements pub/sub pattern with optional state history for undo/redo.

**Usage:**
```javascript
// Create event emitter
const emitter = new EventEmitter('MyModule');

// Subscribe to events
const unsubscribe = emitter.on('event:name', (data) => {
  console.log('Event fired:', data);
});

// Emit events
emitter.emit('event:name', { key: 'value' });

// State management with history
const state = new StateManager({ count: 0 });
state.set('count', 5);           // Set value
state.get('count')               // Get value
state.undo()                      // Undo changes
state.redo()                      // Redo changes
```

### Service Modules

#### `StorageManager.js` - Unified Storage
Abstracts storage operations with fallback support (localStorage → FileSystem API).

**Key Methods:**
```javascript
// Initialize storage
await storage.init()

// Get all files
const { files, secureFiles } = await storage.getFiles()

// Save files
await storage.saveFiles(files, secureFiles)

// Get activity logs
const activities = storage.getActivities()

// Add activity
storage.addActivity({ type, description, timestamp })

// Auth token management
storage.getAuthToken()
storage.saveAuthToken(token)
storage.clearAuthToken()
```

#### `CryptoService.js` - Encryption/Decryption
Uses Web Crypto API with AES-GCM and PBKDF2 key derivation.

**Key Methods:**
```javascript
// Encrypt with password
const encrypted = await crypto.encryptWithPassword(data, password)

// Decrypt with password
const decrypted = await crypto.decryptWithPassword(encrypted, password)

// Generate secure password
const password = crypto.generateSecurePassword(12)

// Validate password strength
const strength = crypto.validatePasswordStrength(password)
// Returns: { score: 0-4, label: 'Weak'|'Fair'|'Good'|'Strong' }
```

#### `FileService.js` - File Operations
Manages all file operations on the underlying storage.

**Key Methods:**
```javascript
// Get all files
const allFiles = fileService.getAllFiles()

// Upload file
await fileService.uploadFile(file, {
  encrypt: true,
  password: 'secret123',
  name: 'custom-name.pdf'
})

// Delete file (soft delete)
await fileService.deleteFile(fileId)

// Restore from trash
await fileService.restoreFromTrash(fileId)

// Get file statistics
const stats = fileService.getStats()
// Returns: { totalFiles, secureFiles, recentFiles, downloadsToday, trashCount, totalStorageSize }

// Search files
const results = fileService.searchFiles('query')

// Get recent files
const recent = fileService.getRecentFiles(24) // Last 24 hours
```

#### `NotificationService.js` - Notifications
Manages toast notifications and notification panel.

**Key Methods:**
```javascript
// Add notification
notif.add('Message', 'success')      // Type: 'success', 'error', 'warning', 'info'
notif.success('Success message')
notif.error('Error message')
notif.warning('Warning message')
notif.info('Info message')

// Get all notifications
const all = notif.getAll()

// Clear all
notif.clear()

// Filter by type
const errors = notif.getByType('error')
```

### UI Module

#### `UIRenderer.js` - DOM Management
Centralizes all DOM manipulation and rendering.

**Key Methods:**
```javascript
// Screen visibility
ui.showLoadingScreen()
ui.hideLoadingScreen()
ui.showLoginScreen()
ui.showMainInterface()

// Page navigation
ui.switchPage('dashboard')

// Update displays
ui.updateStatsDisplay({ totalFiles: 42, secureFiles: 10, ... })
ui.updateStorageDisplay({ percentage: 45, used: '45 MB', total: '100 MB' })
ui.updateUserProfile({ name: 'Admin', role: 'Administrator' })

// Render content
ui.renderFilesGrid(files, 'filesGrid')
ui.renderActivityList(activities, 'recentActivity')

// Theme management
ui.toggleTheme()
ui.setTheme('dark')           // 'dark' or 'light'

// Modals
ui.showModal('fileModal')
ui.hideModal('fileModal')
ui.closeAllModals()
```

### Utils

#### `config.js` - Configuration
Centralized configuration constants.

**Common Values:**
```javascript
CONFIG.LIMITS.MAX_FILES_IN_MEMORY       // 1000
CONFIG.LIMITS.TRASH_RETENTION_DAYS      // 30
CONFIG.LIMITS.RECENT_FILES_HOURS        // 24

CONFIG.CRYPTO.ALGORITHM                  // 'AES-GCM'
CONFIG.CRYPTO.PBKDF2_ITERATIONS          // 100,000
CONFIG.CRYPTO.KEY_LENGTH                 // 256 bits

CONFIG.UI.TOAST_DURATION_SUCCESS         // 4000ms
CONFIG.FILES.ALLOWED_TYPES               // [...list of allowed file extensions...]
```

#### `logger.js` - Logging
Structured logging with multiple levels.

**Usage:**
```javascript
import { createLogger } from './utils/logger.js'

const logger = createLogger('MyModule')

logger.debug('Debug message', data)
logger.info('Info message', data)
logger.warn('Warning message', data)
logger.error('Error message', error)
```

## Usage Examples

### Basic Setup

```javascript
import App from './modules/core/App.js'

// Create and initialize app
const app = new App()
await app.init()  // Will check JWT and boot if authenticated
```

### Upload File with Encryption

```javascript
const fileInput = document.getElementById('fileInput')
const password = 'secure-password-123'

fileInput.addEventListener('change', async (e) => {
  for (const file of e.target.files) {
    try {
      const metadata = await app.fileService.uploadFile(file, {
        encrypt: true,
        password: password
      })
      app.notifications.success(`File "${metadata.name}" uploaded`)
      app.updateStats()
    } catch (error) {
      app.notifications.error(`Upload failed: ${error.message}`)
    }
  }
})
```

### Decrypt File

```javascript
const fileId = 'some-file-id'
const password = 'secure-password-123'

try {
  // Crypto service handles decryption
  const file = app.fileService.getFile(fileId)
  const decrypted = await app.crypto.decryptWithPassword(
    file.cryptoData,  // Encrypted package
    password
  )
  // Use decrypted data
} catch (error) {
  app.notifications.error('Decryption failed - invalid password')
}
```

### Listen to Events

```javascript
// Listen for file uploads
app.fileService.on('file:uploaded', (file) => {
  console.log('File uploaded:', file.name)
  app.updateStats()
  app.notifications.success(`Uploaded: ${file.name}`)
})

// Listen for page switches
app.ui.on('page:switched', (page) => {
  console.log('Switched to page:', page)
})

// Listen for theme changes
app.ui.on('theme:changed', (theme) => {
  console.log('Theme changed to:', theme)
})
```

### Custom State Management

```javascript
import { StateManager } from './modules/core/EventEmitter.js'

// Create state with initial values
const appState = new StateManager({
  user: null,
  settings: {}
})

// Listen to changes
appState.on('state:change', ({ path, value }) => {
  console.log(`State changed: ${path} = ${value}`)
})

// Update state
appState.set('user', { id: 1, name: 'Admin' })
appState.set('settings.theme', 'dark')
```

## Global Function Compatibility

For HTML compatibility, the following global functions are available:

```javascript
// Navigation
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

// Encryption
togglePasswordInput()
togglePasswordVisibility(inputId)
copyGeneratedPassword()

// Backup
exportData()
importData(file)

// Storage
selectStorageFolder()
confirmStorageSetup()

// Logout
performLogout()

// Access window.filingSystem for direct access to app instance
window.filingSystem.fileService.getAllFiles()
```

## Migration from Monolithic to Modular

### Old Way (Monolithic)
```javascript
// Everything in one class
import FilingSystem from './main.js'
const sys = new FilingSystem()
sys.uploadFiles(files)
sys.deleteFile(id)
// All 2000+ lines mixed together
```

### New Way (Modular)
```javascript
// Services are separated and composable
import App from './modules/core/App.js'
const app = new App()
await app.fileService.uploadFile(file, options)
await app.fileService.deleteFile(id)
// Can import and use individual services
```

## Extending the System

### Add a New Service

1. Create `src/js/modules/services/MyService.js`:

```javascript
import { EventEmitter } from '../core/EventEmitter.js'
import { createLogger } from '../utils/logger.js'

const logger = createLogger('MyService')

export class MyService extends EventEmitter {
  constructor(dependencyService) {
    super('MyService')
    this.dependency = dependencyService
  }

  myMethod() {
    this.emit('my:event', data)
  }
}

export default MyService
```

2. Add to `App.js`:

```javascript
import MyService from '../services/MyService.js'

// In App constructor
this.myService = new MyService(this.otherService)

// In bootApp
await this.myService.initialize()
```

3. Use in HTML or other modules:

```javascript
app.myService.myMethod()
```

### Add Custom Logger

```javascript
import { createLogger } from './modules/utils/logger.js'

const logger = createLogger('MyModule')
logger.info('Application started')
logger.error('Something went wrong', error)
```

## Architecture Decisions

### Why EventEmitter for State Management?

EventEmitter provides:
- ✅ Decoupled components (services don't know about each other)
- ✅ Single source of truth for events
- ✅ Easy to test (mock emitters)
- ✅ Performant for most use cases
- ✅ No external dependencies required

### Why Separate Config File?

- ✅ Single place to change constants
- ✅ Easy to support different environments
- ✅ Clear constraints and limits
- ✅ Version tracked in one place

### Why StorageManager Abstraction?

- ✅ Can swap localStorage for IndexedDB without changing app code
- ✅ Easy to add cloud storage later
- ✅ Graceful fallbacks (FileSystem → localStorage)
- ✅ Testable storage behavior independently

## Testing Services

Each service can be tested independently:

```javascript
// Test CryptoService
const crypto = new CryptoService()
const encrypted = await crypto.encryptWithPassword('data', 'password')
const decrypted = await crypto.decryptWithPassword(encrypted, 'password')
console.assert(decrypted === 'data')

// Test StorageManager
const storage = new StorageManager()
await storage.init()
storage.saveSettings({ theme: 'dark' })
const settings = storage.getSettings()
console.assert(settings.theme === 'dark')

// Test FileService
const fileService = new FileService(storage, crypto)
const uploadedFile = await fileService.uploadFiles(file, { encrypt: true })
console.assert(uploadedFile.encrypted === true)
```

## Troubleshooting

### "filingSystem is undefined"

Make sure the initialization script runs AFTER `initAuthGuard()` completes:

```javascript
if (isAuthenticated) {
    const app = await initializeFilingSystem()
    window.filingSystem = app  // Now global
}
```

### Storage quota exceeded

Check `CONFIG.LIMITS.MAX_FILES_IN_MEMORY`:

```javascript
if (app.fileService.getAllFiles().length > CONFIG.LIMITS.MAX_FILES_IN_MEMORY) {
    // Archive old files or clean up
}
```

### Password validation failing

Make sure password is at least 6 characters:

```javascript
const result = app.crypto.validatePasswordStrength(password)
if (result.score < 2) {
    app.notifications.warning('Password is too weak')
}
```

## Performance Tips

1. **Lazy load pages**: Don't render all pages in `bootApp()`, render on page switch
2. **Debounce file operations**: Use lodash `debounce` for file searches
3. **Batch DOM updates**: Collect changes then update DOM once
4. **Use virtual scrolling**: For large file lists (implement in UIRenderer)
5. **Cache file icons**: Generate SVG cache of common file types

## Future Enhancements

- [ ] IndexedDB support for larger offline storage
- [ ] Cloud sync adapter
- [ ] Offline-first architecture
- [ ] Service Worker integration
- [ ] Real-time collaboration (WebSockets)
- [ ] Advanced search with Lunr.js
- [ ] File compression before encryption
- [ ] Batch operations (multi-select actions)

## Support & Questions

For questions or issues with the modular architecture, refer to:
- Original monolithic code in `_backup_pre_refactor/main.js.bak`
- JSDoc comments in each module
- Test examples in this documentation

---

**Architecture Version:** 2.0.0
**Last Updated:** April 2026
**Compatibility:** ES6+ modules, requires modern browser with Web Crypto API
