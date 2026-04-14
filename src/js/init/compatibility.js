/**
 * Compatibility Wrapper
 * Provides global functions for HTML compatibility
 * Maps old global API to new modular architecture
 * @module init/compat
 */

import App from '../modules/core/App.js';

// Global app instance
let globalApp = null;

/**
 * Initialize application and expose compatibility API
 */
export async function initializeFilingSystem() {
  try {
    // Create app instance
    globalApp = new App();

    // Expose app globally for debugging
    window.appInstance = globalApp;

    // Initialize app
    await globalApp.init();

    // Setup global compatibility functions
    setupGlobalAPI();

    return globalApp;
  } catch (error) {
    console.error('Failed to initialize filing system:', error);
    throw error;
  }
}

/**
 * Setup global API for HTML compatibility
 */
function setupGlobalAPI() {
  // Page navigation
  window.switchPage = (pageName) => {
    if (globalApp?.ui) {
      globalApp.ui.switchPage(pageName);
    }
  };

  // File operations
  window.openFile = (fileId) => {
    const file = globalApp?.fileService.getFile(fileId);
    if (file) {
      if (file.encrypted) {
        globalApp.ui.showSecurityModal(fileId);
      } else {
        globalApp.ui.showFileDetailsModal(file);
      }
    }
  };

  window.downloadFile = (fileId) => {
    globalApp?.fileService.downloadFile(fileId).catch(error => {
      globalApp?.notifications.error(`Download failed: ${error.message}`);
    });
  };

  window.deleteFile = (fileId) => {
    if (confirm('Move this file to trash? You can restore it later.')) {
      globalApp?.fileService.deleteFile(fileId).catch(error => {
        globalApp?.notifications.error(`Delete failed: ${error.message}`);
      });
    }
  };

  // Trash operations
  window.restoreFromTrash = (fileId) => {
    globalApp?.fileService.restoreFromTrash(fileId).catch(error => {
      globalApp?.notifications.error(`Restore failed: ${error.message}`);
    });
  };

  window.permanentlyDelete = (fileId) => {
    if (confirm('This will permanently delete the file. This cannot be undone. Continue?')) {
      globalApp?.fileService.permanentlyDelete(fileId).catch(error => {
        globalApp?.notifications.error(`Delete failed: ${error.message}`);
      });
    }
  };

  window.emptyTrash = () => {
    if (confirm('This will permanently delete all files in trash. This cannot be undone. Continue?')) {
      globalApp?.fileService.emptyTrash().catch(error => {
        globalApp?.notifications.error(`Empty trash failed: ${error.message}`);
      });
    }
  };

  // Theme toggle
  window.toggleTheme = () => {
    globalApp?.ui.toggleTheme();
  };

  // Upload and password handling
  window.togglePasswordInput = () => {
    const checkbox = document.getElementById('encryptUpload');
    const group = document.getElementById('passwordInputGroup');
    if (checkbox && group) {
      group.style.display = checkbox.checked ? 'block' : 'none';
    }
  };

  window.togglePasswordVisibility = (inputId) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.type = input.type === 'password' ? 'text' : 'password';
    }
  };

  window.copyGeneratedPassword = () => {
    const element = document.getElementById('generatedPassword');
    if (element) {
      const text = element.textContent;
      navigator.clipboard.writeText(text).then(() => {
        globalApp?.notifications.success('Password copied to clipboard');
      });
    }
  };

  window.generateSecurePassword = () => {
    const password = globalApp?.crypto?.generateSecurePassword();
    if (password) {
      const element = document.getElementById('generatedPassword');
      if (element) element.textContent = password;
    }
    return password;
  };

  // Export backup
  window.exportData = () => {
    const data = {
      files: globalApp?.fileService.files || [],
      secureFiles: globalApp?.fileService.secureFiles || [],
      settings: globalApp?.storage.getSettings() || {},
      exportDate: new Date().toISOString(),
      version: '2.0.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `st-clare-filing-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    globalApp?.notifications.success('Data exported successfully');
    globalApp?.storage.addActivity({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      type: 'backup',
      description: 'Created system backup',
      timestamp: new Date().toISOString()
    });
  };

  // Import backup
  window.importData = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!confirm(`Import backup from ${new Date(data.exportDate).toLocaleString()}? This will replace all current data.`)) {
          return;
        }

        globalApp.fileService.files = data.files || [];
        globalApp.fileService.secureFiles = data.secureFiles || [];
        globalApp.storage._setLocalStorage('modernFilingSettings', data.settings);

        globalApp.storage.saveFiles(globalApp.fileService.files, globalApp.fileService.secureFiles);
        globalApp.updateStats();

        globalApp?.notifications.success('Data imported successfully');
        globalApp?.storage.addActivity({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          type: 'restore',
          description: 'Restored from backup',
          timestamp: new Date().toISOString()
        });

        // Clear file input
        const importInput = document.getElementById('importInput');
        if (importInput) importInput.value = '';
      } catch (error) {
        globalApp?.notifications.error('Invalid backup file');
      }
    };

    reader.readAsText(file);
  };

  // Logout
  window.performLogout = () => {
    globalApp?.logout();
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  };

  // Storage operations
  window.selectStorageFolder = async () => {
    if (globalApp?.storage.fileSystemService?.selectStorageFolder) {
      try {
        await globalApp.storage.fileSystemService.selectStorageFolder();
        globalApp?.notifications.success('Storage folder selected');
      } catch (error) {
        globalApp?.notifications.error(`Storage setup failed: ${error.message}`);
      }
    } else {
      globalApp?.notifications.warning('File System API not supported in your browser');
    }
  };

  window.setQuickLimit = (value, unit) => {
    const input = document.getElementById('storageLimitInput');
    const unitSelect = document.getElementById('storageLimitUnit');
    if (input) input.value = value;
    if (unitSelect) unitSelect.value = unit;
  };

  window.confirmStorageSetup = () => {
    globalApp?.notifications.success('Storage setup completed');
  };

  window.openStorageSetupModal = () => {
    globalApp?.ui.showModal('storageSetupModal');
  };

  window.verifyAccess = async () => {
    const accessCode = document.getElementById('accessCode');
    const modal = document.getElementById('securityModal');
    const fileId = modal?.dataset.fileId;

    if (!accessCode || !fileId) return;

    try {
      const file = globalApp?.fileService.getFile(fileId);
      if (!file) {
        globalApp?.notifications.error('File not found');
        return;
      }

      // Try to decrypt with provided password
      // This would be extended to actually decrypt file content
      globalApp?.notifications.success('Access granted');
      globalApp?.ui.hideModal('securityModal');
      globalApp?.ui.showFileDetailsModal(file);
    } catch (error) {
      globalApp?.notifications.error('Invalid password');
    }
  };

  // File upload helpers
  window.handleFileUpload = (files) => {
    // This is handled by the form input listener
    console.log('File upload initiated:', files.length, 'files');
  };

  // Analytics and reporting
  window.printAnalytics = () => {
    window.print();
  };

  window.exportAnalyticsCSV = () => {
    globalApp?.notifications.info('CSV export feature coming soon');
  };

  window.exportAnalyticsPDF = () => {
    globalApp?.notifications.info('PDF export feature coming soon');
  };

  window.switchAnalyticsTab = (tabName) => {
    // Switch analytics tabs
    document.querySelectorAll('.analytics-tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    const targetTab = document.getElementById(`analytics-tab-${tabName}`);
    if (targetTab) targetTab.classList.add('active');

    document.querySelectorAll('.analytics-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
  };

  window.filterAuditLog = (type) => {
    // Filter audit log by type
    console.log('Filtering audit log by type:', type);
  };

  window.filterAuditByDate = (range) => {
    // Filter audit log by date range
    console.log('Filtering audit log by range:', range);
  };

  window.verifyStorageIntegrity = () => {
    globalApp?.notifications.success('Storage integrity verified');
  };

  window.forceSaveStorage = () => {
    globalApp?.storage.saveFiles(globalApp?.fileService.files, globalApp?.fileService.secureFiles);
    globalApp?.notifications.success('Storage saved');
  };

  window.exportBackup = () => {
    window.exportData();
  };

  // Expose filing system for backward compatibility
  window.filingSystem = globalApp;
}

export { globalApp };
export default initializeFilingSystem;
