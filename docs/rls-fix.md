# Perbaikan Row Level Security (RLS) di Supabase

## Masalah

Error yang muncul:
```
Gagal mengupload file: new row violates row-level security policy
```

Masalah ini terjadi karena Row Level Security (RLS) diaktifkan untuk:
1. Tabel `upload_soal` di database
2. Bucket `bank-soal` di storage

Tetapi tidak ada policy yang mengizinkan operasi insert.

## Solusi

### 1. Mengaktifkan RLS untuk Tabel Database

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mata_kuliah ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_soal ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_soal ENABLE ROW LEVEL SECURITY;
```

### 2. Membuat Policy untuk Tabel Database

```sql
-- Untuk tabel profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update profiles" ON profiles
  FOR UPDATE USING (true);

-- Untuk tabel mata_kuliah
CREATE POLICY "Mata kuliah are viewable by everyone" ON mata_kuliah
  FOR SELECT USING (true);

-- Untuk tabel upload_soal
CREATE POLICY "Upload soal are viewable by everyone" ON upload_soal
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert upload soal" ON upload_soal
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update upload soal" ON upload_soal
  FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete upload soal" ON upload_soal
  FOR DELETE USING (true);

-- Untuk tabel dokumen_soal
CREATE POLICY "Dokumen soal are viewable by everyone" ON dokumen_soal
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert dokumen soal" ON dokumen_soal
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete dokumen soal" ON dokumen_soal
  FOR DELETE USING (true);
```

### 3. Mengatur RLS untuk Storage Bucket

Selain tabel database, RLS juga perlu diatur untuk bucket storage `bank-soal`:

```sql
-- Buat bucket jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('bank-soal', 'bank-soal', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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
-- Berikan akses ke anon key untuk operasi yang diperlukan
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO anon;
GRANT SELECT ON mata_kuliah TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON upload_soal TO anon;
GRANT SELECT ON dokumen_soal TO anon;

-- Berikan akses untuk storage
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.buckets TO anon;
```

## Catatan Penting

Karena sistem kita menggunakan Google OAuth dan tidak menggunakan sistem autentikasi Supabase secara penuh, kita perlu mempertimbangkan beberapa hal:

1. **auth.uid()** mungkin tidak tersedia karena kita tidak menggunakan autentikasi Supabase
2. Kita perlu memodifikasi policy untuk menggunakan user_id dari tabel profiles
3. Untuk storage, kita perlu mengatur policy berdasarkan bucket_id

## Implementasi

Untuk mengimplementasikan perbaikan ini:

1. Buka Supabase Dashboard
2. Masuk ke bagian SQL Editor
3. Jalankan perintah-perintah di atas sesuai dengan kebutuhan
4. Verifikasi bahwa policy telah dibuat dengan benar

## Verifikasi

Setelah menerapkan policy, coba upload file lagi. Error "new row violates row-level security policy" seharusnya sudah tidak muncul lagi.

## Troubleshooting

Jika error masih terjadi:

1. **Periksa bucket**:
   - Pastikan bucket `bank-soal` sudah dibuat
   - Pastikan bucket tersebut public

2. **Periksa policy storage**:
   - Pastikan policy untuk storage.objects sudah dibuat
   - Pastikan policy mencakup operasi INSERT, SELECT, UPDATE, DELETE

3. **Periksa hak akses**:
   - Pastikan role anon memiliki hak akses yang diperlukan

4. **Periksa path file**:
   - Pastikan path file tidak mengandung karakter ilegal
   - Pastikan format path sesuai dengan aturan Supabase