# Cara Memperbaiki Tabel profiles di Supabase - Mengubah Tipe Data user_id

## Masalah

Error yang muncul:
```
{code: '23503', details: 'Key (user_id)=(19e6b97f-0000-0000-0000-000000000000) is not present in table "users".', hint: null, message: 'insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"'}
```

## Penyebab

Masalah ini terjadi karena foreign key constraint antara tabel `profiles` dan `auth.users`. Kolom `user_id` di tabel `profiles` merupakan foreign key yang merujuk ke kolom `id` di tabel `auth.users`. Ketika mencoba menyimpan data ke tabel `profiles` dengan Google User ID yang dikonversi ke UUID, sistem memeriksa apakah `user_id` tersebut ada di tabel `auth.users`. Karena Google User ID tidak terdaftar di tabel `auth.users`, maka terjadi error.

## Solusi

Solusi yang direkomendasikan adalah mengubah tipe data kolom `user_id` dari `uuid` (dengan foreign key constraint) ke `TEXT`. Ini memungkinkan penyimpanan Google User ID secara langsung tanpa konversi dan tanpa masalah foreign key constraint.

## Langkah-langkah

### Langkah 1: Menghapus Foreign Key Constraint

Jalankan perintah SQL berikut di Supabase:

```sql
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
```

### Langkah 2: Mengubah Tipe Data Kolom user_id

Jalankan perintah SQL berikut di Supabase:

```sql
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
```

### Langkah 3: Memperbarui Tabel upload_soal dan dokumen_soal

Karena kita mengubah tipe data `user_id` di tabel `profiles` menjadi `TEXT`, kita juga perlu memperbarui referensi di tabel `upload_soal` dan `dokumen_soal`:

```sql
ALTER TABLE upload_soal ALTER COLUMN uploaded_by TYPE TEXT;
ALTER TABLE upload_soal ALTER COLUMN reviewed_by TYPE TEXT;
ALTER TABLE dokumen_soal ALTER COLUMN approved_by TYPE TEXT;
```

### Langkah 4: Memverifikasi Struktur Tabel

Setelah menjalankan perintah di atas, struktur tabel akan menjadi:

```sql
CREATE TABLE profiles (
    user_id TEXT PRIMARY KEY,
    name text NOT NULL,
    role text CHECK (role IN ('mahasiswa','admin')) DEFAULT 'mahasiswa',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

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

## Verifikasi

Setelah melakukan perubahan, coba login kembali menggunakan akun mahasiswa ITENAS. Sistem sekarang akan:

1. Menyimpan Google User ID secara langsung sebagai string
2. Menghindari masalah konversi UUID
3. Menghindari masalah foreign key constraint
4. Memperbarui waktu login terakhir setiap kali pengguna login

## Keuntungan Pendekatan Ini

1. **Sederhana** - Tidak memerlukan perubahan besar pada arsitektur
2. **Fungsional** - Masih mempertahankan semua fungsionalitas yang dibutuhkan
3. **Mudah diimplementasikan** - Dapat dilakukan dengan beberapa perintah SQL
4. **Kompatibel** - Bekerja dengan sistem autentikasi Google OAuth yang sudah ada

## Pertimbangan

Meskipun pendekatan ini menyelesaikan masalah saat ini, untuk implementasi jangka panjang, pertimbangkan untuk:

1. Menggunakan sistem autentikasi Supabase yang sebenarnya
2. Memanfaatkan fitur auth.users dengan benar
3. Mengimplementasikan manajemen pengguna yang lebih robust