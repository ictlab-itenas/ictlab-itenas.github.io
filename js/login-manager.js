/**
 * Login Utilities for ICT Lab Website
 * Manages user authentication state across all pages
 */

// Import Supabase functions
let loginSupabaseModule;
let loginGetUserProfile;

// Dynamically import Supabase module
async function loadLoginSupabase() {
  try {
    if (!loginSupabaseModule) {
      loginSupabaseModule = await import('./supabase.js');
      loginGetUserProfile = loginSupabaseModule.getUserProfile;
      console.log('Login Supabase module loaded successfully');
    }
  } catch (error) {
    console.error('Failed to load Login Supabase module:', error);
  }
}

class LoginManager {
  constructor() {
    this.storageKeys = {
      isLoggedIn: 'isLoggedIn',
      userInfo: 'userInfo',
      loginMethod: 'loginMethod',
      loginTime: 'loginTime'
    };
    
    // Load Supabase module
    loadLoginSupabase();
    
    this.init();
  }

  init() {
    // Check if user session is expired (24 hours)
    this.checkSessionExpiry();
    
    // Update UI based on login status
    this.updateLoginUI();
  }

  // Check if user is logged in
  isUserLoggedIn() {
    const isLoggedIn = localStorage.getItem(this.storageKeys.isLoggedIn) === 'true';
    const userEmail = localStorage.getItem('userEmail');
    
    // Additional validation: check if email is from @itenas.ac.id domain
    if (isLoggedIn && userEmail) {
      return userEmail.endsWith('@mhs.itenas.ac.id');
    }
    
    return false;
  }

  // Get user information
  getUserInfo() {
    const userInfo = localStorage.getItem(this.storageKeys.userInfo);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Get login method
  getLoginMethod() {
    return localStorage.getItem(this.storageKeys.loginMethod) || 'none';
  }

  // Check session expiry (24 hours)
  checkSessionExpiry() {
    const loginTime = localStorage.getItem(this.storageKeys.loginTime);
    if (loginTime) {
      const loginDate = new Date(loginTime);
      const now = new Date();
      const diffHours = (now - loginDate) / (1000 * 60 * 60);
      
      // Session expires after 24 hours
      if (diffHours > 24) {
        this.logout();
      }
    }
  }

  // Logout user
  logout() {
    // Clear all login-related data
    Object.values(this.storageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Also clear userEmail
    localStorage.removeItem('userEmail');
    localStorage.removeItem('quizResults');
    
    // Redirect to login page if not already there
        if (!window.location.pathname.includes('login.html')) {
          window.location.href = '/login.html';
    }
  }

  // Update UI elements based on login status
  updateLoginUI() {
    const isLoggedIn = this.isUserLoggedIn();
    const userInfo = this.getUserInfo();
    
    // Update navbar login link
    this.updateNavbarLoginLink(isLoggedIn, userInfo);
    
    // Show/hide login-specific content
    this.toggleLoginContent(isLoggedIn);
  }

  // Update navbar login link
  updateNavbarLoginLink(isLoggedIn, userInfo) {
    // For main navbar (index.html)
    const mainNavbar = document.querySelector('.navbar-menu');
    if (mainNavbar) {
      // match any href that ends with login.html to be resilient to relative paths
      const loginLink = mainNavbar.querySelector('a[href$="login.html"]');
      if (loginLink) {
        if (isLoggedIn && userInfo) {
          // Show only first name
          const firstName = userInfo && (userInfo.given_name || userInfo.name) ? (userInfo.given_name || userInfo.name).split(' ')[0] : (localStorage.getItem('userEmail') || 'User');
          loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${firstName}`;
          loginLink.href = '#';
          loginLink.onclick = (e) => {
            e.preventDefault();
            this.showUserMenu(e);
          };
        } else {
          loginLink.innerHTML = 'Login';
              loginLink.href = '/login.html';
          loginLink.onclick = null;
        }
      }
    }

    // For catalog navbar
    const catalogNavbar = document.querySelector('.catalog-navbar-menu');
    if (catalogNavbar) {
      const loginLink = catalogNavbar.querySelector('a[href$="login.html"]');
      const logoutBtn = catalogNavbar.querySelector('.catalog-navbar-logout');
      
      if (loginLink && logoutBtn) {
        if (isLoggedIn && userInfo) {
          // For admin dashboard, hide login link and show logout button
          if (window.location.pathname.includes('/admin/')) {
            loginLink.style.display = 'none';
            logoutBtn.style.display = 'flex';
          } else {
            // For other pages, show first name in login link and hide logout button
            const firstName = userInfo && (userInfo.given_name || userInfo.name) ? (userInfo.given_name || userInfo.name).split(' ')[0] : (localStorage.getItem('userEmail') || 'User');
            loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${firstName}`;
            loginLink.href = '#';
            loginLink.onclick = (e) => {
              e.preventDefault();
              this.showUserMenu(e);
            };
            loginLink.style.display = 'flex';
            logoutBtn.style.display = 'none';
          }
        } else {
          // Show login link and hide logout button when not logged in
          loginLink.innerHTML = 'Login';
              loginLink.href = '/login.html';
          loginLink.onclick = null;
          loginLink.style.display = 'flex';
          logoutBtn.style.display = 'none';
        }
      }
    }
  }

  // Show user dropdown menu
  async showUserMenu(event) {
    // Remove existing menu if any
    const existingMenu = document.querySelector('.user-dropdown-menu');
    if (existingMenu) {
      existingMenu.remove();
    }

    const userInfo = this.getUserInfo();
    const loginMethod = this.getLoginMethod();
    
    // Check if user is admin
    let isAdmin = false;
    if (loginSupabaseModule && loginGetUserProfile) {
      try {
        const userId = userInfo?.sub || localStorage.getItem('userId');
        if (userId) {
          const profileResult = await loginGetUserProfile(userId);
          if (profileResult.success && profileResult.data) {
            isAdmin = profileResult.data.role === 'admin';
          }
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    }
    
    // Compute display name (first name only)
    const displayName = userInfo && (userInfo.given_name || userInfo.name) ? (userInfo.given_name || userInfo.name).split(' ')[0] : (localStorage.getItem('userEmail') || 'User');

    // Create dropdown menu with centered avatar and first name only
    let menuHTML = `
      <div class="user-info">
        <img src="${userInfo?.picture || 'img/logo-bg.png'}" alt="Profile" class="user-avatar">
        <div class="user-name">${displayName}</div>
        <div class="user-email">${localStorage.getItem('userEmail') || userInfo?.email || ''}</div>
        <div class="login-method">via ${loginMethod === 'google' ? 'Google' : 'Guest'}</div>
      </div>
      <div class="menu-divider"></div>
    `;
    
    // Add admin dashboard link if user is admin
    if (isAdmin) {
      menuHTML += `
        <a href="/admin/dashboard.html" class="menu-item">
          <i class="fas fa-cog"></i> Admin Dashboard
        </a>
        <div class="menu-divider"></div>
      `;
    }
    
    menuHTML += `
      <button class="menu-item" onclick="loginManager.logout()">
        <i class="fas fa-sign-out-alt"></i> Logout
      </button>
    `;

    const menu = document.createElement('div');
    menu.className = 'user-dropdown-menu';
    menu.innerHTML = menuHTML;

    // Position menu
    const rect = event.target.getBoundingClientRect();
    menu.style.position = 'fixed';
    menu.style.top = (rect.bottom + 10) + 'px';
    menu.style.right = (window.innerWidth - rect.right) + 'px';
    menu.style.zIndex = '10000';

    document.body.appendChild(menu);

    // Close menu when clicking outside
    setTimeout(() => {
      document.addEventListener('click', function closeMenu(e) {
        if (!menu.contains(e.target) && e.target !== event.target) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
        }
      });
    }, 100);
  }

  // Toggle login-specific content
  toggleLoginContent(isLoggedIn) {
    // Show/hide elements based on data attributes
    const loginOnlyElements = document.querySelectorAll('[data-login-required="true"]');
    const guestOnlyElements = document.querySelectorAll('[data-guest-only="true"]');
    
    loginOnlyElements.forEach(element => {
      element.style.display = isLoggedIn ? 'block' : 'none';
    });
    
    guestOnlyElements.forEach(element => {
      element.style.display = isLoggedIn ? 'none' : 'block';
    });
  }

  // Require login for certain actions
  requireLogin(callback) {
    if (this.isUserLoggedIn()) {
      callback();
    } else {
      this.showLoginPrompt();
    }
  }

  // Show login prompt modal
  showLoginPrompt() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'login-prompt-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Login Required</h3>
          <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>You need to login to access this feature.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">
            Cancel
          </button>
              <button class="btn-primary" onclick="window.location.href='/login.html'">
            Login
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  }

  // Get user display name
  getUserDisplayName() {
    const userInfo = this.getUserInfo();
    const userEmail = localStorage.getItem('userEmail');
    
    if (!this.isUserLoggedIn()) return 'Guest';
    
    if (userInfo) {
      return userInfo.name || userInfo.given_name || userEmail || 'User';
    }
    
    return userEmail || 'User';
  }

  // Check if user has specific permissions (placeholder for future use)
  hasPermission(permission) {
    if (!this.isUserLoggedIn()) return false;
    
    // In the future, you can implement role-based permissions here
    // For now, all logged-in users have basic permissions
    return true;
  }
}

// Create global instance
const loginManager = new LoginManager();

// Add styles for user dropdown and login prompt
const loginStyles = `
<style>
.user-dropdown-menu {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 250px;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.user-info {
  padding: 20px 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  background: #f8f9fa;
  text-align: center;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.user-name {
  font-weight: 700;
  color: #1a1a1a;
  font-size: 1rem;
  margin-top: 6px;
}

.user-email {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}

.login-method {
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.menu-divider {
  height: 1px;
  background: #e0e0e0;
}

.menu-item {
  width: 100%;
  padding: 12px 20px;
  border: none;
  background: white;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  color: #666;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: #f0f0f0;
  color: #1a1a1a;
}

.login-prompt-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.login-prompt-modal .modal-content {
  background: white;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
  overflow: hidden;
}

.modal-header {
  padding: 20px 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #999;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.modal-footer {
  padding: 0 20px 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secondary, .btn-primary {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f0f0f0;
  color: #666;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #4285F4;
  color: white;
}

.btn-primary:hover {
  background: #3367d6;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', loginStyles);
