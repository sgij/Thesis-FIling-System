/**
 * Logger Module
 * Provides structured logging with multiple levels
 * @module utils/logger
 */

export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  /**
   * Initialize logger
   * @param {string} namespace - Module namespace for logs
   * @param {number} level - Log level (0=DEBUG, 1=INFO, 2=WARN, 3=ERROR)
   */
  constructor(namespace = 'App', level = LOG_LEVELS.INFO) {
    this.namespace = namespace;
    this.level = level;
    this.isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
  }

  /**
   * Format log message with timestamp and namespace
   */
  _format(level, message, data) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.namespace}] [${level}]`;
    return { prefix, message, data };
  }

  /**
   * Debug level logging
   */
  debug(message, data = null) {
    if (this.level <= LOG_LEVELS.DEBUG) {
      const formatted = this._format('DEBUG', message, data);
      console.debug(`${formatted.prefix} ${formatted.message}`, data || '');
    }
  }

  /**
   * Info level logging
   */
  info(message, data = null) {
    if (this.level <= LOG_LEVELS.INFO) {
      const formatted = this._format('INFO', message, data);
      console.log(`${formatted.prefix} ${formatted.message}`, data || '');
    }
  }

  /**
   * Warning level logging
   */
  warn(message, data = null) {
    if (this.level <= LOG_LEVELS.WARN) {
      const formatted = this._format('WARN', message, data);
      console.warn(`${formatted.prefix} ${formatted.message}`, data || '');
    }
  }

  /**
   * Error level logging
   */
  error(message, data = null) {
    if (this.level <= LOG_LEVELS.ERROR) {
      const formatted = this._format('ERROR', message, data);
      console.error(`${formatted.prefix} ${formatted.message}`, data || '');
    }
  }

  /**
   * Set log level
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Create child logger with extended namespace
   */
  child(childNamespace) {
    return new Logger(`${this.namespace}:${childNamespace}`, this.level);
  }
}

export function createLogger(namespace, level = LOG_LEVELS.INFO) {
  return new Logger(namespace, level);
}

// Global logger instance
export const logger = new Logger('FilingSystem', LOG_LEVELS.INFO);

export default Logger;
