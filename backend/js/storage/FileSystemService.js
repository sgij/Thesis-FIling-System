/**
 * FileSystemService - Bulletproof File System Access API Storage Engine
 * Provides unlimited storage (1-2 TB+) by saving files directly to disk
 * Features: Atomic writes, checksums, auto-backup, recovery system
 * Works with local drives, network shares, and RAID arrays
 */

class FileSystemService {
    constructor() {
        this.directoryHandle = null;
        this.isConnected = false;

        // Manifest system (replaces old index)
        this.manifestFileName = '_manifest.json';
        this.manifestBackupFileName = '_manifest.backup.json';
        this.trashFolderName = '_trash';

        // Write queue for HDD-friendly batched saves
        this.pendingChanges = [];
        this.flushTimer = null;
        this.flushInterval = 30000; // 30 seconds
        this.maxPendingChanges = 10;
        this.isFlushing = false;
        this.lastSaveTime = null;

        // Manifest data (loaded from disk)
        this.manifest = null;

        // Recovery state
        this.recoveryReport = null;

        // Callbacks for UI updates
        this.onSaveStart = null;
        this.onSaveEnd = null;
        this.onRecovery = null;

        // Load config from localStorage (fallback, will be replaced by manifest)
        this.config = this.loadConfig();

        // Setup beforeunload handler
        this.setupBeforeUnload();
    }

    /**
     * Load storage configuration from localStorage (fallback only)
     */
    loadConfig() {
        const defaultConfig = {
            storagePath: '',
            storageLimit: null, // No default limit - user must configure
            storageLimitEnabled: false,
            detectedMaxStorage: null,
            lastConnected: null,
            autoOrganize: true,
            folderStructure: {
                documents: 'Documents',
                images: 'Images',
                secure: 'Secure',
                archive: 'Archive'
            }
        };

        try {
            const saved = localStorage.getItem('fileSystemConfig');
            return saved ? { ...defaultConfig, ...JSON.parse(saved) } : defaultConfig;
        } catch {
            return defaultConfig;
        }
    }

    /**
     * Save storage configuration to localStorage (backup)
     */
    saveConfig() {
        localStorage.setItem('fileSystemConfig', JSON.stringify(this.config));
    }

    /**
     * Setup beforeunload handler to flush pending changes
     */
    setupBeforeUnload() {
        window.addEventListener('beforeunload', (e) => {
            // Only show warning if connected AND there are actual pending file changes
            if (this.isConnected && this.pendingChanges.length > 0 && this.isFlushing === false) {
                // Try to flush synchronously (may not always work)
                this.flushChangesSync();

                // Only show warning if flush didn't complete
                if (this.pendingChanges.length > 0) {
                    e.preventDefault();
                    e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                }
            }
        });
    }

    // =========================================================================
    // MANIFEST SYSTEM (Phase 1)
    // =========================================================================

    /**
     * Create empty manifest structure
     */
    createEmptyManifest() {
        return {
            version: '2.0',
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            checksum: null,
            settings: {
                storageLimitGB: null,
                storageLimitBytes: null,
                storageLimitEnabled: false,
                detectedMaxStorage: null,
                institution: 'St. Clare College',
                configuredAt: null
            },
            files: {},
            secureFiles: {},
            auditLog: [],
            trash: {},
            statistics: {
                totalUploads: 0,
                totalDeletes: 0,
                totalRestores: 0
            }
        };
    }

    /**
     * Generate SHA-256 checksum for data integrity
     */
    async generateChecksum(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate manifest checksum
     */
    async validateChecksum(manifest) {
        if (!manifest.checksum) return true; // No checksum = old format, accept it

        const storedChecksum = manifest.checksum;
        const dataToCheck = { ...manifest, checksum: null };
        const calculatedChecksum = await this.generateChecksum(dataToCheck);

        return storedChecksum === calculatedChecksum;
    }

    /**
     * Load manifest from disk with recovery chain
     */
    async loadManifest() {
        if (!this.isConnected || !this.directoryHandle) {
            return this.createEmptyManifest();
        }

        this.recoveryReport = {
            source: null,
            recovered: false,
            issues: [],
            timestamp: new Date().toISOString()
        };

        // Recovery Chain - try sources in order
        const sources = [
            { name: 'primary', file: this.manifestFileName },
            { name: 'backup', file: this.manifestBackupFileName },
            { name: 'versioned', file: null } // Will search for versioned files
        ];

        // Level 1: Try primary manifest
        let manifest = await this.tryLoadManifestFile(this.manifestFileName);
        console.log('Loaded manifest from disk:', manifest ? 'success' : 'failed');
        if (manifest) {
            console.log('manifest.files keys from disk:', Object.keys(manifest.files || {}));
            console.log('manifest.secureFiles keys from disk:', Object.keys(manifest.secureFiles || {}));
        }
        if (manifest && await this.validateChecksum(manifest)) {
            this.recoveryReport.source = 'primary';
            this.manifest = manifest;
            this.syncConfigFromManifest();
            return manifest;
        } else if (manifest) {
            this.recoveryReport.issues.push('Primary manifest checksum invalid');
        }

        // Level 2: Try backup manifest
        manifest = await this.tryLoadManifestFile(this.manifestBackupFileName);
        if (manifest && await this.validateChecksum(manifest)) {
            this.recoveryReport.source = 'backup';
            this.recoveryReport.recovered = true;
            this.recoveryReport.issues.push('Recovered from backup manifest');
            this.manifest = manifest;
            this.syncConfigFromManifest();
            // Restore primary from backup
            await this.saveManifestToDisk(manifest, this.manifestFileName);
            return manifest;
        } else if (manifest) {
            this.recoveryReport.issues.push('Backup manifest checksum invalid');
        }

        // Level 3: Try versioned manifests (newest first)
        const versionedManifest = await this.tryLoadVersionedManifest();
        if (versionedManifest) {
            this.recoveryReport.source = 'versioned';
            this.recoveryReport.recovered = true;
            this.manifest = versionedManifest;
            this.syncConfigFromManifest();
            await this.saveManifestToDisk(versionedManifest, this.manifestFileName);
            return versionedManifest;
        }

        // Level 4: Rebuild from files on disk
        manifest = await this.rebuildManifestFromFiles();
        if (manifest && Object.keys(manifest.files).length > 0) {
            this.recoveryReport.source = 'rebuilt';
            this.recoveryReport.recovered = true;
            this.recoveryReport.issues.push('Manifest rebuilt from existing files');
            this.manifest = manifest;
            await this.saveManifestToDisk(manifest, this.manifestFileName);

            // Trigger recovery callback
            if (this.onRecovery) {
                this.onRecovery(this.recoveryReport);
            }
            return manifest;
        }

        // Level 5: Create new empty manifest
        this.recoveryReport.source = 'new';
        manifest = this.createEmptyManifest();
        this.manifest = manifest;
        await this.saveManifestToDisk(manifest, this.manifestFileName);
        return manifest;
    }

    /**
     * Try to load a specific manifest file
     */
    async tryLoadManifestFile(filename) {
        try {
            const fileHandle = await this.directoryHandle.getFileHandle(filename);
            const file = await fileHandle.getFile();
            const content = await file.text();
            const manifest = JSON.parse(content);

            // Migrate/normalize manifest structure for older versions
            return this.migrateManifest(manifest);
        } catch (error) {
            return null;
        }
    }

    /**
     * Migrate manifest to current version structure
     */
    migrateManifest(manifest) {
        if (!manifest) return null;

        // Ensure trash object exists (added in v2.0)
        if (!manifest.trash) {
            manifest.trash = {};
        }

        // Ensure statistics object exists
        if (!manifest.statistics) {
            manifest.statistics = {
                totalUploads: 0,
                totalDeletes: 0,
                totalRestores: 0
            };
        }

        // Ensure auditLog array exists
        if (!manifest.auditLog) {
            manifest.auditLog = [];
        }

        // Ensure settings has all required properties
        if (!manifest.settings) {
            manifest.settings = {};
        }
        manifest.settings.storageLimitEnabled = manifest.settings.storageLimitEnabled ?? false;
        manifest.settings.storageLimitBytes = manifest.settings.storageLimitBytes ?? null;

        return manifest;
    }

    /**
     * Try to load the newest versioned manifest
     */
    async tryLoadVersionedManifest() {
        try {
            const versionedFiles = [];

            for await (const entry of this.directoryHandle.values()) {
                if (entry.kind === 'file' && entry.name.startsWith('_manifest.v') && entry.name.endsWith('.json')) {
                    versionedFiles.push(entry.name);
                }
            }

            // Sort by timestamp (newest first)
            versionedFiles.sort().reverse();

            for (const filename of versionedFiles.slice(0, 5)) { // Try last 5 versions
                const manifest = await this.tryLoadManifestFile(filename);
                if (manifest && await this.validateChecksum(manifest)) {
                    this.recoveryReport.issues.push(`Recovered from versioned manifest: ${filename}`);
                    return manifest;
                }
            }
        } catch (error) {
            console.warn('Could not load versioned manifests:', error);
        }
        return null;
    }

    /**
     * Rebuild manifest by scanning files on disk
     */
    async rebuildManifestFromFiles() {
        if (!this.directoryHandle) return null;

        const manifest = this.createEmptyManifest();
        manifest.settings = { ...manifest.settings, ...this.config };

        const foldersToScan = ['Documents', 'Images', 'Secure', 'Archive'];

        for (const folderName of foldersToScan) {
            try {
                const folderHandle = await this.directoryHandle.getDirectoryHandle(folderName);

                for await (const entry of folderHandle.values()) {
                    if (entry.kind === 'file' && !entry.name.startsWith('_')) {
                        try {
                            const fileHandle = await folderHandle.getFileHandle(entry.name);
                            const file = await fileHandle.getFile();

                            const metadata = {
                                id: this.generateId(),
                                name: entry.name,
                                storedName: entry.name,
                                folder: folderName,
                                size: this.formatFileSize(file.size),
                                rawSize: file.size,
                                type: this.getFileType(entry.name),
                                mimeType: file.type,
                                uploadDate: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
                                recoveredAt: new Date().toISOString(),
                                encrypted: folderName === 'Secure',
                                deleted: false
                            };

                            if (folderName === 'Secure') {
                                manifest.secureFiles[metadata.id] = metadata;
                            } else {
                                manifest.files[metadata.id] = metadata;
                            }
                        } catch (err) {
                            console.warn(`Could not read file ${entry.name}:`, err);
                        }
                    }
                }
            } catch (error) {
                // Folder doesn't exist, that's fine
            }
        }

        return manifest;
    }

    /**
     * Sync config from loaded manifest
     */
    syncConfigFromManifest() {
        if (!this.manifest) return;

        const settings = this.manifest.settings;
        if (settings.storageLimitBytes) {
            this.config.storageLimit = settings.storageLimitBytes;
            this.config.storageLimitEnabled = settings.storageLimitEnabled;
        }
        if (settings.detectedMaxStorage) {
            this.config.detectedMaxStorage = settings.detectedMaxStorage;
        }
        this.saveConfig();
    }

    /**
     * Save manifest to disk with atomic write pattern
     */
    async saveManifestToDisk(manifest, filename) {
        if (!this.directoryHandle) return;

        try {
            // Update checksum before saving
            const manifestToSave = { ...manifest, checksum: null };
            manifestToSave.lastModified = new Date().toISOString();
            manifestToSave.checksum = await this.generateChecksum(manifestToSave);

            const content = JSON.stringify(manifestToSave, null, 2);
            const tempFilename = `_temp_${Date.now()}.json`;

            // Step 1: Write to temp file
            const tempHandle = await this.directoryHandle.getFileHandle(tempFilename, { create: true });
            const tempWritable = await tempHandle.createWritable();
            await tempWritable.write(content);
            await tempWritable.close();

            // Step 2: Read back and verify
            const verifyHandle = await this.directoryHandle.getFileHandle(tempFilename);
            const verifyFile = await verifyHandle.getFile();
            const verifyContent = await verifyFile.text();

            if (verifyContent !== content) {
                throw new Error('Write verification failed');
            }

            // Step 3: Rename temp to target (atomic on most file systems)
            // Since File System Access API doesn't have rename, we copy and delete
            const targetHandle = await this.directoryHandle.getFileHandle(filename, { create: true });
            const targetWritable = await targetHandle.createWritable();
            await targetWritable.write(content);
            await targetWritable.close();

            // Step 4: Delete temp file
            await this.directoryHandle.removeEntry(tempFilename);

            this.lastSaveTime = new Date();
            return true;
        } catch (error) {
            console.error('Failed to save manifest:', error);
            throw error;
        }
    }

    /**
     * Save manifest with backup creation
     */
    async saveManifest() {
        if (!this.manifest || !this.directoryHandle) return;

        try {
            // Notify UI that save is starting
            if (this.onSaveStart) this.onSaveStart();

            // Create backup of current manifest first
            await this.createManifestBackup();

            // Save main manifest
            await this.saveManifestToDisk(this.manifest, this.manifestFileName);

            // Notify UI that save is complete
            if (this.onSaveEnd) this.onSaveEnd();

            return true;
        } catch (error) {
            console.error('Failed to save manifest:', error);
            if (this.onSaveEnd) this.onSaveEnd(error);
            throw error;
        }
    }

    /**
     * Create backup of manifest
     */
    async createManifestBackup() {
        try {
            // Copy current manifest to backup
            const currentManifest = await this.tryLoadManifestFile(this.manifestFileName);
            if (currentManifest) {
                await this.saveManifestToDisk(currentManifest, this.manifestBackupFileName);
            }
        } catch (error) {
            console.warn('Could not create manifest backup:', error);
        }
    }

    /**
     * Create versioned snapshot of manifest
     */
    async createVersionedSnapshot() {
        if (!this.manifest) return;

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const versionedFilename = `_manifest.v${timestamp}.json`;

        await this.saveManifestToDisk(this.manifest, versionedFilename);

        // Cleanup old versions (keep last 5)
        await this.cleanupOldVersions();
    }

    /**
     * Cleanup old versioned manifests
     */
    async cleanupOldVersions() {
        try {
            const versionedFiles = [];

            for await (const entry of this.directoryHandle.values()) {
                if (entry.kind === 'file' && entry.name.startsWith('_manifest.v') && entry.name.endsWith('.json')) {
                    versionedFiles.push(entry.name);
                }
            }

            // Keep only last 5 versions
            versionedFiles.sort().reverse();
            const filesToDelete = versionedFiles.slice(5);

            for (const filename of filesToDelete) {
                try {
                    await this.directoryHandle.removeEntry(filename);
                } catch (err) {
                    console.warn(`Could not delete old version ${filename}:`, err);
                }
            }
        } catch (error) {
            console.warn('Could not cleanup old versions:', error);
        }
    }

    // =========================================================================
    // WRITE QUEUE SYSTEM (Phase 2)
    // =========================================================================

    /**
     * Queue a change for batched saving
     */
    queueChange(changeType, data) {
        this.pendingChanges.push({
            type: changeType,
            data: data,
            timestamp: new Date().toISOString()
        });

        // Start or reset flush timer
        this.scheduleFlush();

        // Force flush if too many pending changes
        if (this.pendingChanges.length >= this.maxPendingChanges) {
            this.flushChanges();
        }
    }

    /**
     * Schedule a flush operation
     */
    scheduleFlush() {
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
        }

        this.flushTimer = setTimeout(() => {
            this.flushChanges();
        }, this.flushInterval);
    }

    /**
     * Flush all pending changes to disk
     */
    async flushChanges() {
        if (this.isFlushing || this.pendingChanges.length === 0) return;

        this.isFlushing = true;
        console.log('Flushing changes to disk...');
        console.log('manifest.files keys before flush:', Object.keys(this.manifest?.files || {}));

        try {
            // Save manifest which contains all changes
            await this.saveManifest();
            console.log('Flush complete - manifest saved to disk');

            // Clear pending changes
            this.pendingChanges = [];

            // Clear timer
            if (this.flushTimer) {
                clearTimeout(this.flushTimer);
                this.flushTimer = null;
            }
        } catch (error) {
            console.error('Failed to flush changes:', error);
        } finally {
            this.isFlushing = false;
        }
    }

    /**
     * Synchronous flush attempt (for beforeunload)
     */
    flushChangesSync() {
        // This is a best-effort attempt - async operations may not complete
        if (this.pendingChanges.length > 0 && this.manifest) {
            // Store in localStorage as emergency backup
            localStorage.setItem('emergencyManifestBackup', JSON.stringify(this.manifest));
        }
    }

    /**
     * Get pending changes count
     */
    getPendingChangesCount() {
        return this.pendingChanges.length;
    }

    /**
     * Get last save time
     */
    getLastSaveTime() {
        return this.lastSaveTime;
    }

    /**
     * Check if File System Access API is supported
     */
    isSupported() {
        return 'showDirectoryPicker' in window;
    }

    /**
     * Request user to select storage folder
     * @returns {Promise<boolean>} Success status
     */
    async selectStorageFolder() {
        if (!this.isSupported()) {
            throw new Error('File System Access API is not supported. Please use a Chromium-based browser.');
        }

        try {
            this.directoryHandle = await window.showDirectoryPicker({
                mode: 'readwrite',
                startIn: 'documents'
            });

            // Verify we have write permission
            const permission = await this.directoryHandle.requestPermission({ mode: 'readwrite' });
            if (permission !== 'granted') {
                throw new Error('Permission denied. Please grant read/write access to the folder.');
            }

            this.isConnected = true;
            this.config.storagePath = this.directoryHandle.name;
            this.config.lastConnected = new Date().toISOString();

            // Detect available storage space
            await this.detectAvailableStorage();

            this.saveConfig();

            // Initialize folder structure
            await this.initializeFolderStructure();

            // Load or create manifest
            await this.loadManifest();

            // Save directory handle for persistence
            await this.saveDirectoryHandle();

            return true;
        } catch (error) {
            if (error.name === 'AbortError') {
                // User cancelled the picker
                return false;
            }
            throw error;
        }
    }

    /**
     * Try to restore previously selected directory
     * @returns {Promise<boolean>} Success status
     */
    async restoreConnection() {
        if (!this.isSupported()) return false;

        try {
            // Try to get stored handle from IndexedDB
            const handle = await this.getStoredDirectoryHandle();
            if (!handle) return false;

            // Verify permission
            const permission = await handle.queryPermission({ mode: 'readwrite' });
            if (permission === 'granted') {
                this.directoryHandle = handle;
                this.isConnected = true;
                // Load manifest from disk
                await this.loadManifest();
                return true;
            }

            // Try to request permission again
            const newPermission = await handle.requestPermission({ mode: 'readwrite' });
            if (newPermission === 'granted') {
                this.directoryHandle = handle;
                this.isConnected = true;
                // Load manifest from disk
                await this.loadManifest();
                return true;
            }

            return false;
        } catch (error) {
            console.warn('Could not restore directory connection:', error);
            return false;
        }
    }

    /**
     * Save directory handle to IndexedDB for persistence
     */
    async saveDirectoryHandle() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FileSystemStorage', 1);

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('handles')) {
                    db.createObjectStore('handles', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['handles'], 'readwrite');
                const store = transaction.objectStore('handles');

                store.put({ id: 'rootDirectory', handle: this.directoryHandle });

                transaction.oncomplete = () => {
                    db.close();
                    resolve();
                };
                transaction.onerror = () => reject(transaction.error);
            };
        });
    }

    /**
     * Get stored directory handle from IndexedDB
     * @returns {Promise<FileSystemDirectoryHandle|null>}
     */
    async getStoredDirectoryHandle() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('FileSystemStorage', 1);

            request.onerror = () => reject(request.error);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('handles')) {
                    db.createObjectStore('handles', { keyPath: 'id' });
                }
            };

            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['handles'], 'readonly');
                const store = transaction.objectStore('handles');
                const getRequest = store.get('rootDirectory');

                getRequest.onsuccess = () => {
                    db.close();
                    resolve(getRequest.result?.handle || null);
                };
                getRequest.onerror = () => {
                    db.close();
                    resolve(null);
                };
            };
        });
    }

    /**
     * Initialize folder structure in storage directory
     */
    async initializeFolderStructure() {
        if (!this.isConnected || !this.directoryHandle) return;

        const folders = [...Object.values(this.config.folderStructure), this.trashFolderName];
        for (const folder of folders) {
            try {
                await this.directoryHandle.getDirectoryHandle(folder, { create: true });
            } catch (error) {
                console.warn(`Could not create folder ${folder}:`, error);
            }
        }
    }

    // =========================================================================
    // SOFT DELETE & TRASH SYSTEM (Phase 4)
    // =========================================================================

    /**
     * Move file to trash (soft delete)
     */
    async moveToTrash(fileId) {
        if (!this.manifest || !this.directoryHandle) {
            throw new Error('Storage not connected.');
        }

        console.log('moveToTrash called with fileId:', fileId);
        console.log('manifest.files keys:', Object.keys(this.manifest.files));
        console.log('manifest.secureFiles keys:', Object.keys(this.manifest.secureFiles));

        // Find file in manifest
        let metadata = this.manifest.files[fileId] || this.manifest.secureFiles[fileId];
        const isSecure = !!this.manifest.secureFiles[fileId];

        if (!metadata) {
            console.error('File not found in manifest. Looking for:', fileId);
            throw new Error(`File not found in manifest. ID: ${fileId}`);
        }

        try {
            // Move actual file to trash folder
            const sourceFolder = await this.directoryHandle.getDirectoryHandle(metadata.folder);
            const trashFolder = await this.directoryHandle.getDirectoryHandle(this.trashFolderName, { create: true });

            // Read source file
            const sourceFileHandle = await sourceFolder.getFileHandle(metadata.storedName);
            const sourceFile = await sourceFileHandle.getFile();

            // Generate unique name in trash
            const trashFileName = `${Date.now()}_${metadata.storedName}`;
            const trashFileHandle = await trashFolder.getFileHandle(trashFileName, { create: true });
            const writable = await trashFileHandle.createWritable();
            await writable.write(sourceFile);
            await writable.close();

            // Delete from source
            await sourceFolder.removeEntry(metadata.storedName);

            // Update manifest
            metadata.deleted = true;
            metadata.deletedAt = new Date().toISOString();
            metadata.originalFolder = metadata.folder;
            metadata.originalStoredName = metadata.storedName;
            metadata.storedName = trashFileName;
            metadata.folder = this.trashFolderName;

            // Move to trash in manifest
            if (isSecure) {
                delete this.manifest.secureFiles[fileId];
            } else {
                delete this.manifest.files[fileId];
            }
            this.manifest.trash[fileId] = metadata;
            this.manifest.statistics.totalDeletes++;

            // Add audit log
            this.addAuditLog('delete', fileId, metadata.name);

            // Save manifest immediately after delete
            await this.saveManifest();

            return true;
        } catch (error) {
            console.error('Could not move file to trash:', error);
            throw error;
        }
    }

    /**
     * Restore file from trash
     */
    async restoreFromTrash(fileId) {
        if (!this.manifest || !this.directoryHandle) {
            throw new Error('Storage not connected.');
        }

        const metadata = this.manifest.trash[fileId];
        if (!metadata) {
            throw new Error('File not found in trash.');
        }

        try {
            // Move file back from trash
            const trashFolder = await this.directoryHandle.getDirectoryHandle(this.trashFolderName);
            const targetFolder = await this.directoryHandle.getDirectoryHandle(metadata.originalFolder, { create: true });

            // Read trash file
            const trashFileHandle = await trashFolder.getFileHandle(metadata.storedName);
            const trashFile = await trashFileHandle.getFile();

            // Generate unique name in target (original name might be taken)
            const restoredFileName = await this.generateUniqueFilename(metadata.originalStoredName, targetFolder);
            const targetFileHandle = await targetFolder.getFileHandle(restoredFileName, { create: true });
            const writable = await targetFileHandle.createWritable();
            await writable.write(trashFile);
            await writable.close();

            // Delete from trash
            await trashFolder.removeEntry(metadata.storedName);

            // Update metadata
            metadata.deleted = false;
            metadata.restoredAt = new Date().toISOString();
            metadata.storedName = restoredFileName;
            metadata.folder = metadata.originalFolder;
            delete metadata.deletedAt;
            delete metadata.originalFolder;
            delete metadata.originalStoredName;

            // Move back in manifest
            delete this.manifest.trash[fileId];
            if (metadata.encrypted) {
                this.manifest.secureFiles[fileId] = metadata;
            } else {
                this.manifest.files[fileId] = metadata;
            }
            this.manifest.statistics.totalRestores++;

            // Add audit log
            this.addAuditLog('restore', fileId, metadata.name);

            // Save manifest immediately after restore
            await this.saveManifest();

            return metadata;
        } catch (error) {
            console.error('Could not restore file from trash:', error);
            throw error;
        }
    }

    /**
     * Permanently delete file from trash
     */
    async permanentDelete(fileId) {
        if (!this.manifest || !this.directoryHandle) {
            throw new Error('Storage not connected.');
        }

        const metadata = this.manifest.trash[fileId];
        if (!metadata) {
            throw new Error('File not found in trash.');
        }

        try {
            // Delete actual file
            const trashFolder = await this.directoryHandle.getDirectoryHandle(this.trashFolderName);
            await trashFolder.removeEntry(metadata.storedName);

            // Remove from manifest
            delete this.manifest.trash[fileId];

            // Add audit log
            this.addAuditLog('permanent_delete', fileId, metadata.name);

            // Save manifest immediately
            await this.saveManifest();

            return true;
        } catch (error) {
            console.error('Could not permanently delete file:', error);
            throw error;
        }
    }

    /**
     * Empty trash (delete all files in trash)
     */
    async emptyTrash() {
        if (!this.manifest || !this.directoryHandle) {
            throw new Error('Storage not connected.');
        }

        const trashIds = Object.keys(this.manifest.trash);
        const results = { success: 0, failed: 0 };

        for (const fileId of trashIds) {
            try {
                await this.permanentDelete(fileId);
                results.success++;
            } catch (error) {
                results.failed++;
            }
        }

        return results;
    }

    /**
     * Get all files in trash
     */
    getTrashFiles() {
        if (!this.manifest || !this.manifest.trash) return [];

        // Return trash files with their IDs included
        return Object.entries(this.manifest.trash).map(([id, metadata]) => ({
            id,
            ...metadata
        }));
    }

    /**
     * Auto-purge old trash items (older than specified days)
     */
    async autoPurgeTrash(daysOld = 30) {
        if (!this.manifest) return;

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const oldItems = Object.entries(this.manifest.trash)
            .filter(([id, item]) => new Date(item.deletedAt) < cutoffDate)
            .map(([id]) => id);

        for (const fileId of oldItems) {
            try {
                await this.permanentDelete(fileId);
            } catch (error) {
                console.warn(`Could not auto-purge ${fileId}:`, error);
            }
        }
    }

    // =========================================================================
    // AUDIT LOG SYSTEM
    // =========================================================================

    /**
     * Add entry to audit log
     */
    addAuditLog(action, fileId, fileName, details = {}) {
        if (!this.manifest) return;

        const entry = {
            id: this.generateId(),
            action,
            fileId,
            fileName,
            timestamp: new Date().toISOString(),
            details
        };

        this.manifest.auditLog.unshift(entry);

        // Keep last 1000 entries
        if (this.manifest.auditLog.length > 1000) {
            this.manifest.auditLog = this.manifest.auditLog.slice(0, 1000);
        }
    }

    /**
     * Get audit log entries
     */
    getAuditLog(limit = 100) {
        if (!this.manifest) return [];
        return this.manifest.auditLog.slice(0, limit);
    }

    // =========================================================================
    // FILE OPERATIONS (Updated to use Manifest)
    // =========================================================================

    /**
     * Get target folder based on file type
     * @param {string} fileType File type
     * @param {boolean} isSecure Is encrypted file
     * @returns {string} Folder name
     */
    getTargetFolder(fileType, isSecure = false) {
        if (isSecure) return this.config.folderStructure.secure;

        const imageTypes = ['image', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        if (imageTypes.includes(fileType.toLowerCase())) {
            return this.config.folderStructure.images;
        }

        return this.config.folderStructure.documents;
    }

    /**
     * Generate unique filename to avoid conflicts
     * @param {string} originalName Original filename
     * @param {FileSystemDirectoryHandle} folderHandle Target folder
     * @returns {Promise<string>} Unique filename
     */
    async generateUniqueFilename(originalName, folderHandle) {
        let filename = originalName;
        let counter = 1;

        while (true) {
            try {
                await folderHandle.getFileHandle(filename);
                // File exists, generate new name
                const ext = originalName.includes('.') ? '.' + originalName.split('.').pop() : '';
                const baseName = originalName.replace(ext, '');
                filename = `${baseName} (${counter})${ext}`;
                counter++;
            } catch {
                // File doesn't exist, use this name
                break;
            }
        }

        return filename;
    }

    /**
     * Save a file to storage
     * @param {File} file File to save
     * @param {Object} options Save options
     * @returns {Promise<Object>} Saved file metadata
     */
    async saveFile(file, options = {}) {
        if (!this.isConnected || !this.directoryHandle) {
            throw new Error('Storage not connected. Please select a storage folder first.');
        }

        const { encrypt = false, password = null, content = null } = options;

        // Determine target folder
        const targetFolderName = this.getTargetFolder(this.getFileType(file.name), encrypt);
        const targetFolder = await this.directoryHandle.getDirectoryHandle(targetFolderName, { create: true });

        // Generate unique filename
        const uniqueFilename = await this.generateUniqueFilename(file.name, targetFolder);

        // Create file
        const fileHandle = await targetFolder.getFileHandle(uniqueFilename, { create: true });
        const writable = await fileHandle.createWritable();

        // Write content (either provided content or original file)
        if (content) {
            await writable.write(content);
        } else {
            await writable.write(file);
        }
        await writable.close();

        // Create metadata
        const metadata = {
            id: this.generateId(),
            name: file.name,
            storedName: uniqueFilename,
            folder: targetFolderName,
            size: this.formatFileSize(file.size),
            rawSize: file.size,
            type: this.getFileType(file.name),
            mimeType: file.type,
            uploadDate: new Date().toISOString(),
            encrypted: encrypt,
            hasPassword: !!password
        };

        // Update manifest (instead of index)
        if (!this.manifest) {
            this.manifest = this.createEmptyManifest();
        }

        if (encrypt) {
            this.manifest.secureFiles[metadata.id] = metadata;
            console.log('Added to manifest.secureFiles:', metadata.id);
        } else {
            this.manifest.files[metadata.id] = metadata;
            console.log('Added to manifest.files:', metadata.id);
        }
        console.log('manifest.files keys after save:', Object.keys(this.manifest.files));
        this.manifest.statistics.totalUploads++;

        // Add audit log
        this.addAuditLog('upload', metadata.id, file.name, { size: file.size, encrypted: encrypt });

        // IMPORTANT: Save manifest immediately after upload to ensure data persistence
        // This prevents data loss if user deletes before the 30-second queue flush
        await this.saveManifest();
        console.log('Manifest saved immediately after upload');

        return metadata;
    }

    /**
     * Get a file from storage
     * @param {string} fileId File ID
     * @returns {Promise<{metadata: Object, file: File}>} File data
     */
    async getFile(fileId) {
        if (!this.isConnected || !this.directoryHandle) {
            throw new Error('Storage not connected.');
        }

        if (!this.manifest) {
            throw new Error('Manifest not loaded.');
        }

        // Find in manifest
        const metadata = this.manifest.files[fileId] || this.manifest.secureFiles[fileId];

        if (!metadata) {
            throw new Error('File not found.');
        }

        try {
            const folderHandle = await this.directoryHandle.getDirectoryHandle(metadata.folder);
            const fileHandle = await folderHandle.getFileHandle(metadata.storedName);
            const file = await fileHandle.getFile();

            return { metadata, file };
        } catch (error) {
            console.error('Could not retrieve file:', error);
            throw new Error('Could not retrieve file from storage.');
        }
    }

    /**
     * Delete a file from storage (soft delete - moves to trash)
     * @param {string} fileId File ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(fileId) {
        // Use soft delete (move to trash)
        return await this.moveToTrash(fileId);
    }

    /**
     * Get all files from storage
     * @returns {Promise<{files: Array, secureFiles: Array}>} All files
     */
    async getAllFiles() {
        if (!this.manifest) {
            return { files: [], secureFiles: [] };
        }

        return {
            files: Object.values(this.manifest.files),
            secureFiles: Object.values(this.manifest.secureFiles)
        };
    }

    /**
     * Get empty stats (when not connected)
     */
    getEmptyStats() {
        return {
            totalFiles: 0,
            secureFiles: 0,
            regularFiles: 0,
            totalSize: 0,
            formattedSize: '0 Bytes',
            storageLimit: this.config.storageLimit,
            formattedLimit: this.config.storageLimit ? this.formatFileSize(this.config.storageLimit) : '--',
            usagePercentage: 0,
            storageLimitEnabled: false,
            isConnected: false,
            storagePath: '',
            lastConnected: null,
            detectedMaxStorage: null,
            formattedMaxStorage: 'Unknown',
            trashCount: 0,
            trashSize: 0,
            pendingChanges: 0,
            lastSaveTime: null
        };
    }

    /**
     * Get storage statistics
     * @returns {Promise<Object>} Storage stats
     */
    async getStorageStats() {
        if (!this.manifest) {
            return this.getEmptyStats();
        }

        const files = [...Object.values(this.manifest.files), ...Object.values(this.manifest.secureFiles)];

        const totalSize = files.reduce((sum, f) => sum + (f.rawSize || 0), 0);
        const fileCount = files.length;
        const secureCount = Object.keys(this.manifest.secureFiles).length;
        const trashCount = Object.keys(this.manifest.trash).length;

        // Calculate trash size
        const trashSize = Object.values(this.manifest.trash).reduce((sum, f) => sum + (f.rawSize || 0), 0);

        // Get limit from manifest settings
        const storageLimit = this.manifest.settings.storageLimitBytes || this.config.storageLimit;
        const storageLimitEnabled = this.manifest.settings.storageLimitEnabled || this.config.storageLimitEnabled;
        const detectedStorage = this.config.detectedMaxStorage;

        // Determine display limit: user-set limit if enabled, otherwise detected disk capacity
        const displayLimit = storageLimitEnabled && storageLimit ? storageLimit : detectedStorage;
        const usagePercentage = displayLimit ? Math.min(100, (totalSize / displayLimit) * 100) : 0;

        return {
            totalFiles: fileCount,
            secureFiles: secureCount,
            regularFiles: fileCount - secureCount,
            totalSize: totalSize,
            formattedSize: this.formatFileSize(totalSize),
            storageLimit: storageLimit,
            displayLimit: displayLimit,
            formattedLimit: displayLimit ? this.formatFileSize(displayLimit) : (this.isConnected ? 'Unknown' : '--'),
            usagePercentage: usagePercentage,
            storageLimitEnabled: storageLimitEnabled,
            isConnected: this.isConnected,
            storagePath: this.config.storagePath,
            lastConnected: this.config.lastConnected,
            detectedMaxStorage: this.config.detectedMaxStorage,
            formattedMaxStorage: this.config.detectedMaxStorage ? this.formatFileSize(this.config.detectedMaxStorage) : 'Unknown',
            trashCount: trashCount,
            trashSize: trashSize,
            formattedTrashSize: this.formatFileSize(trashSize),
            pendingChanges: this.pendingChanges.length,
            lastSaveTime: this.lastSaveTime,
            statistics: this.manifest.statistics
        };
    }

    /**
     * Detect available storage space on the selected drive
     * @returns {Promise<Object>} Storage info with quota and usage
     */
    async detectAvailableStorage() {
        let detectedStorage = null;

        // Method 1: Try Storage Manager API (most accurate for browser storage)
        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                // This gives us the browser's storage quota, which is typically
                // a percentage of the disk space (60% in Chrome)
                if (estimate.quota) {
                    // Estimate actual disk space (browser typically gets 60% of free space)
                    detectedStorage = Math.floor(estimate.quota / 0.6);
                }
            } catch (error) {
                console.warn('Storage estimate failed:', error);
            }
        }

        // Method 2: Try to write a test file to estimate (fallback)
        // This is a rough estimation based on common drive sizes
        if (!detectedStorage && this.directoryHandle) {
            // Default to reasonable estimates based on drive letter/path
            // These are fallback values when we can't detect actual space
            detectedStorage = 500 * 1024 * 1024 * 1024; // 500 GB default assumption
        }

        // Store the detected value
        this.config.detectedMaxStorage = detectedStorage;

        // Update manifest settings if connected
        if (this.manifest) {
            this.manifest.settings.detectedMaxStorage = detectedStorage;
        }

        return {
            detectedStorage,
            formattedStorage: this.formatFileSize(detectedStorage),
            isEstimate: true // Flag that this is an estimate
        };
    }

    /**
     * Get detected maximum storage
     * @returns {Object} Detected storage info
     */
    getDetectedStorage() {
        return {
            bytes: this.config.detectedMaxStorage,
            formatted: this.config.detectedMaxStorage ? this.formatFileSize(this.config.detectedMaxStorage) : 'Unknown',
            isConfigured: this.config.storageLimit !== null && this.config.storageLimit > 0
        };
    }

    /**
     * Set storage limit (saves to both config and manifest)
     * @param {number} limitInBytes Storage limit in bytes
     * @returns {Object} Result with actual limit set and whether it was capped
     */
    setStorageLimit(limitInBytes) {
        let actualLimit = limitInBytes;
        let wasCapped = false;

        // Cap at detected storage capacity if available
        if (this.config.detectedMaxStorage && limitInBytes > this.config.detectedMaxStorage) {
            actualLimit = this.config.detectedMaxStorage;
            wasCapped = true;
        }

        this.config.storageLimit = actualLimit;
        this.config.storageLimitEnabled = true;
        this.saveConfig();

        // Also update manifest
        if (this.manifest) {
            this.manifest.settings.storageLimitBytes = actualLimit;
            this.manifest.settings.storageLimitGB = actualLimit / (1024 * 1024 * 1024);
            this.manifest.settings.storageLimitEnabled = true;
            this.manifest.settings.configuredAt = new Date().toISOString();
            this.queueChange('settings', { storageLimitBytes: actualLimit });
        }

        return { actualLimit, wasCapped, detectedMax: this.config.detectedMaxStorage };
    }

    /**
     * Disable storage limit
     */
    disableStorageLimit() {
        this.config.storageLimitEnabled = false;
        this.saveConfig();

        if (this.manifest) {
            this.manifest.settings.storageLimitEnabled = false;
            this.queueChange('settings', { storageLimitEnabled: false });
        }
    }

    /**
     * Check if upload would exceed storage limit
     * @param {number} fileSize File size in bytes
     * @returns {Promise<boolean>} True if upload is allowed
     */
    async checkStorageQuota(fileSize) {
        const storageLimit = this.manifest?.settings?.storageLimitBytes || this.config.storageLimit;
        const storageLimitEnabled = this.manifest?.settings?.storageLimitEnabled || this.config.storageLimitEnabled;

        if (!storageLimitEnabled || !storageLimit) return true;

        const stats = await this.getStorageStats();
        return (stats.totalSize + fileSize) <= storageLimit;
    }

    /**
     * Disconnect from storage (flushes pending changes first)
     */
    async disconnect() {
        // Flush any pending changes before disconnecting
        if (this.pendingChanges.length > 0) {
            await this.flushChanges();
        }

        this.directoryHandle = null;
        this.isConnected = false;
        this.manifest = null;
    }

    // =========================================================================
    // EXPORT/IMPORT SYSTEM (Phase 5)
    // =========================================================================

    /**
     * Export all data as a downloadable backup
     * Returns metadata that can be used to create a manual backup
     */
    async exportBackupMetadata() {
        if (!this.manifest) {
            throw new Error('No manifest to export.');
        }

        // Create versioned snapshot first
        await this.createVersionedSnapshot();

        const exportData = {
            exportDate: new Date().toISOString(),
            exportVersion: '2.0',
            manifest: this.manifest,
            config: this.config,
            fileList: [
                ...Object.values(this.manifest.files).map(f => ({ ...f, location: `${f.folder}/${f.storedName}` })),
                ...Object.values(this.manifest.secureFiles).map(f => ({ ...f, location: `${f.folder}/${f.storedName}` }))
            ]
        };

        return exportData;
    }

    /**
     * Verify storage integrity
     * Checks that all files in manifest exist on disk
     */
    async verifyIntegrity() {
        if (!this.manifest || !this.directoryHandle) {
            return { valid: false, error: 'Not connected' };
        }

        const results = {
            valid: true,
            totalFiles: 0,
            missingFiles: [],
            orphanedFiles: [],
            errors: []
        };

        // Check files in manifest exist on disk
        const allFiles = [
            ...Object.entries(this.manifest.files),
            ...Object.entries(this.manifest.secureFiles)
        ];

        results.totalFiles = allFiles.length;

        for (const [id, metadata] of allFiles) {
            try {
                const folderHandle = await this.directoryHandle.getDirectoryHandle(metadata.folder);
                await folderHandle.getFileHandle(metadata.storedName);
            } catch (error) {
                results.missingFiles.push({ id, name: metadata.name, folder: metadata.folder });
                results.valid = false;
            }
        }

        // Check for orphaned files (files on disk not in manifest)
        const foldersToScan = ['Documents', 'Images', 'Secure', 'Archive'];
        const manifestFileNames = new Set(allFiles.map(([id, m]) => `${m.folder}/${m.storedName}`));

        for (const folderName of foldersToScan) {
            try {
                const folderHandle = await this.directoryHandle.getDirectoryHandle(folderName);
                for await (const entry of folderHandle.values()) {
                    if (entry.kind === 'file' && !entry.name.startsWith('_')) {
                        const fullPath = `${folderName}/${entry.name}`;
                        if (!manifestFileNames.has(fullPath)) {
                            results.orphanedFiles.push({ name: entry.name, folder: folderName });
                        }
                    }
                }
            } catch (error) {
                // Folder doesn't exist, that's fine
            }
        }

        return results;
    }

    /**
     * Repair storage by adding orphaned files to manifest
     */
    async repairStorage() {
        const integrity = await this.verifyIntegrity();

        if (integrity.orphanedFiles.length === 0 && integrity.missingFiles.length === 0) {
            return { repaired: false, message: 'No repairs needed' };
        }

        let addedCount = 0;
        let removedCount = 0;

        // Add orphaned files to manifest
        for (const orphan of integrity.orphanedFiles) {
            try {
                const folderHandle = await this.directoryHandle.getDirectoryHandle(orphan.folder);
                const fileHandle = await folderHandle.getFileHandle(orphan.name);
                const file = await fileHandle.getFile();

                const metadata = {
                    id: this.generateId(),
                    name: orphan.name,
                    storedName: orphan.name,
                    folder: orphan.folder,
                    size: this.formatFileSize(file.size),
                    rawSize: file.size,
                    type: this.getFileType(orphan.name),
                    mimeType: file.type,
                    uploadDate: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
                    repairedAt: new Date().toISOString(),
                    encrypted: orphan.folder === 'Secure',
                    deleted: false
                };

                if (orphan.folder === 'Secure') {
                    this.manifest.secureFiles[metadata.id] = metadata;
                } else {
                    this.manifest.files[metadata.id] = metadata;
                }
                addedCount++;
            } catch (error) {
                console.warn(`Could not repair orphan ${orphan.name}:`, error);
            }
        }

        // Remove missing files from manifest
        for (const missing of integrity.missingFiles) {
            delete this.manifest.files[missing.id];
            delete this.manifest.secureFiles[missing.id];
            removedCount++;
        }

        // Save repaired manifest
        await this.saveManifest();

        return {
            repaired: true,
            addedCount,
            removedCount,
            message: `Added ${addedCount} orphaned files, removed ${removedCount} missing references`
        };
    }

    /**
     * Get recovery report (if any recovery happened on load)
     */
    getRecoveryReport() {
        return this.recoveryReport;
    }

    /**
     * Force save manifest (bypass queue)
     */
    async forceSave() {
        await this.saveManifest();
    }

    // =========================================================================
    // UTILITY METHODS
    // =========================================================================

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'pdf',
            'doc': 'doc', 'docx': 'doc',
            'txt': 'txt',
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image', 'bmp': 'image', 'webp': 'image',
            'xlsx': 'xlsx', 'xls': 'xlsx',
            'pptx': 'pptx', 'ppt': 'pptx',
            'csv': 'xlsx',
            'zip': 'archive', 'rar': 'archive', '7z': 'archive'
        };
        return typeMap[extension] || 'file';
    }

    formatFileSize(bytes) {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Parse size string to bytes
     * @param {string} sizeStr Size string like "100 GB"
     * @returns {number} Size in bytes
     */
    parseSizeToBytes(sizeStr) {
        const units = {
            'bytes': 1,
            'kb': 1024,
            'mb': 1024 * 1024,
            'gb': 1024 * 1024 * 1024,
            'tb': 1024 * 1024 * 1024 * 1024
        };

        const match = sizeStr.toLowerCase().match(/^([\d.]+)\s*(bytes|kb|mb|gb|tb)$/);
        if (!match) return 0;

        const value = parseFloat(match[1]);
        const unit = match[2];
        return Math.floor(value * (units[unit] || 1));
    }
}

// Export for module usage
export default FileSystemService;

// Also attach to window for non-module usage
if (typeof window !== 'undefined') {
    window.FileSystemService = FileSystemService;
}
