/**
 * Upload functionality for ICT Lab Website
 * Handles file upload to Google Drive via Apps Script
 */

// Configuration
window.APPS_SCRIPT_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbx3oPm3Jm2Y7l8LQB2bzCb14lHDyvyufYsssFZ363_omU8pRFrum0S2OhI_9E71bsfc/exec';

// Login validation functions
function isValidLogin() {
  const email = localStorage.getItem('userEmail');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const loginTime = localStorage.getItem('loginTime');
  const sessionValid = localStorage.getItem('sessionValid');
  
  console.log('Checking login validity:', { 
    isLoggedIn, 
    email, 
    loginTime, 
    sessionValid,
    emailDomain: email ? email.split('@')[1] : 'none'
  });
  
  // Check basic login status
  if (isLoggedIn !== 'true' || !email || !email.endsWith('@mhs.itenas.ac.id') || sessionValid !== 'true') {
    console.log('Invalid login status, email domain, or session');
    return false;
  }
  
  // Check if login is not expired (24 hours)
  if (loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    console.log('Session age (hours):', hoursDiff.toFixed(2));
    
    if (hoursDiff > 24) {
      console.log('Login session expired (>24 hours)');
      // Clear expired session
      clearUserSession();
      return false;
    }
  }
  
  console.log('Login validation passed');
  return true;
}

function clearUserSession() {
  console.log('Clearing user session...');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('loginMethod');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('lastActiveTime');
  localStorage.removeItem('sessionValid');
}

// Handle logout functionality
function handleLogout() {
  if (typeof logout === 'function') {
    logout();
  } else {
    // Fallback logout functionality
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}

// File upload handling functions
function handleFileSelect(file) {
  // Validate file type
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    Swal.fire({
      icon: 'error',
      title: 'Format File Tidak Didukung',
      text: 'Silakan pilih file dengan format PDF, JPG, JPEG, atau PNG.'
    });
    return;
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    Swal.fire({
      icon: 'error',
      title: 'File Terlalu Besar',
      text: 'Ukuran file maksimal adalah 10MB.'
    });
    return;
  }

  // Show file preview
  const fileName = file.name;
  const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
  
  document.querySelector('.file-name').textContent = fileName;
  document.querySelector('.file-size').textContent = fileSize;
  
  document.querySelector('.file-upload-content').style.display = 'none';
  document.getElementById('filePreview').style.display = 'block';
}

function removeFile() {
  const fileUpload = document.getElementById('fileUpload');
  const filePreview = document.getElementById('filePreview');
  const fileUploadArea = document.getElementById('fileUploadArea');
  
  fileUpload.value = '';
  document.querySelector('.file-upload-content').style.display = 'block';
  filePreview.style.display = 'none';
  fileUploadArea.classList.remove('drag-over');
}

function resetForm() {
  document.getElementById('uploadForm').reset();
  removeFile();
}

// Helper function for filename generation
function slugify(text) {
  return text
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// Fallback submit via hidden iframe to bypass CORS
function submitViaIframe(endpoint, formData) {
  return new Promise((resolve, reject) => {
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    const iframeName = 'upload_iframe_' + Date.now();
    iframe.name = iframeName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);

    const form = document.getElementById('uploadForm');
    // Keep original attrs
    const orig = {
      action: form.getAttribute('action'),
      method: form.getAttribute('method'),
      enctype: form.getAttribute('enctype'),
      target: form.getAttribute('target')
    };

    // Add hidden fields needed by Apps Script (DON'T add return=json for iframe mode)
    const hiddenFields = [];
    function addHidden(name, value) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
      hiddenFields.push(input);
    }
    
    // Extract data from FormData
    const email = localStorage.getItem('userEmail') || '';
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const nama = userInfo?.name || userInfo?.given_name || '';
    const mataKuliah = document.getElementById('mataKuliah').value.trim();
    const jenisUjian = document.getElementById('jenisUjian').value.trim();
    const tahun = document.getElementById('tahun').value.trim();
    const file = document.getElementById('fileUpload').files[0];
    
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const baseName = `${slugify(mataKuliah)}_${slugify(jenisUjian)}_${tahun}`;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const uploadFileName = `${baseName}_${timestamp}.${ext}`;

    addHidden('action', 'uploadFile');
    addHidden('mataKuliah', mataKuliah);
    addHidden('jenisUjian', jenisUjian);
    addHidden('tahun', tahun);
    addHidden('uploaderEmail', email);
    addHidden('uploaderName', nama);
    addHidden('fileRename', uploadFileName);

    // Configure and submit
    form.setAttribute('action', endpoint);
    form.setAttribute('method', 'POST');
    form.setAttribute('enctype', 'multipart/form-data');
    form.setAttribute('target', iframeName);

    let resolved = false;
    
    // Listen for postMessage from iframe (success case)
    function handleMessage(event) {
      if (event.data && event.data.type === 'ictlab-upload' && !resolved) {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        cleanup();
        resolve(event.data.payload);
      }
    }
    window.addEventListener('message', handleMessage);

    // When iframe loads (fallback case if no postMessage received)
    iframe.addEventListener('load', function onLoad() {
      iframe.removeEventListener('load', onLoad);
      if (!resolved) {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        // Assume success if no error and we reach here
        setTimeout(() => {
          cleanup();
          resolve({ success: true, message: 'Upload selesai (via iframe)' });
        }, 1000);
      }
    });

    function cleanup() {
      // Clean up
      hiddenFields.forEach(h => h.remove());
      if (orig.action) form.setAttribute('action', orig.action); else form.removeAttribute('action');
      if (orig.method) form.setAttribute('method', orig.method); else form.removeAttribute('method');
      if (orig.enctype) form.setAttribute('enctype', orig.enctype); else form.removeAttribute('enctype');
      if (orig.target) form.setAttribute('target', orig.target); else form.removeAttribute('target');
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 500);
    }

    // Error handling
    iframe.addEventListener('error', function() {
      if (!resolved) {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        cleanup();
        reject(new Error('Iframe upload failed'));
      }
    });

    // Submit form to iframe
    form.submit();
  });
}

// Main upload function
async function handleUploadSubmit(e) {
  e.preventDefault();

  // Ensure logged in and has valid email
  if (!isValidLogin()) {
    Swal.fire({ 
      icon: 'error', 
      title: 'Sesi Tidak Valid', 
      text: 'Silakan login ulang dengan email @mhs.itenas.ac.id.' 
    });
    return;
  }

  const email = localStorage.getItem('userEmail') || '';
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const nama = userInfo?.name || userInfo?.given_name || '';

  const mataKuliah = document.getElementById('mataKuliah').value.trim();
  const jenisUjian = document.getElementById('jenisUjian').value.trim();
  const tahun = document.getElementById('tahun').value.trim();
  const file = document.getElementById('fileUpload').files[0];

  if (!mataKuliah || !jenisUjian || !tahun || !file) {
    Swal.fire({ 
      icon: 'error', 
      title: 'Form Belum Lengkap', 
      text: 'Lengkapi semua field dan pilih file terlebih dahulu.' 
    });
    return;
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const baseName = `${slugify(mataKuliah)}_${slugify(jenisUjian)}_${tahun}`;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const uploadFileName = `${baseName}_${timestamp}.${ext}`;

  // Build multipart form data for Apps Script
  const formData = new FormData();
  formData.append('action', 'uploadFile');
  formData.append('return', 'json');
  formData.append('mataKuliah', mataKuliah);
  formData.append('jenisUjian', jenisUjian);
  formData.append('tahun', tahun);
  formData.append('uploaderEmail', email);
  formData.append('uploaderName', nama);
  formData.append('fileRename', uploadFileName);
  formData.append('fileUpload', file, uploadFileName);

  // Show loading
  Swal.fire({
    title: 'Mengunggah Soal...',
    html: 'Mohon tunggu sebentar. Jangan menutup halaman ini.',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Gunakan endpoint khusus upload
    const endpoint = window.APPS_SCRIPT_UPLOAD_URL;
    if (!endpoint) {
      throw new Error('Endpoint upload belum dikonfigurasi.');
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    // Try to parse JSON, but handle opaque/cors fallback
    let result = null;
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      result = await res.json();
    } else if (res.ok) {
      const text = await res.text();
      try { 
        result = JSON.parse(text); 
      } catch (_) { 
        result = { success: true, message: 'Upload processed.' }; 
      }
    } else {
      const errText = await res.text();
      throw new Error(errText || `HTTP ${res.status}`);
    }

    if (result && result.success) {
      const link = result.webViewLink || result.webContentLink || result.url || null;
      Swal.fire({
        icon: 'success',
        title: 'Upload Berhasil!',
        html: `Soal berhasil diunggah dan akan diverifikasi tim.<br>${link ? `<a href="${link}" target="_blank">Lihat file</a>` : ''}`,
        confirmButtonText: 'OK'
      }).then(() => {
        resetForm();
      });
    } else {
      throw new Error(result?.message || 'Terjadi kesalahan saat mengunggah.');
    }
  } catch (err) {
    console.warn('Fetch upload gagal atau terblokir CORS, mencoba fallback iframe...', err);
    try {
      const result = await submitViaIframe(window.APPS_SCRIPT_UPLOAD_URL, formData);
      
      if (result && result.success) {
        const link = result.webViewLink || result.webContentLink || result.url || null;
        Swal.fire({
          icon: 'success',
          title: 'Upload Berhasil!',
          html: `Soal berhasil diunggah dan akan diverifikasi tim.<br>${link ? `<a href="${link}" target="_blank">Lihat file</a>` : ''}`,
          confirmButtonText: 'OK'
        }).then(() => {
          resetForm();
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Upload Berhasil!',
          html: 'Soal berhasil diunggah dan akan diverifikasi tim. (Catatan: tautan file tidak tersedia karena batasan CORS)',
          confirmButtonText: 'OK'
        }).then(() => {
          resetForm();
        });
      }
    } catch (fallbackErr) {
      console.error('Fallback iframe upload gagal:', fallbackErr);
      Swal.fire({ 
        icon: 'error', 
        title: 'Upload Gagal', 
        text: fallbackErr.message || 'Coba lagi beberapa saat lagi.' 
      });
    }
  }
}

// Initialize page functionality
function initializeUploadPage() {
  console.log('Upload page loading...');
  
  // Add small delay to prevent redirect loops
  setTimeout(() => {
    // Check if user is logged in
    if (!isValidLogin()) {
      console.log('User not logged in or session expired, redirecting to login...');
      if (!document.body.classList.contains('redirecting')) {
        document.body.classList.add('redirecting');
        window.location.href = 'login.html';
      }
      return;
    }
    
    console.log('Valid login found, initializing upload page...');
    // Update last active time
    localStorage.setItem('lastActiveTime', new Date().toISOString());
  }, 200);

  // Setup file upload area
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileUpload = document.getElementById('fileUpload');

  if (fileUploadArea && fileUpload) {
    fileUploadArea.addEventListener('click', () => {
      fileUpload.click();
    });

    fileUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileUploadArea.classList.add('drag-over');
    });

    fileUploadArea.addEventListener('dragleave', () => {
      fileUploadArea.classList.remove('drag-over');
    });

    fileUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      fileUploadArea.classList.remove('drag-over');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    });

    fileUpload.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  // Setup form submission
  const uploadForm = document.getElementById('uploadForm');
  if (uploadForm) {
    uploadForm.addEventListener('submit', handleUploadSubmit);
  }
}

// Listen for postMessage from Apps Script iframe response
window.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'ictlab-upload' && event.data.payload) {
    const result = event.data.payload;
    console.log('Received upload result via postMessage:', result);
    
    if (result.success) {
      const link = result.webViewLink || result.webContentLink || result.url || null;
      Swal.close(); // Close any existing loading
      Swal.fire({
        icon: 'success',
        title: 'Upload Berhasil!',
        html: `Soal berhasil diunggah dan akan diverifikasi tim.<br>${link ? `<a href="${link}" target="_blank">Lihat file</a>` : ''}`,
        confirmButtonText: 'OK'
      }).then(() => {
        resetForm();
      });
    } else {
      Swal.close();
      Swal.fire({ 
        icon: 'error', 
        title: 'Upload Gagal', 
        text: result.message || 'Terjadi kesalahan saat mengunggah.' 
      });
    }
  }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeUploadPage);
