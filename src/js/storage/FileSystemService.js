/**
 * FileSystemService - File System Access API Storage Engine
 * Provides unlimited storage (1-2 TB+) by saving files directly to disk
 * Works with local drives, network shares, and RAID arrays
 */

class FileSystemService {
    constructor() {
        this.directoryHandle = null;
        this.isConnected = false;
        this.indexFileName = '.filing-system-index.json';
        this.config = this.loadConfig();
    }

    /**
     * Load storage configuration from localStorage
     */
    loadConfig() {
        const defaultConfig = {
            storagePath: '',
            storageLimit: 100 * 1024 * 1024 * 1024, // 100 GB default
            storageLimitEnabled: true,
            detectedMaxStorage: null, // Will store detected max storage
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
     * Save storage configuration to localStorage
     */
    saveConfig() {
        localStorage.setItem('fileSystemConfig', JSON.stringify(this.config));
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
            throw new Error('File System Access API is not supported. Please use Chrome or Edge browser.');
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
                return true;
            }

            // Try to request permission again
            const newPermission = await handle.requestPermission({ mode: 'readwrite' });
            if (newPermission === 'granted') {
                this.directoryHandle = handle;
                this.isConnected = true;
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

        const folders = Object.values(this.config.folderStructure);
        for (const folder of folders) {
            try {
                await this.directoryHandle.getDirectoryHandle(folder, { create: true });
            } catch (error) {
                console.warn(`Could not create folder ${folder}:`, error);
            }
        }

        // Create index file if it doesn't exist
        await this.ensureIndexFile();
    }

    /**
     * Ensure index file exists
     */
    async ensureIndexFile() {
        try {
            await this.directoryHandle.getFileHandle(this.indexFileName);
        } catch {
            // Create new index file
            const fileHandle = await this.directoryHandle.getFileHandle(this.indexFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify({
                version: '1.0',
                created: new Date().toISOString(),
                files: [],
                secureFiles: []
            }, null, 2));
            await writable.close();
        }
    }

    /**
     * Read the index file
     * @returns {Promise<Object>} Index data
     */
    async readIndex() {
        if (!this.isConnected || !this.directoryHandle) {
            return { files: [], secureFiles: [] };
        }

        try {
            const fileHandle = await this.directoryHandle.getFileHandle(this.indexFileName);
            const file = await fileHandle.getFile();
            const content = await file.text();
            return JSON.parse(content);
        } catch (error) {
            console.warn('Could not read index file:', error);
            return { files: [], secureFiles: [] };
        }
    }

    /**
     * Write to the index file
     * @param {Object} indexData Index data to write
     */
    async writeIndex(indexData) {
        if (!this.isConnected || !this.directoryHandle) return;

        try {
            const fileHandle = await this.directoryHandle.getFileHandle(this.indexFileName, { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify({
                ...indexData,
                lastModified: new Date().toISOString()
            }, null, 2));
            await writable.close();
        } catch (error) {
            console.error('Could not write index file:', error);
            throw error;
        }
    }

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

        // Update index
        const index = await this.readIndex();
        if (encrypt) {
            index.secureFiles = index.secureFiles || [];
            index.secureFiles.push(metadata);
        } else {
            index.files = index.files || [];
            index.files.push(metadata);
        }
        await this.writeIndex(index);

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

        const index = await this.readIndex();
        const allFiles = [...(index.files || []), ...(index.secureFiles || [])];
        const metadata = allFiles.find(f => f.id === fileId);

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
     * Delete a file from storage
     * @param {string} fileId File ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteFile(fileId) {
        if (!this.isConnected || !this.directoryHandle) {
            throw new Error('Storage not connected.');
        }

        const index = await this.readIndex();
        let metadata = null;
        let isSecure = false;

        // Find file in index
        const fileIndex = (index.files || []).findIndex(f => f.id === fileId);
        if (fileIndex !== -1) {
            metadata = index.files[fileIndex];
            index.files.splice(fileIndex, 1);
        } else {
            const secureIndex = (index.secureFiles || []).findIndex(f => f.id === fileId);
            if (secureIndex !== -1) {
                metadata = index.secureFiles[secureIndex];
                index.secureFiles.splice(secureIndex, 1);
                isSecure = true;
            }
        }

        if (!metadata) {
            throw new Error('File not found.');
        }

        try {
            // Delete actual file
            const folderHandle = await this.directoryHandle.getDirectoryHandle(metadata.folder);
            await folderHandle.removeEntry(metadata.storedName);

            // Update index
            await this.writeIndex(index);

            return true;
        } catch (error) {
            console.error('Could not delete file:', error);
            // Still update index even if file deletion failed
            await this.writeIndex(index);
            throw new Error('Could not delete file from storage.');
        }
    }

    /**
     * Get all files from storage
     * @returns {Promise<{files: Array, secureFiles: Array}>} All files
     */
    async getAllFiles() {
        const index = await this.readIndex();
        return {
            files: index.files || [],
            secureFiles: index.secureFiles || []
        };
    }

    /**
     * Get storage statistics
     * @returns {Promise<Object>} Storage stats
     */
    async getStorageStats() {
        const index = await this.readIndex();
        const files = [...(index.files || []), ...(index.secureFiles || [])];

        const totalSize = files.reduce((sum, f) => sum + (f.rawSize || 0), 0);
        const fileCount = files.length;
        const secureCount = (index.secureFiles || []).length;

        // Try to get actual disk usage using Storage API
        let diskQuota = this.config.storageLimit;
        let diskUsage = totalSize;

        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();
                // Note: This is browser storage, not the actual folder
                // We use our configured limit instead
            } catch (error) {
                console.warn('Could not estimate storage:', error);
            }
        }

        return {
            totalFiles: fileCount,
            secureFiles: secureCount,
            regularFiles: fileCount - secureCount,
            totalSize: totalSize,
            formattedSize: this.formatFileSize(totalSize),
            storageLimit: this.config.storageLimit,
            formattedLimit: this.formatFileSize(this.config.storageLimit),
            usagePercentage: this.config.storageLimitEnabled
                ? Math.min(100, (totalSize / this.config.storageLimit) * 100)
                : 0,
            storageLimitEnabled: this.config.storageLimitEnabled,
            isConnected: this.isConnected,
            storagePath: this.config.storagePath,
            lastConnected: this.config.lastConnected,
            detectedMaxStorage: this.config.detectedMaxStorage,
            formattedMaxStorage: this.config.detectedMaxStorage ? this.formatFileSize(this.config.detectedMaxStorage) : 'Unknown'
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

        // If no limit was previously set, suggest using detected max
        if (!this.config.storageLimit || this.config.storageLimit === 100 * 1024 * 1024 * 1024) {
            // Don't automatically set, let user decide
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
            isConfigured: this.config.storageLimit !== null
        };
    }

    /**
     * Set storage limit
     * @param {number} limitInBytes Storage limit in bytes
     */
    setStorageLimit(limitInBytes) {
        this.config.storageLimit = limitInBytes;
        this.config.storageLimitEnabled = true;
        this.saveConfig();
    }

    /**
     * Disable storage limit
     */
    disableStorageLimit() {
        this.config.storageLimitEnabled = false;
        this.saveConfig();
    }

    /**
     * Check if upload would exceed storage limit
     * @param {number} fileSize File size in bytes
     * @returns {Promise<boolean>} True if upload is allowed
     */
    async checkStorageQuota(fileSize) {
        if (!this.config.storageLimitEnabled) return true;

        const stats = await this.getStorageStats();
        return (stats.totalSize + fileSize) <= this.config.storageLimit;
    }

    /**
     * Disconnect from storage
     */
    disconnect() {
        this.directoryHandle = null;
        this.isConnected = false;
    }

    // Utility methods
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
        if (bytes === 0) return '0 Bytes';
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
