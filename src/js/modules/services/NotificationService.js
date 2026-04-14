/**
 * Notification Service
 * Manages toast notifications and notification panel
 * @module services/NotificationService
 */

import { EventEmitter } from '../core/EventEmitter.js';
import { createLogger } from '../utils/logger.js';
import { CONFIG } from '../utils/config.js';

const logger = createLogger('NotificationService');

export class NotificationService extends EventEmitter {
  constructor() {
    super('NotificationService');
    this.notifications = [];
    this.toastContainer = null;
    this.logger = logger;
  }

  /**
   * Add notification
   */
  add(message, type = 'info', options = {}) {
    if (!message || typeof message !== 'string') {
      this.logger.warn('Invalid notification message');
      return null;
    }

    const notification = {
      id: this._generateId(),
      message: message.trim(),
      type, // 'success', 'error', 'warning', 'info'
      timestamp: new Date().toISOString(),
      ...options
    };

    this.notifications.unshift(notification);

    // Keep only recent notifications
    if (this.notifications.length > CONFIG.LIMITS.MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, CONFIG.LIMITS.MAX_NOTIFICATIONS);
    }

    // Show toast
    this.showToast(message, type);

    // Emit event
    this.emit('notification:added', notification);

    return notification;
  }

  /**
   * Add success notification
   */
  success(message, options) {
    return this.add(message, 'success', options);
  }

  /**
   * Add error notification
   */
  error(message, options) {
    return this.add(message, 'error', options);
  }

  /**
   * Add warning notification
   */
  warning(message, options) {
    return this.add(message, 'warning', options);
  }

  /**
   * Add info notification
   */
  info(message, options) {
    return this.add(message, 'info', options);
  }

  /**
   * Show toast notification
   */
  showToast(message, type = 'info') {
    if (!document) return; // Handle SSR/non-DOM environments

    // Get or create toast container
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
      this.toastContainer = container;
    }

    // Icon mapping
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-times-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    };

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas ${icons[type] || icons.info}"></i>
      </div>
      <div class="toast-body">
        <span class="toast-message">${this._escapeHtml(message)}</span>
      </div>
      <button class="toast-close" onclick="this.parentElement.classList.add('toast-hiding'); setTimeout(() => this.parentElement.remove(), 300);" aria-label="Close">
        <i class="fas fa-times"></i>
      </button>
      <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toast.classList.add('toast-visible');
    });

    // Auto-remove after delay
    const duration = this._getToastDuration(type);
    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.classList.add('toast-hiding');
        setTimeout(() => {
          if (toast && toast.parentElement) {
            toast.remove();
          }
        }, CONFIG.UI.ANIMATION_DURATION);
      }
    }, duration);

    // Limit max toasts
    const toasts = container.querySelectorAll('.toast');
    if (toasts.length > CONFIG.LIMITS.MAX_TOASTS) {
      const oldToast = toasts[0];
      oldToast.classList.add('toast-hiding');
      setTimeout(() => oldToast.remove(), CONFIG.UI.ANIMATION_DURATION);
    }
  }

  /**
   * Get all notifications
   */
  getAll() {
    return [...this.notifications];
  }

  /**
   * Clear all notifications
   */
  clear() {
    this.notifications = [];
    this.emit('notifications:cleared');
  }

  /**
   * Remove notification by ID
   */
  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.emit('notification:removed', id);
  }

  /**
   * Get notifications by type
   */
  getByType(type) {
    return this.notifications.filter(n => n.type === type);
  }

  /**
   * Helper: Get toast duration by type
   */
  _getToastDuration(type) {
    const durations = {
      success: CONFIG.UI.TOAST_DURATION_SUCCESS,
      error: CONFIG.UI.TOAST_DURATION_ERROR,
      warning: CONFIG.UI.TOAST_DURATION_WARNING,
      info: CONFIG.UI.TOAST_DURATION_INFO
    };
    return durations[type] || CONFIG.UI.TOAST_DURATION_INFO;
  }

  /**
   * Helper: Escape HTML
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Helper: Generate unique ID
   */
  _generateId() {
    return 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }
}

export default NotificationService;
