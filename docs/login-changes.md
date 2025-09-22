# Perubahan Sistem Login - Menggunakan Supabase Profiles

## Latar Belakang
Sebelumnya, sistem login menggunakan Google Sheets untuk menyimpan data pengguna. Sekarang kami telah beralih menggunakan tabel `profiles` di Supabase untuk menyimpan informasi pengguna.

## Perubahan yang Dilakukan

### 1. Penambahan File Baru
- `js/supabase.js` - Berisi konfigurasi klien Supabase dan fungsi untuk menyimpan/mengambil data pengguna

### 2. Modifikasi File yang Ada
- `js/login.js` - Diperbarui untuk menggunakan Supabase alih-alih Google Sheets
- `js/upload.js` - Diperbarui untuk memuat modul Supabase
- `js/soal.js` - Diperbarui untuk memuat modul Supabase
- `js/login-manager.js` - Diperbarui untuk memuat modul Supabase
- `login.html` - Diperbarui untuk mengubah referensi penyimpanan data dari Google Sheets ke Supabase
- `summary.md` - Diperbarui untuk mencerminkan perubahan arsitektur
- `.env` - Diperbarui dengan komentar tentang penggunaan Supabase

### 3. Penghapusan Fungsi yang Tidak Digunakan
- Fungsi `saveUserToDatabase()` dan `storeLocalBackup()` di `js/login.js` telah dihapus karena tidak lagi digunakan

## Cara Kerja Baru

1. Pengguna login menggunakan akun Google dengan domain @mhs.itenas.ac.id
2. Setelah autentikasi berhasil, data pengguna (ID, nama, email) disimpan di tabel `profiles` di Supabase
3. Google User ID disimpan secara langsung sebagai string (tanpa konversi ke UUID)
4. Jika pengguna sudah ada di database, hanya tanggal login terakhir yang diperbarui
5. Data sesi pengguna tetap disimpan di localStorage seperti sebelumnya

## Keuntungan Perubahan

1. **Keamanan yang Lebih Baik** - Supabase menyediakan keamanan dan enkripsi yang lebih baik daripada Google Sheets
2. **Performa yang Lebih Baik** - Akses database lebih cepat daripada API Google Sheets
3. **Skalabilitas** - Supabase dapat menangani jumlah pengguna yang lebih besar
4. **Integrasi yang Lebih Baik** - Dengan ekosistem Supabase yang lengkap

## Struktur Tabel Profiles

```sql
CREATE TABLE profiles (
    user_id TEXT PRIMARY KEY,
    name text NOT NULL,
    role text CHECK (role IN ('mahasiswa','admin')) DEFAULT 'mahasiswa',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

**Catatan Penting**: Tipe data kolom `user_id` diubah dari `uuid` ke `TEXT` untuk menghindari masalah foreign key constraint dengan tabel `auth.users`. Ini memungkinkan penyimpanan Google User ID secara langsung tanpa konversi.

## Solusi untuk Masalah Foreign Key Constraint

Masalah foreign key constraint terjadi karena kolom `user_id` di tabel `profiles` merupakan foreign key yang merujuk ke kolom `id` di tabel `auth.users`. Karena Google User ID tidak terdaftar di tabel `auth.users`, terjadi error ketika mencoba menyimpan data.

Solusi yang diimplementasikan:
1. Mengubah tipe data kolom `user_id` dari `uuid` ke `TEXT`
2. Menyimpan Google User ID secara langsung tanpa konversi
3. Menghapus foreign key constraint yang menyebabkan masalah

Keuntungan pendekatan ini:
1. **Sederhana** - Tidak memerlukan perubahan besar pada arsitektur
2. **Fungsional** - Masih mempertahankan semua fungsionalitas yang dibutuhkan
3. **Mudah diimplementasikan** - Dapat dilakukan dengan satu perintah SQL

## Pengujian

Perubahan ini telah diuji dengan:
1. Login menggunakan akun mahasiswa ITENAS
2. Verifikasi data pengguna tersimpan di tabel profiles
3. Pengujian login ulang dan pembaruan tanggal login terakhir