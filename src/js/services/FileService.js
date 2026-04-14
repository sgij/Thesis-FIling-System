/**
 * File Service - Handles all file-related API calls
 * Communicates with the backend Express API for file operations
 */

const API_URL = '/api/files';

class FileService {
  /**
   * Upload a file to PostgreSQL
   * @param {File} file - The file object from input
   * @param {string} password - Optional password for encryption
   * @returns {Promise<Object>} Upload response
   */
  static async uploadFile(file, password = null) {
    try {
      // Read file as base64
      const contentBase64 = await this.fileToBase64(file);

      const payload = {
        name: file.name,
        type: this.getFileType(file.name),
        size: file.size,
        mimeType: file.type,
        contentBase64: contentBase64,
        isEncrypted: !!password
      };

      // If password provided, add encryption details
      if (password) {
        // Note: actual encryption should be done before sending
        // This is a placeholder for the encryption logic
        payload.password = password;
        payload.iv = this.generateIV();
        payload.salt = this.generateSalt();
      }

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Get all regular files for the user
   * @param {Object} options - Filter and sort options
   * @returns {Promise<Object>} Files list
   */
  static async getFiles(options = {}) {
    try {
      const params = new URLSearchParams();
      if (options.type) params.append('type', options.type);
      if (options.sortBy) params.append('sortBy', options.sortBy);

      const response = await fetch(`${API_URL}?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get files error:', error);
      throw error;
    }
  }

  /**
   * Get all secure (encrypted) files for the user
   * @returns {Promise<Object>} Secure files list
   */
  static async getSecureFiles() {
    try {
      const response = await fetch(`${API_URL}/secure`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get secure files: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get secure files error:', error);
      throw error;
    }
  }

  /**
   * Download a file
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} File data including content
   */
  static async downloadFile(fileId) {
    try {
      const response = await fetch(`${API_URL}/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const data = await response.json();

      // Convert base64 to blob and trigger download
      if (data.success && data.file) {
        this.downloadBlob(data.file);
      }

      return data;
    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  }

  /**
   * Access a secure file (requires password)
   * @param {string} fileId - The secure file ID
   * @param {string} password - Password to decrypt
   * @returns {Promise<Object>} File data
   */
  static async accessSecureFile(fileId, password) {
    try {
      const response = await fetch(`${API_URL}/${fileId}/access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        throw new Error(`Access denied: ${response.statusText}`);
      }

      const data = await response.json();

      // Optionally download after access verification
      if (data.success && data.file) {
        this.downloadBlob(data.file);
      }

      return data;
    } catch (error) {
      console.error('Secure file access error:', error);
      throw error;
    }
  }

  /**
   * Delete a file
   * @param {string} fileId - The file ID
   * @returns {Promise<Object>} Deletion response
   */
  static async deleteFile(fileId) {
    try {
      const response = await fetch(`${API_URL}/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Deletion failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('File deletion error:', error);
      throw error;
    }
  }

  /**
   * Delete a secure file
   * @param {string} fileId - The secure file ID
   * @returns {Promise<Object>} Deletion response
   */
  static async deleteSecureFile(fileId) {
    try {
      const response = await fetch(`${API_URL}/secure/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Deletion failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Secure file deletion error:', error);
      throw error;
    }
  }

  /**
   * Get file statistics
   * @returns {Promise<Object>} File stats (count, total size, etc.)
   */
  static async getFileStats() {
    try {
      const response = await fetch(`${API_URL}/stats`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  // ========== Helper Methods ==========

  /**
   * Convert File object to Base64 string
   * @private
   */
  static fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get file type from filename
   * @private
   */
  static getFileType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'pdf': 'pdf',
      'doc': 'doc',
      'docx': 'doc',
      'xlsx': 'xlsx',
      'xls': 'xlsx',
      'pptx': 'ppt',
      'ppt': 'ppt',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'txt': 'text'
    };
    return typeMap[ext] || 'unknown';
  }

  /**
   * Get auth token from localStorage
   * @private
   */
  static getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  /**
   * Generate IV for encryption (placeholder)
   * @private
   */
  static generateIV() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Generate salt for encryption (placeholder)
   * @private
   */
  static generateSalt() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Download blob as file
   * @private
   */
  static downloadBlob(fileData) {
    try {
      const binaryString = atob(fileData.content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: fileData.mimeType });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download blob error:', error);
      throw error;
    }
  }
}

export default FileService;
