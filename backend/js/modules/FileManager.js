/**
 * FileManager Module - Integration example for using FileService
 *
 * This module shows how to integrate PostgreSQL file storage
 * with your existing St. Clare Filing System
 */

import FileService from './services/FileService.js';

class FileManager {
  constructor() {
    this.currentFiles = [];
    this.currentSecureFiles = [];
    this.stats = null;
    this.isLoading = false;
  }

  /**
   * Initialize file manager
   * Call this when the app starts
   */
  async init() {
    try {
      console.log('Initializing FileManager...');
      await this.loadFileStats();
      await this.loadFiles();
      await this.loadSecureFiles();
      this.setupEventListeners();
      console.log('✓ FileManager initialized');
    } catch (error) {
      console.error('FileManager initialization failed:', error);
    }
  }

  /**
   * Load file statistics
   */
  async loadFileStats() {
    try {
      const response = await FileService.getFileStats();
      this.stats = response.stats;
      this.updateStatsDisplay();
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  /**
   * Load regular files
   */
  async loadFiles() {
    try {
      this.isLoading = true;
      const response = await FileService.getFiles({ sortBy: 'date' });
      this.currentFiles = response.files;
      this.renderFiles();
    } catch (error) {
      console.error('Failed to load files:', error);
      this.showError('Failed to load files');
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Load secure files
   */
  async loadSecureFiles() {
    try {
      const response = await FileService.getSecureFiles();
      this.currentSecureFiles = response.files;
      this.renderSecureFiles();
    } catch (error) {
      console.error('Failed to load secure files:', error);
    }
  }

  /**
   * Upload a file
   */
  async uploadFile(file, options = {}) {
    try {
      const password = options.password || null;
      const response = await FileService.uploadFile(file, password);

      this.showSuccess(`File "${file.name}" uploaded successfully`);

      // Refresh file lists
      if (options.password) {
        await this.loadSecureFiles();
      } else {
        await this.loadFiles();
      }

      // Update stats
      await this.loadFileStats();

      return response;
    } catch (error) {
      console.error('Upload failed:', error);
      this.showError(`Upload failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Download a file
   */
  async downloadFile(fileId) {
    try {
      this.showInfo('Downloading file...');
      await FileService.downloadFile(fileId);
      this.showSuccess('File downloaded');
    } catch (error) {
      console.error('Download failed:', error);
      this.showError('Download failed');
    }
  }

  /**
   * Access a secure file
   */
  async accessSecureFile(fileId) {
    try {
      const password = prompt('This file is encrypted. Enter password:');
      if (!password) return;

      const response = await FileService.accessSecureFile(fileId, password);
      this.showSuccess('File accessed');
    } catch (error) {
      console.error('Access failed:', error);
      this.showError('Invalid password or access denied');
    }
  }

  /**
   * Delete a file
   */
  async deleteFile(fileId, isSecure = false) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const method = isSecure ? 'deleteSecureFile' : 'deleteFile';
      await FileService[method](fileId);

      this.showSuccess('File deleted');

      // Refresh lists
      if (isSecure) {
        await this.loadSecureFiles();
      } else {
        await this.loadFiles();
      }

      // Update stats
      await this.loadFileStats();
    } catch (error) {
      console.error('Delete failed:', error);
      this.showError('Failed to delete file');
    }
  }

  /**
   * Render regular files in the UI
   */
  renderFiles() {
    const container = document.getElementById('filesGrid') ||
                      document.getElementById('filesList');

    if (!container) return;

    if (this.currentFiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No files yet. Upload your first file!</p>
        </div>
      `;
      return;
    }

    const html = this.currentFiles.map(file => this.renderFileCard(file, false)).join('');
    container.innerHTML = html;

    // Attach event listeners
    this.attachFileListeners();
  }

  /**
   * Render secure files in the UI
   */
  renderSecureFiles() {
    const container = document.getElementById('secureFilesGrid');
    if (!container) return;

    if (this.currentSecureFiles.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-lock"></i>
          <p>No secure files yet.</p>
        </div>
      `;
      return;
    }

    const html = this.currentSecureFiles
      .map(file => this.renderFileCard(file, true))
      .join('');
    container.innerHTML = html;

    this.attachSecureFileListeners();
  }

  /**
   * Create HTML for a file card
   */
  renderFileCard(file, isSecure = false) {
    const icon = this.getFileIcon(file.type);
    const size = this.formatBytes(Number(file.size));
    const date = new Date(file.uploadedAt).toLocaleDateString();

    return `
      <div class="file-card" data-file-id="${file.id}">
        <div class="file-icon">
          ${icon}
        </div>
        <div class="file-info">
          <h4 class="file-name">${this.truncate(file.name, 30)}</h4>
          <p class="file-meta">
            <span>${size}</span>
            <span>•</span>
            <span>${date}</span>
          </p>
        </div>
        <div class="file-actions">
          <button class="btn-small download-btn" title="Download">
            <i class="fas fa-download"></i>
          </button>
          ${isSecure ? `
            <button class="btn-small access-btn" title="Access">
              <i class="fas fa-unlock"></i>
            </button>
          ` : ''}
          <button class="btn-small delete-btn" title="Delete">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach event listeners to file cards
   */
  attachFileListeners() {
    document.querySelectorAll('.file-card').forEach(card => {
      const fileId = card.dataset.fileId;

      card.querySelector('.download-btn')?.addEventListener('click', () => {
        this.downloadFile(fileId);
      });

      card.querySelector('.delete-btn')?.addEventListener('click', () => {
        this.deleteFile(fileId, false);
      });
    });
  }

  /**
   * Attach event listeners to secure file cards
   */
  attachSecureFileListeners() {
    document.querySelectorAll('[data-file-id]').forEach(card => {
      const fileId = card.dataset.fileId;

      card.querySelector('.download-btn')?.addEventListener('click', () => {
        this.downloadFile(fileId);
      });

      card.querySelector('.access-btn')?.addEventListener('click', () => {
        this.accessSecureFile(fileId);
      });

      card.querySelector('.delete-btn')?.addEventListener('click', () => {
        this.deleteFile(fileId, true);
      });
    });
  }

  /**
   * Update statistics display in UI
   */
  updateStatsDisplay() {
    if (!this.stats) return;

    // Update dashboard cards
    const dashTotalFiles = document.getElementById('dashTotalFiles');
    const dashSecureFiles = document.getElementById('dashSecureFiles');
    const totalFileCount = document.getElementById('totalFileCount');
    const secureFileCount = document.getElementById('secureFileCount');
    const storageBar = document.getElementById('storageBar');
    const storageUsed = document.getElementById('storageUsed');
    const storageTotal = document.getElementById('storageTotal');

    if (dashTotalFiles) dashTotalFiles.textContent = this.stats.totalFiles;
    if (dashSecureFiles) dashSecureFiles.textContent = this.stats.secureFiles;
    if (totalFileCount) totalFileCount.textContent = this.stats.totalFiles;
    if (secureFileCount) secureFileCount.textContent = this.stats.secureFiles;
    if (storageUsed) storageUsed.textContent = this.stats.totalSizeFormatted;
    if (storageTotal) storageTotal.textContent = '5 GB'; // Default limit

    // Update storage bar width
    if (storageBar) {
      const percentage = (this.stats.totalSize / (5 * 1024 * 1024 * 1024)) * 100;
      storageBar.style.width = Math.min(percentage, 100) + '%';
    }
  }

  /**
   * Setup event listeners for upload form
   */
  setupEventListeners() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const encryptCheckbox = document.getElementById('encryptUpload');
    const passwordInputGroup = document.getElementById('passwordInputGroup');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFilesSelected(e.target.files);
      });
    }

    if (uploadZone) {
      // Drag and drop
      uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
      });

      uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
      });

      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        this.handleFilesSelected(e.dataTransfer.files);
      });
    }

    if (encryptCheckbox) {
      encryptCheckbox.addEventListener('change', (e) => {
        if (passwordInputGroup) {
          passwordInputGroup.style.display = e.target.checked ? 'block' : 'none';
        }
      });
    }
  }

  /**
   * Handle selected files
   */
  async handleFilesSelected(files) {
    const encryptCheckbox = document.getElementById('encryptUpload');
    const passwordInput = document.getElementById('customPassword');
    const shouldEncrypt = encryptCheckbox?.checked || false;
    const password = shouldEncrypt ? passwordInput?.value || null : null;

    for (const file of files) {
      // Validate file
      if (!this.validateFile(file)) continue;

      try {
        await this.uploadFile(file, { password });
      } catch (error) {
        console.error('Upload error:', error);
      }
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100 MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxml',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/vnd.ms-excel'
    ];

    if (file.size > maxSize) {
      this.showError(`File "${file.name}" is too large (max 100 MB)`);
      return false;
    }

    // Note: MIME type validation is not foolproof
    // Validate on server as well
    return true;
  }

  /**
   * Get icon for file type
   */
  getFileIcon(type) {
    const icons = {
      'pdf': '<i class="fas fa-file-pdf"></i>',
      'doc': '<i class="fas fa-file-word"></i>',
      'image': '<i class="fas fa-file-image"></i>',
      'xlsx': '<i class="fas fa-file-excel"></i>',
      'text': '<i class="fas fa-file-alt"></i>',
      'unknown': '<i class="fas fa-file"></i>'
    };
    return icons[type] || icons['unknown'];
  }

  /**
   * Format bytes to human readable format
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Truncate text
   */
  truncate(text, length) {
    return text.length > length ? text.substring(0, length) + '...' : text;
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    console.log('✓', message);
    // You can replace this with your notification system
    this.showNotification(message, 'success');
  }

  /**
   * Show error message
   */
  showError(message) {
    console.error('✗', message);
    this.showNotification(message, 'error');
  }

  /**
   * Show info message
   */
  showInfo(message) {
    console.log('ℹ', message);
    this.showNotification(message, 'info');
  }

  /**
   * Generic notification display
   */
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notification);

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
}

// Export the file manager
export default FileManager;

/**
 * Usage in your main.js:
 *
 * import FileManager from './modules/FileManager.js';
 *
 * const fileManager = new FileManager();
 * await fileManager.init();
 *
 * // Now FileManager handles all file operations
 */
