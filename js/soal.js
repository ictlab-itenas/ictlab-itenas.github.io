// Minimal login interaction in this file — UI and avatar/menu are handled by `login-manager.js`.

  // Soal page — Mata Kuliah list (default/fallback)
let mataKuliahList = [
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
  { kode: "IFB-113", nama: "MATEMATIKA KOMPUTER" },
  { kode: "IFB-114", nama: "PENGANTAR TRANSFORMASI DIGITAL" },
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
  { kode: "IFB-211", nama: "PEMROGRAMAN WEB" },
  { kode: "IFB-213", nama: "REKAYASA PERANGKAT LUNAK" },
  { kode: "IFB-301", nama: "COMPUTER VISION" },
  { kode: "IFB-302", nama: "KEAMANAN JARINGAN" },
  { kode: "IFB-303", nama: "TEKNIK MULTIMEDIA" },
  { kode: "IFB-304", nama: "SISTEM PAKAR DAN BAHASA ALAMIAH" },
  { kode: "IFB-305", nama: "KECERDASAN BUATAN" },
  { kode: "IFB-306", nama: "PENGENALAN UCAPAN DAN TEKS KE UCAPAN" },
  { kode: "IFB-307", nama: "DATA MINING DAN INFORMATION RETRIEVAL" },
  { kode: "IFB-308", nama: "PEMROGRAMAN ROBOTIKA" },
  { kode: "IFB-309", nama: "PEMROGRAMAN IOT" },
  { kode: "IFB-310", nama: "MACHINE LEARNING" },
  { kode: "IFB-312", nama: "PEMROGRAMAN GAME" },
  { kode: "IFB-351", nama: "JARINGAN SYARAF TIRUAN" },
  { kode: "IFB-352", nama: "TRANSAKSI ELEKTRONIK" },
  { kode: "IFB-353", nama: "BASIS DATA LANJUT" },
  { kode: "IFB-354", nama: "BISNIS INTELIJEN" },
  { kode: "IFB-355", nama: "PEMROGRAMAN MOBILE" },
  { kode: "IFB-356", nama: "SISTEM OPERASI LANJUT" },
  { kode: "IFB-401", nama: "MANAJEMEN PROYEK" },
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

    // Supabase loader for dokumen_soal
    let soalSupabaseModule;
    let soalGetAllDokumen;

    async function loadSoalSupabase() {
      try {
        if (!soalSupabaseModule) {
          soalSupabaseModule = await import('./supabase.js');
          soalGetAllDokumen = soalSupabaseModule.getAllDokumenSoal;
        }
      } catch (err) {
        console.warn('Failed to load supabase in soal.js:', err);
      }
    }

    async function loadDokumenSoal() {
      await loadSoalSupabase();

      if (typeof soalGetAllDokumen === 'function') {
        const res = await soalGetAllDokumen();
        if (res && res.success && Array.isArray(res.data)) {
          soalData = res.data.map((doc, idx) => {
            const fileUrl = doc.file_url || null;
            let fileName = '';
            if (fileUrl) {
              try { fileName = new URL(fileUrl).pathname.split('/').pop(); } catch(e) { fileName = fileUrl; }
            }

            // Robust mapping for mata kuliah relation which may come in different shapes
            const mkRel = doc.mata_kuliah || doc.mata_kuliah_id || doc.mata_kuliah_data || null;
            const kodeMk = mkRel?.kode_mk || mkRel?.kode || doc.kode_mk || doc.mk_id || doc.mk || '';
            const namaMk = mkRel?.nama_mk || mkRel?.nama || doc.nama_mk || doc.nama || '';
            const mataKuliahDisplay = (namaMk || kodeMk || '').toString().trim();

            const mapped = {
              id: doc.dokumen_id || (`remote-${idx}`),
              kode: kodeMk || '',
              mataKuliah: mataKuliahDisplay,
              tahun: String(doc.tahun || ''),
              jenisUjian: doc.jenis_ujian || doc.jenis || '',
              fileUrl: fileUrl,
              fileName: fileName,
              raw: doc
            };

            if (!mapped.mataKuliah) {
              console.warn('dokumen_soal row missing mata_kuliah mapping:', doc);
            }

            return mapped;
          });
          console.log('Loaded dokumen_soal from Supabase, count:', soalData.length);
          // If Supabase returned zero dokumen, we'll fall through to try loading mata_kuliah
          if (soalData.length > 0) return;
        }
      }
      // If we have no dokumen from Supabase, try to load mata_kuliah list from Supabase
      try {
        if (soalSupabaseModule && typeof soalSupabaseModule.supabase !== 'undefined') {
          // Attempt to fetch mata_kuliah table
          const { data: mkData, error: mkError } = await soalSupabaseModule.supabase
            .from('mata_kuliah')
            .select('kode_mk, nama_mk')
            .order('kode_mk', { ascending: true });

          if (!mkError && Array.isArray(mkData) && mkData.length > 0) {
            // Map mata_kuliah rows to mataKuliahList; do NOT generate fake dokumen
            mataKuliahList = mkData.map(m => ({ kode: m.kode_mk || m.kode, nama: m.nama_mk || m.nama }));
            console.log('Loaded mata_kuliah list from Supabase for cards, count:', mataKuliahList.length);
            return;
          }
        }
      } catch (e) {
        console.warn('Error loading mata_kuliah from Supabase fallback:', e);
      }

      // No dokumen and unable to load mata_kuliah from Supabase; keep soalData empty
      console.log('No dokumen found and no mata_kuliah fetched; rendering with local fallback subject list only.');
    }

    // Helper: load mata_kuliah list from Supabase (returns array of {kode, nama})
    async function loadMataKuliahListFromSupabase() {
      await loadSoalSupabase();
      try {
        if (soalSupabaseModule && typeof soalSupabaseModule.supabase !== 'undefined') {
          const { data, error } = await soalSupabaseModule.supabase
            .from('mata_kuliah')
            .select('kode_mk, nama_mk')
            .order('kode_mk', { ascending: true });
          if (!error && Array.isArray(data)) {
            return data.map(m => ({ kode: m.kode_mk || m.kode || '', nama: m.nama_mk || m.nama || '' }));
          }
        }
      } catch (e) {
        console.warn('Failed to load mata_kuliah from Supabase:', e);
      }
      return [];
    }

    // Ensure mataKuliahList is loaded from Supabase when available
    async function ensureMataKuliahListLoaded() {
      try {
        const mkRows = await loadMataKuliahListFromSupabase();
        if (Array.isArray(mkRows) && mkRows.length > 0) {
          mataKuliahList = mkRows;
        }
      } catch (e) {
        // keep fallback list
      }
    }

    // Pagination variables
    let allSoal = [...soalData];
    let currentPage = 1;
    const itemsPerPage = 12;
    let filteredSoal = [...soalData];

    // Initialize page — load dokumen from Supabase first
    document.addEventListener('DOMContentLoaded', async function() {
      console.log('Bank Soal page loading...');
      
      // Add small delay to prevent redirect loops
      setTimeout(async () => {
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
  // Load documents from Supabase (or fallback) before rendering
  await loadDokumenSoal();
  // Also load the full mata_kuliah list for rendering cards
  await ensureMataKuliahListLoaded();
  // Ensure the derived lists used for filtering/pagination reflect the newly loaded data
  allSoal = [...soalData];
  filteredSoal = [...soalData];
  currentPage = 1;
  console.log('soalData sample:', soalData[0] || null, 'allSoal length:', allSoal.length);
        initializeFilters(); // Initialize filter dropdowns
        displaySoalCardsWithPagination();
        setupEventListeners();
    // Render leaderboard after initial load
    try { await renderLeaderboardTopContributors(); } catch(e) { console.warn('Leaderboard render error:', e); }
        
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

    // Initialize filter dropdowns
    function initializeFilters() {
      const mataKuliahFilter = document.getElementById('mataKuliahFilter');
      const tahunFilter = document.getElementById('tahunFilter');
      const ujianFilter = document.getElementById('ujianFilter');

      // Populate mata kuliah filter
      if (mataKuliahFilter) {
        const names = (Array.isArray(mataKuliahList) ? mataKuliahList : [])
          .map(m => m.nama || m.kode)
          .filter(Boolean)
          .sort();

        if (names.length === 0) {
          // Load async as fallback
          loadMataKuliahListFromSupabase().then(mkRows => {
            if (Array.isArray(mkRows) && mkRows.length > 0) {
              mataKuliahList = mkRows;
              const opts = mkRows.map(m => `<option value="${m.nama || m.kode}">${m.nama || m.kode}</option>`).join('');
              mataKuliahFilter.innerHTML = '<option value="">Semua Mata Kuliah</option>' + opts;
            }
          }).catch(() => {});
        } else {
          mataKuliahFilter.innerHTML = '<option value="">Semua Mata Kuliah</option>';
          names.forEach(nm => {
            const option = document.createElement('option');
            option.value = nm;
            option.textContent = nm;
            mataKuliahFilter.appendChild(option);
          });
        }
      }

      // Populate tahun filter
      if (tahunFilter) {
        tahunFilter.innerHTML = '<option value="">Semua Tahun</option>';
        ['2022', '2023', '2024'].forEach(year => {
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          tahunFilter.appendChild(option);
        });
      }

      // Populate ujian filter
      if (ujianFilter) {
        ujianFilter.innerHTML = '<option value="">Semua Ujian</option>';
        ['UTS', 'UAS'].forEach(ujian => {
          const option = document.createElement('option');
          option.value = ujian;
          option.textContent = ujian;
          ujianFilter.appendChild(option);
        });
      }
    }

    // Helpers to derive current subject list (cards) from mataKuliahList
    function getSubjectNamesFromList() {
      return (Array.isArray(mataKuliahList) ? mataKuliahList : [])
        .map(m => m.nama || m.kode)
        .filter(Boolean);
    }

    function getFilteredSubjectNames() {
      const searchTerm = (document.getElementById('searchInput')?.value || '').toLowerCase();
      const names = getSubjectNamesFromList();
      const filtered = names.filter(nm => !searchTerm || nm.toLowerCase().includes(searchTerm));
      return filtered.sort();
    }

    // Setup event listeners for search and filters
    function setupEventListeners() {
      const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', filterAndDisplayCards);
    }

    // Get available files for a specific mata kuliah — based on Supabase dokumen (no HEAD fetch)
    function getAvailableFiles(mataKuliahName) {
      const items = soalData.filter(item => item.mataKuliah === mataKuliahName);
      const available = {};
      for (const it of items) {
        if (!available[it.tahun]) available[it.tahun] = [];
        if (!available[it.tahun].includes(it.jenisUjian)) available[it.tahun].push(it.jenisUjian);
      }
      return available;
    }

    // Initialize card dropdowns with available files only
    async function initializeCardDropdowns(mataKuliah) {
      const card = document.querySelector(`[data-mata-kuliah="${mataKuliah}"]`);
      if (!card) return;

      const yearSelector = card.querySelector('.year-selector');
      const availableFiles = getAvailableFiles(mataKuliah);
      const allYears = ['2022', '2023', '2024']; // All possible years
      const allUjian = ['UTS', 'UAS']; // All possible ujian types

      // Count total available files
      const globalYearFilter = document.getElementById('tahunFilter')?.value || '';
      const globalUjianFilter = document.getElementById('ujianFilter')?.value || '';
      let totalFiles = 0;
      Object.entries(availableFiles).forEach(([year, ujianList]) => {
        if (globalYearFilter && year !== globalYearFilter) return;
        if (globalUjianFilter) {
          totalFiles += ujianList.filter(u => u === globalUjianFilter).length;
        } else {
          totalFiles += ujianList.length;
        }
      });

      // Update file count
      const subtitle = card.querySelector('.card-subtitle');
      if (subtitle) {
        subtitle.textContent = `${totalFiles} soal tersedia`;
      }

      // Clear and populate year dropdown with all years, disable unavailable ones
      yearSelector.innerHTML = '<option value="">Pilih Tahun</option>';
      allYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        
        // Disable if no files available for this year
        if (!availableFiles[year] || availableFiles[year].length === 0) {
          option.disabled = true;
          option.textContent = `${year} (-)`;
          option.style.color = '#bbb';
        }
        
        yearSelector.appendChild(option);
      });

      // Store available files data for later use
      card.dataset.availableFiles = JSON.stringify(availableFiles);
      card.dataset.allUjian = JSON.stringify(allUjian);

      // Initialize ujian selector with all options disabled initially
      const ujianSelector = card.querySelector('.ujian-selector');
      ujianSelector.innerHTML = '<option value="">Pilih Ujian</option>';
      allUjian.forEach(ujian => {
        const option = document.createElement('option');
        option.value = ujian;
        option.textContent = `${ujian} (pilih tahun)`;
        option.disabled = true;
        option.style.color = '#bbb';
        ujianSelector.appendChild(option);
      });

      // Preselect global filters if available and valid
      if (globalYearFilter && allYears.includes(globalYearFilter) && !yearSelector.querySelector(`option[value="${globalYearFilter}"]`)?.disabled) {
        yearSelector.value = globalYearFilter;
        updateUjianOptions(mataKuliah);
        if (globalUjianFilter) {
          const hasUjian = (availableFiles[globalYearFilter] || []).includes(globalUjianFilter);
          if (hasUjian) {
            ujianSelector.value = globalUjianFilter;
          }
        }
        updateCardActions(mataKuliah);
      }
    }

    // Update ujian options based on selected year
    function updateUjianOptions(mataKuliah) {
      const card = document.querySelector(`[data-mata-kuliah="${mataKuliah}"]`);
      if (!card) return;

      const yearSelector = card.querySelector('.year-selector');
      const ujianSelector = card.querySelector('.ujian-selector');
      const selectedYear = yearSelector.value;

      // Clear ujian selector
      ujianSelector.innerHTML = '<option value="">Pilih Ujian</option>';

      if (selectedYear) {
        const availableFiles = JSON.parse(card.dataset.availableFiles || '{}');
        const allUjian = JSON.parse(card.dataset.allUjian || '["UTS", "UAS"]');
        const availableUjianForYear = availableFiles[selectedYear] || [];

        // Populate ujian dropdown with all options, disable unavailable ones
        allUjian.forEach(ujian => {
          const option = document.createElement('option');
          option.value = ujian;
          option.textContent = ujian;
          
          // Disable if not available for selected year
          if (!availableUjianForYear.includes(ujian)) {
            option.disabled = true;
            option.textContent = `${ujian} (-)`;
            option.style.color = '#bbb';
          }
          
          ujianSelector.appendChild(option);
        });
      } else {
        // If no year selected, show all ujian options but disabled
        const allUjian = JSON.parse(card.dataset.allUjian || '["UTS", "UAS"]');
        allUjian.forEach(ujian => {
          const option = document.createElement('option');
          option.value = ujian;
          option.textContent = `${ujian} (pilih tahun)`;
          option.disabled = true;
          option.style.color = '#bbb';
          ujianSelector.appendChild(option);
        });
      }

      // Update card actions after changing year
      updateCardActions(mataKuliah);
    }

    // Filter and display cards — cards are driven by mataKuliah list (not dokumen)
    function filterAndDisplayCards() {
      // Only search is used now; grouped rendering reads it directly
      filteredSoal = soalData;
      currentPage = 1;
      displaySoalCardsWithPagination();
    }

    // Pagination functions
    function renderPagination() {
      // Pagination is based on subject (mata kuliah) count
      const subjectNames = getFilteredSubjectNames();
      const totalMataKuliah = subjectNames.length;
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
  document.querySelector('.pagination-next').disabled = currentPage === totalPages || totalPages === 0;

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
      const totalPages = Math.ceil(getFilteredSubjectNames().length / itemsPerPage);
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
      
      // Derive subject names from mataKuliahList, filtered by search/mk filter
      const allMataKuliah = getFilteredSubjectNames();
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
        const items = soalData.filter(it => it.mataKuliah === mataKuliah);

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
                <p class="card-subtitle">${items.length} soal tersedia</p>
              </div>
            </div>
            
            <div class="card-selectors">
              <div class="selector-group">
                <label>Tahun:</label>
                <select class="year-selector" onchange="updateUjianOptions('${mataKuliah}')">
                  <option value="">Pilih Tahun</option>
                </select>
              </div>
              
              <div class="selector-group">
                <label>Jenis Ujian:</label>
                <select class="ujian-selector" onchange="updateCardActions('${mataKuliah}')">
                  <option value="">Pilih Ujian</option>
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

      // Initialize dropdowns with available files after cards are created
      setTimeout(() => {
        paginatedMataKuliah.forEach(mkName => {
          initializeCardDropdowns(mkName);
        });
      }, 100);
      
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
      if (selectedYear && selectedUjian) {
        const soalItem = soalData.find(item => 
          item.mataKuliah === mataKuliah && 
          item.tahun === selectedYear && 
          item.jenisUjian === selectedUjian
        );
        if (soalItem) {
          const pdfUrl = soalItem.fileUrl || `documents/soal/${soalItem.fileName}`;
          if (soalItem.fileUrl) {
            // If Supabase URL present, consider it available
            previewBtn.disabled = false;
            downloadBtn.disabled = false;
            previewBtn.style.opacity = '1';
            downloadBtn.style.opacity = '1';
          } else {
            // Fallback to local file existence check
            fetch(pdfUrl, { method: 'HEAD' })
              .then(response => {
                if (response.ok) {
                  previewBtn.disabled = false;
                  downloadBtn.disabled = false;
                  previewBtn.style.opacity = '1';
                  downloadBtn.style.opacity = '1';
                } else {
                  previewBtn.disabled = true;
                  downloadBtn.disabled = true;
                  previewBtn.style.opacity = '0.5';
                  downloadBtn.style.opacity = '0.5';
                }
              })
              .catch(() => {
                previewBtn.disabled = true;
                downloadBtn.disabled = true;
                previewBtn.style.opacity = '0.5';
                downloadBtn.style.opacity = '0.5';
              });
          }
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
        downloadSoalItem(soalItem);
      }
    }

    // Preview soal function - Updated for PDF
    function previewSoal(soalId) {
      const soal = soalData.find(item => item.id === soalId);
      if (!soal) return;

      currentPreviewData = soal;
      const pdfUrl = soal.fileUrl || `documents/soal/${soal.fileName}`;
      const isMobile = window.innerWidth <= 768;
      
      // If using Supabase URL, skip HEAD check to avoid CORS issues
      if (soal.fileUrl) {
        if (isMobile) {
          window.open(pdfUrl, '_blank');
        } else {
          showPDFModal(pdfUrl, soal);
        }
        return;
      }

      // Fallback: local file existence check
      checkFileExists(pdfUrl).then(exists => {
        if (exists) {
          if (isMobile) {
            window.open(pdfUrl, '_blank');
          } else {
            showPDFModal(pdfUrl, soal);
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Soal Tidak Tersedia',
            text: `Soal ${soal.mataKuliah} ${soal.jenisUjian} ${soal.tahun} belum tersedia.`,
            confirmButtonColor: '#4285F4',
            customClass: {
              popup: 'swal-popup',
              title: 'swal-title',
              content: 'swal-content'
            }
          });
        }
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Tidak dapat mengakses file soal. Periksa koneksi internet Anda.',
          confirmButtonColor: '#4285F4'
        });
      });
    }

    // Check if file exists
    function checkFileExists(url) {
      return fetch(url, { method: 'HEAD' })
        .then(response => response.ok)
        .catch(() => false);
    }

    // Show PDF Modal for desktop
    function showPDFModal(pdfUrl, soalData) {
      Swal.fire({
        title: `${soalData.mataKuliah} - ${soalData.jenisUjian} ${soalData.tahun}`,
        html: `
          <div class="pdf-viewer-container" style="margin-top: 20px;">
            <div class="pdf-actions" style="margin-bottom: 15px; display: flex; gap: 10px; justify-content: center;">
              <button onclick="window.open('${pdfUrl}', '_blank')" 
                      style="padding: 8px 16px; background: #4285F4; color: white; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 0.9rem;">
                <i class="fas fa-external-link-alt"></i> Buka di Tab Baru
              </button>
            </div>
            <iframe src="${pdfUrl}" 
                    width="100%" 
                    height="600px" 
                    style="border: 1px solid #ddd; border-radius: 8px; background: white;">
              <p>Browser Anda tidak mendukung tampilan PDF. 
                 <a href="${pdfUrl}" target="_blank">Klik di sini untuk membuka file</a>
              </p>
            </iframe>
          </div>
        `,
        width: '90%',
        showCloseButton: true,
        showConfirmButton: true,
        confirmButtonText: '<i class="fas fa-download"></i> Download PDF',
        confirmButtonColor: '#34A853',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-content'
        },
        preConfirm: () => {
          downloadSoalItem(soalData);
        }
      });
    }

    // Close preview modal
    function closePreview() {
      document.getElementById('previewModal').style.display = 'none';
      currentPreviewData = null;
    }

    // Download soal function
    function downloadSoal() {
      if (currentPreviewData) {
        downloadSoalItem(currentPreviewData);
      }
    }

    function downloadSoalItem(soal) {
      if (!soal) return;
      if (soal.fileUrl) {
        downloadSoalFileDirect(soal.fileUrl, soal.fileName || `${soal.mataKuliah}_${soal.tahun}_${soal.jenisUjian}.pdf`);
      } else if (soal.fileName) {
        downloadSoalFile(soal.fileName);
      }
    }

    function downloadSoalFileDirect(url, suggestedName) {
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = suggestedName || '';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        Swal.fire({
          title: 'Download Dimulai',
          text: 'File sedang didownload',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'swal-popup', title: 'swal-title', content: 'swal-content' }
        });
      } catch (e) {
        Swal.fire({
          title: 'Error Download',
          text: 'Tidak dapat memulai download file ini.',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    }

    function downloadSoalFile(fileName) {
      // PDF file URL
      const pdfUrl = `documents/soal/${fileName}`;
      
      // Check if PDF file exists using fetch
      fetch(pdfUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            // File exists, proceed with download
            const link = document.createElement('a');
            link.href = pdfUrl;
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
          } else {
            // File doesn't exist
            showFileNotFoundAlert(fileName);
          }
        })
        .catch(() => {
          // Network error or file access error
          Swal.fire({
            title: 'Error Download',
            text: 'Terjadi error saat mengakses file. Periksa koneksi internet Anda.',
            icon: 'error',
            confirmButtonColor: '#d33',
            customClass: {
              popup: 'swal-popup',
              title: 'swal-title',
              content: 'swal-content'
            }
          });
        });
    }

    function showFileNotFoundAlert(fileName) {
      Swal.fire({
        title: 'Soal Belum Tersedia',
        text: `Maaf, file soal ${fileName} belum tersedia untuk didownload`,
        icon: 'warning',
        confirmButtonText: 'OK',
        confirmButtonColor: '#f39c12',
        customClass: {
          popup: 'swal-popup',
          title: 'swal-title',
          content: 'swal-content'
        }
      });
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

    // Delegate logout menu showing to LoginManager (no local DOM/styling here)
    function showLogoutMenu(event) {
      if (window.loginManager && typeof window.loginManager.showUserMenu === 'function') {
        window.loginManager.showUserMenu(event);
      } else {
        // Fallback: simple confirm and logout
        if (confirm('Logout?')) {
          performLogout();
        }
      }
    }

    // Logout function — delegate to LoginManager if available
    function performLogout() {
      if (window.loginManager && typeof window.loginManager.logout === 'function') {
        window.loginManager.logout();
        return;
      }

      // Fallback: confirm and clear session
      if (confirm('Apakah Anda yakin ingin logout?')) {
        clearUserSession();
        window.location.href = '/login.html';
      }
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
          window.loginManager = new LoginManager();
          console.log('Login Manager initialized');
          
          // Force update the navbar UI
          if (window.loginManager.updateLoginUI) {
            window.loginManager.updateLoginUI();
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

    // Leaderboard: Top 5 contributors by uploaded_by
    async function renderLeaderboardTopContributors() {
      try {
        // Ensure we have access to Supabase
        await loadSoalSupabase();
        const listEl = document.getElementById('leaderboardList');
        if (!listEl || !soalSupabaseModule?.supabase) return;

        // Fetch all dokumen with uploader names
        const { data, error } = await soalSupabaseModule.supabase
          .from('dokumen_soal')
          .select('uploaded_by, profiles!dokumen_soal_uploaded_by_fkey(name)');
        if (error) {
          console.warn('Failed to fetch dokumen for leaderboard:', error);
          return;
        }

        // Count by uploaded_by
        const counts = new Map();
        (data || []).forEach(row => {
          const key = row.uploaded_by || 'unknown';
          const name = row.profiles?.name || 'Anonim';
          const prev = counts.get(key) || { name, count: 0 };
          counts.set(key, { name: prev.name || name, count: prev.count + 1 });
        });

        const topRaw = Array.from(counts.values()).sort((a, b) => b.count - a.count);
        const top = topRaw.slice(0, 5);
        const placeholders = Math.max(0, 5 - top.length);

        // Render
        const rows = top.map((item, idx) => {
          const rank = idx + 1;
          return `
            <li class="leaderboard-item rank-${rank}">
              <div class="leaderboard-rank">${rank}</div>
              <div class="leaderboard-user">
                <div class="leaderboard-avatar"><i class="fas fa-user"></i></div>
                <div class="leaderboard-name">${item.name || 'Anonim'}</div>
              </div>
              <div class="leaderboard-count">${item.count} dokumen</div>
            </li>
          `;
        });

        // Add placeholders if less than 5
        for (let i = 0; i < placeholders; i++) {
          const rank = top.length + i + 1;
          rows.push(`
            <li class="leaderboard-item placeholder rank-${rank}">
              <div class="leaderboard-rank">${rank}</div>
              <div class="leaderboard-user">
                <div class="leaderboard-avatar"><i class="fas fa-user"></i></div>
                <div class="leaderboard-name">-</div>
              </div>
              <div class="leaderboard-count">-</div>
            </li>
          `);
        }

        listEl.innerHTML = rows.join('');
      } catch (e) {
        console.warn('Error rendering leaderboard:', e);
      }
    }
    