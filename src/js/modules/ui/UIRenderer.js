/**
 * UI Renderer Service
 * Centralizes DOM manipulation and rendering logic
 * @module ui/UIRenderer
 */

import { EventEmitter } from '../core/EventEmitter.js';
import { createLogger } from '../utils/logger.js';
import { CONFIG } from '../utils/config.js';

const logger = createLogger('UIRenderer');

export class UIRenderer extends EventEmitter {
  constructor() {
    super('UIRenderer');
    this.logger = logger;
    this.currentPage = 'dashboard';
    this.currentView = 'grid';
    this.currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.DEFAULTS.THEME;
  }

  /**
   * Show loading screen
   */
  showLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    const mainApp = document.getElementById('mainApp');

    if (screen) screen.style.display = 'flex';
    if (mainApp) mainApp.classList.add('hidden');
  }

  /**
   * Hide loading screen
   */
  hideLoadingScreen() {
    const screen = document.getElementById('loadingScreen');
    const mainApp = document.getElementById('mainApp');

    if (screen) {
      screen.style.opacity = '0';
      setTimeout(() => {
        if (screen) screen.style.display = 'none';
        if (mainApp) mainApp.classList.remove('hidden');
      }, CONFIG.UI.ANIMATION_DURATION);
    }
  }

  /**
   * Show login screen
   */
  showLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    const mainApp = document.getElementById('mainApp');

    if (loginScreen) loginScreen.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');

    const usernameInput = document.getElementById('loginUsername');
    if (usernameInput) usernameInput.focus();
  }

  /**
   * Hide login screen
   */
  hideLoginScreen() {
    const loginScreen = document.getElementById('loginScreen');
    if (loginScreen) loginScreen.classList.add('hidden');
  }

  /**
   * Show main application interface
   */
  showMainInterface() {
    const mainApp = document.getElementById('mainApp');
    if (mainApp) mainApp.classList.remove('hidden');
  }

  /**
   * Switch to different page
   */
  switchPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageName;

      // Update navigation active state
      document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageName);
      });

      this.emit('page:switched', pageName);
    }
  }

  /**
   * Update stats cards on dashboard
   */
  updateStatsDisplay(stats) {
    const mappings = {
      totalFiles: 'dashTotalFiles',
      secureFiles: 'dashSecureFiles',
      recentFiles: 'dashRecentFiles',
      downloadsToday: 'dashDownloadsToday'
    };

    for (const [key, elementId] of Object.entries(mappings)) {
      const element = document.getElementById(elementId);
      if (element && stats[key] !== undefined) {
        element.textContent = stats[key];
      }
    }

    // Update sidebar counts
    this.updateSidebarCounts(stats);
  }

  /**
   * Update sidebar file counts
   */
  updateSidebarCounts(stats) {
    const countMappings = {
      totalFiles: 'totalFileCount',
      secureFiles: 'secureFileCount',
      trashCount: 'trashFileCount'
    };

    for (const [key, elementId] of Object.entries(countMappings)) {
      const element = document.getElementById(elementId);
      if (element && stats[key] !== undefined) {
        element.textContent = stats[key];
        element.style.display = stats[key] > 0 ? 'inline-block' : 'none';
      }
    }

    // Update notification count
    const notifCount = document.getElementById('notificationCount');
    if (notifCount && stats.notifications !== undefined) {
      notifCount.textContent = stats.notifications;
      notifCount.style.display = stats.notifications > 0 ? 'block' : 'none';
    }
  }

  /**
   * Update storage bar
   */
  updateStorageDisplay(storageInfo) {
    const storageBar = document.getElementById('storageBar');
    const storageUsed = document.getElementById('storageUsed');
    const storageTotal = document.getElementById('storageTotal');

    if (storageBar) {
      const percentage = Math.min(storageInfo.percentage || 0, 100);
      storageBar.style.width = `${percentage}%`;
      storageBar.classList.remove('warning', 'danger');
      if (percentage > 90) storageBar.classList.add('danger');
      else if (percentage > 75) storageBar.classList.add('warning');
    }

    if (storageUsed) {
      storageUsed.textContent = storageInfo.used || '0 Bytes';
    }

    if (storageTotal) {
      storageTotal.textContent = storageInfo.total || '--';
    }
  }

  /**
   * Render file cards
   */
  renderFilesGrid(files, containerId = 'filesGrid', emptyMessage = 'No files') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!files || files.length === 0) {
      container.innerHTML = this._getEmptyStateHTML(emptyMessage);
      return;
    }

    container.innerHTML = files.map(file => this._createFileCardHTML(file)).join('');
  }

  /**
   * Render recent activity list
   */
  renderActivityList(activities, containerId = 'recentActivity') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!activities || activities.length === 0) {
      container.innerHTML = `
        <div class="activity-item">
          <div class="activity-content">
            <div class="activity-title">No recent activity</div>
            <div class="activity-description">Start uploading files to see activity here</div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = activities.map(activity => this._createActivityItemHTML(activity)).join('');
  }

  /**
   * Update user profile display
   */
  updateUserProfile(user) {
    const displayName = user?.name || 'Registrar Office';
    const displayRole = user?.role || 'Administrator';

    const elements = {
      '.user-name': displayName,
      '.user-role': displayRole,
      '.user-dropdown-name': displayName,
      '.user-dropdown-role': displayRole
    };

    for (const [selector, text] of Object.entries(elements)) {
      const element = document.querySelector(selector);
      if (element) element.textContent = text;
    }

    // Update avatar
    const avatar = document.querySelector('.user-profile img');
    if (avatar) {
      const label = encodeURIComponent(displayName);
      avatar.src = `https://ui-avatars.com/api/?name=${label}&background=3b82f6&color=fff`;
      avatar.alt = displayName;
    }
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);

    // Update theme toggle icon
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }
    }

    this.emit('theme:changed', theme);
  }

  /**
   * Show modal
   */
  showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  /**
   * Hide modal
   */
  hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  /**
   * Close all modals
   */
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  }

  /**
   * Show file details modal
   */
  showFileDetailsModal(file) {
    const modal = document.getElementById('fileModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    if (modalTitle) modalTitle.textContent = file.name;

    if (modalBody) {
      modalBody.innerHTML = `
        <div class="file-details">
          <p><strong>File Name:</strong> ${file.name}</p>
          <p><strong>File Size:</strong> ${file.size}</p>
          <p><strong>File Type:</strong> ${(file.type || '').toUpperCase()}</p>
          <p><strong>Upload Date:</strong> ${new Date(file.uploadDate).toLocaleString()}</p>
          <p><strong>Security:</strong> ${file.encrypted ? '🔒 Encrypted' : '🔓 Standard'}</p>
        </div>
      `;
    }

    if (modal) modal.classList.add('active');
  }

  /**
   * Show security modal for encrypted files
   */
  showSecurityModal(fileId) {
    const modal = document.getElementById('securityModal');
    if (modal) {
      modal.classList.add('active');
      modal.dataset.fileId = fileId;
    }
  }

  /**
   * Set login error message
   */
  setLoginError(message) {
    const loginStatus = document.getElementById('loginStatus');
    if (loginStatus) {
      loginStatus.textContent = message;
      loginStatus.className = 'login-status error';
    }
  }

  /**
   * Clear login form
   */
  clearLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.reset();
      const loginStatus = document.getElementById('loginStatus');
      if (loginStatus) loginStatus.textContent = '';
    }
  }

  /**
   * Helper: Create file card HTML
   */
  _createFileCardHTML(file) {
    const uploadDate = new Date(file.uploadDate).toLocaleDateString();
    const fileIcon = this._getFileIcon(file.type);
    const securityBadge = file.encrypted ? '<span class="security-badge">🔒 Encrypted</span>' : '';

    return `
      <div class="file-card" onclick="window.dispatchEvent(new CustomEvent('openFile', {detail: {fileId: '${file.id}'}}))">
        <div class="file-header">
          <div class="file-icon ${file.type}">
            ${fileIcon}
          </div>
          <div class="file-actions">
            <button onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('downloadFile', {detail: {fileId: '${file.id}'}}));" title="Download">
              <i class="fas fa-download"></i>
            </button>
            <button onclick="event.stopPropagation(); window.dispatchEvent(new CustomEvent('deleteFile', {detail: {fileId: '${file.id}'}}));" title="Delete">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="file-info">
          <h4>${file.name}</h4>
          <p>${file.size} • ${uploadDate}</p>
          ${securityBadge}
        </div>
      </div>
    `;
  }

  /**
   * Helper: Create activity item HTML
   */
  _createActivityItemHTML(activity) {
    const relativeTime = this._formatRelativeTime(activity.timestamp);
    const color = this._getActivityColor(activity.type);
    const icon = this._getActivityIcon(activity.type);

    return `
      <div class="activity-item">
        <div class="activity-icon" style="background: ${color}">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="activity-content">
          <div class="activity-title">${activity.description}</div>
          <div class="activity-time">${relativeTime}</div>
        </div>
      </div>
    `;
  }

  /**
   * Helper: Get empty state HTML
   */
  _getEmptyStateHTML(message, description = '') {
    return `
      <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
        <i class="fas fa-folder-open" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
        <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary);">${message}</h3>
        <p>${description}</p>
      </div>
    `;
  }

  /**
   * Helper: Get file icon HTML
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
   * Helper: Get activity color
   */
  _getActivityColor(type) {
    const colors = {
      'upload': 'var(--accent-primary)',
      'download': 'var(--accent-success)',
      'delete': 'var(--accent-danger)',
      'backup': 'var(--accent-warning)',
      'restore': 'var(--accent-info)'
    };
    return colors[type] || 'var(--accent-primary)';
  }

  /**
   * Helper: Get activity icon
   */
  _getActivityIcon(type) {
    const icons = {
      'upload': 'upload',
      'download': 'download',
      'delete': 'trash',
      'backup': 'database',
      'restore': 'history'
    };
    return icons[type] || 'file';
  }

  /**
   * Helper: Format relative time
   */
  _formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }
}

export default UIRenderer;
