/**
 * Application Configuration
 * Centralized configuration constants for the filing system
 * @module utils/config
 */

export const CONFIG = {
  // Application Info
  APP_NAME: 'St. Clare College Filing System',
  APP_VERSION: '2.0.0',

  // Storage Keys
  STORAGE_KEYS: {
    FILES: 'modernFilingFiles',
    SECURE_FILES: 'modernSecureFiles',
    SETTINGS: 'modernFilingSettings',
    ACTIVITIES: 'modernFilingActivities',
    TRASH: 'modernFilingTrash',
    AUTH_TOKEN: 'auth_token',
    AUTH_USER: 'auth_user',
    AUTH_EXPIRY: 'auth_token_expiry',
    THEME: 'theme'
  },

  // Limits & Constraints
  LIMITS: {
    MAX_FILES_IN_MEMORY: 1000,
    MAX_ACTIVITIES: 50,
    MAX_NOTIFICATIONS: 20,
    MAX_TOASTS: 5,
    TRASH_RETENTION_DAYS: 30,
    RECENT_FILES_HOURS: 24,
    SESSION_TIMEOUT_MS: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  // Encryption Settings
  CRYPTO: {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256, // bits
    IV_LENGTH: 12, // bytes
    TAG_LENGTH: 128, // bits
    PBKDF2_ITERATIONS: 100_000,
    PBKDF2_HASH: 'SHA-256',
    PBKDF2_SALT_LENGTH: 16 // bytes
  },

  // UI Configuration
  UI: {
    TOAST_DURATION_SUCCESS: 4000,
    TOAST_DURATION_WARNING: 5000,
    TOAST_DURATION_ERROR: 6000,
    TOAST_DURATION_INFO: 4000,
    ANIMATION_DURATION: 300,
    DEBOUNCE_DELAY: 300,
    FILE_ICON_SIZE: 40
  },

  // File Configuration
  FILES: {
    ALLOWED_TYPES: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.txt', '.xlsx', '.pptx'],
    MAX_FILE_SIZE_MB: 500, // Maximum file size for upload
    RECENT_FILES_LIMIT: 12,
    ACTIVITY_RECENT_LIMIT: 5
  },

  // Pagination
  PAGINATION: {
    FILES_PER_PAGE: 12,
    AUDIT_LOGS_PER_PAGE: 20
  },

  // Default Settings
  DEFAULTS: {
    THEME: 'dark',
    AUTO_SAVE: true,
    NOTIFICATIONS_ENABLED: true,
    AUTO_BACKUP: false,
    ENCRYPT_BY_DEFAULT: false,
    AUTO_ORGANIZE: true,
    STORAGE_LIMIT_ENABLED: true
  }
};

export default CONFIG;
