# ICT Laboratory Website

Website resmi ICT Laboratory Institut Teknologi Nasional (ITENAS) Bandung.

## Deskripsi

Website ini menyediakan berbagai fitur untuk mahasiswa dan staf ICT Laboratory, termasuk:
- Bank soal ujian
- Sistem upload soal
- Informasi kegiatan dan prestasi
- Profil anggota tim

## Fitur Utama

### 1. Bank Soal
Akses koleksi soal ujian dari berbagai mata kuliah Prodi Informatika dengan kemampuan:
- Filter berdasarkan mata kuliah, tahun, dan jenis ujian
- Preview dan download soal dalam format PDF
- Navigasi yang mudah dengan pagination

### 2. Upload Soal
Sistem kontribusi untuk mahasiswa berbagi soal ujian:
- Upload soal dalam format PDF, JPG, JPEG, atau PNG
- Form validasi dengan pengecekan ukuran file dan tipe
- Penamaan file otomatis berdasarkan mata kuliah, tahun, dan jenis ujian
- File disimpan di Supabase Storage dengan metadata di tabel upload_soal

### 3. Autentikasi
Sistem login menggunakan akun mahasiswa ITENAS:
- Autentikasi dengan Google OAuth
- Validasi domain email (@mhs.itenas.ac.id)
- Session management dengan localStorage
- Profil pengguna disimpan di database Supabase dengan Google User ID sebagai string

## Teknologi yang Digunakan

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **UI Library**: Font Awesome, SweetAlert2
- **Autentikasi**: Google OAuth 2.0
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Hosting**: GitHub Pages

## Struktur Direktori

```
ictlab-itenas.github.io/
├── css/                 # Stylesheet files
├── js/                  # JavaScript files
├── img/                 # Image assets
├── documents/           # Document files (soal, dll)
├── admin/               # Admin panel (jika ada)
├── index.html           # Halaman utama
├── login.html           # Halaman login
├── soal.html            # Bank soal
├── upload.html          # Upload soal
├── catalog.html         # Katalog proyek
└── README.md            # Dokumentasi
```

## Cara Kontribusi

1. Fork repository ini
2. Buat branch baru untuk fitur/bug fix
3. Commit perubahan dengan pesan yang jelas
4. Push ke branch di repository Anda
5. Buat pull request ke repository utama

## Lisensi

Hak cipta © 2025 ICT Laboratory Institut Teknologi Nasional Bandung.
Semua hak dilindungi undang-undang.

## Kontak

Untuk pertanyaan atau masalah teknis, hubungi admin ICT Laboratory di contact@labict.itenas.ac.id