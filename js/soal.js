    // Initialize login manager
    let loginManager;
    let currentPreviewData = null;

    // Soal data with exam files
    // Mata kuliah list
    const mataKuliahList = [
      { kode: "IFB-102", nama: "PENGANTAR IOT" },
      { kode: "IFB-103", nama: "KEWARGANEGARAAN" },
      { kode: "IFB-104", nama: "BASIS DATA" },
      { kode: "IFB-105", nama: "PROBABILITAS DAN STATISTIKA" },
      { kode: "IFB-106", nama: "MATEMATIKA LANJUT" },
      { kode: "IFB-107", nama: "PENGANTAR SAINS KOMPUTER" },
      { kode: "IFB-108", nama: "ALGORITMA LANJUT" },
      { kode: "IFB-109", nama: "ALGORITMA DASAR" },
      { kode: "IFB-110", nama: "PENGANTAR SAINS DATA" },
      { kode: "IFB-111", nama: "MATEMATIKA" },
      { kode: "IFB-112", nama: "ORGANISASI DAN ARSITEKTUR KOMPUTER" },
      { kode: "IFB-201", nama: "GRAFIKA KOMPUTER TERAPAN" },
      { kode: "IFB-202", nama: "PEMROGRAMAN BERORIENTASI OBJEK" },
      { kode: "IFB-203", nama: "INTERAKSI MANUSIA DAN KOMPUTER" },
      { kode: "IFB-204", nama: "JARINGAN KOMPUTER" },
      { kode: "IFB-205", nama: "PEMROGRAMAN BASIS DATA" },
      { kode: "IFB-206", nama: "KOMPUTASI PARALEL & SISTEM TERDISTRIBUSI" },
      { kode: "IFB-207", nama: "PEMROGRAMAN DASAR" },
      { kode: "IFB-208", nama: "PENGOLAHAN CITRA DIGITAL" },
      { kode: "IFB-209", nama: "SISTEM OPERASI" },
      { kode: "IFB-210", nama: "PEMROGRAMAN WEB LANJUT" },
      { kode: "IFB-301", nama: "COMPUTER VISION" },
      { kode: "IFB-302", nama: "KEAMANAN JARINGAN" },
      { kode: "IFB-303", nama: "TEKNIK MULTIMEDIA" },
      { kode: "IFB-304", nama: "SISTEM PAKAR DAN BAHASA ALAMIAH" },
      { kode: "IFB-305", nama: "KECERDASAN BUATAN" },
      { kode: "IFB-307", nama: "DATA MINING DAN INFORMATION RETRIEVAL" },
      { kode: "IFB-308", nama: "PEMROGRAMAN ROBOTIKA" },
      { kode: "IFB-309", nama: "PEMROGRAMAN IOT" },
      { kode: "IFB-310", nama: "MACHINE LEARNING" },
      { kode: "IFB-312", nama: "PEMROGRAMAN GAME" },
      { kode: "IFB-351", nama: "JARINGAN SYARAF TIRUAN" },
      { kode: "IFB-353", nama: "BASIS DATA LANJUT" },
      { kode: "IFB-355", nama: "PEMROGRAMAN MOBILE" },
      { kode: "IFB-451", nama: "BIG DATA" },
      { kode: "IFB-452", nama: "KOMPUTASI AWAN" },
      { kode: "IFB-453", nama: "JARINGAN KOMPUTER LANJUT" },
      { kode: "IFB-454", nama: "DEEP LEARNING" },
      { kode: "IFB-311", nama: "BAHASA INGGRIS I" },
      { kode: "IFB-407", nama: "BAHASA INGGRIS II" },
      { kode: "IFB-402", nama: "BAHASA INGGRIS III" },
      { kode: "IFB-404", nama: "BAHASA INDONESIA" },
      { kode: "IFB-405", nama: "AGAMA" },
      { kode: "IFB-409", nama: "KEWIRAUSAHAAN" }
    ];

    const tahunList = ["2022", "2023", "2024"];
    const ujianList = ["UTS", "UAS"];

    let soalData = [];
    let idCounter = 1;
    mataKuliahList.forEach(mk => {
      tahunList.forEach(tahun => {
        ujianList.forEach(ujian => {
          soalData.push({
            id: idCounter++,
            kode: mk.kode,
            mataKuliah: mk.nama,
            tahun: tahun,
            jenisUjian: ujian,
            fileName: `${mk.kode}_${tahun}_${ujian}.webp`
          });
        });
      });
    });

    // Pagination variables
    let allSoal = [...soalData];
    let currentPage = 1;
    const itemsPerPage = 12;
    let filteredSoal = [...soalData];

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      console.log('Bank Soal page loading...');
      
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
        
        console.log('Valid login found, initializing page...');
        initializePage();
        displaySoalCardsWithPagination();
        setupEventListeners();
        
        // Additional check to ensure Login Manager updates the UI
        setTimeout(() => {
          console.log('Checking navbar update...');
          const catalogNavbar = document.querySelector('.catalog-navbar-menu');
          const loginLink = catalogNavbar ? catalogNavbar.querySelector('a[href="login.html"]') : null;
          
          console.log('Catalog navbar found:', !!catalogNavbar);
          console.log('Login link found:', !!loginLink);
          console.log('Login link content:', loginLink ? loginLink.innerHTML : 'N/A');
          
          if (isValidLogin()) {
            // Try to update via Login Manager first
            if (loginLink && loginLink.innerHTML === 'Login') {
              console.log('Manually updating navbar...');
              const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
              loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${userInfo.name || userInfo.given_name || 'User'}`;
              loginLink.href = '#';
              loginLink.onclick = (e) => {
                e.preventDefault();
                if (loginManager && loginManager.showUserMenu) {
                  loginManager.showUserMenu(e);
                } else {
                  // Fallback: show simple logout confirmation
                  showLogoutMenu(e);
                }
              };
            }
          }
        }, 500);
      }, 200);
    });

    // Setup event listeners for search and filters
    function setupEventListeners() {
      const searchInput = document.getElementById('searchInput');
      const mataKuliahFilter = document.getElementById('mataKuliahFilter');
      const tahunFilter = document.getElementById('tahunFilter');
      const ujianFilter = document.getElementById('ujianFilter');

      searchInput.addEventListener('input', filterAndDisplayCards);
      mataKuliahFilter.addEventListener('change', filterAndDisplayCards);
      tahunFilter.addEventListener('change', filterAndDisplayCards);
      ujianFilter.addEventListener('change', filterAndDisplayCards);
    }

    // Filter and display cards
    function filterAndDisplayCards() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const mataKuliah = document.getElementById('mataKuliahFilter').value;
      const tahun = document.getElementById('tahunFilter').value;
      const ujian = document.getElementById('ujianFilter').value;

      // Filter the raw data first
      filteredSoal = soalData.filter(item => {
        const matchSearch = item.mataKuliah.toLowerCase().includes(searchTerm);
        const matchMataKuliah = !mataKuliah || item.mataKuliah === mataKuliah;
        const matchTahun = !tahun || item.tahun === tahun;
        const matchUjian = !ujian || item.jenisUjian === ujian;
        
        return matchSearch && matchMataKuliah && matchTahun && matchUjian;
      });

      // Reset to first page when filtering
      currentPage = 1;
      
      // Display with pagination
      displaySoalCardsWithPagination();
    }

    // Pagination functions
    function renderPagination() {
      // Perbaiki pagination agar berdasarkan jumlah mata kuliah (card)
      const groupedData = {};
      filteredSoal.forEach(item => {
        if (!groupedData[item.mataKuliah]) groupedData[item.mataKuliah] = [];
        groupedData[item.mataKuliah].push(item);
      });
      const mataKuliahList = Object.keys(groupedData);
      const totalMataKuliah = mataKuliahList.length;
      const totalPages = Math.ceil(totalMataKuliah / itemsPerPage);
      const paginationContainer = document.querySelector('.pagination-numbers');
      const pageInfo = document.querySelector('.pagination-info');

      // Update page info
      const start = (currentPage - 1) * itemsPerPage + 1;
      const end = Math.min(currentPage * itemsPerPage, totalMataKuliah);
      pageInfo.textContent = `Menampilkan ${start}-${end} dari ${totalMataKuliah} mata kuliah`;

      // Clear pagination numbers
      paginationContainer.innerHTML = '';

      // Calculate page range to show
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      // Adjust range if needed
      if (endPage - startPage < 4) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + 4);
        } else if (endPage === totalPages) {
          startPage = Math.max(1, endPage - 4);
        }
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        paginationContainer.appendChild(pageBtn);
      }

      // Update prev/next buttons
      document.querySelector('.pagination-prev').disabled = currentPage === 1;
      document.querySelector('.pagination-next').disabled = currentPage === totalPages;

      // Hide pagination if only one page
      document.querySelector('.pagination-section').style.display = 
        totalPages <= 1 ? 'none' : 'flex';
    }

    function goToPage(page) {
      currentPage = page;
      displaySoalCardsWithPagination();
      renderPagination();
      
      // Scroll to top of results
      document.querySelector('.results-section').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }

    function nextPage() {
      const totalPages = Math.ceil(filteredSoal.length / itemsPerPage);
      if (currentPage < totalPages) {
        goToPage(currentPage + 1);
      }
    }

    function prevPage() {
      if (currentPage > 1) {
        goToPage(currentPage - 1);
      }
    }

    // Reset filters
    function resetFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('mataKuliahFilter').value = '';
      document.getElementById('tahunFilter').value = '';
      document.getElementById('ujianFilter').value = '';
      
      // Reset filtered data and pagination
      filteredSoal = [...soalData];
      currentPage = 1;
      
      displaySoalCardsWithPagination();
    }

    // Display soal cards with pagination
    function displaySoalCardsWithPagination(filteredGroups = null) {
      const cardsContainer = document.getElementById('cardsContainer');
      const totalCount = document.getElementById('totalMataKuliahCount');
      
      // Group data by mata kuliah if not already filtered
      let groupedData = filteredGroups;
      if (!groupedData) {
        groupedData = {};
        filteredSoal.forEach(item => {
          if (!groupedData[item.mataKuliah]) {
            groupedData[item.mataKuliah] = [];
          }
          groupedData[item.mataKuliah].push(item);
        });
      }
      
      const allMataKuliah = Object.keys(groupedData);
      const totalMataKuliah = allMataKuliah.length;
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedMataKuliah = allMataKuliah.slice(startIndex, endIndex);
      
      totalCount.textContent = `Total: ${totalMataKuliah} Mata Kuliah`;

      if (totalMataKuliah === 0) {
        cardsContainer.innerHTML = `
          <div class="no-soal-message">
            <i class="fas fa-search"></i>
            <h4>Tidak ada mata kuliah yang ditemukan</h4>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        `;
        document.querySelector('.pagination-section').style.display = 'none';
        return;
      }

      // Generate cards HTML for current page only
      cardsContainer.innerHTML = paginatedMataKuliah.map(mataKuliah => {
        const items = groupedData[mataKuliah];
        const availableYears = [...new Set(items.map(item => item.tahun))].sort();
        const availableUjian = [...new Set(items.map(item => item.jenisUjian))];

        // Hitung jumlah soal/gambar yang tersedia (file benar-benar ada)
        let soalTersedia = 0;
        const soalPromises = items.map(item => {
          return new Promise(resolve => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = `img/soal/${item.fileName}`;
          });
        });

        // Karena map di sini synchronous, tampilkan placeholder dulu, update jumlah soal setelah pengecekan file
        setTimeout(() => {
          Promise.all(soalPromises).then(results => {
            const count = results.filter(Boolean).length;
            const card = document.querySelector(`[data-mata-kuliah="${mataKuliah}"] .card-subtitle`);
            if (card) card.textContent = `${count} soal tersedia`;
          });
        }, 0);

        // Get icons for different subjects
        const getSubjectIcon = (subject) => {
          const iconMap = {
            'PENGANTAR IOT': 'fas fa-microchip',
            'KEWARGANEGARAAN': 'fas fa-flag',
            'BASIS DATA': 'fas fa-database',
            'PEMROGRAMAN WEB': 'fas fa-globe',
            'ALGORITMA & PEMROGRAMAN': 'fas fa-code',
            'MATEMATIKA DISKRIT': 'fas fa-calculator',
            'STATISTIKA': 'fas fa-chart-bar',
            'FISIKA': 'fas fa-atom',
            'STRUKTUR DATA': 'fas fa-project-diagram',
            'JARINGAN KOMPUTER': 'fas fa-network-wired',
            'SISTEM OPERASI': 'fas fa-desktop',
            'REKAYASA PERANGKAT LUNAK': 'fas fa-cogs',
            'KEAMANAN INFORMASI': 'fas fa-shield-alt',
            'BAHASA INGGRIS I': 'fas fa-language',
            'BAHASA INGGRIS II': 'fas fa-language',
            'BAHASA INGGRIS III': 'fas fa-language',
            'BAHASA INDONESIA': 'fas fa-book-open',
            'AGAMA': 'fas fa-pray',
            'KEWIRAUSAHAAN': 'fas fa-handshake'
          };
          return iconMap[subject] || 'fas fa-book';
        };

        return `
          <div class="soal-card" data-mata-kuliah="${mataKuliah}">
            <div class="card-header">
              <div class="card-icon">
                <i class="${getSubjectIcon(mataKuliah)}"></i>
              </div>
              <div class="card-title">
                <h4>${mataKuliah}</h4>
                <p class="card-subtitle">0 soal tersedia</p>
              </div>
            </div>
            
            <div class="card-selectors">
              <div class="selector-group">
                <label>Tahun:</label>
                <select class="year-selector" onchange="updateCardActions('${mataKuliah}')">
                  <option value="">Pilih Tahun</option>
                  ${availableYears.map(year => `<option value="${year}">${year}</option>`).join('')}
                </select>
              </div>
              
              <div class="selector-group">
                <label>Jenis Ujian:</label>
                <select class="ujian-selector" onchange="updateCardActions('${mataKuliah}')">
                  <option value="">Pilih Ujian</option>
                  ${availableUjian.map(ujian => `<option value="${ujian}">${ujian}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="card-preview-btn" onclick="previewFromCard('${mataKuliah}')" disabled>
                <i class="fas fa-eye"></i> Preview
              </button>
              <button class="card-download-btn" onclick="downloadFromCard('${mataKuliah}')" disabled>
                <i class="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        `;
      }).join('');
      
      // Render pagination
      renderPagination();
    }

    // Display soal cards
    function displaySoalCards(filteredGroups = null) {
      const cardsContainer = document.getElementById('cardsContainer');
      const totalCount = document.getElementById('totalMataKuliahCount');
      
      // Group data by mata kuliah if not already filtered
      let groupedData = filteredGroups;
      if (!groupedData) {
        groupedData = {};
        soalData.forEach(item => {
          if (!groupedData[item.mataKuliah]) {
            groupedData[item.mataKuliah] = [];
          }
          groupedData[item.mataKuliah].push(item);
        });
      }
      
      const mataKuliahCount = Object.keys(groupedData).length;
      totalCount.textContent = `Total: ${mataKuliahCount} mata kuliah`;

      if (mataKuliahCount === 0) {
        cardsContainer.innerHTML = `
          <div class="no-soal-message">
            <i class="fas fa-search"></i>
            <h4>Tidak ada mata kuliah yang ditemukan</h4>
            <p>Coba ubah filter atau kata kunci pencarian</p>
          </div>
        `;
        return;
      }

      // Generate cards HTML
      cardsContainer.innerHTML = Object.keys(groupedData).map(mataKuliah => {
        const items = groupedData[mataKuliah];
        const availableYears = [...new Set(items.map(item => item.tahun))].sort();
        const availableUjian = [...new Set(items.map(item => item.jenisUjian))];
        
        // Get icons for different subjects
        const getSubjectIcon = (subject) => {
          const iconMap = {
            'Pemrograman Lanjut': 'fas fa-code',
            'Struktur Data': 'fas fa-project-diagram',
            'Basis Data': 'fas fa-database',
            'Jaringan Komputer': 'fas fa-network-wired',
            'Sistem Operasi': 'fas fa-desktop',
            'Rekayasa Perangkat Lunak': 'fas fa-cogs',
            'Keamanan Informasi': 'fas fa-shield-alt'
          };
          return iconMap[subject] || 'fas fa-book';
        };

        return `
          <div class="soal-card" data-mata-kuliah="${mataKuliah}">
            <div class="card-header">
              <div class="card-icon">
                <i class="${getSubjectIcon(mataKuliah)}"></i>
              </div>
              <div class="card-title">
                <h4>${mataKuliah}</h4>
                <p class="card-subtitle">${items.length} soal tersedia</p>
              </div>
            </div>
            
            <div class="card-selectors">
              <div class="selector-group">
                <label>Tahun:</label>
                <select class="year-selector" onchange="updateCardActions('${mataKuliah}')">
                  <option value="">Pilih Tahun</option>
                  ${availableYears.map(year => `<option value="${year}">${year}</option>`).join('')}
                </select>
              </div>
              
              <div class="selector-group">
                <label>Jenis Ujian:</label>
                <select class="ujian-selector" onchange="updateCardActions('${mataKuliah}')">
                  <option value="">Pilih Ujian</option>
                  ${availableUjian.map(ujian => `<option value="${ujian}">${ujian}</option>`).join('')}
                </select>
              </div>
            </div>
            
            <div class="card-actions">
              <button class="card-preview-btn" onclick="previewFromCard('${mataKuliah}')" disabled>
                <i class="fas fa-eye"></i> Preview
              </button>
              <button class="card-download-btn" onclick="downloadFromCard('${mataKuliah}')" disabled>
                <i class="fas fa-download"></i> Download
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // Update card actions based on selections
    function updateCardActions(mataKuliah) {
      const card = document.querySelector(`[data-mata-kuliah="${mataKuliah}"]`);
      if (!card) return;

      const yearSelector = card.querySelector('.year-selector');
      const ujianSelector = card.querySelector('.ujian-selector');
      const previewBtn = card.querySelector('.card-preview-btn');
      const downloadBtn = card.querySelector('.card-download-btn');

      const selectedYear = yearSelector.value;
      const selectedUjian = ujianSelector.value;

      // Enable/disable buttons based on selections and file availability
      let fileAvailable = false;
      if (selectedYear && selectedUjian) {
        const soalItem = soalData.find(item => 
          item.mataKuliah === mataKuliah && 
          item.tahun === selectedYear && 
          item.jenisUjian === selectedUjian
        );
        if (soalItem) {
          // Check if file exists in img/soal folder
          const imageUrl = `img/soal/${soalItem.fileName}`;
          const testImage = new Image();
          testImage.onload = function() {
            previewBtn.disabled = false;
            downloadBtn.disabled = false;
            previewBtn.style.opacity = '1';
            downloadBtn.style.opacity = '1';
          };
          testImage.onerror = function() {
            previewBtn.disabled = true;
            downloadBtn.disabled = true;
            previewBtn.style.opacity = '0.5';
            downloadBtn.style.opacity = '0.5';
          };
          testImage.src = imageUrl;
          return;
        }
      }
      // If not both selected or file not found, disable buttons
      previewBtn.disabled = true;
      downloadBtn.disabled = true;
      previewBtn.style.opacity = '0.5';
      downloadBtn.style.opacity = '0.5';
    }

    // Preview from card
    function previewFromCard(mataKuliah) {
      const card = document.querySelector(`[data-mata-kuliah="${mataKuliah}"]`);
      if (!card) return;

      const yearSelector = card.querySelector('.year-selector');
      const ujianSelector = card.querySelector('.ujian-selector');
      const selectedYear = yearSelector.value;
      const selectedUjian = ujianSelector.value;

      if (!selectedYear || !selectedUjian) {
        Swal.fire({
          title: 'Pilih Tahun dan Jenis Ujian',
          text: 'Mohon pilih tahun dan jenis ujian terlebih dahulu',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f39c12',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content'
          }
        });
        return;
      }

      // Find the specific soal item
      const soalItem = soalData.find(item => 
        item.mataKuliah === mataKuliah && 
        item.tahun === selectedYear && 
        item.jenisUjian === selectedUjian
      );

      if (soalItem) {
        previewSoal(soalItem.id);
      }
    }

    // Download from card
    function downloadFromCard(mataKuliah) {
      const card = document.querySelector(`[data-mata-kuliah="${mataKuliah}"]`);
      if (!card) return;

      const yearSelector = card.querySelector('.year-selector');
      const ujianSelector = card.querySelector('.ujian-selector');
      const selectedYear = yearSelector.value;
      const selectedUjian = ujianSelector.value;

      if (!selectedYear || !selectedUjian) {
        Swal.fire({
          title: 'Pilih Tahun dan Jenis Ujian',
          text: 'Mohon pilih tahun dan jenis ujian terlebih dahulu',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f39c12',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content'
          }
        });
        return;
      }

      // Find the specific soal item
      const soalItem = soalData.find(item => 
        item.mataKuliah === mataKuliah && 
        item.tahun === selectedYear && 
        item.jenisUjian === selectedUjian
      );

      if (soalItem) {
        downloadSoalFile(soalItem.fileName);
      }
    }

    // Preview soal function
    function previewSoal(soalId) {
      const soal = soalData.find(item => item.id === soalId);
      if (!soal) return;

      currentPreviewData = soal;
      
      // Set modal content
      document.getElementById('previewTitle').textContent = `${soal.mataKuliah} - ${soal.jenisUjian} ${soal.tahun}`;
      
      const previewImage = document.getElementById('previewImage');
      const imageUrl = `img/soal/${soal.fileName}`;
      
      // Hide any existing unavailable message
      const messageDiv = document.getElementById('unavailableMessage');
      if (messageDiv) {
        messageDiv.style.display = 'none';
      }
      
      // Show image initially
      previewImage.style.display = 'block';
      previewImage.src = imageUrl;
      
      // Handle image load error
      previewImage.onerror = function() {
        // Hide image and show "soal belum tersedia" message
        this.style.display = 'none';
        
        // Create or update message
        let messageDiv = document.getElementById('unavailableMessage');
        if (!messageDiv) {
          messageDiv = document.createElement('div');
          messageDiv.id = 'unavailableMessage';
          messageDiv.style.cssText = `
            padding: 60px 20px;
            text-align: center;
            color: #999;
            font-size: 1.2rem;
            font-family: 'Inter', sans-serif;
          `;
          this.parentNode.appendChild(messageDiv);
        }
        messageDiv.innerHTML = `
          <i class="fas fa-file-alt" style="font-size: 3rem; margin-bottom: 20px; display: block; color: #ddd;"></i>
          <p style="margin: 0; font-weight: 500;">Soal belum tersedia</p>
          <p style="margin: 10px 0 0; font-size: 0.9rem;">File soal untuk mata kuliah ini belum diupload</p>
        `;
        messageDiv.style.display = 'block';
      };
      
      // Handle successful image load
      previewImage.onload = function() {
        this.style.display = 'block';
        const messageDiv = document.getElementById('unavailableMessage');
        if (messageDiv) {
          messageDiv.style.display = 'none';
        }
      };
      
      // Show modal
      document.getElementById('previewModal').style.display = 'block';
    }

    // Close preview modal
    function closePreview() {
      document.getElementById('previewModal').style.display = 'none';
      currentPreviewData = null;
    }

    // Download soal function
    function downloadSoal() {
      if (currentPreviewData) {
        downloadSoalFile(currentPreviewData.fileName);
      }
    }

    function downloadSoalFile(fileName) {
      // Check if file exists by trying to create the download link
      const imageUrl = `img/soal/${fileName}`;
      
      // Create a temporary image to check if file exists
      const testImage = new Image();
      
      testImage.onload = function() {
        // File exists, proceed with download
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = fileName;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        Swal.fire({
          title: 'Download Berhasil!',
          text: `File ${fileName} sedang didownload`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content'
          }
        });
      };
      
      testImage.onerror = function() {
        // File doesn't exist, show alert
        Swal.fire({
          title: 'Soal Belum Tersedia',
          text: 'Maaf, soal untuk mata kuliah ini belum tersedia untuk didownload',
          icon: 'warning',
          confirmButtonText: 'OK',
          confirmButtonColor: '#f39c12',
          customClass: {
            popup: 'swal-popup',
            title: 'swal-title',
            content: 'swal-content'
          }
        });
      };
      
      // Start checking if image exists
      testImage.src = imageUrl;
    }

    // Close modal when clicking outside
    document.addEventListener('click', function(e) {
      const modal = document.getElementById('previewModal');
      if (e.target === modal) {
        closePreview();
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closePreview();
      }
    });

    // Fallback logout menu function
    function showLogoutMenu(event) {
      // Remove existing menu if any
      const existingMenu = document.querySelector('.simple-logout-menu');
      if (existingMenu) {
        existingMenu.remove();
      }

      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const userEmail = localStorage.getItem('userEmail') || '';
      
      // Create simple logout menu
      const menu = document.createElement('div');
      menu.className = 'simple-logout-menu';
      menu.innerHTML = `
        <div class="user-info">
          <img src="${userInfo?.picture || 'img/logo-bg.png'}" alt="Profile" class="user-avatar">
          <div class="user-details">
            <div class="user-name">${userInfo?.name || userInfo?.given_name || 'User'}</div>
            <div class="user-email">${userEmail}</div>
            <div class="login-method">Via Google</div>
          </div>
        </div>
        <div class="menu-divider"></div>
        <button class="menu-item" onclick="performLogout()">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      `;

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

    // Logout function
    function performLogout() {
      Swal.fire({
        title: 'Konfirmasi Logout',
        text: 'Apakah Anda yakin ingin logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Logout',
        cancelButtonText: 'Batal',
        background: '#fff',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-content'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('User logging out...');
          
          // Show loading alert
          Swal.fire({
            title: 'Logging out...',
            text: 'Mohon tunggu sebentar',
            icon: 'info',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });
          
          if (loginManager && loginManager.logout) {
            loginManager.logout();
          } else {
            // Fallback logout
            clearUserSession();
            
            if (!document.body.classList.contains('redirecting')) {
              document.body.classList.add('redirecting');
              setTimeout(() => {
                window.location.href = 'login.html';
              }, 500);
            }
          }
        }
      });
    }

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

    function initializePage() {
      console.log('Initializing Bank Soal ICT page...');
      
      // Initialize login manager with a small delay to ensure it's loaded
      setTimeout(() => {
        if (typeof LoginManager !== 'undefined') {
          loginManager = new LoginManager();
          console.log('Login Manager initialized');
          
          // Force update the navbar UI
          if (loginManager.updateLoginUI) {
            loginManager.updateLoginUI();
          }
        } else {
          console.warn('LoginManager class not available');
        }
      }, 100);
      
      // Load user info for display (optional)
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const email = localStorage.getItem('userEmail') || '';
      
      console.log('User info loaded:', { email, name: userInfo.name });
      
      // Update last active time
      localStorage.setItem('lastActiveTime', new Date().toISOString());
    }

    function initializePage() {
      console.log('Initializing Bank Soal ICT page...');
      
      // Initialize login manager with a small delay to ensure it's loaded
      setTimeout(() => {
        if (typeof LoginManager !== 'undefined') {
          loginManager = new LoginManager();
          console.log('Login Manager initialized');
          
          // Force update the navbar UI
          if (loginManager.updateLoginUI) {
            loginManager.updateLoginUI();
          }
        } else {
          console.warn('LoginManager class not available');
        }
      }, 100);
      
      // Load user info for display (optional)
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const email = localStorage.getItem('userEmail') || '';
      
      console.log('User info loaded:', { email, name: userInfo.name });
      
      // Update last active time
      localStorage.setItem('lastActiveTime', new Date().toISOString());
    }