# Cara Memverifikasi Data Upload di Tabel upload_soal

## Tujuan

Dokumen ini menjelaskan cara memverifikasi bahwa data upload soal telah tersimpan dengan benar di tabel `upload_soal` di Supabase.

## Prasyarat

1. Akses ke Supabase Dashboard
2. Hak akses untuk melihat data di tabel `upload_soal`
3. Data upload soal telah berhasil dilakukan

## Metode Verifikasi

### 1. Melalui Supabase Dashboard (GUI)

#### Langkah 1: Akses Table Editor
1. Buka Supabase Dashboard
2. Pilih proyek yang sesuai
3. Klik "Table Editor" di sidebar kiri

#### Langkah 2: Pilih Tabel upload_soal
1. Dari daftar tabel, pilih `upload_soal`
2. Tunggu hingga data dimuat

#### Langkah 3: Periksa Data
Perhatikan kolom-kolom berikut:
- `upload_id`: Harus berupa UUID yang unik
- `mk_id`: Harus merujuk ke ID mata kuliah yang valid
- `tahun`: Harus sesuai dengan tahun yang dipilih saat upload
- `jenis_ujian`: Harus sesuai dengan jenis ujian yang dipilih
- `file_url`: Harus berisi URL publik file yang diupload
- `uploaded_by`: Harus berisi Google User ID pengguna yang mengupload
- `status`: Harus 'pending' untuk upload baru
- `created_at`: Harus berisi timestamp saat upload dilakukan
- `updated_at`: Harus berisi timestamp saat data terakhir diperbarui

### 2. Melalui SQL Query

#### Query Dasar
Jalankan query berikut untuk melihat semua data upload:

```sql
SELECT * FROM upload_soal ORDER BY created_at DESC;
```

#### Query dengan Join
Untuk melihat informasi lebih lengkap, jalankan query berikut:

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
    u.created_at,
    u.updated_at
FROM upload_soal u
JOIN mata_kuliah m ON u.mk_id = m.mk_id
JOIN profiles p ON u.uploaded_by = p.user_id
ORDER BY u.created_at DESC;
```

#### Query untuk Upload Spesifik
Untuk memeriksa upload tertentu berdasarkan upload_id:

```sql
SELECT 
    u.*,
    m.kode_mk,
    m.nama_mk,
    p.name as uploaded_by_name
FROM upload_soal u
JOIN mata_kuliah m ON u.mk_id = m.mk_id
JOIN profiles p ON u.uploaded_by = p.user_id
WHERE u.upload_id = 'ID_UPLOAD_YANG_DICARI';
```

### 3. Melalui API Supabase (Jika Diperlukan)

Jika Anda ingin memverifikasi melalui kode, Anda dapat menggunakan API Supabase:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://puknlynkeluidmexyosm.supabase.co',
  'YOUR_ANON_KEY'
);

// Mendapatkan semua data upload
const { data, error } = await supabase
  .from('upload_soal')
  .select(`
    *,
    mata_kuliah(kode_mk, nama_mk),
    profiles(name)
  `)
  .order('created_at', { ascending: false });

if (error) {
  console.error('Error fetching upload data:', error);
} else {
  console.log('Upload data:', data);
}
```

## Kriteria Verifikasi

### Data Harus Ada
1. Tabel `upload_soal` harus memiliki data setelah upload dilakukan
2. Setiap upload harus memiliki `upload_id` yang unik
3. Setiap upload harus memiliki `mk_id` yang merujuk ke mata kuliah yang valid
4. Setiap upload harus memiliki `file_url` yang valid

### Data Harus Benar
1. `tahun` harus sesuai dengan tahun yang dipilih saat upload
2. `jenis_ujian` harus sesuai dengan jenis ujian yang dipilih
3. `uploaded_by` harus berisi Google User ID pengguna yang benar
4. `status` harus 'pending' untuk upload baru
5. `created_at` dan `updated_at` harus berisi timestamp yang valid

### Integritas Data
1. Foreign key constraints harus terpenuhi:
   - `mk_id` harus merujuk ke `mk_id` yang ada di tabel `mata_kuliah`
   - `uploaded_by` harus merujuk ke `user_id` yang ada di tabel `profiles`
   - `reviewed_by` (jika ada) harus merujuk ke `user_id` yang ada di tabel `profiles`

## Troubleshooting

### Masalah Umum

1. **Data tidak muncul**:
   - Periksa apakah proses upload berhasil tanpa error
   - Periksa console browser untuk error JavaScript
   - Periksa log Supabase untuk error database

2. **Data tidak lengkap**:
   - Periksa apakah semua field terisi saat upload
   - Periksa apakah ada error saat menyimpan data

3. **Foreign key constraint error**:
   - Periksa apakah `mk_id` merujuk ke mata kuliah yang valid
   - Periksa apakah `uploaded_by` merujuk ke pengguna yang valid

4. **Timestamp tidak valid**:
   - Periksa apakah fungsi `new Date().toISOString()` berfungsi dengan benar

## Contoh Data yang Benar

Berikut adalah contoh data yang seharusnya muncul di tabel `upload_soal`:

```
upload_id: "a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8"
mk_id: "f8e7d6c5-b4a3-9281-7654-3210fedcba98"
tahun: 2024
jenis_ujian: "UTS"
file_url: "https://puknlynkeluidmexyosm.supabase.co/storage/v1/object/public/bank-soal/uploads/1234567890_IFB-202_2024_UTS_20240101_John_Doe.pdf"
uploaded_by: "123456789012345678901"
status: "pending"
created_at: "2024-01-01T10:00:00Z"
updated_at: "2024-01-01T10:00:00Z"
```

Dengan mengikuti panduan ini, Anda dapat memverifikasi bahwa data upload soal telah tersimpan dengan benar di tabel `upload_soal`.