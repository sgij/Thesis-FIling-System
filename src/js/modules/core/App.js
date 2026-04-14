/**
 * Application Orchestrator
 * Main application class that coordinates all services
 * @module core/App
 */

import { EventEmitter } from './EventEmitter.js';
import { createLogger } from '../utils/logger.js';
import { CONFIG } from '../utils/config.js';
import StorageManager from '../services/StorageManager.js';
import CryptoService from '../services/CryptoService.js';
import FileService from '../services/FileService.js';
import NotificationService from '../services/NotificationService.js';
import UIRenderer from '../ui/UIRenderer.js';

const logger = createLogger('App');

export class App extends EventEmitter {
  constructor() {
    super('App');
    this.logger = logger;

    // Initialize services
    this.storage = new StorageManager();
    this.crypto = new CryptoService();
    this.fileService = new FileService(this.storage, this.crypto);
    this.notifications = new NotificationService();
    this.ui = new UIRenderer();

    this.isInitialized = false;
    this.isAuthenticated = false;
    this.currentUser = null;

    this._setupEventListeners();
  }

  /**
   * Initialize application
   */
  async init() {
    this.logger.info('Initializing application');
    this.ui.showLoadingScreen();

    try {
      // Initialize storage
      await this.storage.init();
      this.logger.info('Storage initialized');

      // Load files from storage
      await this.fileService.initialize();
      this.logger.info('File service initialized');

      // Check JWT authentication
      const token = this.storage.getAuthToken();
      if (token) {
        this.isAuthenticated = true;
        this.logger.info('User authenticated via JWT');
      }

      this.ui.hideLoadingScreen();

      if (this.isAuthenticated) {
        this.bootApp();
      } else {
        this.showLoginScreen();
      }

      this.isInitialized = true;
      this.emit('app:initialized');
    } catch (error) {
      this.logger.error('Initialization error:', error);
      this.notifications.error('Failed to initialize application');
      this.ui.hideLoadingScreen();
    }
  }

  /**
   * Boot application after authentication
   */
  bootApp() {
    this.logger.info('Booting application');

    // Load theme
    this.ui.setTheme(this.storage._getLocalStorage(CONFIG.STORAGE_KEYS.THEME, CONFIG.DEFAULTS.THEME));

    // Update UI with current stats
    this.updateStats();

    // Update user profile display
    const userInfo = this.storage._getLocalStorage(CONFIG.STORAGE_KEYS.AUTH_USER);
    if (userInfo) {
      this.currentUser = userInfo;
      this.ui.updateUserProfile(userInfo);
    }

    // Setup event listeners for file operations
    this._setupFileEventListeners();

    // Generate sample activity if needed
    const activities = this.storage.getActivities();
    if (!activities || activities.length === 0) {
      this._generateSampleActivity();
    }

    // Show main interface
    this.ui.showMainInterface();
    this.ui.hideLoginScreen();
    this.ui.switchPage('dashboard');

    this.logger.info('Application booted successfully');
    this.emit('app:booted');
  }

  /**
   * Show login screen
   */
  showLoginScreen() {
    this.ui.showLoginScreen();
    this.ui.hideMainInterface?.();
  }

  /**
   * Update dashboard statistics
   */
  updateStats() {
    const stats = this.fileService.getStats();
    const notifications = this.notifications.getAll().length;

    this.ui.updateStatsDisplay({
      totalFiles: stats.totalFiles,
      secureFiles: stats.secureFiles,
      recentFiles: stats.recentFiles,
      downloadsToday: stats.downloadsToday,
      notifications
    });

    this.ui.updateSidebarCounts({
      totalFiles: stats.totalFiles,
      secureFiles: stats.secureFiles,
      trashCount: stats.trashCount,
      notifications
    });
  }

  /**
   * Logout
   */
  logout() {
    this.logger.info('Logging out');
    this.storage.clearAuthToken();
    this.isAuthenticated = false;
    this.currentUser = null;
    this.ui.clearLoginForm();
    this.ui.showLoginScreen();
    this.emit('app:logout');
  }

  /**
   * Setup core event listeners
   */
  _setupEventListeners() {
    // Page navigation
    document.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.dataset.page;
        if (page) this.ui.switchPage(page);
      });
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.ui.toggleTheme());
    }

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => this.ui.closeAllModals());
    });

    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.ui.closeAllModals();
      });
    });

    // Global logout
    window.confirmLogout = (event) => {
      event?.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        this.logout();
      }
    };

    // Render pages on switch
    this.ui.on('page:switched', (page) => {
      this._renderPage(page);
    });
  }

  /**
   * Setup file operation event listeners
   */
  _setupFileEventListeners() {
    // Listen for file operations and update stats/UI
    this.fileService.on('file:uploaded', (file) => {
      this.notifications.success(`File "${file.name}" uploaded successfully`);
      this.storage.addActivity({
        id: this._generateId(),
        type: 'upload',
        description: `Uploaded ${file.name}`,
        timestamp: new Date().toISOString()
      });
      this.updateStats();
    });

    this.fileService.on('file:downloaded', (file) => {
      this.storage.addActivity({
        id: this._generateId(),
        type: 'download',
        description: `Downloaded ${file.name}`,
        timestamp: new Date().toISOString()
      });
      this.updateStats();
    });

    this.fileService.on('file:deleted', (file) => {
      this.notifications.success(`File "${file.name}" moved to trash`);
      this.storage.addActivity({
        id: this._generateId(),
        type: 'delete',
        description: `Deleted ${file.name}`,
        timestamp: new Date().toISOString()
      });
      this.updateStats();
    });

    this.fileService.on('file:restored', (file) => {
      this.notifications.success(`File "${file.name}" restored from trash`);
      this.updateStats();
    });

    this.fileService.on('trash:emptied', (count) => {
      this.notifications.success(`Trash emptied: ${count} files deleted`);
      this.updateStats();
    });
  }

  /**
   * Render specific page content
   */
  _renderPage(page) {
    switch (page) {
      case 'dashboard':
        this._renderDashboard();
        break;
      case 'files':
       this._renderFilesPage();
        break;
      case 'recent':
        this._renderRecentPage();
        break;
      case 'secure':
        this._renderSecureFilesPage();
        break;
      case 'trash':
        this._renderTrashPage();
        break;
      // Other pages...
    }
  }

  /**
   * Render dashboard
   */
  _renderDashboard() {
    const activities = this.storage.getActivities().slice(0, 5);
    this.ui.renderActivityList(activities);
    this.updateStats();
  }

  /**
   * Render files page
   */
  _renderFilesPage() {
    this.ui.renderFilesGrid(this.fileService.getAllFiles(), 'filesGrid', 'No files yet');
  }

  /**
   * Render recent files page
   */
  _renderRecentPage() {
    const recentFiles = this.fileService.getRecentFiles().slice(0, 12);
    this.ui.renderFilesGrid(recentFiles, 'recentFilesGrid', 'No recent files');
  }

  /**
   * Render secure files page
   */
  _renderSecureFilesPage() {
    this.ui.renderFilesGrid(this.fileService.secureFiles, 'secureFilesGrid', 'No secure files');
  }

  /**
   * Render trash page
   */
  _renderTrashPage() {
    const trash = this.fileService.getTrash();
    const container = document.getElementById('trashContainer');

    if (!container) return;

    if (trash.length === 0) {
      container.innerHTML = `
        <div class="trash-empty">
          <i class="fas fa-trash-alt"></i>
          <p>Trash is empty</p>
        </div>
      `;
      return;
    }

    container.innerHTML = trash.map(file => `
      <div class="trash-item">
        <div class="trash-item-header">
          <div class="trash-item-icon">
            ${this._getFileIcon(file.type)}
          </div>
          <div class="trash-item-info">
            <h4>${file.name}</h4>
            <span>${file.size || 'Unknown size'}</span>
          </div>
        </div>
        <div class="trash-item-meta">
          <i class="fas fa-clock"></i> Deleted: ${new Date(file.deletedAt).toLocaleString()}
        </div>
        <div class="trash-item-actions">
          <button class="btn btn-sm btn-success" onclick="window.dispatchEvent(new CustomEvent('restoreFromTrash', {detail: {fileId: '${file.id}'}}))">
            <i class="fas fa-undo"></i> Restore
          </button>
          <button class="btn btn-sm btn-danger" onclick="window.dispatchEvent(new CustomEvent('permanentlyDelete', {detail: {fileId: '${file.id}'}}))">
            <i class="fas fa-times"></i> Delete
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate sample activity
   */
  _generateSampleActivity() {
    const activities = [
      { type: 'upload', description: 'Uploaded student_records.pdf' },
      { type: 'backup', description: 'System backup completed' },
      { type: 'download', description: 'Downloaded enrollment_form.docx' }
    ];

    activities.forEach((activity, index) => {
      setTimeout(() => {
        this.storage.addActivity({
          id: this._generateId(),
          ...activity,
          timestamp: new Date().toISOString()
        });
      }, index * 1000);
    });
  }

  /**
   * Helper: Get file icon
   */
  _getFileIcon(type) {
    const icons = {
      'pdf': '<i class="fas fa-file-pdf"></i>',
      'doc': '<i class="fas fa-file-word"></i>',
      'image': '<i class="fas fa-file-image"></i>',
      'txt': '<i class="fas fa-file-alt"></i>',
      'xlsx': '<i class="fas fa-file-excel"></i>',
      'pptx': '<i class="fas fa-file-powerpoint"></i>'
    };
    return icons[type] || '<i class="fas fa-file"></i>';
  }

  /**
   * Helper: Generate unique ID
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default App;
