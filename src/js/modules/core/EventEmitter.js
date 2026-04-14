/**
 * Event Emitter / State Management
 * Implements pub/sub pattern for reactive state management
 * @module core/EventEmitter
 */

import { logger } from '../utils/logger.js';

export class EventEmitter {
  constructor(namespace = 'EventEmitter') {
    this.listeners = new Map();
    this.namespace = namespace;
    this.logger = logger.child(namespace);
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (...args) => {
      callback(...args);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (!this.listeners.has(event)) return;

    this.listeners.get(event).delete(callback);

    if (this.listeners.get(event).size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to listeners
   */
  emit(event, ...args) {
    if (!this.listeners.has(event)) {
      return;
    }

    this.logger.debug(`Event emitted: ${event}`, args);

    // Call all listeners (in order)
    for (const callback of this.listeners.get(event)) {
      try {
        callback(...args);
      } catch (error) {
        this.logger.error(`Error in event listener for "${event}":`, error);
      }
    }
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event) {
    if (!this.listeners.has(event)) return 0;
    return this.listeners.get(event).size;
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}

/**
 * State Management using Reactive Object
 * Combines EventEmitter with reactive state
 */
export class StateManager extends EventEmitter {
  constructor(initialState = {}, namespace = 'StateManager') {
    super(namespace);
    this.state = { ...initialState };
    this.history = [{ ...initialState }];
    this.historyIndex = 0;
  }

  /**
   * Get state value
   */
  get(path) {
    if (!path) return this.state;

    const keys = path.split('.');
    let value = this.state;

    for (const key of keys) {
      if (value == null) return undefined;
      value = value[key];
    }

    return value;
  }

  /**
   * Set state value and emit change event
   */
  set(path, value) {
    const keys = path.split('.');
    const key = keys.pop();

    let target = this.state;
    for (const k of keys) {
      if (target[k] == null) {
        target[k] = {};
      }
      target = target[k];
    }

    const oldValue = target[key];
    target[key] = value;

    // Add to history
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({ ...this.state });
    this.historyIndex++;

    // Emit change event
    this.emit('state:change', { path, value, oldValue });
    this.emit(`state:${path}:change`, value, oldValue);

    return this;
  }

  /**
   * Update multiple state values
   */
  update(updates) {
    for (const [path, value] of Object.entries(updates)) {
      this.set(path, value);
    }
    return this;
  }

  /**
   * Reset state to initial value
   */
  reset() {
    this.state = { ...this.history[0] };
    this.historyIndex = 0;
    this.emit('state:reset');
  }

  /**
   * Undo to previous state
   */
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = { ...this.history[this.historyIndex] };
      this.emit('state:undo');
    }
  }

  /**
   * Redo to next state
   */
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = { ...this.history[this.historyIndex] };
      this.emit('state:redo');
    }
  }
}

export default {
  EventEmitter,
  StateManager
};
