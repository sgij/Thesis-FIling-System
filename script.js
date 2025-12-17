// Modern Filing System Application with Custom Password Support
class ModernFilingSystem {
    constructor() {
        this.files = JSON.parse(localStorage.getItem('modernFilingFiles')) || [];
        this.secureFiles = JSON.parse(localStorage.getItem('modernSecureFiles')) || [];
        this.settings = JSON.parse(localStorage.getItem('modernFilingSettings')) || this.getDefaultSettings();
        this.currentPage = 'dashboard';
        this.currentView = 'grid';
        this.notifications = [];

        this.init();
    }

    getDefaultSettings() {
        return {
            autoSave: true,
            notifications: true,
            theme: 'dark',
            autoBackup: false,
            encryptByDefault: false
        };
    }

    init() {
        this.showLoadingScreen();

        setTimeout(() => {
            this.hideLoadingScreen();
            this.setupEventListeners();
            this.setupNavigation();
            this.setupDragAndDrop();
            this.updateStats();
            this.renderCurrentPage();
            this.updateStorageInfo();
            this.loadTheme();
            this.generateSampleActivity();
            this.setupPasswordInputs();
        }, 2000);
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');

        loadingScreen.style.display = 'flex';
        mainApp.classList.add('hidden');
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainApp = document.getElementById('mainApp');

        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            mainApp.classList.remove('hidden');
        }, 500);
    }

    setupPasswordInputs() {
        // Setup password strength checker
        const customPassword = document.getElementById('customPassword');
        if (customPassword) {
            customPassword.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Setup radio button handlers
        document.querySelectorAll('input[name="passwordType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.handlePasswordTypeChange(e.target.value);
            });
        });
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-fill');
        const strengthText = document.querySelector('.strength-text');

        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let strengthLabel = '';

        if (password.length === 0) {
            strengthLabel = 'Enter a password';
            strength = 0;
        } else if (password.length < 6) {
            strengthLabel = 'Too short';
            strength = 1;
        } else {
            // Check password complexity
            const hasLower = /[a-z]/.test(password);
            const hasUpper = /[A-Z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            const isLongEnough = password.length >= 8;

            const complexityScore = [hasLower, hasUpper, hasNumbers, hasSpecial, isLongEnough].filter(Boolean).length;

            if (complexityScore < 2) {
                strength = 1;
                strengthLabel = 'Weak';
            } else if (complexityScore < 3) {
                strength = 2;
                strengthLabel = 'Fair';
            } else if (complexityScore < 4) {
                strength = 3;
                strengthLabel = 'Good';
            } else {
                strength = 4;
                strengthLabel = 'Strong';
            }
        }

        // Update UI
        strengthBar.className = 'strength-fill';
        if (strength === 1) strengthBar.classList.add('weak');
        else if (strength === 2) strengthBar.classList.add('fair');
        else if (strength === 3) strengthBar.classList.add('good');
        else if (strength === 4) strengthBar.classList.add('strong');

        strengthText.textContent = strengthLabel;
    }

    handlePasswordTypeChange(type) {
        const customPasswordInput = document.querySelector('.custom-password-input');
        const autoPasswordDisplay = document.getElementById('autoPasswordDisplay');
        const generatedPasswordSpan = document.getElementById('generatedPassword');

        if (type === 'custom') {
            if (customPasswordInput) customPasswordInput.style.display = 'block';
            if (autoPasswordDisplay) autoPasswordDisplay.style.display = 'none';
        } else if (type === 'auto') {
            if (customPasswordInput) customPasswordInput.style.display = 'none';
            if (autoPasswordDisplay) autoPasswordDisplay.style.display = 'block';

            // Generate a secure password
            const generatedPassword = this.generateSecurePassword();
            if (generatedPasswordSpan) generatedPasswordSpan.textContent = generatedPassword;
        }
    }

    generateSecurePassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let password = "";

        // Ensure at least one character from each category
        password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
        password += "0123456789"[Math.floor(Math.random() * 10)]; // number
        password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special

        // Fill the rest randomly
        for (let i = password.length; i < length; i++) {
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    getEncryptionPassword() {
        const passwordType = document.querySelector('input[name="passwordType"]:checked')?.value;

        if (passwordType === 'custom') {
            const customPassword = document.getElementById('customPassword')?.value;
            if (!customPassword || customPassword.length < 6) {
                this.addNotification('Password must be at least 6 characters long', 'error');
                return null;
            }
            return customPassword;
        } else if (passwordType === 'auto') {
            const generatedPassword = document.getElementById('generatedPassword')?.textContent;
            return generatedPassword || this.generateSecurePassword();
        }

        return null;
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files);
            });
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });
        }

        // Import functionality
        const importInput = document.getElementById('importInput');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    this.importData(e.target.files[0]);
                }
            });
        }

        // View controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Filter controls
        const fileTypeFilter = document.getElementById('fileTypeFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (fileTypeFilter) {
            fileTypeFilter.addEventListener('change', () => this.applyFilters());
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', () => this.applyFilters());
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModals();
                }
            });
        });
    }

    setupNavigation() {
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.switchPage(page);

                // Update active state
                document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');
        if (!uploadZone) return;

        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });

        uploadZone.addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
    }

    switchPage(pageName) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Show selected page
        const targetPage = document.getElementById(pageName);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;
            this.renderCurrentPage();
        }
    }

    renderCurrentPage() {
        switch(this.currentPage) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'files':
                this.renderFiles();
                break;
            case 'upload':
                this.renderUploadPage();
                break;
            case 'recent':
                this.renderRecentFiles();
                break;
            case 'secure':
                this.renderSecureFiles();
                break;
            case 'trash':
                this.renderTrashPage();
                break;
            case 'backup':
                this.renderBackupPage();
                break;
            case 'analytics':
                this.renderAnalytics();
                break;
            case 'settings':
                this.renderSettings();
                break;
        }
    }

    renderTrashPage() {
        // Call global trash render function
        if (typeof renderTrashPage === 'function') {
            renderTrashPage();
        }
    }

    renderDashboard() {
        this.updateStats();
        this.renderRecentActivity();
    }

    updateStats() {
        const totalFiles = this.files.length + this.secureFiles.length;
        const secureCount = this.secureFiles.length;
        const recentCount = this.getRecentFilesCount();

        // Update dashboard stats
        const dashTotalFiles = document.getElementById('dashTotalFiles');
        const dashSecureFiles = document.getElementById('dashSecureFiles');
        const dashRecentFiles = document.getElementById('dashRecentFiles');

        if (dashTotalFiles) dashTotalFiles.textContent = totalFiles;
        if (dashSecureFiles) dashSecureFiles.textContent = secureCount;
        if (dashRecentFiles) dashRecentFiles.textContent = recentCount;

        // Update sidebar counts
        const totalFileCount = document.getElementById('totalFileCount');
        const secureFileCount = document.getElementById('secureFileCount');

        if (totalFileCount) totalFileCount.textContent = totalFiles;
        if (secureFileCount) secureFileCount.textContent = secureCount;

        // Update notification count
        const notificationCount = document.getElementById('notificationCount');
        if (notificationCount) {
            notificationCount.textContent = this.notifications.length;
            notificationCount.style.display = this.notifications.length > 0 ? 'block' : 'none';
        }
    }

    getRecentFilesCount() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const allFiles = [...this.files, ...this.secureFiles];
        return allFiles.filter(file => new Date(file.uploadDate) > oneDayAgo).length;
    }

    updateStorageInfo() {
        const totalSize = this.getTotalStorageSize();
        const maxSize = 100 * 1024 * 1024; // 100MB limit for demo
        const percentage = (totalSize / maxSize) * 100;

        const storageBar = document.getElementById('storageBar');
        const storageUsed = document.getElementById('storageUsed');
        const storageTotal = document.getElementById('storageTotal');

        if (storageBar) storageBar.style.width = `${Math.min(percentage, 100)}%`;
        if (storageUsed) storageUsed.textContent = this.formatFileSize(totalSize);
        if (storageTotal) storageTotal.textContent = this.formatFileSize(maxSize);
    }

    getTotalStorageSize() {
        const allFiles = [...this.files, ...this.secureFiles];
        return allFiles.reduce((total, file) => total + (file.rawSize || 1024), 0);
    }

    handleFileUpload(files) {
        if (!files || files.length === 0) return;

        const encryptUpload = document.getElementById('encryptUpload');
        const shouldEncrypt = encryptUpload ? encryptUpload.checked : false;

        let encryptionPassword = null;
        if (shouldEncrypt) {
            encryptionPassword = this.getEncryptionPassword();
            if (!encryptionPassword) {
                return; // Error message already shown in getEncryptionPassword
            }
        }

        this.showUploadProgress(files.length);

        Array.from(files).forEach((file, index) => {
            setTimeout(() => {
                const fileData = {
                    id: this.generateId(),
                    name: file.name,
                    size: this.formatFileSize(file.size),
                    rawSize: file.size,
                    type: this.getFileType(file.name),
                    uploadDate: new Date().toISOString(),
                    encrypted: shouldEncrypt,
                    content: null
                };

                if (shouldEncrypt) {
                    fileData.password = encryptionPassword; // Store the actual password
                    this.secureFiles.push(fileData);
                    localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));
                } else {
                    this.files.push(fileData);
                    localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
                }

                this.updateUploadProgress(index + 1, files.length);
                this.addNotification(`File "${file.name}" uploaded successfully${shouldEncrypt ? ' and encrypted' : ''}`, 'success');

                if (index === files.length - 1) {
                    setTimeout(() => {
                        this.hideUploadProgress();
                        this.updateStats();
                        this.updateStorageInfo();
                        this.renderCurrentPage();
                        this.addActivity('upload', `Uploaded ${files.length} file${files.length > 1 ? 's' : ''}${shouldEncrypt ? ' with encryption' : ''}`);

                        // Reset form
                        this.resetUploadForm();
                    }, 500);
                }
            }, index * 300);
        });

        // Clear file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    }

    resetUploadForm() {
        // Reset encryption checkbox
        const encryptUpload = document.getElementById('encryptUpload');
        if (encryptUpload) encryptUpload.checked = false;

        // Hide password input group
        const passwordInputGroup = document.getElementById('passwordInputGroup');
        if (passwordInputGroup) passwordInputGroup.style.display = 'none';

        // Clear password inputs
        const customPassword = document.getElementById('customPassword');
        if (customPassword) customPassword.value = '';

        // Reset radio buttons
        const customRadio = document.querySelector('input[name="passwordType"][value="custom"]');
        if (customRadio) customRadio.checked = true;

        // Reset password strength indicator
        this.checkPasswordStrength('');
    }

    showUploadProgress(totalFiles) {
        const uploadProgress = document.getElementById('uploadProgress');
        if (!uploadProgress) return;

        uploadProgress.style.display = 'block';
        uploadProgress.innerHTML = `
            <div class="progress-header">
                <h4>Uploading Files...</h4>
                <span class="progress-text">0 / ${totalFiles} files</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%"></div>
            </div>
        `;
    }

    updateUploadProgress(current, total) {
        const progressText = document.querySelector('.progress-text');
        const progressFill = document.querySelector('.progress-fill');

        if (progressText) progressText.textContent = `${current} / ${total} files`;
        if (progressFill) progressFill.style.width = `${(current / total) * 100}%`;
    }

    hideUploadProgress() {
        const uploadProgress = document.getElementById('uploadProgress');
        if (uploadProgress) {
            setTimeout(() => {
                uploadProgress.style.display = 'none';
            }, 1000);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getFileType(filename) {
        const extension = filename.split('.').pop().toLowerCase();
        const typeMap = {
            'pdf': 'pdf',
            'doc': 'doc', 'docx': 'doc',
            'txt': 'txt',
            'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
            'xlsx': 'xlsx', 'xls': 'xlsx',
            'pptx': 'pptx', 'ppt': 'pptx'
        };
        return typeMap[extension] || 'txt';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    renderFiles() {
        const filesGrid = document.getElementById('filesGrid');
        if (!filesGrid) return;

        const allFiles = [...this.files, ...this.secureFiles];

        if (allFiles.length === 0) {
            filesGrid.innerHTML = this.getEmptyState('No files yet', 'Upload your first document to get started');
            return;
        }

        filesGrid.innerHTML = allFiles.map(file => this.createFileCard(file)).join('');
    }

    renderRecentFiles() {
        const recentFilesGrid = document.getElementById('recentFilesGrid');
        if (!recentFilesGrid) return;

        const allFiles = [...this.files, ...this.secureFiles];
        const recentFiles = allFiles
            .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
            .slice(0, 12);

        if (recentFiles.length === 0) {
            recentFilesGrid.innerHTML = this.getEmptyState('No recent files', 'Upload some documents to see them here');
            return;
        }

        recentFilesGrid.innerHTML = recentFiles.map(file => this.createFileCard(file)).join('');
    }

    renderSecureFiles() {
        const secureFilesGrid = document.getElementById('secureFilesGrid');
        if (!secureFilesGrid) return;

        if (this.secureFiles.length === 0) {
            secureFilesGrid.innerHTML = this.getEmptyState('No secure files', 'Upload encrypted documents to see them here');
            return;
        }

        secureFilesGrid.innerHTML = this.secureFiles.map(file => this.createFileCard(file)).join('');
    }

    createFileCard(file) {
        const uploadDate = new Date(file.uploadDate).toLocaleDateString();
        const fileIcon = this.getFileIcon(file.type);
        const securityBadge = file.encrypted ? '<span class="security-badge">🔒 Encrypted</span>' : '';

        return `
            <div class="file-card" onclick="filingSystem.openFile('${file.id}')">
                <div class="file-header">
                    <div class="file-icon ${file.type}">
                        ${fileIcon}
                    </div>
                    <div class="file-actions">
                        <button onclick="event.stopPropagation(); filingSystem.downloadFile('${file.id}')" title="Download">
                            <i class="fas fa-download"></i>
                        </button>
                        <button onclick="event.stopPropagation(); filingSystem.deleteFile('${file.id}')" title="Delete">
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

    getFileIcon(type) {
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

    getEmptyState(title, description) {
        return `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                <i class="fas fa-folder-open" style="font-size: 4rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3 style="margin-bottom: 0.5rem; color: var(--text-secondary);">${title}</h3>
                <p>${description}</p>
            </div>
        `;
    }

    openFile(fileId) {
        const file = this.findFile(fileId);
        if (!file) return;

        if (file.encrypted) {
            this.showSecurityModal(file);
        } else {
            this.showFileDetails(file);
        }
    }

    findFile(fileId) {
        return [...this.files, ...this.secureFiles].find(f => f.id === fileId);
    }

    showSecurityModal(file) {
        const modal = document.getElementById('securityModal');
        if (modal) {
            modal.classList.add('active');
            modal.dataset.fileId = file.id;
        }
    }

    showFileDetails(file) {
        const modal = document.getElementById('fileModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        if (modalTitle) modalTitle.textContent = file.name;
        if (modalBody) {
            modalBody.innerHTML = `
                <div class="file-details">
                    <p><strong>File Name:</strong> ${file.name}</p>
                    <p><strong>File Size:</strong> ${file.size}</p>
                    <p><strong>File Type:</strong> ${file.type.toUpperCase()}</p>
                    <p><strong>Upload Date:</strong> ${new Date(file.uploadDate).toLocaleString()}</p>
                    <p><strong>Security:</strong> ${file.encrypted ? '🔒 Encrypted' : '🔓 Standard'}</p>
                    ${file.encrypted && file.password ? `
                        <p><strong>Password:</strong> <code style="background: var(--bg-secondary); padding: 0.25rem 0.5rem; border-radius: 4px;">${file.password}</code></p>
                        <small style="color: var(--text-muted); font-style: italic;">This is the password you set when uploading the file</small>
                    ` : ''}
                </div>
            `;
        }

        if (modal) modal.classList.add('active');
    }

    downloadFile(fileId) {
        const file = this.findFile(fileId);
        if (!file) return;

        if (file.encrypted) {
            this.showSecurityModal(file);
        } else {
            this.addNotification(`Downloading ${file.name}...`, 'info');
            this.addActivity('download', `Downloaded "${file.name}"`);
        }
    }

    deleteFile(fileId) {
        if (!confirm('Are you sure you want to delete this file?')) return;

        const file = this.findFile(fileId);
        if (!file) return;

        this.files = this.files.filter(f => f.id !== fileId);
        this.secureFiles = this.secureFiles.filter(f => f.id !== fileId);

        localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
        localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));

        this.updateStats();
        this.updateStorageInfo();
        this.renderCurrentPage();
        this.addNotification(`File "${file.name}" deleted successfully`, 'success');
        this.addActivity('delete', `Deleted "${file.name}"`);
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // Backup functionality
    exportData() {
        const data = {
            files: this.files,
            secureFiles: this.secureFiles,
            settings: this.settings,
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

        this.addNotification('Data exported successfully', 'success');
        this.addActivity('backup', 'Created system backup');
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                if (!confirm(`Import backup from ${new Date(data.exportDate).toLocaleString()}? This will replace all current data.`)) {
                    return;
                }

                this.files = data.files || [];
                this.secureFiles = data.secureFiles || [];
                this.settings = { ...this.settings, ...(data.settings || {}) };

                localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
                localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));
                localStorage.setItem('modernFilingSettings', JSON.stringify(this.settings));

                this.updateStats();
                this.updateStorageInfo();
                this.renderCurrentPage();
                this.addNotification('Data imported successfully', 'success');
                this.addActivity('restore', 'Restored from backup');
            } catch (error) {
                this.addNotification('Invalid backup file', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Notification system
    addNotification(message, type = 'info') {
        const notification = {
            id: this.generateId(),
            message,
            type,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(notification);

        // Keep only last 10 notifications
        if (this.notifications.length > 10) {
            this.notifications = this.notifications.slice(0, 10);
        }

        this.updateStats();
        this.showToast(message, type);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: var(--bg-card);
            border: 1px solid var(--border-primary);
            border-left: 4px solid ${type === 'success' ? 'var(--accent-success)' : type === 'error' ? 'var(--accent-danger)' : 'var(--accent-info)'};
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Activity tracking
    addActivity(type, description) {
        const activity = {
            id: this.generateId(),
            type,
            description,
            timestamp: new Date().toISOString()
        };

        const activities = JSON.parse(localStorage.getItem('modernFilingActivities')) || [];
        activities.unshift(activity);

        // Keep only last 50 activities
        if (activities.length > 50) {
            activities.splice(50);
        }

        localStorage.setItem('modernFilingActivities', JSON.stringify(activities));

        if (this.currentPage === 'dashboard') {
            this.renderRecentActivity();
        }
    }

    renderRecentActivity() {
        const activityList = document.getElementById('recentActivity');
        if (!activityList) return;

        const activities = JSON.parse(localStorage.getItem('modernFilingActivities')) || [];
        const recentActivities = activities.slice(0, 5);

        if (recentActivities.length === 0) {
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-content">
                        <div class="activity-title">No recent activity</div>
                        <div class="activity-description">Start uploading files to see activity here</div>
                    </div>
                </div>
            `;
            return;
        }

        activityList.innerHTML = recentActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon" style="background: ${this.getActivityColor(activity.type)}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.description}</div>
                    <div class="activity-time">${this.formatRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getActivityColor(type) {
        const colors = {
            'upload': 'var(--accent-primary)',
            'download': 'var(--accent-success)',
            'delete': 'var(--accent-danger)',
            'backup': 'var(--accent-warning)',
            'restore': 'var(--accent-info)'
        };
        return colors[type] || 'var(--accent-primary)';
    }

    getActivityIcon(type) {
        const icons = {
            'upload': 'upload',
            'download': 'download',
            'delete': 'trash',
            'backup': 'database',
            'restore': 'history'
        };
        return icons[type] || 'file';
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }

    generateSampleActivity() {
        if (localStorage.getItem('modernFilingActivities')) return;

        const sampleActivities = [
            { type: 'upload', description: 'Uploaded student_records.pdf' },
            { type: 'backup', description: 'System backup completed' },
            { type: 'download', description: 'Downloaded enrollment_form.docx' }
        ];

        sampleActivities.forEach((activity, index) => {
            setTimeout(() => {
                this.addActivity(activity.type, activity.description);
            }, index * 1000);
        });
    }

    // Theme management
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);

        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // Security functionality
    showSecurityScan() {
        const secureCount = this.secureFiles.length;
        const totalCount = this.files.length + this.secureFiles.length;
        const securityPercentage = totalCount > 0 ? Math.round((secureCount / totalCount) * 100) : 0;

        this.addNotification(`Security scan complete: ${securityPercentage}% of files are encrypted`, 'info');
    }

    // Additional utility methods
    applyFilters() {
        // Implement filtering logic based on current page
        this.renderCurrentPage();
    }

    switchView(view) {
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');
        // Implement view switching logic
    }

    handleGlobalSearch(query) {
        if (!query.trim()) return;

        const allFiles = [...this.files, ...this.secureFiles];
        const results = allFiles.filter(file =>
            file.name.toLowerCase().includes(query.toLowerCase())
        );

        // Show search suggestions or results
        console.log(`Found ${results.length} files matching "${query}"`);
    }

    renderUploadPage() {
        // Upload page is already rendered in HTML
    }

    renderBackupPage() {
        // Backup page is already rendered in HTML
    }

    renderAnalytics() {
        // Analytics page placeholder
    }

    renderSettings() {
        // Settings page is already rendered in HTML
        const autoSaveSetting = document.getElementById('autoSaveSetting');
        const notificationsSetting = document.getElementById('notificationsSetting');

        if (autoSaveSetting) autoSaveSetting.checked = this.settings.autoSave;
        if (notificationsSetting) notificationsSetting.checked = this.settings.notifications;
    }
}

// Global functions
window.switchPage = function(pageName) {
    if (window.filingSystem) {
        window.filingSystem.switchPage(pageName);

        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-page="${pageName}"]`)?.classList.add('active');
    }
};

window.toggleTheme = function() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
};

window.togglePasswordInput = function() {
    const encryptUpload = document.getElementById('encryptUpload');
    const passwordInputGroup = document.getElementById('passwordInputGroup');

    if (encryptUpload && passwordInputGroup) {
        if (encryptUpload.checked) {
            passwordInputGroup.style.display = 'block';
            // Set default to custom password
            const customRadio = document.querySelector('input[name="passwordType"][value="custom"]');
            if (customRadio) customRadio.checked = true;
            window.filingSystem.handlePasswordTypeChange('custom');
        } else {
            passwordInputGroup.style.display = 'none';
        }
    }
};

window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
};

window.copyGeneratedPassword = function() {
    const generatedPassword = document.getElementById('generatedPassword').textContent;
    navigator.clipboard.writeText(generatedPassword).then(() => {
        window.filingSystem.addNotification('Password copied to clipboard!', 'success');
    }).catch(() => {
        window.filingSystem.addNotification('Failed to copy password', 'error');
    });
};

window.verifyAccess = function() {
    const modal = document.getElementById('securityModal');
    const fileId = modal?.dataset.fileId;
    const enteredPassword = document.getElementById('accessCode')?.value;

    if (!fileId || !enteredPassword) {
        window.filingSystem.addNotification('Please enter a password', 'error');
        return;
    }

    const file = window.filingSystem.findFile(fileId);
    if (file && file.password === enteredPassword) {
        window.filingSystem.closeModals();
        window.filingSystem.showFileDetails(file);
        document.getElementById('accessCode').value = '';
        window.filingSystem.addNotification('Access granted', 'success');
        window.filingSystem.addActivity('download', `Accessed secure file "${file.name}"`);
    } else {
        window.filingSystem.addNotification('Incorrect password', 'error');
        document.getElementById('accessCode').value = '';
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.filingSystem = new ModernFilingSystem();

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }

        .toast-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
    `;
    document.head.appendChild(style);

    console.log('🚀 Modern Filing System v2.0 with Custom Password Support initialized successfully!');
});


/*
  Enhancement IIFE appended to original script to add:
  - rename-before-upload modal + queue processing
  - storing file content (Base64) for non-encrypted files
  - AES-GCM encryption/decryption for encrypted files (Web Crypto API)
  - automatic download after successful decryption
  - auto-generated password shown once; hint stored
  This IIFE attaches methods to ModernFilingSystem.prototype so it overrides behavior.
*/
(function(){
  if (typeof ModernFilingSystem === 'undefined') {
    console.warn('ModernFilingSystem not found. Make sure the original script defines it before this enhancement runs.');
  }

  ModernFilingSystem.prototype.escapeHtml = function(str) {
    return (str + '').replace(/[&<>"'`=\/]/g, function (s) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
      }[s];
    });
  };

  ModernFilingSystem.prototype.readFileAsArrayBuffer = async function(file) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsArrayBuffer(file);
    });
  };

  ModernFilingSystem.prototype.arrayBufferToBase64 = function(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  };

  ModernFilingSystem.prototype.base64ToArrayBuffer = function(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  };

  ModernFilingSystem.prototype.deriveKeyFromPassword = async function(password, salt, iterations = 250000) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  };

  ModernFilingSystem.prototype.encryptArrayBufferWithPassword = async function(arrayBuffer, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKeyFromPassword(password, salt);
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, arrayBuffer);
    return {
      ciphertext: this.arrayBufferToBase64(cipher),
      iv: this.arrayBufferToBase64(iv.buffer),
      salt: this.arrayBufferToBase64(salt.buffer)
    };
  };

  ModernFilingSystem.prototype.decryptArrayBufferWithPassword = async function(cipherBase64, ivBase64, saltBase64, password) {
    try {
      const cipherBuf = this.base64ToArrayBuffer(cipherBase64);
      const ivBuf = this.base64ToArrayBuffer(ivBase64);
      const saltBuf = this.base64ToArrayBuffer(saltBase64);
      const key = await this.deriveKeyFromPassword(password, new Uint8Array(saltBuf));
      const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(ivBuf) }, key, cipherBuf);
      return plain; // ArrayBuffer
    } catch (e) {
      throw e;
    }
  };

  ModernFilingSystem.prototype.handleFileUpload = function(files) {
    if (!files || files.length === 0) return;
    const fileItems = Array.from(files).map((file) => ({
      file,
      id: this.generateId ? this.generateId() : (Date.now().toString(36) + Math.random().toString(36).substr(2)),
      originalName: file.name,
      newName: file.name,
      shouldEncrypt: false,
      passwordType: 'custom',
      customPassword: '',
      generatedPassword: this.generateSecurePassword ? this.generateSecurePassword() : (Math.random().toString(36).slice(2,14))
    }));

    this.showRenameUploadModal(fileItems);
  };

  ModernFilingSystem.prototype.processUploadQueue = async function(items) {
    this.showUploadProgress(items.length);
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      try {
        const ab = await this.readFileAsArrayBuffer(item.file);
        let storedContent = null;
        let encryptedMeta = null;

        if (item.shouldEncrypt) {
          const pw = item.customPassword || item.generatedPassword;
          const encResult = await this.encryptArrayBufferWithPassword(ab, pw);
          storedContent = encResult.ciphertext;
          encryptedMeta = {
            iv: encResult.iv,
            salt: encResult.salt,
            method: 'AES-GCM-PBKDF2'
          };
          const hint = (pw && pw.length > 4) ? (pw.slice(0,2) + '…' + pw.slice(-2)) : (pw || null);
          var storedGeneratedPasswordHint = item.passwordType === 'auto' ? hint : null;
        } else {
          const blob = new Blob([ab], { type: item.file.type || 'application/octet-stream' });
          storedContent = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(blob);
          });
        }

        const fileData = {
          id: item.id,
          name: item.newName || item.originalName,
          originalName: item.originalName,
          size: this.formatFileSize ? this.formatFileSize(item.file.size) : (item.file.size + ' bytes'),
          rawSize: item.file.size,
          type: this.getFileType ? this.getFileType(item.newName || item.originalName) : 'txt',
          uploadDate: new Date().toISOString(),
          encrypted: !!item.shouldEncrypt,
          content: storedContent,
          encryptedMeta: encryptedMeta || null,
          storedGeneratedPasswordHint: storedGeneratedPasswordHint || null
        };

        if (item.shouldEncrypt) {
          this.secureFiles = this.secureFiles || [];
          this.secureFiles.push(fileData);
          localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));
        } else {
          this.files = this.files || [];
          this.files.push(fileData);
          localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
        }

        this.updateUploadProgress ? this.updateUploadProgress(i+1, items.length) : null;
        this.addNotification ? this.addNotification(`Uploaded \"${fileData.name}\"${fileData.encrypted ? ' (encrypted)' : ''}`, 'success') : console.log('Uploaded', fileData.name);
        this.addActivity ? this.addActivity('upload', `Uploaded ${fileData.name}`) : null;
      } catch (err) {
        this.addNotification ? this.addNotification(`Failed to process \"${item.originalName}\": ${err.message || err}`, 'error') : console.error(err);
      }
    }

    setTimeout(() => {
      this.hideUploadProgress ? this.hideUploadProgress() : null;
      this.updateStats ? this.updateStats() : null;
      this.updateStorageInfo ? this.updateStorageInfo() : null;
      this.renderCurrentPage ? this.renderCurrentPage() : null;
      this.resetUploadForm ? this.resetUploadForm() : null;
    }, 600);
  };

  ModernFilingSystem.prototype.showRenameUploadModal = function(items) {
    const existing = document.getElementById('uploadRenameModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'uploadRenameModal';
    modal.className = 'modal active';
    modal.style.zIndex = 2000;
    modal.innerHTML = `
      <div class="modal-content" style="max-width:900px; margin: 6rem auto; padding: 1.25rem;">
          <h3 style="margin-top:0">Upload — Rename & Options</h3>
          <p style="color:var(--text-muted)">Edit file names and choose encryption options before uploading.</p>
          <div id="uploadRenameList" style="max-height: 50vh; overflow:auto; margin: 1rem 0;"></div>
          <div style="display:flex; gap: .5rem; justify-content:flex-end; margin-top:1rem;">
              <button id="cancelUploadBtn" class="btn">Cancel</button>
              <button id="confirmUploadBtn" class="btn btn-primary">Upload ${items.length} file(s)</button>
          </div>
      </div>
    `;
    document.body.appendChild(modal);

    if (!document.getElementById('uploadRenameModalStyle')) {
      const style = document.createElement('style');
      style.id = 'uploadRenameModalStyle';
      style.textContent = `
        #uploadRenameList .upload-item { display:flex; gap:0.5rem; align-items:center; padding:0.5rem; border-bottom:1px solid var(--border-primary); }
        #uploadRenameList .upload-item input[type="text"]{ flex:1; padding:0.5rem; border-radius:4px; border:1px solid var(--border-primary); background:var(--bg-card); color:var(--text-primary); }
        #uploadRenameList .upload-item .small { font-size:0.9rem; color:var(--text-muted); }
        #uploadRenameList .upload-item label{ font-size:0.85rem; margin-right:0.25rem;}
        .btn { padding: 0.5rem 0.75rem; border-radius:6px; border:1px solid var(--border-primary); background:var(--bg-card); cursor:pointer; }
        .btn-primary { background: var(--accent-primary); color: white; border-color: transparent; }
      `;
      document.head.appendChild(style);
    }

    const list = modal.querySelector('#uploadRenameList');
    items.forEach((it, idx) => {
      const row = document.createElement('div');
      row.className = 'upload-item';
      row.dataset.index = idx;
      row.innerHTML = `
        <div style="width:56px; text-align:center;">
            <div style="font-size:1.5rem; opacity:0.9;">📄</div>
        </div>
        <div style="flex:1; display:flex; flex-direction:column;">
            <div style="display:flex; gap:0.5rem; align-items:center;">
                <input data-field="newName" type="text" value="${this.escapeHtml(it.newName)}" />
                <span class="small">${this.formatFileSize ? this.formatFileSize(it.file.size) : (it.file.size+' bytes')}</span>
            </div>
            <div style="display:flex; gap:0.5rem; align-items:center; margin-top:0.5rem;">
                <label><input type="checkbox" data-field="shouldEncrypt" ${it.shouldEncrypt ? 'checked' : ''}/> Encrypt</label>
                <label style="display:flex; align-items:center; gap:0.25rem;"><input name="passwordType-${idx}" type="radio" value="custom" data-field="passwordType" ${it.passwordType==='custom' ? 'checked' : ''}/> Custom</label>
                <label style="display:flex; align-items:center; gap:0.25rem;"><input name="passwordType-${idx}" type="radio" value="auto" data-field="passwordType" ${it.passwordType==='auto' ? 'checked' : ''}/> Auto</label>
                <input data-field="customPassword" type="password" placeholder="custom password (min 6)" style="width:200px; padding:0.35rem; border-radius:4px; border:1px solid var(--border-primary);" />
                <button data-action="showGen" class="btn" title="Use generated password">Gen</button>
                <span data-field="genDisplay" class="small" style="margin-left:auto; font-family:monospace;">${this.escapeHtml(it.generatedPassword)}</span>
            </div>
        </div>
      `;
      list.appendChild(row);

      const newNameInput = row.querySelector('input[data-field="newName"]');
      const encryptCheckbox = row.querySelector('input[data-field="shouldEncrypt"]');
      const customPwdInput = row.querySelector('input[data-field="customPassword"]');
      const pwdTypeRadios = row.querySelectorAll(`input[name="passwordType-${idx}"]`);
      const genBtn = row.querySelector('button[data-action="showGen"]');
      const genDisplay = row.querySelector('span[data-field="genDisplay"]');

      newNameInput.addEventListener('input', (e) => { it.newName = e.target.value; });
      encryptCheckbox.addEventListener('change', (e) => {
        it.shouldEncrypt = e.target.checked;
        customPwdInput.style.display = it.shouldEncrypt ? 'inline-block' : 'none';
        pwdTypeRadios.forEach(r => r.disabled = !it.shouldEncrypt);
        genDisplay.style.opacity = it.shouldEncrypt ? '1' : '0.4';
      });
      customPwdInput.style.display = 'none';
      customPwdInput.addEventListener('input', (e) => it.customPassword = e.target.value);

      pwdTypeRadios.forEach(r => {
        r.addEventListener('change', (e) => {
          it.passwordType = e.target.value;
          genDisplay.style.opacity = it.passwordType === 'auto' ? '1' : '0.6';
        });
        r.disabled = !it.shouldEncrypt;
      });

      genBtn.addEventListener('click', () => {
        it.passwordType = 'auto';
        it.generatedPassword = this.generateSecurePassword ? this.generateSecurePassword() : (Math.random().toString(36).slice(2,14));
        genDisplay.textContent = it.generatedPassword;
      });
    });

    modal.querySelector('#cancelUploadBtn').addEventListener('click', () => { modal.remove(); });

    modal.querySelector('#confirmUploadBtn').addEventListener('click', async () => {
      const rows = Array.from(list.children);
      rows.forEach((row, idx) => {
        const it = items[idx];
        it.newName = row.querySelector('input[data-field="newName"]').value.trim() || it.originalName;
        it.shouldEncrypt = !!row.querySelector('input[data-field="shouldEncrypt"]').checked;
        it.passwordType = row.querySelector(`input[name="passwordType-${idx}"]:checked`) ? row.querySelector(`input[name="passwordType-${idx}"]:checked`).value : 'custom';
        it.customPassword = row.querySelector('input[data-field="customPassword"]').value;
        if (!it.generatedPassword) it.generatedPassword = this.generateSecurePassword ? this.generateSecurePassword() : (Math.random().toString(36).slice(2,14));
      });

      modal.remove();
      await this.processUploadQueue(items);
    });
  };

  ModernFilingSystem.prototype.downloadFile = async function(fileId) {
    const file = this.findFile ? this.findFile(fileId) : null;
    if (!file) return;

    if (file.encrypted) {
      this.showSecurityModal ? this.showSecurityModal(file) : null;
    } else {
      this.addNotification ? this.addNotification(`Downloading ${file.name}...`, 'info') : null;
      if (file.content && file.content.startsWith('data:')) {
        const a = document.createElement('a');
        a.href = file.content;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        this.addActivity ? this.addActivity('download', `Downloaded "${file.name}"`) : null;
      } else {
        try {
          if (file.content) {
            const b64 = file.content.replace(/^data:.*;base64,/, '');
            const ab = this.base64ToArrayBuffer(b64);
            const blob = new Blob([ab], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            this.addActivity ? this.addActivity('download', `Downloaded "${file.name}"`) : null;
          } else {
            this.addNotification ? this.addNotification('No file content available', 'error') : null;
          }
        } catch (e) {
          this.addNotification ? this.addNotification('Failed to prepare download', 'error') : null;
        }
      }
    }
  };

  ModernFilingSystem.prototype.openFile = function(fileId) {
    const file = this.findFile ? this.findFile(fileId) : null;
    if (!file) return;
    if (file.encrypted) {
      this.showSecurityModal ? this.showSecurityModal(file) : null;
    } else {
      this.showFileDetails ? this.showFileDetails(file) : null;
    }
  };

  ModernFilingSystem.prototype.showSecurityModal = function(file) {
    let modal = document.getElementById('securityModal');
    if (modal) {
      modal.classList.add('active');
      modal.dataset.fileId = file.id;
      const accessInput = document.getElementById('accessCode');
      if (accessInput) accessInput.value = '';
      return;
    }

    modal = document.createElement('div');
    modal.id = 'securityModal';
    modal.className = 'modal active';
    modal.style.zIndex = 1500;
    modal.dataset.fileId = file.id;
    modal.innerHTML = `
      <div class="modal-content" style="max-width:420px; margin:6rem auto; padding:1rem;">
        <h3>Enter password to access file</h3>
        <input id="accessCode" type="password" placeholder="Password" style="width:100%; padding:0.5rem; margin:0.5rem 0;" />
        <div style="display:flex; gap:.5rem; justify-content:flex-end;">
          <button id="cancelAccess" class="btn">Cancel</button>
          <button id="confirmAccess" class="btn btn-primary">Submit</button>
        </div>
        <div id="passwordHint" style="margin-top:0.5rem; color:var(--text-muted); font-size:0.9rem;"></div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('cancelAccess').addEventListener('click', () => modal.remove());
    document.getElementById('confirmAccess').addEventListener('click', () => { window.verifyAccess && window.verifyAccess(); });

    const hintEl = document.getElementById('passwordHint');
    if (hintEl && file.storedGeneratedPasswordHint) {
      hintEl.textContent = `Hint: ${file.storedGeneratedPasswordHint} (if you chose auto-generated password)`;
    } else if (hintEl) {
      hintEl.textContent = '';
    }
  };

  ModernFilingSystem.prototype.resetUploadForm = function() {
    const encryptUpload = document.getElementById('encryptUpload');
    if (encryptUpload) encryptUpload.checked = false;
    const passwordInputGroup = document.getElementById('passwordInputGroup');
    if (passwordInputGroup) passwordInputGroup.style.display = 'none';
    const customPassword = document.getElementById('customPassword');
    if (customPassword) customPassword.value = '';
    const customRadio = document.querySelector('input[name="passwordType"][value="custom"]');
    if (customRadio) customRadio.checked = true;
    this.checkPasswordStrength ? this.checkPasswordStrength('') : null;
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  window.verifyAccess = async function() {
    const modal = document.getElementById('securityModal');
    const fileId = modal?.dataset.fileId;
    const enteredPassword = document.getElementById('accessCode')?.value;

    if (!fileId || !enteredPassword) {
      window.filingSystem && window.filingSystem.addNotification ? window.filingSystem.addNotification('Please enter a password', 'error') : alert('Please enter a password');
      return;
    }

    const file = window.filingSystem && window.filingSystem.findFile ? window.filingSystem.findFile(fileId) : null;
    if (!file) {
      window.filingSystem && window.filingSystem.addNotification ? window.filingSystem.addNotification('File not found', 'error') : alert('File not found');
      return;
    }

    if (file.encrypted && file.encryptedMeta) {
      try {
        const plainAB = await window.filingSystem.decryptArrayBufferWithPassword(
          file.content,
          file.encryptedMeta.iv,
          file.encryptedMeta.salt,
          enteredPassword
        );

        const blob = new Blob([plainAB], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        window.filingSystem.closeModals && window.filingSystem.closeModals();
        window.filingSystem.showFileDetails && window.filingSystem.showFileDetails(file);

        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 5000);

        const accessInput = document.getElementById('accessCode');
        if (accessInput) accessInput.value = '';

        window.filingSystem.addNotification && window.filingSystem.addNotification('Access granted', 'success');
        window.filingSystem.addActivity && window.filingSystem.addActivity('download', `Accessed secure file "${file.name}"`);
      } catch (e) {
        window.filingSystem.addNotification && window.filingSystem.addNotification('Incorrect password or corrupted file', 'error');
        const accessInput = document.getElementById('accessCode');
        if (accessInput) accessInput.value = '';
      }
    } else {
      if (file.password && file.password === enteredPassword) {
        window.filingSystem.closeModals && window.filingSystem.closeModals();
        window.filingSystem.showFileDetails && window.filingSystem.showFileDetails(file);
        const accessInput = document.getElementById('accessCode');
        if (accessInput) accessInput.value = '';
        window.filingSystem.addNotification && window.filingSystem.addNotification('Access granted (legacy)', 'success');
        window.filingSystem.addActivity && window.filingSystem.addActivity('download', `Accessed secure file "${file.name}"`);
      } else {
        window.filingSystem.addNotification && window.filingSystem.addNotification('Incorrect password', 'error');
        const accessInput = document.getElementById('accessCode');
        if (accessInput) accessInput.value = '';
      }
    }
  };

  document.addEventListener('DOMContentLoaded', function() {
    if (window.filingSystem && document.getElementById('fileInput')) {
      const fi = document.getElementById('fileInput');
      fi.removeEventListener && fi.removeEventListener('change', () => {});
      fi.addEventListener('change', (e) => {
        const files = e.target.files;
        window.filingSystem.handleFileUpload(files);
      });
    }
  });

})(); // end IIFE

// ============================================
// BULLETPROOF STORAGE SYSTEM INTEGRATION
// ============================================

// Global FileSystemService instance
window.fileSystemService = null;

// Initialize FileSystemService
async function initFileSystemService() {
    // Dynamically import FileSystemService
    try {
        const module = await import('./src/js/storage/FileSystemService.js');
        const FileSystemService = module.default;
        window.fileSystemService = new FileSystemService();

        // Setup callbacks for UI updates
        window.fileSystemService.onSaveStart = () => {
            const indicator = document.getElementById('saveIndicator');
            if (indicator) indicator.classList.remove('hidden');
        };

        window.fileSystemService.onSaveEnd = (error) => {
            const indicator = document.getElementById('saveIndicator');
            if (indicator) indicator.classList.add('hidden');
            updateLastSavedIndicator();
        };

        window.fileSystemService.onRecovery = (report) => {
            if (report && report.recovered) {
                showRecoveryModal(report);
            }
        };

        // Try to restore previous connection
        const restored = await window.fileSystemService.restoreConnection();
        if (restored) {
            console.log('✅ Storage connection restored');
            updateStorageUI();

            // Check for recovery report
            const report = window.fileSystemService.getRecoveryReport();
            if (report && report.recovered) {
                showRecoveryModal(report);
            }
        } else {
            // Show storage setup prompt if not connected
            console.log('⚠️ Storage not connected. Setup required.');
        }

        return true;
    } catch (error) {
        console.error('Failed to initialize FileSystemService:', error);
        return false;
    }
}

// Storage Setup Functions
window.selectStorageFolder = async function() {
    if (!window.fileSystemService) {
        await initFileSystemService();
    }

    try {
        const success = await window.fileSystemService.selectStorageFolder();
        if (success) {
            // Move to step 2
            document.getElementById('setupStep1').classList.add('hidden');
            document.getElementById('setupStep2').classList.remove('hidden');

            // Update UI with detected values
            document.getElementById('selectedFolderName').textContent =
                window.fileSystemService.config.storagePath || 'Selected Folder';

            const detected = window.fileSystemService.getDetectedStorage();
            document.getElementById('detectedStorageValue').textContent =
                detected.formatted || 'Unknown';
        }
    } catch (error) {
        console.error('Storage folder selection failed:', error);
        if (window.filingSystem) {
            window.filingSystem.addNotification(error.message, 'error');
        }
    }
};

window.setQuickLimit = function(value, unit) {
    document.getElementById('storageLimitInput').value = value;
    document.getElementById('storageLimitUnit').value = unit;
};

window.confirmStorageSetup = async function() {
    const limitValue = parseFloat(document.getElementById('storageLimitInput').value);
    const limitUnit = document.getElementById('storageLimitUnit').value;

    if (!limitValue || limitValue <= 0) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Please enter a valid storage limit', 'error');
        }
        return;
    }

    // Convert to bytes
    const multiplier = limitUnit === 'TB' ? 1024 * 1024 * 1024 * 1024 : 1024 * 1024 * 1024;
    const limitBytes = limitValue * multiplier;

    // Set the storage limit
    window.fileSystemService.setStorageLimit(limitBytes);

    // Close modal
    closeStorageSetupModal();

    // Update UI
    updateStorageUI();

    if (window.filingSystem) {
        window.filingSystem.addNotification(`Storage configured: ${limitValue} ${limitUnit} limit`, 'success');
    }
};

window.openStorageSetupModal = function() {
    const modal = document.getElementById('storageSetupModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset to step 1
        document.getElementById('setupStep1').classList.remove('hidden');
        document.getElementById('setupStep2').classList.add('hidden');
    }
};

function closeStorageSetupModal() {
    const modal = document.getElementById('storageSetupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Recovery Modal Functions
function showRecoveryModal(report) {
    const modal = document.getElementById('recoveryModal');
    if (!modal) return;

    // Update status badge
    const statusDiv = document.getElementById('recoveryStatus');
    const badge = statusDiv.querySelector('.recovery-badge');
    if (report.recovered) {
        badge.className = 'recovery-badge warning';
        badge.innerHTML = '<i class="fas fa-exclamation-triangle"></i><span>Data Recovered</span>';
    }

    // Update details
    document.getElementById('recoverySource').textContent = report.source || 'Unknown';

    const filesCount = window.fileSystemService?.manifest ?
        Object.keys(window.fileSystemService.manifest.files).length +
        Object.keys(window.fileSystemService.manifest.secureFiles).length : 0;
    document.getElementById('recoveryFilesCount').textContent = filesCount;

    const issuesText = report.issues?.length > 0 ? report.issues.join(', ') : 'None';
    document.getElementById('recoveryIssues').textContent = issuesText;

    modal.style.display = 'flex';
}

window.closeRecoveryModal = function() {
    const modal = document.getElementById('recoveryModal');
    if (modal) modal.style.display = 'none';
};

window.verifyStorageIntegrity = async function() {
    if (!window.fileSystemService || !window.fileSystemService.isConnected) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Storage not connected', 'error');
        }
        return;
    }

    try {
        const results = await window.fileSystemService.verifyIntegrity();

        // Show results in notification or modal
        if (results.valid) {
            if (window.filingSystem) {
                window.filingSystem.addNotification(
                    `✅ Storage verified: ${results.totalFiles} files OK`,
                    'success'
                );
            }
        } else {
            const message = `⚠️ Issues found: ${results.missingFiles.length} missing, ${results.orphanedFiles.length} orphaned`;
            if (window.filingSystem) {
                window.filingSystem.addNotification(message, 'warning');
            }

            // Offer to repair
            if (confirm(`${message}\n\nWould you like to repair the storage?`)) {
                const repairResult = await window.fileSystemService.repairStorage();
                if (window.filingSystem) {
                    window.filingSystem.addNotification(repairResult.message, 'success');
                }
            }
        }
    } catch (error) {
        console.error('Integrity check failed:', error);
        if (window.filingSystem) {
            window.filingSystem.addNotification('Integrity check failed: ' + error.message, 'error');
        }
    }

    closeRecoveryModal();
};

// Update Last Saved Indicator
function updateLastSavedIndicator() {
    const indicator = document.getElementById('lastSavedIndicator');
    const textEl = document.getElementById('lastSavedText');

    if (!indicator || !textEl || !window.fileSystemService) return;

    const lastSave = window.fileSystemService.getLastSaveTime();
    const pendingCount = window.fileSystemService.getPendingChangesCount();

    if (pendingCount > 0) {
        indicator.classList.add('unsaved');
        textEl.textContent = `${pendingCount} unsaved changes`;
    } else if (lastSave) {
        indicator.classList.remove('unsaved');
        const timeAgo = getTimeAgo(lastSave);
        textEl.textContent = `Saved ${timeAgo}`;
    } else {
        indicator.classList.remove('unsaved');
        textEl.textContent = 'All changes saved';
    }
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

// Update Storage UI
async function updateStorageUI() {
    if (!window.fileSystemService) return;

    const isConnected = window.fileSystemService.isConnected;

    try {
        const stats = await window.fileSystemService.getStorageStats();

        // Update sidebar storage info
        const storageBar = document.getElementById('storageBar');
        const storageUsed = document.getElementById('storageUsed');
        const storageTotal = document.getElementById('storageTotal');

        if (storageBar) storageBar.style.width = `${Math.min(stats.usagePercentage || 0, 100)}%`;
        if (storageUsed) storageUsed.textContent = stats.formattedSize || '0 Bytes';
        if (storageTotal) storageTotal.textContent = stats.formattedLimit || '--';

        // Update file counts
        const totalFileCount = document.getElementById('totalFileCount');
        const secureFileCount = document.getElementById('secureFileCount');
        const trashFileCount = document.getElementById('trashFileCount');

        if (totalFileCount) totalFileCount.textContent = stats.totalFiles || 0;
        if (secureFileCount) secureFileCount.textContent = stats.secureFiles || 0;
        if (trashFileCount) trashFileCount.textContent = stats.trashCount || 0;

        // Update dashboard stats if visible
        const dashTotalFiles = document.getElementById('dashTotalFiles');
        const dashSecureFiles = document.getElementById('dashSecureFiles');

        if (dashTotalFiles) dashTotalFiles.textContent = stats.totalFiles || 0;
        if (dashSecureFiles) dashSecureFiles.textContent = stats.secureFiles || 0;

        // Update settings page storage info
        updateSettingsStorageInfo(stats, isConnected);

    } catch (error) {
        console.error('Failed to update storage UI:', error);
    }
}

// Update Settings Page Storage Info
function updateSettingsStorageInfo(stats, isConnected) {
    // Connection status
    const connectionStatus = document.getElementById('storageConnectionStatus');
    if (connectionStatus) {
        if (isConnected) {
            connectionStatus.innerHTML = '<i class="fas fa-circle connected"></i> Connected';
        } else {
            connectionStatus.innerHTML = '<i class="fas fa-circle disconnected"></i> Not Connected';
        }
    }

    // Storage location
    const locationText = document.getElementById('storageLocationText');
    if (locationText) {
        locationText.textContent = stats.storagePath || '--';
    }

    // Current limit
    const currentLimitDisplay = document.getElementById('currentLimitDisplay');
    if (currentLimitDisplay) {
        currentLimitDisplay.textContent = stats.formattedLimit || '--';
    }

    // Available space
    const availableSpaceDisplay = document.getElementById('availableSpaceDisplay');
    if (availableSpaceDisplay) {
        availableSpaceDisplay.textContent = stats.formattedMaxStorage || '--';
    }
}

// Render Trash Page
function renderTrashPage() {
    const container = document.getElementById('trashContainer');
    if (!container || !window.fileSystemService) return;

    const trashFiles = window.fileSystemService.getTrashFiles();

    if (trashFiles.length === 0) {
        container.innerHTML = `
            <div class="trash-empty">
                <i class="fas fa-trash-alt"></i>
                <p>Trash is empty</p>
            </div>
        `;
        return;
    }

    const getFileIcon = (type) => {
        const icons = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'image': 'fa-file-image',
            'xlsx': 'fa-file-excel',
            'txt': 'fa-file-alt',
            'archive': 'fa-file-archive'
        };
        return icons[type] || 'fa-file';
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    container.innerHTML = `
        <div class="trash-grid">
            ${trashFiles.map(file => `
                <div class="trash-item">
                    <div class="trash-item-header">
                        <div class="trash-item-icon">
                            <i class="fas ${getFileIcon(file.type)}"></i>
                        </div>
                        <div class="trash-item-name" title="${file.name}">${file.name}</div>
                    </div>
                    <div class="trash-item-meta">
                        <div>Size: ${file.size}</div>
                        <div>Deleted: ${formatDate(file.deletedAt)}</div>
                    </div>
                    <div class="trash-item-actions">
                        <button class="btn-restore" onclick="restoreFromTrash('${file.id}')">
                            <i class="fas fa-undo"></i> Restore
                        </button>
                        <button class="btn-delete-permanent" onclick="permanentDeleteFile('${file.id}')">
                            <i class="fas fa-times"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Trash Management Functions
window.viewTrash = async function() {
    if (!window.fileSystemService) return;
    renderTrashPage();
};

window.restoreFromTrash = async function(fileId) {
    if (!window.fileSystemService) return;

    try {
        await window.fileSystemService.restoreFromTrash(fileId);
        if (window.filingSystem) {
            window.filingSystem.addNotification('File restored successfully', 'success');
        }
        updateStorageUI();
        renderTrashPage();
    } catch (error) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Failed to restore file: ' + error.message, 'error');
        }
    }
};

window.permanentDeleteFile = async function(fileId) {
    if (!window.fileSystemService) return;

    if (!confirm('This will permanently delete the file. This cannot be undone. Continue?')) {
        return;
    }

    try {
        await window.fileSystemService.permanentDelete(fileId);
        if (window.filingSystem) {
            window.filingSystem.addNotification('File permanently deleted', 'success');
        }
        updateStorageUI();
    } catch (error) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Failed to delete file: ' + error.message, 'error');
        }
    }
};

window.emptyTrash = async function() {
    if (!window.fileSystemService) return;

    if (!confirm('This will permanently delete all files in trash. This cannot be undone. Continue?')) {
        return;
    }

    try {
        const results = await window.fileSystemService.emptyTrash();
        if (window.filingSystem) {
            window.filingSystem.addNotification(
                `Trash emptied: ${results.success} files deleted`,
                'success'
            );
        }
        updateStorageUI();
    } catch (error) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Failed to empty trash: ' + error.message, 'error');
        }
    }
};

// Force Save Function
window.forceSaveStorage = async function() {
    if (!window.fileSystemService) return;

    try {
        await window.fileSystemService.forceSave();
        if (window.filingSystem) {
            window.filingSystem.addNotification('Storage saved successfully', 'success');
        }
        updateLastSavedIndicator();
    } catch (error) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Failed to save: ' + error.message, 'error');
        }
    }
};

// Export Backup Function
window.exportBackup = async function() {
    if (!window.fileSystemService || !window.fileSystemService.isConnected) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Storage not connected', 'error');
        }
        return;
    }

    try {
        const exportData = await window.fileSystemService.exportBackupMetadata();

        // Create downloadable JSON
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `filing-system-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 5000);

        if (window.filingSystem) {
            window.filingSystem.addNotification('Backup metadata exported. Remember to also backup your storage folder!', 'success');
        }
    } catch (error) {
        if (window.filingSystem) {
            window.filingSystem.addNotification('Export failed: ' + error.message, 'error');
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize FileSystemService
    await initFileSystemService();

    // Start periodic UI updates
    setInterval(updateLastSavedIndicator, 10000); // Update every 10 seconds

    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
});
