# Perubahan Sistem Upload Soal - Menggunakan Supabase Storage dan Database

## Latar Belakang
Sebelumnya, sistem upload soal menggunakan Google Apps Script untuk menyimpan file dan data. Sekarang kami telah beralih menggunakan Supabase Storage untuk menyimpan file dan tabel `upload_soal` di Supabase untuk menyimpan metadata.

## Perubahan yang Dilakukan

### 1. Penambahan Fungsi Baru di supabase.js
- `saveUploadData()` - Menyimpan metadata upload ke tabel `upload_soal`
- `getMataKuliahByKode()` - Mengambil ID mata kuliah berdasarkan kode mata kuliah
- `getPendingUploads()` - Mengambil daftar upload yang menunggu persetujuan (untuk admin)
- `getAllUsers()` - Mengambil semua user (untuk admin)
- `getAllDokumenSoal()` - Mengambil semua dokumen soal resmi (untuk admin)
- `approveUpload()` - Menyetujui upload dan memindahkannya ke dokumen soal resmi (untuk admin)
- `rejectUpload()` - Menolak upload (untuk admin)

### 2. Memperbarui Struktur Tabel
- Memperbarui tabel `upload_soal` dengan kolom `reviewed_by` dan `updated_at`
- Memperbarui tabel `dokumen_soal` dengan referensi ke `upload_soal`
- Memastikan semua foreign key constraints sudah benar

### 3. Modifikasi File upload.js
- Menghapus dependensi pada Google Apps Script
- Mengimplementasikan upload file langsung ke Supabase Storage
- Menyimpan metadata ke tabel `upload_soal` di Supabase
- Menghapus fungsi `submitViaIframe()` dan `reader.onload` yang tidak lagi digunakan

### 4. Membuat Dashboard Admin
- Membuat halaman dashboard admin di `admin/dashboard.html`
- Membuat stylesheet khusus di `css/admin-dashboard.css`
- Membuat JavaScript khusus di `js/admin-dashboard.js`
- Membuat navigasi admin yang hanya bisa diakses oleh user dengan role 'admin'

### 5. Perubahan Alur Upload
1. Pengguna memilih file dan mengisi form
2. File diupload langsung ke Supabase Storage
3. Metadata upload disimpan ke tabel `upload_soal` dengan status 'pending'
4. Admin dapat me-review upload dan menyetujui atau menolak
5. Jika disetujui, data dipindahkan ke tabel `dokumen_soal`

## Cara Kerja Baru

1. Pengguna login menggunakan akun Google dengan domain @mhs.itenas.ac.id
2. Pengguna memilih file dan mengisi form upload
3. File diupload langsung ke Supabase Storage bucket `bank-soal`
4. Metadata upload (mk_id, tahun, jenis_ujian, file_url, uploaded_by, status) disimpan di tabel `upload_soal`
5. Admin dapat mengakses dashboard admin untuk me-review upload
6. Admin dapat menyetujui atau menolak upload
7. Jika disetujui, data dipindahkan ke tabel `dokumen_soal` sebagai soal resmi

## Keuntungan Perubahan

1. **Keamanan yang Lebih Baik** - Semua data disimpan di satu platform (Supabase)
2. **Performa yang Lebih Baik** - Tidak ada lagi ketergantungan pada Google Apps Script
3. **Skalabilitas** - Supabase Storage dapat menangani jumlah file yang lebih besar
4. **Integrasi yang Lebih Baik** - Dengan ekosistem Supabase yang lengkap
5. **Workflow yang Lebih Baik** - Admin dapat me-review dan mengelola upload dengan mudah

## Struktur Tabel upload_soal

```sql
CREATE TABLE upload_soal (
    upload_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id uuid NOT NULL REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
    tahun int NOT NULL CHECK (tahun >= 2000),
    jenis_ujian text CHECK (jenis_ujian IN ('UTS','UTS2','UAS','TUBES')) NOT NULL,
    file_url text NOT NULL,
    uploaded_by TEXT NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    status text CHECK (status IN ('pending','approved','rejected')) DEFAULT 'pending',
    reviewed_by TEXT REFERENCES profiles(user_id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

## Struktur Tabel dokumen_soal

```sql
CREATE TABLE dokumen_soal (
    dokumen_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    mk_id uuid NOT NULL REFERENCES mata_kuliah(mk_id) ON DELETE CASCADE,
    tahun int NOT NULL,
    jenis_ujian text CHECK (jenis_ujian IN ('UTS','UTS2','UAS','TUBES')) NOT NULL,
    file_url text NOT NULL,
    uploaded_by TEXT REFERENCES profiles(user_id), -- Add uploaded_by column
    approved_by TEXT NOT NULL REFERENCES profiles(user_id),
    created_at timestamptz DEFAULT now()
);
```

## Struktur Tabel mata_kuliah

```sql
CREATE TABLE mata_kuliah (
    mk_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_mk text UNIQUE NOT NULL,
    nama_mk text NOT NULL
);
```

## Dashboard Admin

Dashboard admin menyediakan:
1. **Overview Statistik** - Jumlah user, dokumen resmi, dan upload pending
2. **Manajemen Upload** - Daftar upload pending dengan tombol approve/reject
3. **Manajemen Dokumen** - Daftar dokumen soal resmi
4. **Manajemen User** - Daftar semua user terdaftar

## Pengujian

Perubahan ini telah diuji dengan:
1. Upload file menggunakan akun mahasiswa ITENAS
2. Verifikasi file tersimpan di Supabase Storage
3. Verifikasi metadata tersimpan di tabel `upload_soal`
4. Verifikasi file dapat diakses melalui URL publik
5. Verifikasi admin dapat mengakses dashboard dan me-review upload