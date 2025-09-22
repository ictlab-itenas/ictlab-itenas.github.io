// Configuration
const GOOGLE_CLIENT_ID = '932373464615-f07kgcbiulom1g59nrs5i6k696m5lq3t.apps.googleusercontent.com';

// Import Supabase functions
let loginSupabaseModule;
let saveUserProfile;
let getUserProfile;

// Dynamically import Supabase module
async function loadLoginSupabase() {
  try {
    if (!loginSupabaseModule) {
      loginSupabaseModule = await import('./supabase.js');
      saveUserProfile = loginSupabaseModule.saveUserProfile;
      getUserProfile = loginSupabaseModule.getUserProfile;
      console.log('Login Supabase module loaded successfully');
    }
  } catch (error) {
    console.error('Failed to load Login Supabase module:', error);
    showAlert('Terjadi kesalahan saat memuat sistem login. Silakan coba lagi.', 'error');
  }
}

// Core login functionality
function initializeGoogleSignIn() {
  if (window.google) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    google.accounts.id.renderButton(
      document.querySelector('.g_id_signin'),
      {
        theme: 'filled_blue',
        size: 'large',
        type: 'standard',
        shape: 'rectangular',
        text: 'signin_with',
        logo_alignment: 'left',
        width: '100%'
      }
    );
  }
}

async function handleCredentialResponse(response) {
  console.log("Processing login credentials...");
  showLoading();
  
  const userInfo = parseJwt(response.credential);
  
  if (!userInfo?.email) {
    hideLoading();
    showAlert('Gagal mendapatkan informasi email. Silakan coba lagi.', 'error');
    return;
  }
  
  if (!userInfo.email.endsWith('@mhs.itenas.ac.id')) {
    hideLoading();
    showAlert('Bukan akun mahasiswa ITENAS! Hanya email dengan domain @mhs.itenas.ac.id yang diizinkan.', 'error');
    return;
  }
  
  if (!userInfo.email_verified) {
    hideLoading();
    showAlert('Email belum terverifikasi. Silakan verifikasi email Anda terlebih dahulu.', 'error');
    return;
  }
  
  // Load Supabase module if not already loaded
  if (!loginSupabaseModule) {
    await loadLoginSupabase();
  }
  
  // Save user to Supabase profiles table
  if (saveUserProfile) {
    try {
      const result = await saveUserProfile(userInfo);
      if (!result.success) {
        console.warn('Failed to save user to Supabase:', result.error);
        // We'll still allow login even if Supabase save fails
      }
    } catch (error) {
      console.error('Unexpected error saving user to Supabase:', error);
      // We'll still allow login even if Supabase save fails
    }
  }
  
  saveUserSession(userInfo);
  hideLoading();
  showSuccessModal();
}

function saveUserSession(userInfo) {
  const sessionData = {
    userInfo: JSON.stringify(userInfo),
    userEmail: userInfo.email,
    userId: userInfo.sub, // Save user ID for profile lookup
    isLoggedIn: 'true',
    loginMethod: 'google',
    loginTime: new Date().toISOString(),
    lastActiveTime: new Date().toISOString(),
    sessionValid: 'true'
  };
  
  Object.entries(sessionData).forEach(([key, value]) => {
    localStorage.setItem(key, value);
  });
  
  console.log('User session saved successfully');
}



async function checkLoginStatus() {
  const { isLoggedIn, userEmail, loginTime, sessionValid } = {
    isLoggedIn: localStorage.getItem('isLoggedIn'),
    userEmail: localStorage.getItem('userEmail'),
    loginTime: localStorage.getItem('loginTime'),
    sessionValid: localStorage.getItem('sessionValid')
  };
  
  console.log('Checking login status:', { isLoggedIn, userEmail, sessionValid });
  
  if (isLoggedIn === 'true' && userEmail?.endsWith('@mhs.itenas.ac.id') && sessionValid === 'true') {
    if (loginTime) {
      const hoursDiff = (new Date() - new Date(loginTime)) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        console.log('Session expired, clearing...');
        clearUserSession();
        return;
      }
    }
    
    if (!document.body.classList.contains('redirecting')) {
      document.body.classList.add('redirecting');
      console.log('Valid session found, redirecting based on role...');
      
      // Load Supabase module if not already loaded
      if (!loginSupabaseModule) {
        await loadLoginSupabase();
      }
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      
      if (userId && getUserProfile) {
        try {
          // Get user profile to check role
          const profileResult = await getUserProfile(userId);
          if (profileResult.success && profileResult.data) {
            const userRole = profileResult.data.role;
            console.log('User role:', userRole);
            
            // Redirect based on role
            if (userRole === 'admin') {
              console.log('Redirecting admin to dashboard...');
              setTimeout(() => window.location.href = 'admin/dashboard.html', 800);
              return;
            }
          }
        } catch (error) {
          console.error('Error checking user role:', error);
        }
      }
      
      // Default redirect to soal.html for non-admin users
      console.log('Redirecting to bank soal...');
      setTimeout(() => window.location.href = 'soal.html', 800);
    }
  }
}

function clearUserSession() {
  ['isLoggedIn', 'userInfo', 'userEmail', 'loginMethod', 'loginTime', 'lastActiveTime', 'sessionValid']
    .forEach(key => localStorage.removeItem(key));
}

// UI functions
function showLoading() {
  document.getElementById('loadingOverlay').classList.add('active');
}

function hideLoading() {
  document.getElementById('loadingOverlay').classList.remove('active');
}

function showSuccessModal() {
  const modal = document.getElementById('successModal');
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  
  modal.querySelector('h3').textContent = `Selamat datang, ${userInfo.given_name || userInfo.name || 'User'}!`;
  modal.querySelector('p').textContent = 'Anda berhasil login dengan akun ITENAS.';
  modal.classList.add('active');
  
  // Add click event to the continue button
  const continueBtn = modal.querySelector('.continue-btn');
  continueBtn.onclick = function() {
    redirectToHome();
  };
}

async function redirectToHome() {
  console.log('Redirecting based on user role...');
  if (!document.body.classList.contains('redirecting')) {
    document.body.classList.add('redirecting');
    
    // Load Supabase module if not already loaded
    if (!loginSupabaseModule) {
      await loadLoginSupabase();
    }
    
    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');
    
    if (userId && getUserProfile) {
      try {
        // Get user profile to check role
        const profileResult = await getUserProfile(userId);
        if (profileResult.success && profileResult.data) {
          const userRole = profileResult.data.role;
          console.log('User role:', userRole);
          
          // Redirect based on role
          if (userRole === 'admin') {
            console.log('Redirecting admin to dashboard...');
            setTimeout(() => window.location.href = 'admin/dashboard.html', 1000);
            return;
          }
        }
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    }
    
    // Default redirect to soal.html for non-admin users
    console.log('Redirecting to bank soal...');
    setTimeout(() => window.location.href = 'soal.html', 1000);
  }
}

function showAlert(message, type = 'error') {
  const alertModal = document.createElement('div');
  alertModal.className = 'alert-modal';
  alertModal.innerHTML = `
    <div class="alert-content">
      <div class="alert-icon ${type}">
        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'check-circle'}"></i>
      </div>
      <h3>${type === 'error' ? 'Login Gagal' : 'Berhasil'}</h3>
      <p>${message}</p>
      <button onclick="this.closest('.alert-modal').remove()" class="alert-btn ${type}">
        Tutup
      </button>
    </div>
  `;
  
  document.body.appendChild(alertModal);
  setTimeout(() => alertModal.remove(), 5000);
}

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal(modalId);
      }
    });
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Close modals with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    ['termsModal', 'privacyModal'].forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal && modal.style.display === 'flex') {
        closeModal(modalId);
      }
    });
  }
});

// Utility functions
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  console.log('Login page loaded, initializing...');
  
  setTimeout(checkLoginStatus, 300);
  
  if (GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
    console.warn('Google Client ID not configured.');
    showAlert('Google OAuth not configured. Please contact administrator.', 'error');
  }
  
  if (window.google) {
    initializeGoogleSignIn();
  } else {
    window.addEventListener('load', () => setTimeout(initializeGoogleSignIn, 1000));
  }
});

// Handle page visibility
document.addEventListener('visibilitychange', function() {
  if (!document.hidden && localStorage.getItem('isLoggedIn') === 'true') {
    localStorage.setItem('lastActiveTime', new Date().toISOString());
  }
});
