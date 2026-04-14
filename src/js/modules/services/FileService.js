/**
 * File Service
 * Handles all file operations (upload, download, delete, rename, etc)
 * @module services/FileService
 */

import { EventEmitter } from '../core/EventEmitter.js';
import { createLogger } from '../utils/logger.js';
import { CONFIG } from '../utils/config.js';

const logger = createLogger('FileService');

export class FileService extends EventEmitter {
  constructor(storageManager, cryptoService) {
    super('FileService');
    this.storage = storageManager;
    this.crypto = cryptoService;
    this.logger = logger;
    this.files = [];
    this.secureFiles = [];
    this.trash = [];
  }

  /**
   * Initialize file service with files from storage
   */
  async initialize() {
    const { files, secureFiles } = await this.storage.getFiles();
    this.files = files || [];
    this.secureFiles = secureFiles || [];
    this.trash = this.storage.getTrash() || [];
    this.logger.info(`Loaded ${this.files.length} files and ${this.secureFiles.length} secure files`);
  }

  /**
   * Get all files
   */
  getAllFiles() {
    return [...this.files, ...this.secureFiles];
  }

  /**
   * Get file by ID
   */
  getFile(fileId) {
    return [...this.files, ...this.secureFiles].find(f => f.id === fileId);
  }

  /**
   * Upload file (save to storage with metadata)
   */
  async uploadFile(file, options = {}) {
    try {
      const metadata = {
        id: options.id || this._generateId(),
        name: options.name || file.name,
        size: this._formatFileSize(file.size),
        rawSize: file.size,
        type: this._getFileType(file.name),
        uploadDate: new Date().toISOString(),
        encrypted: options.encrypt || false
      };

      // Save to storage
      const savedMetadata = await this.storage.saveFile(
        file,
        metadata,
        options.encrypt,
        options.password
      );

      // Add to appropriate array
      if (options.encrypt) {
        this.secureFiles.push(savedMetadata);
      } else {
        this.files.push(savedMetadata);
      }

      // Save files to persistence
      await this.storage.saveFiles(this.files, this.secureFiles);

      this.logger.info(`File uploaded: ${metadata.name}`);
      this.emit('file:uploaded', savedMetadata);

      return savedMetadata;
    } catch (error) {
      this.logger.error(`Upload error for ${file.name}:`, error);
      throw error;
    }
  }

  /**
   * Download file
   */
  async downloadFile(fileId) {
    const file = this.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    try {
      // Log download activity
      this.emit('file:downloaded', file);
      return file;
    } catch (error) {
      this.logger.error(`Download error for ${fileId}:`, error);
      throw error;
    }
  }

  /**
   * Rename file
   */
  async renameFile(fileId, newName) {
    const file = this.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const oldName = file.name;
    file.name = newName;

    // Save changes
    await this.storage.saveFiles(this.files, this.secureFiles);

    this.logger.info(`File renamed: ${oldName} -> ${newName}`);
    this.emit('file:renamed', { fileId, oldName, newName });

    return file;
  }

  /**
   * Delete file (soft delete - move to trash)
   */
  async deleteFile(fileId) {
    const file = this.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // Move to trash
    const trashedFile = {
      ...file,
      deletedAt: new Date().toISOString(),
      originalFolder: file.encrypted ? 'secure' : 'files'
    };

    this.trash.unshift(trashedFile);
    this.storage.saveTrash(this.trash);

    // Remove from main arrays
    this.files = this.files.filter(f => f.id !== fileId);
    this.secureFiles = this.secureFiles.filter(f => f.id !== fileId);
    await this.storage.saveFiles(this.files, this.secureFiles);

    this.logger.info(`File deleted: ${file.name}`);
    this.emit('file:deleted', file);

    return file;
  }

  /**
   * Restore file from trash
   */
  async restoreFromTrash(fileId) {
    const trashIndex = this.trash.findIndex(f => f.id === fileId);
    if (trashIndex === -1) {
      throw new Error('File not found in trash');
    }

    const file = this.trash[trashIndex];
    delete file.deletedAt;

    // Restore to appropriate array
    if (file.encrypted || file.originalFolder === 'secure') {
      this.secureFiles.push(file);
    } else {
      this.files.push(file);
    }

    // Remove from trash
    this.trash.splice(trashIndex, 1);
    this.storage.saveTrash(this.trash);
    await this.storage.saveFiles(this.files, this.secureFiles);

    this.logger.info(`File restored: ${file.name}`);
    this.emit('file:restored', file);

    return file;
  }

  /**
   * Permanently delete from trash
   */
  async permanentlyDelete(fileId) {
    this.trash = this.trash.filter(f => f.id !== fileId);
    this.storage.saveTrash(this.trash);

    this.logger.info(`File permanently deleted: ${fileId}`);
    this.emit('file:permanentlyDeleted', fileId);
  }

  /**
   * Empty entire trash
   */
  async emptyTrash() {
    const count = this.trash.length;
    this.trash = [];
    this.storage.saveTrash(this.trash);

    this.logger.info(`Trash emptied: ${count} files deleted`);
    this.emit('trash:emptied', count);
  }

  /**
   * Get trash files
   */
  getTrash() {
    return [...this.trash];
  }

  /**
   * Get recent files (uploaded in last 24 hours)
   */
  getRecentFiles(hoursBack = CONFIG.LIMITS.RECENT_FILES_HOURS) {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    return this.getAllFiles().filter(f =>
      new Date(f.uploadDate) > cutoffTime
    );
  }

  /**
   * Get files by type
   */
  getFilesByType(type) {
    return this.getAllFiles().filter(f => f.type === type);
  }

  /**
   * Search files
   */
  searchFiles(query) {
    const lowerQuery = query.toLowerCase();
    return this.getAllFiles().filter(f =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.type.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get total storage size
   */
  getTotalStorageSize() {
    return this.getAllFiles().reduce((total, f) => total + (f.rawSize || 1024), 0);
  }

  /**
   * Get files statistics
   */
  getStats() {
    const activities = this.storage.getActivities();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return {
      totalFiles: this.files.length + this.secureFiles.length,
      secureFiles: this.secureFiles.length,
      recentFiles: this.getRecentFiles().length,
      downloadsToday: activities.filter(a =>
        a.type === 'download' && new Date(a.timestamp) > oneDayAgo
      ).length,
      trashCount: this.trash.length,
      totalStorageSize: this.getTotalStorageSize()
    };
  }

  /**
   * Helper: Format file size
   */
  _formatFileSize(bytes) {
    if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i < 0 || i >= sizes.length || !isFinite(i)) {
      return '0 Bytes';
    }
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Helper: Get file type from extension
   */
  _getFileType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc', 'docx': 'doc',
      'txt': 'txt',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'xlsx': 'xlsx', 'xls': 'xlsx',
      'pptx': 'pptx', 'ppt': 'pptx'
    };
    return typeMap[extension] || 'txt';
  }

  /**
   * Helper: Generate unique ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default FileService;
