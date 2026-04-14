/**
 * Authentication Guard Script
 * Checks if user is authenticated before allowing access to the app
 * Run this at the top of index.html before loading the main app
 */

import AuthService from './AuthService.js';

/**
 * Initialize auth protection for index.html
 */
export async function initAuthGuard() {
  // Check if user is authenticated
  if (!AuthService.isAuthenticated()) {
    // Not authenticated - redirect to login
    console.log('User not authenticated. Redirecting to login...');
    window.location.href = '/login.html';
    return false;
  }

  // User is authenticated
  console.log('User authenticated. Loading app...');

  try {
    // Verify token is still valid by calling the API
    const userResult = await AuthService.getCurrentUser();

    if (!userResult.success) {
      // Token is invalid - clear and redirect
      console.warn('Token validation failed:', userResult.error);
      AuthService.clearToken();
      window.location.href = '/login.html';
      return false;
    }

    // Update user data in localStorage
    if (userResult.data && userResult.data.user) {
      AuthService.setUser(userResult.data.user);
      console.log('User profile loaded:', userResult.data.user.username);
    }

    return true;
  } catch (error) {
    console.error('Auth guard error:', error);
    AuthService.clearToken();
    window.location.href = '/login.html';
    return false;
  }
}

/**
 * Load user information from server
 */
export async function loadUserProfile() {
  try {
    const result = await AuthService.getCurrentUser();
    if (result.success) {
      return result.data.user;
    }
    return null;
  } catch (error) {
    console.error('Failed to load user profile:', error);
    return null;
  }
}

/**
 * Logout user
 */
export function logout() {
  AuthService.logout();
  window.location.href = '/login.html';
}

/**
 * Update user info in the UI
 */
export function updateUserUI(user) {
  if (!user) return;

  // Update user name in nav
  const userNameEl = document.querySelector('.user-name');
  if (userNameEl) {
    userNameEl.textContent = user.fullName || user.username;
  }

  //Update user role
  const userRoleEl = document.querySelector('.user-role');
  if (userRoleEl) {
    userRoleEl.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  }

  // Update dropdown user info
  const dropdownName = document.querySelector('.user-dropdown-name');
  if (dropdownName) {
    dropdownName.textContent = user.fullName || user.username;
  }

  const dropdownRole = document.querySelector('.user-dropdown-role');
  if (dropdownRole) {
    dropdownRole.textContent = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';
  }
}

/**
 * Setup logout functionality
 */
export function setupLogout() {
  // Find logout button in user dropdown
  const logoutBtn = document.querySelector('.logout-action');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out?')) {
        logout();
      }
    });
  }

  // Also set up any other logout triggers
  const userDropdown = document.getElementById('userDropdown');
  const userProfile = document.getElementById('userProfileMenu');

  if (userDropdown && userProfile) {
    userProfile.addEventListener('click', () => {
      userDropdown.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
      if (!userProfile.contains(e.target)) {
        userDropdown.classList.remove('visible');
      }
    });
  }
}
