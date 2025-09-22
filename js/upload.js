/**
 * Upload functionality for ICT Lab Website
 * Handles file upload to Supabase Storage
 */

// Import Supabase functions
let uploadSupabaseModule;
let uploadGetUserProfile;
let uploadSaveUploadData;
let uploadGetMataKuliahByKode;

// Dynamically import Supabase module
async function loadUploadSupabase() {
  try {
    if (!uploadSupabaseModule) {
      uploadSupabaseModule = await import('./supabase.js');
      uploadGetUserProfile = uploadSupabaseModule.getUserProfile;
      uploadSaveUploadData = uploadSupabaseModule.saveUploadData;
      uploadGetMataKuliahByKode = uploadSupabaseModule.getMataKuliahByKode;
      console.log('Upload Supabase module loaded successfully');
    }
  } catch (error) {
    console.error('Failed to load Upload Supabase module:', error);
  }
}

// Populate mata kuliah select from Supabase
async function populateMataKuliahSelect() {
  try {
    if (!uploadSupabaseModule) {
      await loadUploadSupabase();
    }
    const selectEl = document.getElementById('mataKuliah');
    if (!selectEl || !uploadSupabaseModule?.supabase) return;

    // Show loading placeholder
    selectEl.innerHTML = '<option value="">Memuat daftar mata kuliah...</option>';

    const { data, error } = await uploadSupabaseModule.supabase
      .from('mata_kuliah')
      .select('kode_mk, nama_mk')
      .order('kode_mk', { ascending: true });

    if (error) {
      console.warn('Failed loading mata_kuliah:', error);
      // Fallback: leave existing static options if any
      return;
    }

    const optionsHtml = ['<option value="">Pilih Mata Kuliah</option>']
      .concat((data || []).map(row => {
        const kode = row.kode_mk || '';
        const nama = row.nama_mk || '';
        const label = nama ? `${kode} - ${nama}` : kode;
        return `<option value="${kode}">${label}</option>`;
      }))
      .join('');

    selectEl.innerHTML = optionsHtml;
  } catch (e) {
    console.warn('Error populating mata kuliah select:', e);
  }
}

// Configuration
// For now, we'll keep the Apps Script URL as fallback, but we'll primarily use Supabase
window.APPS_SCRIPT_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbypUM_sGULsRKMkkvqTh3qDpu8YpyIAlGpZG24rWzQFRCBWgmIai5FNQZTIvkzk5Ltv/exec';

// Login validation functions
function isValidLogin() {
  const email = localStorage.getItem('userEmail');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const loginTime = localStorage.getItem('loginTime');
  const sessionValid = localStorage.getItem('sessionValid');
  
  // Check basic login status
  if (isLoggedIn !== 'true' || !email || !email.endsWith('@mhs.itenas.ac.id') || sessionValid !== 'true') {
    return false;
  }
  
  // Check if login is not expired (24 hours)
  if (loginTime) {
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      // Clear expired session
      clearUserSession();
      return false;
    }
  }
  
  return true;
}

function clearUserSession() {
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
  // Validate file type - more comprehensive for mobile compatibility
  const allowedTypes = [
    'application/pdf', 
    'image/jpeg', 
    'image/jpg', 
    'image/png',
    'image/pjpeg', // IE compatibility
    'image/x-png'  // Some browsers use this
  ];
  
  // Also check file extension as fallback for mobile
  const fileNameLower = file.name.toLowerCase();
  const validExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
  const hasValidExtension = validExtensions.some(ext => fileNameLower.endsWith(ext));
  
  if (!allowedTypes.includes(file.type) && !hasValidExtension) {
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

// Main upload function using Supabase
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
  const userId = userInfo?.sub || ''; // Google User ID
  const nama = userInfo?.name || userInfo?.given_name || '';

  const mataKuliah = document.getElementById('mataKuliah').value.trim(); // Ini sekarang adalah kode mata kuliah (misal: IFB-202)
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

  // Get mata kuliah ID from kode_mk
  if (!uploadSupabaseModule) {
    await loadUploadSupabase();
  }
  
  console.log('Fetching mata kuliah with kode:', mataKuliah);
  const mkResult = await uploadGetMataKuliahByKode(mataKuliah);
  console.log('Mata kuliah fetch result:', mkResult);
  
  if (!mkResult.success) {
    Swal.fire({ 
      icon: 'error', 
      title: 'Mata Kuliah Tidak Ditemukan', 
      text: `Mata kuliah dengan kode ${mataKuliah} tidak ditemukan: ${mkResult.error}` 
    });
    return;
  }
  
  const mkId = mkResult.data.mk_id;
  console.log('Found mk_id:', mkId);

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  
  // Format: KodeMatkul_Tahun_Jenis_TGL_Nama
  // mataKuliah sudah berupa kode (misal: IFB-202), tidak perlu di-slugify
  const today = new Date();
  const tanggal = today.toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD format
  const uploadFileName = `${mataKuliah}_${tahun}_${slugify(jenisUjian)}_${tanggal}_${slugify(nama)}.${ext}`;
  
  // Path in Supabase Storage
  const storagePath = `uploads/${Date.now()}_${uploadFileName}`;

  // Show loading
  Swal.fire({
    title: 'Mengunggah Soal...',
    html: 'Mohon tunggu sebentar. Jangan menutup halaman ini.',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    // Upload file to Supabase Storage
    const filePath = storagePath; // Already includes timestamp and filename
    
    console.log('Uploading file to storage:', { filePath, fileName: file.name });
    
    const { data: uploadData, error: uploadError } = await uploadSupabaseModule.supabase
      .storage
      .from('bank-soal')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file to storage:', uploadError);
      throw new Error(`Gagal mengupload file ke storage: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', uploadData);

    // Get public URL for the uploaded file
    const { data: publicUrlData } = uploadSupabaseModule.supabase
      .storage
      .from('bank-soal')
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;
    console.log('File public URL:', fileUrl);

    // Save upload data to upload_soal table using the new function
    const uploadRecord = {
      mk_id: mkId,
      tahun: parseInt(tahun),
      jenis_ujian: jenisUjian,
      file_url: fileUrl,
      uploaded_by: userId, // Google User ID
      status: 'pending'
    };

    console.log('Saving upload record:', uploadRecord);
    
    if (!uploadSaveUploadData) {
      await loadUploadSupabase();
    }
    
    const saveResult = await uploadSaveUploadData(uploadRecord);
    console.log('Save result:', saveResult);
    
    if (!saveResult.success) {
      throw new Error(`Gagal menyimpan data upload: ${saveResult.error}`);
    }

    Swal.fire({
      icon: 'success',
      title: 'Upload Berhasil!',
      html: `Soal berhasil diunggah dan akan diverifikasi tim.<br><a href="${fileUrl}" target="_blank">Lihat file</a>`,
      confirmButtonText: 'OK'
    }).then(() => {
      resetForm();
    });
    
  } catch (err) {
    console.error('Upload error:', err);
    Swal.fire({ 
      icon: 'error', 
      title: 'Upload Gagal', 
      text: err.message || 'Terjadi kesalahan saat mengunggah file. Coba lagi beberapa saat lagi.' 
    });
  }
}

// Initialize page functionality
function initializeUploadPage() {
  // Load Supabase module
  loadUploadSupabase();
  // Populate mata kuliah from DB
  populateMataKuliahSelect();
  
  // Add small delay to prevent redirect loops
  setTimeout(() => {
    // Check if user is logged in
    if (!isValidLogin()) {
      if (!document.body.classList.contains('redirecting')) {
        document.body.classList.add('redirecting');
        window.location.href = 'login.html';
      }
      return;
    }
    
    // Update last active time
    localStorage.setItem('lastActiveTime', new Date().toISOString());
  }, 200);

  // Setup file upload area
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileUpload = document.getElementById('fileUpload');

  if (fileUploadArea && fileUpload) {
    // Check if mobile device
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      // Desktop: Click handler and drag & drop
      fileUploadArea.addEventListener('click', (e) => {
        // Make sure we're not clicking on the file input itself
        if (e.target !== fileUpload) {
          fileUpload.click();
        }
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
    }
    // Mobile: Only the button will handle file selection, no other event listeners

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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializeUploadPage);
