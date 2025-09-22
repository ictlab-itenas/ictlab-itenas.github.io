# Cara Memperbaiki Tabel profiles di Supabase

## Masalah

Error yang muncul:
```
{code: 'PGRST204', details: null, hint: null, message: "Could not find the 'updated_at' column of 'profiles' in the schema cache"}
```

## Penyebab

Tabel `profiles` di database Supabase tidak memiliki kolom `updated_at` yang digunakan dalam kode JavaScript, sehingga menyebabkan error ketika mencoba menyimpan atau memperbarui data pengguna.

## Solusi

### Langkah 1: Menambahkan Kolom updated_at

Jalankan perintah SQL berikut di Supabase:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
```

### Langkah 2: Memverifikasi Struktur Tabel

Setelah menjalankan perintah di atas, struktur tabel `profiles` akan menjadi:

```sql
CREATE TABLE profiles (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    role text CHECK (role IN ('mahasiswa','admin')) DEFAULT 'mahasiswa',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### Langkah 3: Refresh Schema Cache (Jika Diperlukan)

Jika error masih berlanjut setelah menambahkan kolom, Anda mungkin perlu merefresh schema cache di Supabase:

1. Buka dashboard Supabase
2. Masuk ke bagian "Settings" > "API"
3. Klik tombol "Reset" di bagian "Schema Cache"

## Verifikasi

Setelah melakukan perubahan, coba login kembali menggunakan akun mahasiswa ITENAS. Sistem sekarang akan:

1. Membuat hash dari Google User ID dan mengonversinya ke format UUID
2. Menyimpan data pengguna di tabel `profiles` dengan kolom `updated_at` yang sesuai
3. Memperbarui waktu login terakhir setiap kali pengguna login

## Pencegahan

Untuk mencegah masalah serupa di masa depan, pastikan struktur tabel dalam file dokumentasi selalu sinkron dengan struktur tabel aktual di database.