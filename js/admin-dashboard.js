// Admin Dashboard JavaScript
import { 
  supabase, 
  getPendingUploads, 
  getAllUsers, 
  getAllDokumenSoal, 
  approveUpload, 
  rejectUpload,
  getUserProfile
} from '../js/supabase.js';

class AdminDashboard {
  constructor() {
    this.currentUser = null;
    this.pendingUploads = [];
    this.users = [];
    this.dokumenSoal = [];
    
    this.init();
  }
  
  async init() {
    console.log('Initializing Admin Dashboard...');
    
    // Check if user is logged in and has admin role
    await this.checkAuth();
    
    // Initialize event listeners
    this.initEventListeners();
    
    // Load initial data
    await this.loadDashboardData();
  }
  
  async checkAuth() {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      console.log('Auth check:', { userEmail, userId, isLoggedIn });
      
      if (!isLoggedIn || !userEmail || !userId) {
        console.log('User not logged in, redirecting to login...');
        // Update login manager UI before redirecting
        if (typeof loginManager !== 'undefined' && loginManager.updateLoginUI) {
          loginManager.updateLoginUI();
        }
  window.location.href = '/login.html';
        return;
      }
      
      // Check if user has admin role
      const userProfileResult = await getUserProfile(userId);
      if (!userProfileResult.success) {
        console.error('Failed to get user profile:', userProfileResult.error);
        // Update login manager UI before redirecting
        if (typeof loginManager !== 'undefined' && loginManager.updateLoginUI) {
          loginManager.updateLoginUI();
        }
  window.location.href = '/login.html';
        return;
      }
      
      this.currentUser = userProfileResult.data;
      
      if (this.currentUser.role !== 'admin') {
        console.log('User is not admin, redirecting to home...');
        // Update login manager UI before redirecting
        if (typeof loginManager !== 'undefined' && loginManager.updateLoginUI) {
          loginManager.updateLoginUI();
        }
        window.location.href = '../index.html';
        return;
      }
      
      console.log('User is authenticated as admin:', this.currentUser);
      
      // Update login manager UI for authenticated admin
      if (typeof loginManager !== 'undefined' && loginManager.updateLoginUI) {
        loginManager.updateLoginUI();
      }
    } catch (error) {
      console.error('Error in checkAuth:', error);
      // Update login manager UI before redirecting
      if (typeof loginManager !== 'undefined' && loginManager.updateLoginUI) {
        loginManager.updateLoginUI();
      }
  window.location.href = '/login.html';
    }
  }
  
  initEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tab = e.target.getAttribute('data-tab');
        this.switchTab(tab);
      });
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }
    
    // Search functionality
    const pendingSearch = document.getElementById('pendingSearch');
    if (pendingSearch) {
      pendingSearch.addEventListener('input', (e) => {
        this.filterPendingUploads(e.target.value);
      });
    }
    
    const documentsSearch = document.getElementById('documentsSearch');
    if (documentsSearch) {
      documentsSearch.addEventListener('input', (e) => {
        this.filterDocuments(e.target.value);
      });
    }
    
    const usersSearch = document.getElementById('usersSearch');
    if (usersSearch) {
      usersSearch.addEventListener('input', (e) => {
        this.filterUsers(e.target.value);
      });
    }
  }
  
  switchTab(tabName) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
      button.classList.remove('active');
      if (button.getAttribute('data-tab') === tabName) {
        button.classList.add('active');
      }
    });
    
    // Update active tab pane
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
      pane.classList.remove('active');
      if (pane.id === `${tabName}-tab`) {
        pane.classList.add('active');
      }
    });
  }
  
  async loadDashboardData() {
    this.showLoading(true);
    
    try {
      // Load all data concurrently
      const [pendingResult, usersResult, documentsResult] = await Promise.all([
        getPendingUploads(),
        getAllUsers(),
        getAllDokumenSoal()
      ]);
      
      console.log('Dashboard data load results:', { pendingResult, usersResult, documentsResult });
      
      if (pendingResult.success) {
        this.pendingUploads = pendingResult.data;
        this.renderPendingUploads();
        this.updateStats();
      } else {
        console.error('Failed to load pending uploads:', pendingResult.error);
      }
      
      if (usersResult.success) {
        this.users = usersResult.data;
        this.renderUsers();
        this.updateStats();
      } else {
        console.error('Failed to load users:', usersResult.error);
      }
      
      if (documentsResult.success) {
        this.dokumenSoal = documentsResult.data;
        this.renderDocuments();
        this.updateStats();
      } else {
        console.error('Failed to load documents:', documentsResult.error);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Gagal memuat data dashboard. Silakan coba lagi.'
      });
    } finally {
      this.showLoading(false);
    }
  }
  
  renderPendingUploads(data = this.pendingUploads) {
    const tbody = document.getElementById('pendingTableBody');
    const emptyState = document.getElementById('pendingEmptyState');
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = data.map(upload => `
      <tr>
        <td>
          <div>
            <div class="font-weight-bold">${upload.mata_kuliah?.kode_mk || 'N/A'}</div>
            <div class="text-muted">${upload.mata_kuliah?.nama_mk || ''}</div>
          </div>
        </td>
        <td>${upload.tahun}</td>
        <td>${upload.jenis_ujian}</td>
        <td>${upload.profiles?.name || 'Unknown'}</td>
        <td>${new Date(upload.created_at).toLocaleDateString('id-ID')}</td>
        <td>
          <div class="action-group">
            <button class="action-btn btn-approve" onclick="adminDashboard.approveUpload('${upload.upload_id}')">
              <i class="fas fa-check"></i><span class="label">Approve</span>
            </button>
            <button class="action-btn btn-reject" onclick="adminDashboard.rejectUpload('${upload.upload_id}')">
              <i class="fas fa-times"></i><span class="label">Reject</span>
            </button>
            <button class="action-btn btn-delete" onclick="adminDashboard.deletePendingUpload('${upload.upload_id}')">
              <i class="fas fa-trash"></i><span class="label">Delete</span>
            </button>
            <a href="${upload.file_url}" target="_blank" rel="noopener noreferrer" class="action-btn btn-view">
              <i class="fas fa-eye"></i><span class="label">View</span>
            </a>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  renderUsers(data = this.users) {
    const tbody = document.getElementById('usersTableBody');
    const emptyState = document.getElementById('usersEmptyState');
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = data.map(user => `
      <tr>
        <td>
          <div>
            <div class="font-weight-bold">${user.name}</div>
            <div class="text-muted">${user.user_id}</div>
          </div>
        </td>
        <td>
          <span class="badge badge-${user.role === 'admin' ? 'danger' : 'success'}">
            ${user.role}
          </span>
        </td>
        <td>${new Date(user.created_at).toLocaleDateString('id-ID')}</td>
        <td>
          ${user.role !== 'admin' ? `
            <div class="action-group">
              <button class="action-btn btn-delete" onclick=\"adminDashboard.deleteUser('${user.user_id}')\">
                <i class=\"fas fa-trash\"></i><span class=\"label\">Delete</span>
              </button>
            </div>
          ` : `
            <span class="text-muted">-</span>
          `}
        </td>
      </tr>
    `).join('');
  }
  
  renderDocuments(data = this.dokumenSoal) {
    const tbody = document.getElementById('documentsTableBody');
    const emptyState = document.getElementById('documentsEmptyState');
    
    if (!data || data.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }
    
    emptyState.style.display = 'none';
    
    tbody.innerHTML = data.map(doc => `
      <tr>
        <td>
          <div>
            <div class="font-weight-bold">${doc.mata_kuliah?.kode_mk || 'N/A'}</div>
            <div class="text-muted">${doc.mata_kuliah?.nama_mk || ''}</div>
          </div>
        </td>
        <td>${doc.tahun}</td>
        <td>${doc.jenis_ujian}</td>
        <td>
          <div>Uploader: ${doc.profiles?.name || 'Unknown'}</div>
          <div>Approved by: ${doc.approvedBy?.name || 'Unknown'}</div>
        </td>
        <td>${new Date(doc.created_at).toLocaleDateString('id-ID')}</td>
        <td>
          <div class="action-group">
            <a href="${doc.file_url}" target="_blank" rel="noopener noreferrer" class="action-btn btn-view">
              <i class="fas fa-eye"></i><span class="label">View</span>
            </a>
            <button class="action-btn btn-delete" onclick="adminDashboard.deleteDocument('${doc.dokumen_id}')">
              <i class="fas fa-trash"></i><span class="label">Delete</span>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  updateStats() {
    // Update stats counters
    document.getElementById('usersCount').textContent = this.users.length;
    document.getElementById('documentsCount').textContent = this.dokumenSoal.length;
    document.getElementById('pendingCount').textContent = this.pendingUploads.length;
  }
  
  filterPendingUploads(query) {
    if (!query) {
      this.renderPendingUploads();
      return;
    }
    
    const filtered = this.pendingUploads.filter(upload => 
      upload.mata_kuliah?.kode_mk?.toLowerCase().includes(query.toLowerCase()) ||
      upload.mata_kuliah?.nama_mk?.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderPendingUploads(filtered);
  }
  
  filterDocuments(query) {
    if (!query) {
      this.renderDocuments();
      return;
    }
    
    const filtered = this.dokumenSoal.filter(doc => 
      doc.mata_kuliah?.kode_mk?.toLowerCase().includes(query.toLowerCase()) ||
      doc.mata_kuliah?.nama_mk?.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderDocuments(filtered);
  }
  
  filterUsers(query) {
    if (!query) {
      this.renderUsers();
      return;
    }
    
    const filtered = this.users.filter(user => 
      user.name?.toLowerCase().includes(query.toLowerCase()) ||
      user.user_id?.toLowerCase().includes(query.toLowerCase())
    );
    
    this.renderUsers(filtered);
  }
  
  async approveUpload(uploadId) {
    const result = await Swal.fire({
      title: 'Approve Upload?',
      text: 'Apakah Anda yakin ingin mengapprove upload ini?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Approve',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#34A853'
    });
    
    if (!result.isConfirmed) return;
    
    this.showLoading(true);
    
    try {
      const approveResult = await approveUpload(uploadId, this.currentUser.user_id);
      
      if (approveResult.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Upload berhasil diapprove.'
        });
        
        // Reload data
        await this.loadDashboardData();
      } else {
        throw new Error(approveResult.error);
      }
    } catch (error) {
      console.error('Error approving upload:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Gagal mengapprove upload: ${error.message}`
      });
    } finally {
      this.showLoading(false);
    }
  }
  
  async rejectUpload(uploadId) {
    const result = await Swal.fire({
      title: 'Reject Upload?',
      text: 'Apakah Anda yakin ingin menolak upload ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EA4335'
    });
    
    if (!result.isConfirmed) return;
    
    this.showLoading(true);
    
    try {
      const rejectResult = await rejectUpload(uploadId, this.currentUser.user_id);
      
      if (rejectResult.success) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: 'Upload berhasil ditolak.'
        });
        
        // Reload data
        await this.loadDashboardData();
      } else {
        throw new Error(rejectResult.error);
      }
    } catch (error) {
      console.error('Error rejecting upload:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Gagal menolak upload: ${error.message}`
      });
    } finally {
      this.showLoading(false);
    }
  }
  
  async deleteUser(userId) {
    const result = await Swal.fire({
      title: 'Delete User?',
      text: 'Apakah Anda yakin ingin menghapus user ini? Semua upload dan dokumen terkait akan dihapus juga.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EA4335'
    });
    
    if (!result.isConfirmed) return;
    
    this.showLoading(true);
    
    try {
      // Note: We're not deleting related uploads/documents to avoid accidental data loss
      // In a real application, you might want to implement a more sophisticated approach
      // such as marking users as inactive instead of deleting them
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'User berhasil dihapus.'
      });
      
      // Reload data
      await this.loadDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Gagal menghapus user: ${error.message}`
      });
    } finally {
      this.showLoading(false);
    }
  }
  
  async deleteDocument(documentId) {
    const result = await Swal.fire({
      title: 'Delete Document?',
      text: 'Apakah Anda yakin ingin menghapus dokumen ini? File akan dihapus secara permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EA4335'
    });
    
    if (!result.isConfirmed) return;
    
    this.showLoading(true);
    
    try {
      // First, get the document to get the file URL
      console.log('Fetching document with ID:', documentId);
      const { data: document, error: fetchError } = await supabase
        .from('dokumen_soal')
        .select('file_url')
        .eq('dokumen_id', documentId)
        .single();
      
      console.log('Fetch result:', { document, fetchError });
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Extract file path from URL
      const fileUrl = document.file_url;
      const filePath = this.extractFilePathFromUrl(fileUrl);
      console.log('Extracted file path:', filePath);
      
      // Delete file from storage
      if (filePath) {
        console.log('Attempting to delete file from storage:', filePath);
        const { data: storageData, error: storageError } = await supabase
          .storage
          .from('bank-soal')
          .remove([filePath]);
          
        console.log('Storage delete result:', { storageData, storageError });
          
        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
          // Continue with database deletion even if file deletion fails
        }
        
        // Try to verify if file still exists
        try {
          const { data: publicUrlData } = supabase
            .storage
            .from('bank-soal')
            .getPublicUrl(filePath);
            
          console.log('Public URL for deleted file:', publicUrlData);
          
          // Try to fetch the file to see if it still exists
          if (publicUrlData && publicUrlData.publicUrl) {
            fetch(publicUrlData.publicUrl, { method: 'HEAD' })
              .then(response => {
                console.log('File existence check:', { 
                  url: publicUrlData.publicUrl, 
                  exists: response.ok, 
                  status: response.status 
                });
              })
              .catch(err => {
                console.log('File existence check failed:', err);
              });
          }
        } catch (verifyError) {
          console.log('Could not verify file deletion:', verifyError);
        }
      }
      
      // Delete document from database
      console.log('Attempting to delete document with ID:', documentId);
      const { data, error: deleteError } = await supabase
        .from('dokumen_soal')
        .delete()
        .eq('dokumen_id', documentId);
      
      console.log('Delete result:', { data, deleteError });
      
      // Let's also try to verify if the record still exists
      const { data: verifyData, error: verifyError } = await supabase
        .from('dokumen_soal')
        .select('dokumen_id')
        .eq('dokumen_id', documentId);
      
      console.log('Verification result:', { verifyData, verifyError });
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      // Check if the record still exists after deletion
      if (verifyData && verifyData.length > 0) {
        console.warn('Document still exists after deletion attempt');
        throw new Error('Failed to delete document from database');
      }
      
      // Check if any rows were actually deleted
      if (data && data.length === 0) {
        console.warn('No rows were deleted - document may not exist');
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Dokumen berhasil dihapus.'
      });
      
      // Reload data
      await this.loadDashboardData();
    } catch (error) {
      console.error('Error deleting document:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Gagal menghapus dokumen: ${error.message}`
      });
    } finally {
      this.showLoading(false);
    }
  }
  
  async deletePendingUpload(uploadId) {
    const result = await Swal.fire({
      title: 'Delete Pending Upload?',
      text: 'Apakah Anda yakin ingin menghapus upload ini? File akan dihapus secara permanen.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EA4335'
    });
    
    if (!result.isConfirmed) return;
    
    this.showLoading(true);
    
    try {
      // First, get the upload to get the file URL
      const { data: upload, error: fetchError } = await supabase
        .from('upload_soal')
        .select('file_url')
        .eq('upload_id', uploadId)
        .single();
      
      if (fetchError) {
        throw new Error(fetchError.message);
      }
      
      // Extract file path from URL
      const fileUrl = upload.file_url;
      const filePath = this.extractFilePathFromUrl(fileUrl);
      
      // Delete file from storage
      if (filePath) {
        const { error: storageError } = await supabase
          .storage
          .from('bank-soal')
          .remove([filePath]);
          
        if (storageError) {
          console.warn('Failed to delete file from storage:', storageError);
          // Continue with database deletion even if file deletion fails
        }
      }
      
      // Delete upload from database
      const { error: deleteError } = await supabase
        .from('upload_soal')
        .delete()
        .eq('upload_id', uploadId);
      
      if (deleteError) {
        throw new Error(deleteError.message);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Upload berhasil dihapus.'
      });
      
      // Reload data
      await this.loadDashboardData();
    } catch (error) {
      console.error('Error deleting pending upload:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Gagal menghapus upload: ${error.message}`
      });
    } finally {
      this.showLoading(false);
    }
  }
  
  logout() {
    if (typeof loginManager !== 'undefined' && loginManager.logout) {
      loginManager.logout();
    } else {
      // Fallback logout
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '../login.html';
    }
  }
  
  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
      overlay.style.display = show ? 'flex' : 'none';
    }
  }
  
  // Helper function to extract file path from URL
  extractFilePathFromUrl(fileUrl) {
    try {
      console.log('Extracting path from URL:', fileUrl);
      const url = new URL(fileUrl);
      const pathParts = url.pathname.split('/');
      console.log('Path parts:', pathParts);
      // Find the bucket name (bank-soal) in the path
      const bucketIndex = pathParts.indexOf('bank-soal');
      console.log('Bucket index:', bucketIndex);
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        // Return the path after the bucket name
        const result = pathParts.slice(bucketIndex + 1).join('/');
        console.log('Extracted path:', result);
        return result;
      }
      console.log('Could not extract path');
      return null;
    } catch (error) {
      console.error('Error extracting file path:', error);
      return null;
    }
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Small delay to ensure login manager is initialized
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Make adminDashboard globally accessible
  window.adminDashboard = new AdminDashboard();
});