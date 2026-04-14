/**
 * Storage Manager
 * Abstracts storage operations (localStorage + FileSystemService)
 * Provides unified interface with fallback support
 * @module services/StorageManager
 */

import { createLogger } from '../utils/logger.js';
import { CONFIG } from '../utils/config.js';
import FileSystemService from '../../storage/FileSystemService.js';

const logger = createLogger('StorageManager');

export class StorageManager {
  constructor() {
    this.useFileSystem = false;
    this.fileSystemService = null;
    this.logger = logger;
    this.isReady = false;

    this._initializeFileSystem();
  }

  /**
   * Initialize File System Service if available
   */
  _initializeFileSystem() {
    try {
      this.fileSystemService = new FileSystemService();
      const isSupported = this.fileSystemService.isSupported();
      this.logger.info(`File System API support: ${isSupported}`);
    } catch (error) {
      this.logger.warn('Could not initialize FileSystemService:', error);
      this.fileSystemService = null;
    }
  }

  /**
   * Initialize storage and restore file system connection if available
   */
  async init() {
    if (this.isReady) return true;

    if (this.fileSystemService?.isSupported()) {
      try {
        const restored = await this.fileSystemService.restoreConnection();
        if (restored) {
          this.useFileSystem = true;
          this.logger.info('File System storage restored');
        }
      } catch (error) {
        this.logger.warn('Could not restore file system:', error);
      }
    }

    this.isReady = true;
    return this.useFileSystem;
  }

  /**
   * Get all files from storage
   */
  async getFiles() {
    if (this.useFileSystem && this.fileSystemService) {
      try {
        const { files, secureFiles } = await this.fileSystemService.getAllFiles();
        return { files, secureFiles };
      } catch (error) {
        this.logger.error('Error reading from FileSystem:', error);
        // Fallback to localStorage
      }
    }

    // localStorage fallback
    const files = this._getLocalStorage(CONFIG.STORAGE_KEYS.FILES, []);
    const secureFiles = this._getLocalStorage(CONFIG.STORAGE_KEYS.SECURE_FILES, []);
    return { files, secureFiles };
  }

  /**
   * Save files to storage
   */
  async saveFiles(files, secureFiles) {
    if (this.useFileSystem && this.fileSystemService) {
      try {
        // FileSystem API will sync manifest internally
        return true;
      } catch (error) {
        this.logger.error('Error saving to FileSystem:', error);
        // Continue to localStorage fallback
      }
    }

    // localStorage fallback
    this._setLocalStorage(CONFIG.STORAGE_KEYS.FILES, files);
    this._setLocalStorage(CONFIG.STORAGE_KEYS.SECURE_FILES, secureFiles);
    return true;
  }

  /**
   * Save file with optional encryption
   */
  async saveFile(file, metadata, encrypt = false, password = null) {
    if (this.useFileSystem && this.fileSystemService) {
      try {
        return await this.fileSystemService.saveFile(file, {
          encrypt,
          password
        });
      } catch (error) {
        this.logger.error('Error saving file to FileSystem:', error);
        // Fallback to localStorage
      }
    }

    // localStorage fallback - return metadata only
    return {
      ...metadata,
      id: this._generateId(),
      uploadDate: new Date().toISOString()
    };
  }

  /**
   * Delete file (soft delete - move to trash)
   */
  async deleteFile(fileId) {
    if (this.useFileSystem && this.fileSystemService) {
      try {
        return await this.fileSystemService.deleteFile(fileId);
      } catch (error) {
        this.logger.error('Error deleting from FileSystem:', error);
        // Fallback to localStorage
      }
    }

    // localStorage fallback handled by app layer
    return true;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    if (this.useFileSystem && this.fileSystemService) {
      try {
        return await this.fileSystemService.getStorageStats();
      } catch (error) {
        this.logger.error('Error getting FileSystem stats:', error);
        // Fallback to localStorage stats
      }
    }

    // localStorage fallback
    return {
      isConnected: false,
      totalSize: 0,
      storageLimit: null,
      usagePercentage: 0
    };
  }

  /**
   * Sync files from file system storage to memory
   */
  async syncFilesFromStorage() {
    if (!this.useFileSystem || !this.fileSystemService) return null;

    try {
      const { files, secureFiles } = await this.fileSystemService.getAllFiles();
      return { files, secureFiles };
    } catch (error) {
      this.logger.error('Error syncing from storage:', error);
      return null;
    }
  }

  /**
   * Get activity logs
   */
  getActivities() {
    return this._getLocalStorage(CONFIG.STORAGE_KEYS.ACTIVITIES, []);
  }

  /**
   * Save activity log
   */
  addActivity(activity) {
    const activities = this.getActivities();
    activities.unshift(activity);

    // Keep only recent activities
    if (activities.length > CONFIG.LIMITS.MAX_ACTIVITIES) {
      activities.splice(CONFIG.LIMITS.MAX_ACTIVITIES);
    }

    this._setLocalStorage(CONFIG.STORAGE_KEYS.ACTIVITIES, activities);
  }

  /**
   * Get trash files
   */
  getTrash() {
    return this._getLocalStorage(CONFIG.STORAGE_KEYS.TRASH, []);
  }

  /**
   * Save trash files
   */
  saveTrash(trashFiles) {
    this._setLocalStorage(CONFIG.STORAGE_KEYS.TRASH, trashFiles);
  }

  /**
   * Get settings
   */
  getSettings() {
    return this._getLocalStorage(CONFIG.STORAGE_KEYS.SETTINGS, CONFIG.DEFAULTS);
  }

  /**
   * Save settings
   */
  saveSettings(settings) {
    this._setLocalStorage(CONFIG.STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  }

  /**
   * Save auth token
   */
  saveAuthToken(token) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
  }

  /**
   * Remove auth token
   */
  clearAuthToken() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_EXPIRY);
  }

  /**
   * localStorage helper - get
   */
  _getLocalStorage(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (error) {
      this.logger.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * localStorage helper - set
   */
  _setLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      this.logger.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Generate unique ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default StorageManager;
