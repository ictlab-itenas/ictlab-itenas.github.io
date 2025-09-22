# Mengatasi Error "new row violates row-level security policy" pada Storage

## Masalah

Error yang muncul saat upload file:
```
POST https://puknlynkeluidmexyosm.supabase.co/storage/v1/object/bank-soal/uploads/... 400 (Bad Request)
Error: Gagal mengupload file: new row violates row-level security policy
```

Masalah ini terjadi karena Row Level Security (RLS) diaktifkan untuk tabel `storage.objects` tetapi tidak ada policy yang mengizinkan operasi insert untuk bucket `bank-soal`.

## Solusi

### 1. Memahami Struktur Storage di Supabase

Supabase Storage menggunakan dua tabel utama:
1. `storage.buckets` - Menyimpan informasi tentang bucket
2. `storage.objects` - Menyimpan informasi tentang objek/file dalam bucket

### 2. Memastikan Bucket Sudah Dibuat

Pertama, pastikan bucket `bank-soal` sudah dibuat:

```sql
-- Buat bucket jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-soal', 'bank-soal', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### 3. Mengatur RLS untuk Storage

Buat policy yang mengizinkan operasi pada bucket `bank-soal`:

```sql
-- Hapus policy storage yang sudah ada (jika ada)
DROP POLICY IF EXISTS "Anyone can upload to bank-soal" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read from bank-soal" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update in bank-soal" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from bank-soal" ON storage.objects;

-- Buat policy untuk akses storage
CREATE POLICY "Anyone can upload to bank-soal" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bank-soal');

CREATE POLICY "Anyone can read from bank-soal" ON storage.objects
  FOR SELECT USING (bucket_id = 'bank-soal');

CREATE POLICY "Anyone can update in bank-soal" ON storage.objects
  FOR UPDATE USING (bucket_id = 'bank-soal');

CREATE POLICY "Anyone can delete from bank-soal" ON storage.objects
  FOR DELETE USING (bucket_id = 'bank-soal');
```

### 4. Memberikan Hak Akses yang Diperlukan

```sql
-- Berikan akses untuk storage
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.buckets TO anon;
```

## Implementasi Lengkap

Untuk mengimplementasikan perbaikan ini, jalankan script berikut di SQL Editor Supabase:

```sql
-- Bagian 1: Memastikan bucket ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-soal', 'bank-soal', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Bagian 2: Mengatur RLS untuk storage
-- Hapus policy storage yang sudah ada (jika ada)
DROP POLICY IF EXISTS "Anyone can upload to bank-soal" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read from bank-soal" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update in bank-soal" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from bank-soal" ON storage.objects;

-- Buat policy untuk akses storage
CREATE POLICY "Anyone can upload to bank-soal" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'bank-soal');

CREATE POLICY "Anyone can read from bank-soal" ON storage.objects
  FOR SELECT USING (bucket_id = 'bank-soal');

CREATE POLICY "Anyone can update in bank-soal" ON storage.objects
  FOR UPDATE USING (bucket_id = 'bank-soal');

CREATE POLICY "Anyone can delete from bank-soal" ON storage.objects
  FOR DELETE USING (bucket_id = 'bank-soal');

-- Bagian 3: Memberikan hak akses
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.buckets TO anon;
```

## Verifikasi

Setelah menerapkan perbaikan:

1. **Cek bucket**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'bank-soal';
   ```

2. **Cek policy**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%bank-soal%';
   ```

3. **Coba upload file** lagi melalui aplikasi

## Troubleshooting

Jika error masih terjadi:

### 1. Periksa Hak Akses Role
```sql
-- Cek hak akses role anon
SELECT rolname, rolsuper, rolcreaterole, rolcreatedb 
FROM pg_roles 
WHERE rolname = 'anon';
```

### 2. Periksa Policy yang Ada
```sql
-- Lihat semua policy untuk storage.objects
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

### 3. Periksa Konfigurasi Bucket
```sql
-- Lihat detail bucket
SELECT * FROM storage.buckets WHERE id = 'bank-soal';
```

### 4. Periksa Path File
Pastikan path file tidak mengandung karakter ilegal:
- Tidak boleh mengandung `..`
- Tidak boleh dimulai dengan `/`
- Gunakan format yang benar: `bucket_name/path/to/file.ext`

## Catatan Penting

1. **Public Bucket**: Bucket `bank-soal` diatur sebagai public agar file dapat diakses tanpa autentikasi
2. **Policy Scope**: Policy dibuat khusus untuk bucket `bank-soal` agar tidak mempengaruhi bucket lain
3. **Hak Akses**: Role `anon` diberikan akses penuh untuk memudahkan operasi storage

Dengan mengikuti langkah-langkah di atas, error "new row violates row-level security policy" pada storage seharusnya sudah dapat diatasi.