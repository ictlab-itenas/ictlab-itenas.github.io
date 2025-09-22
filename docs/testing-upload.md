# Cara MengUji Upload Soal dengan Supabase

## Persiapan

Sebelum menguji upload soal, pastikan hal-hal berikut telah siap:

1. **Supabase Database**:
   - Tabel `profiles` dengan struktur yang benar
   - Tabel `mata_kuliah` dengan data mata kuliah
   - Tabel `upload_soal` dengan struktur yang benar
   - Tabel `dokumen_soal` (untuk soal yang sudah disetujui)

2. **Supabase Storage**:
   - Bucket `bank-soal` telah dibuat
   - Permissions diatur dengan benar untuk upload dan akses file

3. **Data Mata Kuliah**:
   - Pastikan ada data mata kuliah dalam tabel `mata_kuliah`
   - Contoh: `IFB-202` untuk Pemrograman Berorientasi Objek

## Langkah-langkah Pengujian

### 1. Login ke Sistem
- Buka halaman login (`login.html`)
- Login menggunakan akun Google dengan domain `@mhs.itenas.ac.id`
- Verifikasi bahwa login berhasil dan redirect ke halaman upload

### 2. Akses Halaman Upload
- Setelah login, akses halaman upload (`upload.html`)
- Verifikasi bahwa halaman upload dapat diakses dan form tersedia

### 3. Isi Form Upload
- Pilih mata kuliah dari dropdown (pastikan mata kuliah tersedia di tabel `mata_kuliah`)
- Pilih jenis ujian (UTS, UAS, dll)
- Pilih tahun
- Pilih file untuk diupload (PDF, JPG, JPEG, atau PNG dengan ukuran maks 10MB)

### 4. Submit Form
- Klik tombol "Submit Upload"
- Perhatikan proses upload:
  - File harus diupload ke Supabase Storage
  - Metadata harus disimpan ke tabel `upload_soal`
  - Pesan sukses harus muncul

### 5. Verifikasi di Supabase
- Cek file di Supabase Storage bucket `bank-soal` dalam folder `uploads`
- Cek data di tabel `upload_soal`:
  - `upload_id` harus terisi otomatis
  - `mk_id` harus sesuai dengan mata kuliah yang dipilih
  - `tahun` harus sesuai dengan tahun yang dipilih
  - `jenis_ujian` harus sesuai dengan jenis ujian yang dipilih
  - `file_url` harus berisi URL publik file
  - `uploaded_by` harus berisi Google User ID pengguna
  - `status` harus 'pending'
  - `created_at` dan `updated_at` harus terisi dengan timestamp

### 6. Verifikasi Akses File
- Klik link "Lihat file" dalam pesan sukses
- Verifikasi bahwa file dapat diakses melalui URL publik

## Troubleshooting

### Masalah Umum

1. **File tidak terupload**:
   - Periksa koneksi internet
   - Periksa ukuran file (maks 10MB)
   - Periksa format file (PDF, JPG, JPEG, PNG)

2. **Metadata tidak tersimpan**:
   - Periksa struktur tabel `upload_soal`
   - Periksa foreign key constraints
   - Periksa apakah `mk_id` tersedia untuk kode mata kuliah yang dipilih

3. **File tidak dapat diakses**:
   - Periksa permissions di Supabase Storage
   - Periksa apakah bucket `bank-soal` tersedia

4. **Error validasi form**:
   - Pastikan semua field terisi
   - Pastikan mata kuliah yang dipilih tersedia di database

## Verifikasi Data

### Di Supabase Dashboard
1. Buka Supabase Dashboard
2. Masuk ke bagian "Table Editor"
3. Periksa tabel `upload_soal` untuk data baru
4. Masuk ke bagian "Storage"
5. Periksa bucket `bank-soal` untuk file yang diupload

### Di Database Query
Jalankan query berikut untuk memeriksa data upload:

```sql
SELECT 
    u.upload_id,
    m.kode_mk,
    m.nama_mk,
    u.tahun,
    u.jenis_ujian,
    u.file_url,
    p.name as uploaded_by_name,
    u.status,
    u.created_at
FROM upload_soal u
JOIN mata_kuliah m ON u.mk_id = m.mk_id
JOIN profiles p ON u.uploaded_by = p.user_id
ORDER BY u.created_at DESC
LIMIT 10;
```

Dengan mengikuti langkah-langkah ini, Anda dapat menguji sistem upload soal dan memastikan semua komponen berfungsi dengan benar.