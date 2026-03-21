// Modern Filing System Application with Custom Password Support
// Import FileSystemService
import FileSystemService from './storage/FileSystemService.js';

class ModernFilingSystem {
    constructor() {
        this.files = JSON.parse(localStorage.getItem('modernFilingFiles')) || [];
        this.secureFiles = JSON.parse(localStorage.getItem('modernSecureFiles')) || [];
        this.settings = JSON.parse(localStorage.getItem('modernFilingSettings')) || this.getDefaultSettings();
        this.currentPage = 'dashboard';
        this.currentView = 'grid';
        this.notifications = [];
        this.authStorageKey = 'modernFilingAuthenticated';
        this.userStorageKey = 'modernFilingCurrentUser';
        this.defaultLogin = {
            username: 'admin',
            password: 'admin123'
        };
        this.isAuthenticated = localStorage.getItem(this.authStorageKey) === 'true';
        this.currentUser = JSON.parse(localStorage.getItem(this.userStorageKey)) || {
            name: 'Registrar Office',
            role: 'Administrator',
            username: 'admin'
        };
        this.isAppInitialized = false;

        // Initialize File System Service for disk storage
        this.fileSystemService = new FileSystemService();
        this.useFileSystem = false; // Will be set to true when connected
        this.isSetupComplete = localStorage.getItem('storageSetupComplete') === 'true';

        this.init();
    }

    getDefaultSettings() {
        return {
            autoSave: true,
            notifications: true,
            theme: 'dark',
            autoBackup: false,
            encryptByDefault: false,
            autoOrganize: true,
            storageLimit: null, // Will be set when storage folder is selected
            storageLimitEnabled: true
        };
    }

    init() {
        this.showLoadingScreen();

        setTimeout(async () => {
            // Try to restore file system connection
            await this.initializeStorage();

            this.hideLoadingScreen();
            if (this.isAuthenticated) {
                this.bootApp();
            } else {
                this.setupLoginListeners();
                this.showLoginScreen();
            }
        }, 2000);
    }

    bootApp() {
        if (this.isAppInitialized) {
            this.showMainInterface();
            return;
        }

        this.isAppInitialized = true;
        this.hideLoginScreen();
        this.showMainInterface();
        this.updateUserProfile();

        this.setupEventListeners();
        this.setupNavigation();
        this.setupDragAndDrop();
        this.setupStorageSettings();
        this.updateStats();
        this.renderCurrentPage();
        this.updateStorageInfo();
        this.loadTheme();
        this.generateSampleActivity();
        this.setupPasswordInputs();
        this.detectBrowser();

        // Show setup modal if first time and File System API is supported
        if (!this.isSetupComplete && this.fileSystemService.isSupported()) {
            this.showStorageSetupModal();
        }
    }

    setupLoginListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm && !loginForm.dataset.bound) {
            loginForm.addEventListener('submit', (event) => this.handleLogin(event));
            loginForm.dataset.bound = 'true';
        }

        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        const loginStatus = document.getElementById('loginStatus');

        [loginUsername, loginPassword].forEach((input) => {
            if (input && !input.dataset.clearStatusBound) {
                input.addEventListener('input', () => {
                    if (loginStatus) {
                        loginStatus.textContent = '';
                        loginStatus.className = 'login-status';
                    }
                });
                input.dataset.clearStatusBound = 'true';
            }
        });
    }

    handleLogin(event) {
        event.preventDefault();

        const usernameInput = document.getElementById('loginUsername');
        const passwordInput = document.getElementById('loginPassword');
        const loginStatus = document.getElementById('loginStatus');

        const username = usernameInput?.value.trim() || '';
        const password = passwordInput?.value || '';

        if (!username || !password) {
            if (loginStatus) {
                loginStatus.textContent = 'Enter both username and password.';
                loginStatus.className = 'login-status error';
            }
            return;
        }

        const isValidLogin = username === this.defaultLogin.username && password === this.defaultLogin.password;

        if (!isValidLogin) {
            if (loginStatus) {
                loginStatus.textContent = 'Invalid credentials. Use admin / admin123 to continue.';
                loginStatus.className = 'login-status error';
            }

            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }

            return;
        }

        this.isAuthenticated = true;
        this.currentUser = {
            name: 'Registrar Office',
            role: 'Administrator',
            username
        };

        localStorage.setItem(this.authStorageKey, 'true');
        localStorage.setItem(this.userStorageKey, JSON.stringify(this.currentUser));

        if (loginStatus) {
            loginStatus.textContent = 'Login successful. Loading your workspace...';
            loginStatus.className = 'login-status success';
        }

        if (passwordInput) {
            passwordInput.value = '';
        }

        this.bootApp();
        this.addNotification('Welcome back', 'success');
    }

    showLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        const mainApp = document.getElementById('mainApp');

        if (loginScreen) {
            loginScreen.classList.remove('hidden');
        }

        if (mainApp) {
            mainApp.classList.add('hidden');
        }

        const loginUsername = document.getElementById('loginUsername');
        if (loginUsername) {
            loginUsername.focus();
        }
    }

    hideLoginScreen() {
        const loginScreen = document.getElementById('loginScreen');
        if (loginScreen) {
            loginScreen.classList.add('hidden');
        }
    }

    showMainInterface() {
        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
    }

    toggleUserMenu() {
        const userProfileMenu = document.getElementById('userProfileMenu');
        if (userProfileMenu) {
            userProfileMenu.classList.toggle('open');
        }
    }

    closeUserMenu() {
        const userProfileMenu = document.getElementById('userProfileMenu');
        if (userProfileMenu) {
            userProfileMenu.classList.remove('open');
        }
    }

    logout() {
        this.isAuthenticated = false;
        this.isAppInitialized = false;

        localStorage.removeItem(this.authStorageKey);
        localStorage.removeItem(this.userStorageKey);

        this.closeUserMenu();

        const loginForm = document.getElementById('loginForm');
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        const loginStatus = document.getElementById('loginStatus');

        if (loginForm) {
            loginForm.reset();
        }

        if (loginStatus) {
            loginStatus.textContent = 'You have been logged out.';
            loginStatus.className = 'login-status';
        }

        if (loginPassword) {
            loginPassword.value = '';
        }

        if (loginUsername) {
            loginUsername.focus();
        }

        const mainApp = document.getElementById('mainApp');
        if (mainApp) {
            mainApp.classList.add('hidden');
        }

        this.showLoginScreen();
        this.addNotification('Logged out successfully', 'info');
    }

    updateUserProfile() {
        const userName = document.querySelector('.user-name');
        const userRole = document.querySelector('.user-role');
        const userAvatar = document.querySelector('.user-profile img');
        const dropdownName = document.querySelector('.user-dropdown-name');
        const dropdownRole = document.querySelector('.user-dropdown-role');
        const displayName = this.currentUser?.name || 'Registrar Office';
        const displayRole = this.currentUser?.role || 'Administrator';

        if (userName) {
            userName.textContent = displayName;
        }

        if (userRole) {
            userRole.textContent = displayRole;
        }

        if (userAvatar) {
            const avatarLabel = encodeURIComponent(displayName);
            userAvatar.src = `https://ui-avatars.com/api/?name=${avatarLabel}&background=3b82f6&color=fff`;
            userAvatar.alt = displayName;
        }

        if (dropdownName) {
            dropdownName.textContent = displayName;
        }

        if (dropdownRole) {
            dropdownRole.textContent = displayRole;
        }
    }

    /**
     * Initialize storage system
     */
    async initializeStorage() {
        if (this.fileSystemService.isSupported()) {
            try {
                const restored = await this.fileSystemService.restoreConnection();
                if (restored) {
                    this.useFileSystem = true;
                    // Sync files from file system (replaces localStorage files)
                    await this.syncFilesFromStorage();
                    // Clear localStorage file arrays since we're using FileSystem
                    // (prevents confusion between the two systems)
                    localStorage.removeItem('modernFilingFiles');
                    localStorage.removeItem('modernSecureFiles');
                    console.log('File System storage restored successfully');
                }
            } catch (error) {
                console.warn('Could not restore file system connection:', error);
            }
        }
    }

    /**
     * Sync files from file system storage to memory
     * This replaces any localStorage files when FileSystem is active
     */
    async syncFilesFromStorage() {
        if (!this.useFileSystem) return;

        try {
            const { files, secureFiles } = await this.fileSystemService.getAllFiles();
            // Replace localStorage-loaded files with manifest files
            this.files = files;
            this.secureFiles = secureFiles;
            console.log('Synced from manifest - files:', files.length, 'secureFiles:', secureFiles.length);
        } catch (error) {
            console.error('Error syncing files from storage:', error);
        }
    }

    /**
     * Setup storage settings event listeners
     */
    setupStorageSettings() {
        // Storage limit enable/disable
        const enableStorageLimit = document.getElementById('enableStorageLimit');
        if (enableStorageLimit) {
            enableStorageLimit.addEventListener('change', (e) => {
                const controls = document.getElementById('storageLimitControls');
                if (controls) {
                    controls.style.display = e.target.checked ? 'block' : 'none';
                }
                if (!e.target.checked) {
                    this.fileSystemService.disableStorageLimit();
                    this.addNotification('Storage limit disabled', 'info');
                }
            });
        }

        // Auto organize setting
        const autoOrganize = document.getElementById('autoOrganizeSetting');
        if (autoOrganize) {
            autoOrganize.checked = this.settings.autoOrganize;
            autoOrganize.addEventListener('change', (e) => {
                this.settings.autoOrganize = e.target.checked;
                this.fileSystemService.config.autoOrganize = e.target.checked;
                this.fileSystemService.saveConfig();
                this.saveSettings();
            });
        }
    }

    /**
     * Detect and display current browser
     */
    detectBrowser() {
        const browserSpan = document.getElementById('currentBrowser');
        const setupNotice = document.getElementById('setupBrowserNotice');

        let browser = 'Unknown';
        let isChromiumBased = false;
        const ua = navigator.userAgent;

        // Detect specific Chromium-based browsers
        if (ua.includes('Edg/')) {
            browser = 'Microsoft Edge';
            isChromiumBased = true;
        } else if (ua.includes('OPR/') || ua.includes('Opera')) {
            browser = 'Opera';
            isChromiumBased = true;
        } else if (ua.includes('Brave')) {
            browser = 'Brave';
            isChromiumBased = true;
        } else if (ua.includes('Vivaldi')) {
            browser = 'Vivaldi';
            isChromiumBased = true;
        } else if (ua.includes('Chrome')) {
            browser = 'Chrome';
            isChromiumBased = true;
        } else if (ua.includes('Firefox')) {
            browser = 'Firefox';
            isChromiumBased = false;
        } else if (ua.includes('Safari')) {
            browser = 'Safari';
            isChromiumBased = false;
        }

        // Add status indicator
        const displayText = isChromiumBased ? `${browser} ✓` : `${browser} ✗ (Not Supported)`;
        if (browserSpan) browserSpan.textContent = displayText;

        // Hide/show browser notice based on support
        const isSupported = this.fileSystemService.isSupported();
        const browserNotice = document.getElementById('browserNotice');
        if (browserNotice) {
            browserNotice.classList.toggle('success', isSupported);
            browserNotice.classList.toggle('warning', !isSupported);
        }
        if (setupNotice) {
            setupNotice.classList.toggle('hidden', isSupported);
        }
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
        console.log('setupEventListeners called');

        // File input
        const fileInput = document.getElementById('fileInput');
        console.log('fileInput element:', fileInput);
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('fileInput change event fired, files:', e.target.files);
                try {
                    this.handleFileUpload(e.target.files);
                } catch (error) {
                    console.error('Error in handleFileUpload:', error);
                }
            });
            console.log('fileInput listener attached');
        }

        // Global search
        const globalSearch = document.getElementById('globalSearch');
        if (globalSearch) {
            globalSearch.addEventListener('input', (e) => {
                this.handleGlobalSearch(e.target.value);
            });

            // Close search results when clicking outside
            document.addEventListener('click', (e) => {
                const searchContainer = document.querySelector('.search-container');
                if (searchContainer && !searchContainer.contains(e.target)) {
                    const searchSuggestions = document.getElementById('searchSuggestions');
                    if (searchSuggestions) {
                        searchSuggestions.classList.remove('active');
                    }
                }
            });
        }

        // Notification button
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
            notificationBtn.addEventListener('click', () => {
                this.toggleNotificationPanel();
            });
        }

        const userProfileMenu = document.getElementById('userProfileMenu');
        if (userProfileMenu && !userProfileMenu.dataset.bound) {
            userProfileMenu.addEventListener('click', (event) => {
                event.stopPropagation();
                this.toggleUserMenu();
            });
            userProfileMenu.dataset.bound = 'true';
        }

        if (!document.body.dataset.userMenuBound) {
            document.addEventListener('click', () => {
                this.closeUserMenu();
            });
            document.body.dataset.userMenuBound = 'true';
        }

        if (!document.body.dataset.userMenuEscapeBound) {
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    this.closeUserMenu();
                }
            });
            document.body.dataset.userMenuEscapeBound = 'true';
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

    /**
     * Render the Trash page with deleted files
     */
    renderTrashPage() {
        const container = document.getElementById('trashFilesGrid');
        const emptyState = document.getElementById('trashEmptyState');
        if (!container) return;

        // Get trash files from appropriate source
        let trashFiles = [];
        if (this.useFileSystem && this.fileSystemService?.getTrashFiles) {
            trashFiles = this.fileSystemService.getTrashFiles();
        } else {
            trashFiles = this.getLocalStorageTrashFiles();
        }

        // Update trash count in sidebar
        const trashCount = document.getElementById('trashFileCount');
        if (trashCount) {
            trashCount.textContent = trashFiles.length;
            trashCount.style.display = trashFiles.length > 0 ? 'inline-block' : 'none';
        }

        if (trashFiles.length === 0) {
            container.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        if (emptyState) emptyState.style.display = 'none';

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

        container.innerHTML = trashFiles.map(file => `
            <div class="trash-item">
                <div class="trash-item-header">
                    <div class="trash-item-icon">
                        <i class="fas ${getFileIcon(file.type)}"></i>
                    </div>
                    <div class="trash-item-info">
                        <h4 title="${file.name}">${file.name}</h4>
                        <span>${file.size || 'Unknown size'}</span>
                    </div>
                </div>
                <div class="trash-item-meta">
                    <i class="fas fa-clock"></i> Deleted: ${formatDate(file.deletedAt)}
                </div>
                <div class="trash-item-actions">
                    <button class="btn btn-sm btn-success" onclick="window.filingSystem.restoreFromTrash('${file.id}')">
                        <i class="fas fa-undo"></i> Restore
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.filingSystem.permanentDeleteFile('${file.id}')">
                        <i class="fas fa-times"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Restore a file from trash
     */
    async restoreFromTrash(fileId) {
        // Handle localStorage mode
        if (!this.useFileSystem) {
            this.restoreFromLocalStorageTrash(fileId);
            this.renderTrashPage();
            return;
        }

        if (!this.fileSystemService || !this.fileSystemService.restoreFromTrash) {
            this.addNotification('Storage not connected', 'error');
            return;
        }

        try {
            await this.fileSystemService.restoreFromTrash(fileId);
            this.addNotification('File restored successfully', 'success');
            await this.syncFilesFromStorage();
            this.updateStats();
            this.renderTrashPage();
        } catch (error) {
            this.addNotification('Failed to restore file: ' + error.message, 'error');
        }
    }

    /**
     * Permanently delete a file from trash
     */
    async permanentDeleteFile(fileId) {
        if (!confirm('This will permanently delete the file. This cannot be undone. Continue?')) {
            return;
        }

        // Handle localStorage mode
        if (!this.useFileSystem) {
            this.permanentDeleteFromLocalStorageTrash(fileId);
            return;
        }

        if (!this.fileSystemService || !this.fileSystemService.permanentDelete) {
            this.addNotification('Storage not connected', 'error');
            return;
        }

        try {
            await this.fileSystemService.permanentDelete(fileId);
            this.addNotification('File permanently deleted', 'success');
            this.renderTrashPage();
        } catch (error) {
            this.addNotification('Failed to delete file: ' + error.message, 'error');
        }
    }

    /**
     * Empty all files from trash
     */
    async emptyTrash() {
        if (!confirm('This will permanently delete all files in trash. This cannot be undone. Continue?')) {
            return;
        }

        // Handle localStorage mode
        if (!this.useFileSystem) {
            localStorage.setItem('modernFilingTrash', '[]');
            this.addNotification('Trash emptied', 'success');
            this.renderTrashPage();
            this.updateStats();
            return;
        }

        if (!this.fileSystemService || !this.fileSystemService.emptyTrash) {
            this.addNotification('Storage not connected', 'error');
            return;
        }

        try {
            const results = await this.fileSystemService.emptyTrash();
            this.addNotification(`Trash emptied: ${results.success} files deleted`, 'success');
            this.renderTrashPage();
        } catch (error) {
            this.addNotification('Failed to empty trash: ' + error.message, 'error');
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
        const trashFileCount = document.getElementById('trashFileCount');

        if (totalFileCount) totalFileCount.textContent = totalFiles;
        if (secureFileCount) secureFileCount.textContent = secureCount;

        // Update trash count (from manifest if connected, or localStorage)
        if (trashFileCount) {
            let trashCount = 0;
            if (this.useFileSystem && this.fileSystemService?.manifest?.trash) {
                trashCount = Object.keys(this.fileSystemService.manifest.trash).length;
            } else {
                trashCount = this.getLocalStorageTrashFiles().length;
            }
            trashFileCount.textContent = trashCount;
            trashFileCount.style.display = trashCount > 0 ? 'inline-block' : 'none';
        }

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
        this.updateStorageInfoAsync();
    }

    async updateStorageInfoAsync() {
        let totalSize, maxSize, percentage;
        let isConnected = false;
        let displayLimit = null;

        if (this.useFileSystem) {
            // Get stats from File System Service
            const stats = await this.fileSystemService.getStorageStats();
            totalSize = stats.totalSize;
            maxSize = stats.storageLimit;
            displayLimit = stats.displayLimit; // Uses detected storage if no limit set
            percentage = stats.usagePercentage;
            isConnected = stats.isConnected;

            // Update settings page storage display
            this.updateStorageSettingsDisplay(stats);
        } else {
            // Fallback to localStorage calculation
            totalSize = this.getTotalStorageSize();
            maxSize = this.settings.storageLimit;
            displayLimit = maxSize;
            percentage = maxSize ? (totalSize / maxSize) * 100 : 0;
        }

        const storageBar = document.getElementById('storageBar');
        const storageUsed = document.getElementById('storageUsed');
        const storageTotal = document.getElementById('storageTotal');

        if (storageBar) {
            storageBar.style.width = `${Math.min(percentage, 100)}%`;
            // Add warning/danger classes
            storageBar.classList.remove('warning', 'danger');
            if (percentage > 90) storageBar.classList.add('danger');
            else if (percentage > 75) storageBar.classList.add('warning');
        }
        if (storageUsed) storageUsed.textContent = this.formatFileSize(totalSize || 0);
        if (storageTotal) {
            // Show display limit (user limit or detected capacity)
            if (displayLimit && displayLimit > 0) {
                storageTotal.textContent = this.formatFileSize(displayLimit);
            } else if (isConnected) {
                storageTotal.textContent = 'Unknown';
            } else {
                storageTotal.textContent = '--';
            }
        }
    }

    /**
     * Update storage settings display on settings page
     */
    updateStorageSettingsDisplay(stats) {
        // Connection status
        const statusIndicator = document.getElementById('storageStatusIndicator');
        const connectionStatus = document.getElementById('storageConnectionStatus');
        const pathDisplay = document.getElementById('storagePathDisplay');

        if (statusIndicator) {
            statusIndicator.classList.toggle('connected', stats.isConnected);
            statusIndicator.classList.toggle('disconnected', !stats.isConnected);
        }
        if (connectionStatus) {
            connectionStatus.textContent = stats.isConnected ? 'Connected' : 'Not Connected';
        }
        if (pathDisplay) {
            pathDisplay.value = stats.storagePath || 'No folder selected';
        }

        // Usage display
        const usageText = document.getElementById('storageUsageText');
        const usageFill = document.getElementById('storageUsageFill');
        const totalFiles = document.getElementById('storageTotalFiles');
        const secureFiles = document.getElementById('storageSecureFiles');
        const usedSpace = document.getElementById('storageUsedSpace');

        if (usageText) {
            const formattedSize = stats.formattedSize || '0 Bytes';
            const formattedLimit = stats.formattedLimit || (stats.isConnected ? 'Unlimited' : '--');
            usageText.textContent = `${formattedSize} / ${formattedLimit}`;
        }
        if (usageFill) {
            usageFill.style.width = `${stats.usagePercentage}%`;
            usageFill.classList.remove('warning', 'danger');
            if (stats.usagePercentage > 90) usageFill.classList.add('danger');
            else if (stats.usagePercentage > 75) usageFill.classList.add('warning');
        }
        if (totalFiles) totalFiles.textContent = stats.totalFiles;
        if (secureFiles) secureFiles.textContent = stats.secureFiles;
        if (usedSpace) usedSpace.textContent = stats.formattedSize;

        // Show detected disk capacity
        const detectedCapacityDisplay = document.getElementById('detectedCapacityDisplay');
        const detectedCapacityValue = document.getElementById('detectedCapacityValue');
        if (detectedCapacityDisplay && detectedCapacityValue) {
            if (stats.isConnected && stats.detectedMaxStorage) {
                detectedCapacityDisplay.style.display = 'block';
                detectedCapacityValue.textContent = stats.formattedMaxStorage;
            } else {
                detectedCapacityDisplay.style.display = 'none';
            }
        }

        // Storage limit inputs
        const limitValue = document.getElementById('storageLimitValue');
        const limitUnit = document.getElementById('storageLimitUnit');
        const enableLimit = document.getElementById('enableStorageLimit');
        const limitControls = document.getElementById('storageLimitControls');

        if (enableLimit) {
            enableLimit.checked = stats.storageLimitEnabled;
            // Also update visibility of controls based on saved setting
            if (limitControls) {
                limitControls.style.display = stats.storageLimitEnabled ? 'block' : 'none';
            }
        }

        // Parse current limit to value and unit (use storageLimit if set, otherwise show max for reference)
        if (limitValue && limitUnit) {
            if (stats.storageLimit && stats.storageLimit > 0) {
                const { value, unit } = this.bytesToValueUnit(stats.storageLimit);
                limitValue.value = value;
                limitUnit.value = unit;
            } else if (stats.detectedMaxStorage) {
                // Pre-fill with detected capacity as suggestion
                const { value, unit } = this.bytesToValueUnit(stats.detectedMaxStorage);
                limitValue.value = value;
                limitUnit.value = unit;
            }
        }
    }

    /**
     * Convert bytes to value and unit
     */
    bytesToValueUnit(bytes) {
        // Handle null/undefined/0
        if (!bytes || bytes <= 0) {
            return { value: 0, unit: 'GB' };
        }
        if (bytes >= 1024 * 1024 * 1024 * 1024) {
            return { value: Math.round(bytes / (1024 * 1024 * 1024 * 1024)), unit: 'TB' };
        } else if (bytes >= 1024 * 1024 * 1024) {
            return { value: Math.round(bytes / (1024 * 1024 * 1024)), unit: 'GB' };
        } else {
            return { value: Math.round(bytes / (1024 * 1024)), unit: 'MB' };
        }
    }

    getTotalStorageSize() {
        const allFiles = [...this.files, ...this.secureFiles];
        return allFiles.reduce((total, file) => total + (file.rawSize || 1024), 0);
    }

    handleFileUpload(files) {
        console.log('handleFileUpload called with files:', files);

        if (!files || files.length === 0) {
            console.log('No files provided, returning early');
            return;
        }

        // Always show rename modal for both FileSystem and localStorage
        console.log('Showing rename modal for upload');
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
    }

    /**
     * Handle file upload to File System (disk storage)
     */
    async handleFileUploadToFileSystem(files, shouldEncrypt, encryptionPassword) {
        this.showUploadProgress(files.length);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            try {
                // Check storage quota
                const hasSpace = await this.fileSystemService.checkStorageQuota(file.size);
                if (!hasSpace) {
                    this.addNotification(`Storage limit reached. Cannot upload "${file.name}"`, 'error');
                    failCount++;
                    continue;
                }

                // Save file to disk
                const metadata = await this.fileSystemService.saveFile(file, {
                    encrypt: shouldEncrypt,
                    password: encryptionPassword
                });

                // Update in-memory arrays
                if (shouldEncrypt) {
                    this.secureFiles.push(metadata);
                } else {
                    this.files.push(metadata);
                }

                successCount++;
                this.updateUploadProgress(i + 1, files.length);
                this.addNotification(`File "${file.name}" uploaded successfully${shouldEncrypt ? ' and encrypted' : ''}`, 'success');

            } catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                this.addNotification(`Failed to upload "${file.name}": ${error.message}`, 'error');
                failCount++;
            }
        }

        // Finalize upload
        setTimeout(() => {
            this.hideUploadProgress();
            this.updateStats();
            this.updateStorageInfo();
            this.renderCurrentPage();

            if (successCount > 0) {
                this.addActivity('upload', `Uploaded ${successCount} file${successCount > 1 ? 's' : ''} to storage${shouldEncrypt ? ' with encryption' : ''}`);
            }

            this.resetUploadForm();
        }, 500);

        // Clear file input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) fileInput.value = '';
    }

    /**
     * Handle file upload to localStorage (fallback)
     */
    handleFileUploadToLocalStorage(files, shouldEncrypt, encryptionPassword) {
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
        // Handle null, undefined, NaN, or 0
        if (bytes === null || bytes === undefined || isNaN(bytes) || bytes === 0) {
            return '0 Bytes';
        }
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        // Ensure i is valid (handle negative bytes or other edge cases)
        if (i < 0 || i >= sizes.length || !isFinite(i)) {
            return '0 Bytes';
        }
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
            // Download from File System if using disk storage
            if (this.useFileSystem) {
                this.downloadFileFromStorage(fileId);
            } else {
                this.addNotification(`File content not available (metadata only in browser storage)`, 'warning');
                this.addActivity('download', `Attempted to download "${file.name}"`);
            }
        }
    }

    deleteFile(fileId) {
        if (!confirm('Move this file to trash? You can restore it later from the Trash page.')) return;

        const file = this.findFile(fileId);
        if (!file) return;

        // Delete from File System if using disk storage
        if (this.useFileSystem) {
            this.deleteFileFromStorage(fileId, file);
        } else {
            this.deleteFileFromLocalStorage(fileId, file);
        }
    }

    /**
     * Delete file from File System storage (soft delete - moves to trash)
     */
    async deleteFileFromStorage(fileId, file) {
        try {
            console.log('deleteFileFromStorage called');
            console.log('fileId:', fileId);
            console.log('file object:', file);
            console.log('this.files IDs:', this.files.map(f => f.id));
            console.log('manifest exists:', !!this.fileSystemService.manifest);

            await this.fileSystemService.deleteFile(fileId);

            // Update in-memory arrays
            this.files = this.files.filter(f => f.id !== fileId);
            this.secureFiles = this.secureFiles.filter(f => f.id !== fileId);

            this.updateStats();
            this.updateStorageInfo();
            this.renderCurrentPage();

            this.addNotification(`File "${file.name}" moved to trash`, 'success');
            this.addActivity('delete', `Moved "${file.name}" to trash`);
        } catch (error) {
            console.error('Error deleting file:', error);
            this.addNotification(`Failed to delete file: ${error.message}`, 'error');
        }
    }

    /**
     * Delete file from localStorage (moves to trash)
     */
    deleteFileFromLocalStorage(fileId, file) {
        // Add to localStorage trash
        const trashFiles = JSON.parse(localStorage.getItem('modernFilingTrash') || '[]');
        const trashedFile = {
            ...file,
            deleted: true,
            deletedAt: new Date().toISOString(),
            originalFolder: file.folder || 'files'
        };
        trashFiles.push(trashedFile);
        localStorage.setItem('modernFilingTrash', JSON.stringify(trashFiles));

        // Remove from main arrays
        this.files = this.files.filter(f => f.id !== fileId);
        this.secureFiles = this.secureFiles.filter(f => f.id !== fileId);

        localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
        localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));

        this.updateStats();
        this.updateStorageInfo();
        this.renderCurrentPage();
        this.addNotification(`File "${file.name}" moved to trash`, 'success');
        this.addActivity('delete', `Moved "${file.name}" to trash`);
    }

    /**
     * Get trash files for localStorage mode
     */
    getLocalStorageTrashFiles() {
        return JSON.parse(localStorage.getItem('modernFilingTrash') || '[]');
    }

    /**
     * Restore file from localStorage trash
     */
    restoreFromLocalStorageTrash(fileId) {
        const trashFiles = this.getLocalStorageTrashFiles();
        const fileIndex = trashFiles.findIndex(f => f.id === fileId);

        if (fileIndex === -1) {
            this.addNotification('File not found in trash', 'error');
            return;
        }

        const file = trashFiles[fileIndex];
        delete file.deleted;
        delete file.deletedAt;

        // Restore to appropriate array
        if (file.encrypted) {
            this.secureFiles.push(file);
            localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));
        } else {
            this.files.push(file);
            localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
        }

        // Remove from trash
        trashFiles.splice(fileIndex, 1);
        localStorage.setItem('modernFilingTrash', JSON.stringify(trashFiles));

        this.updateStats();
        this.renderCurrentPage();
        this.addNotification('File restored from trash', 'success');
    }

    /**
     * Permanently delete from localStorage trash
     */
    permanentDeleteFromLocalStorageTrash(fileId) {
        const trashFiles = this.getLocalStorageTrashFiles();
        const filtered = trashFiles.filter(f => f.id !== fileId);
        localStorage.setItem('modernFilingTrash', JSON.stringify(filtered));
        this.renderTrashPage();
        this.addNotification('File permanently deleted', 'success');
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

    // =====================================================
    // NOTIFICATION SYSTEM - Improved Toast Management
    // =====================================================

    /**
     * Add a notification to the system and show toast
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     */
    addNotification(message, type = 'info') {
        // Validate inputs
        if (!message || typeof message !== 'string') {
            console.warn('Invalid notification message:', message);
            return;
        }

        const notification = {
            id: this.generateId(),
            message: message.trim(),
            type,
            timestamp: new Date().toISOString()
        };

        this.notifications.unshift(notification);

        // Keep only last 20 notifications
        if (this.notifications.length > 20) {
            this.notifications = this.notifications.slice(0, 20);
        }

        this.updateStats();
        this.showToast(message, type);

        // Update notification panel if it's open
        this.refreshNotificationPanel();
    }

    /**
     * Refresh the notification panel if it's currently visible
     */
    refreshNotificationPanel() {
        const panel = document.getElementById('notificationPanel');
        if (panel && panel.classList.contains('active')) {
            this.renderNotificationPanel(panel);
        }
    }

    /**
     * Show a toast notification with proper stacking
     * @param {string} message - The message to display
     * @param {string} type - Type: 'success', 'error', 'warning', 'info'
     */
    showToast(message, type = 'info') {
        // Get or create toast container
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
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
                <span class="toast-message">${this.escapeHtml(message)}</span>
            </div>
            <button class="toast-close" onclick="this.parentElement.classList.add('toast-hiding'); setTimeout(() => this.parentElement.remove(), 300);" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            <div class="toast-progress"></div>
        `;

        // Add to container
        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
        });

        // Auto-remove after delay (longer for errors)
        const duration = type === 'error' ? 6000 : type === 'warning' ? 5000 : 4000;

        setTimeout(() => {
            if (toast && toast.parentElement) {
                toast.classList.add('toast-hiding');
                setTimeout(() => {
                    if (toast && toast.parentElement) {
                        toast.remove();
                    }
                }, 300);
            }
        }, duration);

        // Limit max toasts to 5
        const toasts = container.querySelectorAll('.toast');
        if (toasts.length > 5) {
            const oldToast = toasts[0];
            oldToast.classList.add('toast-hiding');
            setTimeout(() => oldToast.remove(), 300);
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
        const searchSuggestions = document.getElementById('searchSuggestions');
        if (!searchSuggestions) return;

        if (!query.trim()) {
            searchSuggestions.classList.remove('active');
            searchSuggestions.innerHTML = '';
            return;
        }

        const allFiles = [...this.files, ...this.secureFiles];
        const results = allFiles.filter(file =>
            file.name.toLowerCase().includes(query.toLowerCase()) ||
            file.type.toLowerCase().includes(query.toLowerCase())
        );

        if (results.length === 0) {
            searchSuggestions.innerHTML = `
                <div class="search-result-item">
                    <div class="search-result-content">
                        <div class="search-result-title">No results found</div>
                        <div class="search-result-meta">Try a different search term</div>
                    </div>
                </div>
            `;
            searchSuggestions.classList.add('active');
            return;
        }

        searchSuggestions.innerHTML = results.slice(0, 5).map(file => {
            const highlightedName = file.name.replace(
                new RegExp(query, 'gi'),
                match => `<span class="search-highlight">${match}</span>`
            );

            return `
                <div class="search-result-item" onclick="filingSystem.openFile('${file.id}')">
                    <div class="search-result-icon" style="background: ${this.getFileIconColor(file.type)}">
                        ${this.getFileIcon(file.type)}
                    </div>
                    <div class="search-result-content">
                        <div class="search-result-title">${highlightedName}</div>
                        <div class="search-result-meta">${file.size} • ${new Date(file.uploadDate).toLocaleDateString()}</div>
                    </div>
                </div>
            `;
        }).join('');

        searchSuggestions.classList.add('active');
    }

    getFileIconColor(type) {
        const colors = {
            'pdf': '#ef4444',
            'doc': '#3b82f6',
            'xlsx': '#10b981',
            'pptx': '#f59e0b',
            'image': '#8b5cf6',
            'txt': '#6b7280'
        };
        return colors[type] || '#6b7280';
    }

    renderUploadPage() {
        // Upload page is already rendered in HTML
    }

    renderBackupPage() {
        // Backup page is already rendered in HTML
        // Set up import listener
        const importInput = document.getElementById('importInput');
        if (importInput && !importInput.dataset.listenerAdded) {
            importInput.addEventListener('change', (e) => {
                this.importData(e.target.files[0]);
            });
            importInput.dataset.listenerAdded = 'true';
        }
    }

    exportData() {
        const backupData = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            files: this.files,
            secureFiles: this.secureFiles,
            settings: this.settings,
            activities: JSON.parse(localStorage.getItem('modernFilingActivities')) || []
        };

        const dataStr = JSON.stringify(backupData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `stclare-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.addNotification('Backup exported successfully', 'success');
        this.addActivity('backup', 'Created system backup');
    }

    importData(file) {
        if (!file) {
            this.addNotification('No file selected', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);

                // Validate backup data
                if (!backupData.version || !backupData.files) {
                    throw new Error('Invalid backup file format');
                }

                // Show confirmation dialog
                if (!confirm(`This will restore data from ${new Date(backupData.exportDate).toLocaleDateString()}. Continue?`)) {
                    return;
                }

                // Restore data
                this.files = backupData.files || [];
                this.secureFiles = backupData.secureFiles || [];
                this.settings = backupData.settings || this.getDefaultSettings();

                // Save to localStorage
                localStorage.setItem('modernFilingFiles', JSON.stringify(this.files));
                localStorage.setItem('modernSecureFiles', JSON.stringify(this.secureFiles));
                localStorage.setItem('modernFilingSettings', JSON.stringify(this.settings));

                if (backupData.activities) {
                    localStorage.setItem('modernFilingActivities', JSON.stringify(backupData.activities));
                }

                // Update UI
                this.updateStats();
                this.updateStorageInfo();
                this.renderCurrentPage();

                this.addNotification('Backup restored successfully', 'success');
                this.addActivity('restore', 'Restored from backup');

                // Clear file input
                const importInput = document.getElementById('importInput');
                if (importInput) importInput.value = '';

            } catch (error) {
                console.error('Import error:', error);
                this.addNotification('Failed to import backup: ' + error.message, 'error');
            }
        };

        reader.onerror = () => {
            this.addNotification('Failed to read backup file', 'error');
        };

        reader.readAsText(file);
    }

    renderAnalytics() {
        const analyticsContainer = document.querySelector('.analytics-container');
        if (!analyticsContainer) return;

        const allFiles = [...this.files, ...this.secureFiles];
        const fileTypeStats = this.getFileTypeStatistics();
        const uploadStats = this.getUploadStatistics();
        const storageStats = this.getStorageStatistics();
        const auditLogs = this.getAuditLogs();
        const reportDate = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        analyticsContainer.innerHTML = `
            <!-- Print Header -->
            <div class="print-header">
                <h1>St. Clare College Document Management System</h1>
                <p>Analytics Report - ${reportDate}</p>
            </div>

            <!-- Analytics Actions -->
            <div class="analytics-actions no-print">
                <button onclick="filingSystem.printAnalytics()">
                    <i class="fas fa-print"></i> Print Report
                </button>
                <button onclick="filingSystem.exportAnalyticsCSV()">
                    <i class="fas fa-file-csv"></i> Export CSV
                </button>
                <button onclick="filingSystem.exportAnalyticsPDF()">
                    <i class="fas fa-file-pdf"></i> Export PDF
                </button>
            </div>

            <!-- Analytics Tabs -->
            <div class="analytics-tabs no-print">
                <button class="analytics-tab active" data-tab="overview" onclick="filingSystem.switchAnalyticsTab('overview')">
                    <i class="fas fa-chart-pie"></i> Overview
                </button>
                <button class="analytics-tab" data-tab="audit" onclick="filingSystem.switchAnalyticsTab('audit')">
                    <i class="fas fa-clipboard-list"></i> Audit Log
                </button>
            </div>

            <!-- Overview Tab Content -->
            <div class="analytics-tab-content active" id="analytics-tab-overview">
            <div class="analytics-grid">
                <!-- Storage Overview -->
                <div class="analytics-card">
                    <div class="analytics-card-header">
                        <h3><i class="fas fa-database"></i> Storage Overview</h3>
                    </div>
                    <div class="storage-ring">
                        <svg width="150" height="150">
                            <defs>
                                <linearGradient id="storageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stop-color="var(--accent-primary)" />
                                    <stop offset="100%" stop-color="var(--accent-secondary)" />
                                </linearGradient>
                            </defs>
                            <circle class="storage-ring-bg" cx="75" cy="75" r="65" />
                            <circle class="storage-ring-progress" cx="75" cy="75" r="65"
                                    stroke-dasharray="${2 * Math.PI * 65}"
                                    stroke-dashoffset="${2 * Math.PI * 65 * (1 - storageStats.percentage / 100)}" />
                        </svg>
                        <div class="storage-ring-text">
                            <span class="storage-ring-percentage">${storageStats.percentage}%</span>
                            <span class="storage-ring-label">Used</span>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 1rem;">
                        <p style="color: var(--text-secondary); font-size: 0.875rem;">
                            ${storageStats.used} of ${storageStats.total} used
                        </p>
                    </div>
                </div>

                <!-- File Type Distribution -->
                <div class="analytics-card">
                    <div class="analytics-card-header">
                        <h3><i class="fas fa-chart-pie"></i> File Types</h3>
                    </div>
                    <div style="padding: 1rem 0;">
                        ${Object.entries(fileTypeStats).map(([type, count]) => `
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <div style="width: 40px; height: 40px; border-radius: var(--radius-sm); background: ${this.getFileIconColor(type)}; display: flex; align-items: center; justify-content: center; color: white;">
                                        ${this.getFileIcon(type)}
                                    </div>
                                    <span style="font-weight: 600; color: var(--text-primary); text-transform: uppercase;">${type}</span>
                                </div>
                                <span style="font-size: 1.25rem; font-weight: 700; color: var(--accent-primary);">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Upload Activity -->
                <div class="analytics-card" style="grid-column: span 2;">
                    <div class="analytics-card-header">
                        <h3><i class="fas fa-chart-line"></i> Upload Activity (Last 7 Days)</h3>
                    </div>
                    <div class="chart-container">
                        ${uploadStats.map(stat => `
                            <div class="chart-bar" style="height: ${Math.max(stat.count * 30, 20)}px;" title="${stat.day}: ${stat.count} uploads">
                                <div class="chart-bar-value">${stat.count}</div>
                                <div class="chart-bar-label">${stat.day}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Quick Stats -->
                <div class="analytics-card">
                    <div class="analytics-card-header">
                        <h3><i class="fas fa-info-circle"></i> Quick Stats</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Total Files</div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--accent-primary);">${allFiles.length}</div>
                        </div>
                        <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Encrypted Files</div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--accent-success);">${this.secureFiles.length}</div>
                        </div>
                        <div style="padding: 1rem; background: var(--bg-tertiary); border-radius: var(--radius-md);">
                            <div style="font-size: 0.875rem; color: var(--text-muted); margin-bottom: 0.5rem;">Security Score</div>
                            <div style="font-size: 2rem; font-weight: 700; color: var(--accent-warning);">${this.calculateSecurityScore()}%</div>
                        </div>
                    </div>
                </div>

                <!-- Recent Uploads -->
                <div class="analytics-card">
                    <div class="analytics-card-header">
                        <h3><i class="fas fa-clock"></i> Recent Uploads</h3>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${allFiles.slice(0, 5).map(file => `
                            <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-sm); cursor: pointer;" onclick="filingSystem.openFile('${file.id}')">
                                <div style="width: 35px; height: 35px; border-radius: var(--radius-sm); background: ${this.getFileIconColor(file.type)}; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;">
                                    ${this.getFileIcon(file.type)}
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <div style="font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--text-muted);">${file.size} • ${this.formatRelativeTime(file.uploadDate)}</div>
                                </div>
                            </div>
                        `).join('') || '<p style="color: var(--text-muted); text-align: center;">No recent uploads</p>'}
                    </div>
                </div>
            </div>
            </div>

            <!-- Audit Log Tab Content -->
            <div class="analytics-tab-content" id="analytics-tab-audit">
            <div class="audit-log-section">
                <div class="audit-log-header">
                    <h2><i class="fas fa-clipboard-list"></i> Audit Log</h2>
                    <p>Complete system activity log with timestamps</p>
                </div>

                <div class="audit-log-filters no-print">
                    <select id="auditTypeFilter" onchange="filingSystem.filterAuditLog(this.value)">
                        <option value="all">All Activities</option>
                        <option value="upload">Uploads</option>
                        <option value="download">Downloads</option>
                        <option value="delete">Deletions</option>
                        <option value="backup">Backups</option>
                        <option value="restore">Restores</option>
                    </select>
                    <select id="auditDateFilter" onchange="filingSystem.filterAuditByDate(this.value)">
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                    </select>
                </div>

                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Description</th>
                            <th>User</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody id="auditLogBody">
                        ${auditLogs.map((log, index) => `
                            <tr class="audit-log-row">
                                <td>${index + 1}</td>
                                <td class="audit-timestamp">${this.formatAuditTimestamp(log.timestamp)}</td>
                                <td><span class="audit-badge audit-badge-${log.type}">${this.getAuditActionLabel(log.type)}</span></td>
                                <td>${log.description}</td>
                                <td>${log.user || 'Registrar Office'}</td>
                                <td><span class="audit-status audit-status-success">Success</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No audit logs available</td></tr>'}
                    </tbody>
                </table>

                <div class="audit-summary">
                    <div class="summary-item">
                        <strong>Total Activities</strong>
                        <span>${auditLogs.length}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Date Range</strong>
                        <span>${this.getAuditDateRange(auditLogs)}</span>
                    </div>
                    <div class="summary-item">
                        <strong>Most Active Action</strong>
                        <span>${this.getMostActiveAction(auditLogs)}</span>
                    </div>
                </div>
            </div>
            </div>

            <!-- Print Footer -->
            <div class="print-footer">
                <p>St. Clare College Document Management System • Confidential</p>
                <p>Page 1 of 1</p>
            </div>
        `;
    }

    getFileTypeStatistics() {
        const allFiles = [...this.files, ...this.secureFiles];
        const stats = {};

        allFiles.forEach(file => {
            stats[file.type] = (stats[file.type] || 0) + 1;
        });

        return stats;
    }

    getUploadStatistics() {
        const allFiles = [...this.files, ...this.secureFiles];
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const stats = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];

            const count = allFiles.filter(file => {
                const fileDate = new Date(file.uploadDate);
                return fileDate.toDateString() === date.toDateString();
            }).length;

            stats.push({ day: dayName, count });
        }

        return stats;
    }

    getStorageStatistics() {
        const totalSize = this.getTotalStorageSize();

        // Use configured limit if available, otherwise fallback to 100MB
        let maxSize = 100 * 1024 * 1024; // 100MB default

        if (this.useFileSystem && this.fileSystemService?.manifest?.settings?.storageLimitBytes) {
            maxSize = this.fileSystemService.manifest.settings.storageLimitBytes;
        } else if (this.fileSystemService?.config?.storageLimit) {
            maxSize = this.fileSystemService.config.storageLimit;
        } else if (this.settings?.storageLimit) {
            maxSize = this.settings.storageLimit;
        }

        const percentage = maxSize > 0 ? Math.round((totalSize / maxSize) * 100) : 0;

        return {
            used: this.formatFileSize(totalSize),
            total: maxSize > 0 ? this.formatFileSize(maxSize) : 'Unlimited',
            percentage: Math.min(percentage, 100)
        };
    }

    calculateSecurityScore() {
        const totalFiles = this.files.length + this.secureFiles.length;
        if (totalFiles === 0) return 100;

        const encryptedFiles = this.secureFiles.length;
        return Math.round((encryptedFiles / totalFiles) * 100);
    }

    // Audit Log Methods
    getAuditLogs() {
        const activities = JSON.parse(localStorage.getItem('modernFilingActivities')) || [];
        return activities.map(activity => ({
            ...activity,
            user: 'Registrar Office',
            status: 'success'
        }));
    }

    formatAuditTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    getAuditActionLabel(type) {
        const labels = {
            'upload': 'Upload',
            'download': 'Download',
            'delete': 'Delete',
            'backup': 'Backup',
            'restore': 'Restore',
            'access': 'Access'
        };
        return labels[type] || type.toUpperCase();
    }

    getAuditDateRange(logs) {
        if (logs.length === 0) return 'No data';
        const dates = logs.map(log => new Date(log.timestamp)).sort((a, b) => a - b);
        const oldest = dates[0].toLocaleDateString();
        const newest = dates[dates.length - 1].toLocaleDateString();
        return `${oldest} - ${newest}`;
    }

    getMostActiveAction(logs) {
        if (logs.length === 0) return 'None';
        const counts = {};
        logs.forEach(log => {
            counts[log.type] = (counts[log.type] || 0) + 1;
        });
        const mostActive = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return `${this.getAuditActionLabel(mostActive[0])} (${mostActive[1]})`;
    }

    switchAnalyticsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.analytics-tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `analytics-tab-${tabName}`);
        });
    }

    filterAuditLog(type) {
        const activities = JSON.parse(localStorage.getItem('modernFilingActivities')) || [];
        const filtered = type === 'all' ? activities : activities.filter(a => a.type === type);
        this.renderAuditTable(filtered);
    }

    filterAuditByDate(range) {
        const activities = JSON.parse(localStorage.getItem('modernFilingActivities')) || [];
        const now = new Date();
        let filtered = activities;

        if (range === 'today') {
            filtered = activities.filter(a => {
                const actDate = new Date(a.timestamp);
                return actDate.toDateString() === now.toDateString();
            });
        } else if (range === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = activities.filter(a => new Date(a.timestamp) >= weekAgo);
        } else if (range === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = activities.filter(a => new Date(a.timestamp) >= monthAgo);
        }

        this.renderAuditTable(filtered);
    }

    renderAuditTable(logs) {
        const tbody = document.getElementById('auditLogBody');
        if (!tbody) return;

        tbody.innerHTML = logs.map((log, index) => `
            <tr class="audit-log-row">
                <td>${index + 1}</td>
                <td class="audit-timestamp">${this.formatAuditTimestamp(log.timestamp)}</td>
                <td><span class="audit-badge audit-badge-${log.type}">${this.getAuditActionLabel(log.type)}</span></td>
                <td>${log.description}</td>
                <td>${log.user || 'Registrar Office'}</td>
                <td><span class="audit-status audit-status-success">Success</span></td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">No audit logs match the filter</td></tr>';
    }

    printAnalytics() {
        window.print();
    }

    exportAnalyticsCSV() {
        const activities = JSON.parse(localStorage.getItem('modernFilingActivities')) || [];
        let csv = 'Timestamp,Action,Description,User,Status\n';

        activities.forEach(log => {
            const timestamp = this.formatAuditTimestamp(log.timestamp);
            const action = this.getAuditActionLabel(log.type);
            const description = log.description.replace(/,/g, ';');
            csv += `"${timestamp}","${action}","${description}","Registrar Office","Success"\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.addNotification('Audit log exported to CSV', 'success');
    }

    exportAnalyticsPDF() {
        // Simple PDF export using print to PDF
        this.addNotification('Use Print > Save as PDF in the print dialog', 'info');
        setTimeout(() => window.print(), 500);
    }

    renderSettings() {
        // Settings page is already rendered in HTML
        const autoSaveSetting = document.getElementById('autoSaveSetting');
        const notificationsSetting = document.getElementById('notificationsSetting');
        const autoOrganizeSetting = document.getElementById('autoOrganizeSetting');

        if (autoSaveSetting) autoSaveSetting.checked = this.settings.autoSave;
        if (notificationsSetting) notificationsSetting.checked = this.settings.notifications;
        if (autoOrganizeSetting) autoOrganizeSetting.checked = this.settings.autoOrganize !== false;

        // Update storage settings display (updateStorageInfoAsync calls updateStorageSettingsDisplay)
        this.updateStorageInfo();
    }

    /**
     * Verify storage integrity
     */
    async verifyStorageIntegrity() {
        if (!this.fileSystemService || !this.fileSystemService.isConnected) {
            this.addNotification('Storage not connected', 'error');
            return;
        }

        try {
            const results = await this.fileSystemService.verifyIntegrity();

            if (results.valid) {
                this.addNotification(`✅ Storage verified: ${results.totalFiles} files OK`, 'success');
            } else {
                const message = `⚠️ Issues found: ${results.missingFiles.length} missing, ${results.orphanedFiles.length} orphaned`;
                this.addNotification(message, 'warning');

                if (confirm(`${message}\n\nWould you like to repair the storage?`)) {
                    const repairResult = await this.fileSystemService.repairStorage();
                    this.addNotification(repairResult.message, 'success');
                    await this.syncFilesFromStorage();
                    this.updateStats();
                }
            }
        } catch (error) {
            this.addNotification('Integrity check failed: ' + error.message, 'error');
        }
    }

    /**
     * Force save all pending changes
     */
    async forceSaveStorage() {
        if (!this.fileSystemService) {
            this.addNotification('Storage not connected', 'error');
            return;
        }

        try {
            await this.fileSystemService.forceSave();
            this.addNotification('Storage saved successfully', 'success');
        } catch (error) {
            this.addNotification('Failed to save: ' + error.message, 'error');
        }
    }

    /**
     * Export backup metadata
     */
    async exportBackup() {
        if (!this.fileSystemService || !this.fileSystemService.isConnected) {
            this.addNotification('Storage not connected', 'error');
            return;
        }

        try {
            const exportData = await this.fileSystemService.exportBackupMetadata();

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `filing-system-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();

            setTimeout(() => URL.revokeObjectURL(url), 5000);

            this.addNotification('Backup metadata exported. Remember to also backup your storage folder!', 'success');
        } catch (error) {
            this.addNotification('Export failed: ' + error.message, 'error');
        }
    }

    // =====================================================
    // STORAGE MANAGEMENT METHODS
    // =====================================================

    /**
     * Show storage setup modal for first-time users
     */
    showStorageSetupModal() {
        const modal = document.getElementById('storageSetupModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Hide storage setup modal
     */
    hideStorageSetupModal() {
        const modal = document.getElementById('storageSetupModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Show recovery modal with details
     */
    showRecoveryModal(details) {
        const modal = document.getElementById('recoveryModal');
        const detailsDiv = document.getElementById('recoveryDetails');

        if (detailsDiv) {
            detailsDiv.innerHTML = `
                <div class="recovery-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Recovery Method: <strong>${details.method || 'automatic'}</strong></span>
                </div>
                <div class="recovery-item">
                    <i class="fas fa-file-alt"></i>
                    <span>Files Recovered: <strong>${details.filesRecovered || 0}</strong></span>
                </div>
                ${details.message ? `<div class="recovery-item"><i class="fas fa-comment"></i><span>${details.message}</span></div>` : ''}
            `;
        }

        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Hide recovery modal
     */
    hideRecoveryModal() {
        const modal = document.getElementById('recoveryModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Step 1: Select storage folder (from setup modal)
     */
    async setupSelectFolderStep1() {
        if (!this.fileSystemService.isSupported()) {
            this.addNotification('File System Access API not supported. Please use a Chromium-based browser (Chrome, Edge, Brave, Opera, etc.).', 'error');
            return;
        }

        try {
            const success = await this.fileSystemService.selectStorageFolder();

            if (success) {
                this.useFileSystem = true;

                // Move to step 2
                this.showSetupStep2();
            }
        } catch (error) {
            console.error('Error selecting storage folder:', error);
            this.addNotification(`Failed to connect storage: ${error.message}`, 'error');
        }
    }

    /**
     * Show setup step 2 (configure storage limit)
     */
    showSetupStep2() {
        const step1 = document.getElementById('setupStep1');
        const step2 = document.getElementById('setupStep2');
        const selectedPath = document.getElementById('setupSelectedPath');
        const detectedValue = document.getElementById('detectedStorageValue');
        const maxStorageLabel = document.getElementById('maxStorageLabel');

        // Hide step 1, show step 2
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'block';

        // Update displayed path
        if (selectedPath) {
            selectedPath.textContent = `Selected: ${this.fileSystemService.config.storagePath}`;
        }

        // Update detected storage
        const detectedStorage = this.fileSystemService.getDetectedStorage();
        if (detectedValue) {
            detectedValue.textContent = detectedStorage.formatted || 'Unable to detect';
        }
        if (maxStorageLabel) {
            maxStorageLabel.textContent = `Use all available storage (${detectedStorage.formatted || 'Unknown'})`;
        }

        // Store detected max for later use
        this.detectedMaxStorage = detectedStorage.bytes;

        // Setup radio button event listeners
        this.setupStorageLimitRadios();
    }

    /**
     * Setup event listeners for storage limit radio buttons
     */
    setupStorageLimitRadios() {
        const radios = document.querySelectorAll('input[name="storageLimitOption"]');
        const customSection = document.getElementById('customLimitSection');

        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (customSection) {
                    customSection.style.display = e.target.value === 'custom' ? 'block' : 'none';
                }
            });
        });
    }

    /**
     * Go back to step 1
     */
    setupGoBack() {
        const step1 = document.getElementById('setupStep1');
        const step2 = document.getElementById('setupStep2');

        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';

        // Disconnect storage since user is going back
        this.fileSystemService.disconnect();
        this.useFileSystem = false;
    }

    /**
     * Complete setup (from step 2)
     */
    setupComplete() {
        const selectedOption = document.querySelector('input[name="storageLimitOption"]:checked');
        let storageLimit;

        if (selectedOption && selectedOption.value === 'max') {
            // Use detected max storage
            storageLimit = this.detectedMaxStorage || 500 * 1024 * 1024 * 1024; // Fallback to 500 GB
        } else {
            // Use custom limit
            const limitValue = document.getElementById('setupStorageLimitValue');
            const limitUnit = document.getElementById('setupStorageLimitUnit');

            if (limitValue && limitUnit) {
                storageLimit = this.parseStorageLimit(limitValue.value, limitUnit.value);
            } else {
                storageLimit = 100 * 1024 * 1024 * 1024; // Default 100 GB
            }
        }

        // Apply storage limit
        this.fileSystemService.setStorageLimit(storageLimit);
        this.settings.storageLimit = storageLimit;
        this.settings.storageLimitEnabled = true;
        this.saveSettings();

        // Mark setup as complete
        this.hideStorageSetupModal();
        localStorage.setItem('storageSetupComplete', 'true');
        this.isSetupComplete = true;

        // Update UI
        this.updateStorageInfo();
        this.updateStats();

        // Notify user
        this.addNotification(`Storage configured: ${this.fileSystemService.formatFileSize(storageLimit)} limit`, 'success');
        this.addActivity('settings', `Connected storage folder: ${this.fileSystemService.config.storagePath} (${this.fileSystemService.formatFileSize(storageLimit)} limit)`);
    }

    /**
     * Legacy method - kept for compatibility
     */
    async setupSelectFolder() {
        await this.setupSelectFolderStep1();
        if (this.useFileSystem) {
            // If using from settings page, complete immediately with detected max
            const detectedStorage = this.fileSystemService.getDetectedStorage();
            if (detectedStorage.bytes) {
                this.fileSystemService.setStorageLimit(detectedStorage.bytes);
                this.settings.storageLimit = detectedStorage.bytes;
                this.settings.storageLimitEnabled = true;
                this.saveSettings();
            }
            this.hideStorageSetupModal();
            localStorage.setItem('storageSetupComplete', 'true');
            this.isSetupComplete = true;
        }
    }

    /**
     * Skip storage setup (use localStorage fallback)
     */
    skipSetup() {
        this.hideStorageSetupModal();
        localStorage.setItem('storageSetupComplete', 'true');
        this.isSetupComplete = true;
        this.addNotification('Using browser storage. You can configure disk storage later in Settings.', 'info');
    }

    /**
     * Select storage folder (from settings page)
     */
    async selectStorageFolder() {
        if (!this.fileSystemService.isSupported()) {
            this.addNotification('File System Access API not supported. Please use a Chromium-based browser (Chrome, Edge, Brave, Opera, etc.).', 'error');
            return;
        }

        try {
            const success = await this.fileSystemService.selectStorageFolder();

            if (success) {
                this.useFileSystem = true;

                // Get detected storage and show to user
                const detected = this.fileSystemService.getDetectedStorage();
                this.addNotification(`Storage folder connected! Detected: ${detected.formatted}`, 'success');
                this.addActivity('settings', 'Connected storage folder: ' + this.fileSystemService.config.storagePath);

                // Sync any existing localStorage files to new storage
                await this.migrateLocalStorageToFileSystem();

                this.updateStorageInfo();
                this.updateStats();

                // Update settings page with detected storage
                this.showDetectedStorageInSettings(detected);
            }
        } catch (error) {
            console.error('Error selecting storage folder:', error);
            this.addNotification(`Failed to connect storage: ${error.message}`, 'error');
        }
    }

    /**
     * Show detected storage in settings page
     */
    showDetectedStorageInSettings(detected) {
        const limitValue = document.getElementById('storageLimitValue');
        const limitUnit = document.getElementById('storageLimitUnit');

        if (detected.bytes && limitValue && limitUnit) {
            const { value, unit } = this.bytesToValueUnit(detected.bytes);
            limitValue.value = value;
            limitUnit.value = unit;
        }
    }

    /**
     * Migrate existing localStorage files to File System storage
     */
    async migrateLocalStorageToFileSystem() {
        const localFiles = JSON.parse(localStorage.getItem('modernFilingFiles')) || [];
        const localSecureFiles = JSON.parse(localStorage.getItem('modernSecureFiles')) || [];

        if (localFiles.length === 0 && localSecureFiles.length === 0) return;

        // Note: Since localStorage only stored metadata (not actual file content),
        // we can't migrate the actual files. We just inform the user.
        if (localFiles.length > 0 || localSecureFiles.length > 0) {
            this.addNotification(`Note: ${localFiles.length + localSecureFiles.length} file records found in browser storage. These were metadata only and have been preserved.`, 'info');
        }
    }

    /**
     * Refresh storage status
     */
    async refreshStorageStatus() {
        const refreshBtn = document.getElementById('refreshStorageBtn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        }

        try {
            if (this.useFileSystem) {
                await this.syncFilesFromStorage();
            }
            await this.updateStorageInfoAsync();
            this.updateStats();
            this.addNotification('Storage status refreshed', 'success');
        } catch (error) {
            this.addNotification('Failed to refresh storage status', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            }
        }
    }

    /**
     * Set storage limit preset
     */
    setStorageLimitPreset(value, unit) {
        const limitValue = document.getElementById('storageLimitValue');
        const limitUnit = document.getElementById('storageLimitUnit');

        if (limitValue) limitValue.value = value;
        if (limitUnit) limitUnit.value = unit;
    }

    /**
     * Apply storage limit from settings
     */
    applyStorageLimit() {
        const limitValue = document.getElementById('storageLimitValue');
        const limitUnit = document.getElementById('storageLimitUnit');
        const enableLimit = document.getElementById('enableStorageLimit');

        if (!limitValue || !limitUnit) return;

        const value = parseFloat(limitValue.value);
        if (isNaN(value) || value <= 0) {
            this.addNotification('Please enter a valid storage limit', 'error');
            return;
        }

        const bytes = this.parseStorageLimit(value, limitUnit.value);

        if (enableLimit && enableLimit.checked) {
            const result = this.fileSystemService.setStorageLimit(bytes);
            this.settings.storageLimit = result.actualLimit;
            this.settings.storageLimitEnabled = true;

            if (result.wasCapped) {
                // Update the input to show the capped value
                const { value: cappedValue, unit: cappedUnit } = this.bytesToValueUnit(result.actualLimit);
                limitValue.value = cappedValue;
                limitUnit.value = cappedUnit;
                this.addNotification(`Storage limit capped at disk capacity: ${this.formatFileSize(result.actualLimit)}`, 'warning');
            } else {
                this.addNotification(`Storage limit set to ${value} ${limitUnit.value}`, 'success');
            }
        } else {
            this.fileSystemService.disableStorageLimit();
            this.settings.storageLimitEnabled = false;
            this.addNotification('Storage limit disabled', 'info');
        }

        this.saveSettings();
        this.updateStorageInfo();
    }

    /**
     * Parse storage limit to bytes
     */
    parseStorageLimit(value, unit) {
        const multipliers = {
            'MB': 1024 * 1024,
            'GB': 1024 * 1024 * 1024,
            'TB': 1024 * 1024 * 1024 * 1024
        };
        return Math.floor(value * (multipliers[unit] || multipliers['GB']));
    }

    /**
     * Convert bytes to a value and unit
     */
    bytesToValueUnit(bytes) {
        const TB = 1024 * 1024 * 1024 * 1024;
        const GB = 1024 * 1024 * 1024;
        const MB = 1024 * 1024;

        if (bytes >= TB) {
            return { value: Math.round(bytes / TB * 10) / 10, unit: 'TB' };
        } else if (bytes >= GB) {
            return { value: Math.round(bytes / GB * 10) / 10, unit: 'GB' };
        } else {
            return { value: Math.round(bytes / MB * 10) / 10, unit: 'MB' };
        }
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        localStorage.setItem('modernFilingSettings', JSON.stringify(this.settings));
    }

    /**
     * Save all settings (triggered by global save button)
     */
    async saveAllSettings() {
        try {
            // Get all current setting values from the UI
            const autoSave = document.getElementById('autoSaveSetting');
            const notifications = document.getElementById('notificationsSetting');
            const autoOrganize = document.getElementById('autoOrganizeSetting');
            const enableStorageLimit = document.getElementById('enableStorageLimit');
            const storageLimitValue = document.getElementById('storageLimitValue');
            const storageLimitUnit = document.getElementById('storageLimitUnit');

            // Update settings object
            if (autoSave) this.settings.autoSave = autoSave.checked;
            if (notifications) this.settings.notifications = notifications.checked;
            if (autoOrganize) {
                this.settings.autoOrganize = autoOrganize.checked;
                this.fileSystemService.config.autoOrganize = autoOrganize.checked;
            }

            // Handle storage limit settings
            if (enableStorageLimit) {
                if (enableStorageLimit.checked) {
                    // Apply storage limit
                    const value = parseFloat(storageLimitValue?.value) || 0;
                    const unit = storageLimitUnit?.value || 'GB';
                    if (value > 0) {
                        this.applyStorageLimit();
                    }
                } else {
                    // Disable storage limit
                    this.fileSystemService.disableStorageLimit();
                }
            }

            // Save to localStorage
            this.saveSettings();

            // Force save to FileSystemService config
            this.fileSystemService.saveConfig();

            // Force flush any pending manifest changes
            if (this.fileSystemService.isConnected) {
                await this.fileSystemService.flushChanges();
            }

            this.addNotification('All settings saved successfully', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            this.addNotification('Error saving settings', 'error');
        }
    }

    /**
     * Download file from storage
     */
    async downloadFileFromStorage(fileId) {
        if (!this.useFileSystem) {
            this.addNotification('File content not available (metadata only in browser storage)', 'error');
            return;
        }

        try {
            const { metadata, file } = await this.fileSystemService.getFile(fileId);

            // Create download link
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = metadata.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.addNotification(`Downloading ${metadata.name}...`, 'info');
            this.addActivity('download', `Downloaded "${metadata.name}"`);
        } catch (error) {
            console.error('Error downloading file:', error);
            this.addNotification(`Failed to download file: ${error.message}`, 'error');
        }
    }

    // File Preview Modal
    showFileDetails(file) {
        let modal = document.getElementById('filePreviewModal');

        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'filePreviewModal';
            modal.className = 'file-preview-modal';
            document.body.appendChild(modal);
        }

        const uploadDate = new Date(file.uploadDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        modal.innerHTML = `
            <div class="file-preview-content">
                <div class="file-preview-header">
                    <div class="file-preview-title">
                        <div class="file-preview-icon" style="background: ${this.getFileIconColor(file.type)}">
                            ${this.getFileIcon(file.type)}
                        </div>
                        <div class="file-preview-info">
                            <h3>${file.name}</h3>
                            <p>${file.size} • ${file.type.toUpperCase()}</p>
                        </div>
                    </div>
                    <button class="btn-icon-only" onclick="filingSystem.closeFilePreview()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="file-preview-body">
                    <div class="file-preview-details">
                        <div class="file-preview-detail">
                            <span class="file-preview-detail-label">File Name</span>
                            <span class="file-preview-detail-value">${file.name}</span>
                        </div>
                        <div class="file-preview-detail">
                            <span class="file-preview-detail-label">File Size</span>
                            <span class="file-preview-detail-value">${file.size}</span>
                        </div>
                        <div class="file-preview-detail">
                            <span class="file-preview-detail-label">File Type</span>
                            <span class="file-preview-detail-value">${file.type.toUpperCase()}</span>
                        </div>
                        <div class="file-preview-detail">
                            <span class="file-preview-detail-label">Upload Date</span>
                            <span class="file-preview-detail-value">${uploadDate}</span>
                        </div>
                        <div class="file-preview-detail">
                            <span class="file-preview-detail-label">Security</span>
                            <span class="file-preview-detail-value">${file.encrypted ? '🔒 Encrypted' : '🔓 Not Encrypted'}</span>
                        </div>
                        <div class="file-preview-detail">
                            <span class="file-preview-detail-label">File ID</span>
                            <span class="file-preview-detail-value">${file.id}</span>
                        </div>
                    </div>
                    ${file.encrypted ? `
                        <div style="padding: 1rem; background: rgba(59, 130, 246, 0.1); border-radius: var(--radius-md); border-left: 3px solid var(--accent-primary);">
                            <p style="color: var(--text-primary); margin: 0;">
                                <i class="fas fa-shield-alt"></i> This file is encrypted and protected with a password.
                            </p>
                        </div>
                    ` : ''}
                </div>
                <div class="file-preview-actions">
                    <button class="btn" onclick="filingSystem.closeFilePreview()">
                        <i class="fas fa-times"></i> Close
                    </button>
                    <button class="btn btn-primary" onclick="filingSystem.downloadFile('${file.id}')">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="btn btn-danger" onclick="filingSystem.deleteFile('${file.id}'); filingSystem.closeFilePreview();">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;

        modal.classList.add('active');

        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFilePreview();
            }
        });
    }

    closeFilePreview() {
        const modal = document.getElementById('filePreviewModal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }

    // Notification Panel
    toggleNotificationPanel() {
        let panel = document.getElementById('notificationPanel');

        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'notificationPanel';
            panel.className = 'notification-panel';
            document.body.appendChild(panel);
            this.renderNotificationPanel(panel);
        }

        panel.classList.toggle('active');

        // Mark all as read when opening
        if (panel.classList.contains('active')) {
            this.markAllNotificationsAsRead();
        }
    }

    renderNotificationPanel(panel) {
        const notifications = this.notifications.slice(0, 20);

        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3>Notifications</h3>
                <div class="notification-panel-actions">
                    <button class="btn-icon-only" onclick="filingSystem.clearAllNotifications()" title="Clear All">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-icon-only" onclick="filingSystem.toggleNotificationPanel()" title="Close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="notification-panel-body">
                ${notifications.length === 0 ? `
                    <div class="notification-item">
                        <div class="notification-item-content">
                            <div class="notification-item-text">
                                <div class="notification-item-title">No notifications</div>
                                <div class="notification-item-description">You're all caught up!</div>
                            </div>
                        </div>
                    </div>
                ` : notifications.map((notif, index) => `
                    <div class="notification-item ${index < 3 ? 'unread' : ''}">
                        <div class="notification-item-content">
                            <div class="notification-item-icon" style="background: ${this.getNotificationColor(notif.type)}">
                                <i class="fas fa-${this.getNotificationIcon(notif.type)}"></i>
                            </div>
                            <div class="notification-item-text">
                                <div class="notification-item-title">${notif.message}</div>
                                <div class="notification-item-time">${this.formatRelativeTime(notif.timestamp)}</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getNotificationColor(type) {
        const colors = {
            'success': 'var(--accent-success)',
            'error': 'var(--accent-danger)',
            'warning': 'var(--accent-warning)',
            'info': 'var(--accent-info)'
        };
        return colors[type] || 'var(--accent-primary)';
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'bell';
    }

    markAllNotificationsAsRead() {
        // Update notification badge
        const badge = document.getElementById('notificationCount');
        if (badge) {
            badge.textContent = '0';
            badge.style.display = 'none';
        }
    }

    clearAllNotifications() {
        this.notifications = [];
        const panel = document.getElementById('notificationPanel');
        if (panel) {
            this.renderNotificationPanel(panel);
        }
        this.addNotification('All notifications cleared', 'success');
    }

    findFile(fileId) {
        return [...this.files, ...this.secureFiles].find(f => f.id === fileId);
    }

    closeModals() {
        const modals = document.querySelectorAll('.modal.active, .file-preview-modal.active');
        modals.forEach(modal => modal.classList.remove('active'));
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

window.logout = function() {
    if (window.filingSystem) {
        window.filingSystem.logout();
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

  // NOTE: This function is overriding the class method - it now properly delegates to FileSystem or localStorage
  ModernFilingSystem.prototype.handleFileUpload = function(files) {
    console.log('handleFileUpload (prototype) called with files:', files);
    if (!files || files.length === 0) return;

    // Always show rename modal for both FileSystem and localStorage
    console.log('Showing rename modal for upload');
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
    // Check if we should use FileSystem API
    if (this.useFileSystem && this.fileSystemService && this.fileSystemService.isConnected) {
      console.log('Processing upload queue to FileSystem');
      await this.processUploadQueueToFileSystem(items);
      return;
    }

    // Fallback to localStorage
    console.log('Processing upload queue to localStorage');
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

  // Process upload queue to FileSystem storage
  ModernFilingSystem.prototype.processUploadQueueToFileSystem = async function(items) {
    this.showUploadProgress(items.length);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      try {
        // Check storage quota
        const hasSpace = await this.fileSystemService.checkStorageQuota(item.file.size);
        if (!hasSpace) {
          this.addNotification(`Storage limit reached. Cannot upload "${item.newName || item.originalName}"`, 'error');
          failCount++;
          continue;
        }

        // Determine encryption password if needed
        let encryptionPassword = null;
        if (item.shouldEncrypt) {
          encryptionPassword = item.customPassword || item.generatedPassword;
          if (!encryptionPassword || encryptionPassword.length < 6) {
            this.addNotification(`Password too short for "${item.newName || item.originalName}". Minimum 6 characters.`, 'error');
            failCount++;
            continue;
          }
        }

        // Create a renamed file if needed
        let fileToUpload = item.file;
        if (item.newName && item.newName !== item.originalName) {
          fileToUpload = new File([item.file], item.newName, { type: item.file.type });
        }

        // Save file to disk
        const metadata = await this.fileSystemService.saveFile(fileToUpload, {
          encrypt: item.shouldEncrypt,
          password: encryptionPassword
        });

        // Store password hint for auto-generated passwords
        if (item.shouldEncrypt && item.passwordType === 'auto' && encryptionPassword) {
          const hint = (encryptionPassword.length > 4) ? (encryptionPassword.slice(0,2) + '…' + encryptionPassword.slice(-2)) : encryptionPassword;
          metadata.storedGeneratedPasswordHint = hint;
        }

        // Update in-memory arrays
        if (item.shouldEncrypt) {
          this.secureFiles.push(metadata);
        } else {
          this.files.push(metadata);
        }

        successCount++;
        this.updateUploadProgress(i + 1, items.length);
        this.addNotification(`File "${item.newName || item.originalName}" uploaded successfully${item.shouldEncrypt ? ' and encrypted' : ''}`, 'success');

      } catch (error) {
        console.error(`Error uploading ${item.originalName}:`, error);
        this.addNotification(`Failed to upload "${item.originalName}": ${error.message}`, 'error');
        failCount++;
      }
    }

    // Finalize upload
    setTimeout(() => {
      this.hideUploadProgress();
      this.updateStats();
      this.updateStorageInfo();
      this.renderCurrentPage();

      if (successCount > 0) {
        this.addActivity('upload', `Uploaded ${successCount} file${successCount > 1 ? 's' : ''} to storage`);
      }

      this.resetUploadForm();
    }, 500);

    // Clear file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
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

  // Global helper function for setup modal preset buttons
  window.setSetupLimitPreset = function(value, unit) {
    const limitValue = document.getElementById('setupStorageLimitValue');
    const limitUnit = document.getElementById('setupStorageLimitUnit');

    if (limitValue) limitValue.value = value;
    if (limitUnit) limitUnit.value = unit;
  };

})(); // end IIFE
