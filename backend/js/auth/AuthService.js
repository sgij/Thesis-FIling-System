/**
 * Authentication Utility Module
 * Handles token storage, API calls, and auth state management
 */

const AUTH_CONFIG = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  tokenKey: 'auth_token',
  userKey: 'auth_user',
  expiryKey: 'auth_token_expiry'
};

class AuthService {
  /**
   * Get the stored JWT token
   */
  static getToken() {
    return localStorage.getItem(AUTH_CONFIG.tokenKey);
  }

  /**
   * Set the JWT token in storage
   */
  static setToken(token) {
    if (token) {
      localStorage.setItem(AUTH_CONFIG.tokenKey, token);
      // Store expiry time (JWT expiry + buffer)
      const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
      localStorage.setItem(AUTH_CONFIG.expiryKey, expiryTime.toString());
    }
  }

  /**
   * Clear the stored token and user data
   */
  static clearToken() {
    localStorage.removeItem(AUTH_CONFIG.tokenKey);
    localStorage.removeItem(AUTH_CONFIG.userKey);
    localStorage.removeItem(AUTH_CONFIG.expiryKey);
  }

  /**
   * Check if token is stored and not expired
   */
  static isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    const expiryTime = localStorage.getItem(AUTH_CONFIG.expiryKey);
    if (!expiryTime) return false;

    return Date.now() < parseInt(expiryTime);
  }

  /**
   * Get stored user data
   */
  static getUser() {
    const userJson = localStorage.getItem(AUTH_CONFIG.userKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Set user data in storage
   */
  static setUser(user) {
    if (user) {
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(user));
    }
  }

  /**
   * Login API call
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  static async login(username, password) {
    try {
      const response = await fetch(`${AUTH_CONFIG.apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }

      if (data.success) {
        // Store token and user data
        this.setToken(data.data.token);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error. Please try again.'
      };
    }
  }

  /**
   * Register API call
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @param {string} fullName
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  static async register(username, email, password, fullName) {
    try {
      const response = await fetch(`${AUTH_CONFIG.apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, fullName })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Registration failed'
        };
      }

      if (data.success) {
        this.setToken(data.data.token);
        this.setUser(data.data.user);
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error. Please try again.'
      };
    }
  }

  /**
   * Logout - clear stored auth data
   */
  static logout() {
    this.clearToken();
  }

  /**
   * Get current user profile
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  static async getCurrentUser() {
    try {
      const token = this.getToken();
      if (!token) {
        return {
          success: false,
          error: 'No token found'
        };
      }

      const response = await fetch(`${AUTH_CONFIG.apiBaseUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // If 401, token is invalid - clear it
        if (response.status === 401) {
          this.clearToken();
        }
        return {
          success: false,
          error: data.error || 'Failed to fetch user'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Make an authenticated API request
   * @param {string} endpoint
   * @param {object} options
   * @returns {Promise<Response>}
   */
  static async authenticatedFetch(endpoint, options = {}) {
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return fetch(`${AUTH_CONFIG.apiBaseUrl}${endpoint}`, {
      ...options,
      headers
    });
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated() {
    return this.isTokenValid() && this.getUser() !== null;
  }

  /**
   * Get user role (for permission checks)
   */
  static getRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  /**
   * Change password
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  static async changePassword(currentPassword, newPassword) {
    try {
      const response = await this.authenticatedFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Failed to change password'
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }
}

export default AuthService;
