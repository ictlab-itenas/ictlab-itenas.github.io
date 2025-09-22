# Perintah SQL untuk Memperbaiki Tabel profiles di Supabase

Berdasarkan error yang muncul:
```
{code: 'PGRST204', details: null, hint: null, message: "Could not find the 'updated_at' column of 'profiles' in the schema cache"}
```

Masalah ini terjadi karena tabel `profiles` tidak memiliki kolom `updated_at` yang digunakan dalam kode JavaScript.

## Solusi

Jalankan perintah SQL berikut di Supabase untuk menambahkan kolom `updated_at`:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
```

## Struktur Tabel profiles yang Benar

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

## Langkah-langkah

1. Buka dashboard Supabase
2. Masuk ke bagian SQL Editor
3. Jalankan perintah ALTER TABLE di atas
4. Setelah itu, refresh schema cache jika diperlukan

Setelah kolom `updated_at` ditambahkan, sistem login akan berfungsi dengan benar tanpa error.