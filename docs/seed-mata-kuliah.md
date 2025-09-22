# Cara Mengisi Data Mata Kuliah ke Supabase

## Persiapan

Sebelum mengisi data mata kuliah, pastikan:

1. Tabel `mata_kuliah` sudah dibuat di Supabase dengan struktur yang benar
2. Anda memiliki akses ke Supabase project
3. File `seed-mata-kuliah.js` sudah tersedia
4. RLS (Row Level Security) sudah diatur dengan benar untuk database dan storage

## Struktur Tabel mata_kuliah

```sql
CREATE TABLE mata_kuliah (
    mk_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    kode_mk text UNIQUE NOT NULL,
    nama_mk text NOT NULL
);
```

## Cara Mengisi Data

### Metode 1: Menggunakan Script JavaScript

1. Buka file `scripts/seed-mata-kuliah.js`
2. Pastikan konfigurasi SUPABASE_URL dan SUPABASE_ANON_KEY sudah benar
3. Jalankan script dengan perintah:

```bash
node scripts/seed-mata-kuliah.js
```

atau jika menggunakan browser, buka file HTML berikut:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Seed Mata Kuliah</title>
</head>
<body>
    <h1>Seed Mata Kuliah ke Supabase</h1>
    <button onclick="runSeed()">Jalankan Seed</button>
    <div id="output"></div>

    <script type="module">
        import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
        
        // Konfigurasi Supabase
        const SUPABASE_URL = 'https://puknlynkeluidmexyosm.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a25seW5rZWx1aWRtZXh5b3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDY4MjAsImV4cCI6MjA3NDAyMjgyMH0.gZX3mHN2LXorriSAWfvrFO-6A_z2ZWXyIXMNT4VNDRY';
        
        // Buat client Supabase
        const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Data mata kuliah
        const mataKuliahData = [
          { kode_mk: "IFB-102", nama_mk: "PENGANTAR IOT" },
          { kode_mk: "IFB-103", nama_mk: "KEWARGANEGARAAN" },
          { kode_mk: "IFB-104", nama_mk: "BASIS DATA" },
          { kode_mk: "IFB-105", nama_mk: "PROBABILITAS DAN STATISTIKA" },
          { kode_mk: "IFB-106", nama_mk: "MATEMATIKA LANJUT" },
          { kode_mk: "IFB-107", nama_mk: "PENGANTAR SAINS KOMPUTER" },
          { kode_mk: "IFB-108", nama_mk: "ALGORITMA LANJUT" },
          { kode_mk: "IFB-109", nama_mk: "ALGORITMA DASAR" },
          { kode_mk: "IFB-110", nama_mk: "PENGANTAR SAINS DATA" },
          { kode_mk: "IFB-111", nama_mk: "MATEMATIKA" },
          { kode_mk: "IFB-112", nama_mk: "ORGANISASI DAN ARSITEKTUR KOMPUTER" },
          { kode_mk: "IFB-113", nama_mk: "MATEMATIKA KOMPUTER" },
          { kode_mk: "IFB-114", nama_mk: "PENGANTAR TRANSFORMASI DIGITAL" },
          { kode_mk: "IFB-201", nama_mk: "GRAFIKA KOMPUTER TERAPAN" },
          { kode_mk: "IFB-202", nama_mk: "PEMROGRAMAN BERORIENTASI OBJEK" },
          { kode_mk: "IFB-203", nama_mk: "INTERAKSI MANUSIA DAN KOMPUTER" },
          { kode_mk: "IFB-204", nama_mk: "JARINGAN KOMPUTER" },
          { kode_mk: "IFB-205", nama_mk: "PEMROGRAMAN BASIS DATA" },
          { kode_mk: "IFB-206", nama_mk: "KOMPUTASI PARALEL & SISTEM TERDISTRIBUSI" },
          { kode_mk: "IFB-207", nama_mk: "PEMROGRAMAN DASAR" },
          { kode_mk: "IFB-208", nama_mk: "PENGOLAHAN CITRA DIGITAL" },
          { kode_mk: "IFB-209", nama_mk: "SISTEM OPERASI" },
          { kode_mk: "IFB-210", nama_mk: "PEMROGRAMAN WEB LANJUT" },
          { kode_mk: "IFB-211", nama_mk: "PEMROGRAMAN WEB" },
          { kode_mk: "IFB-213", nama_mk: "REKAYASA PERANGKAT LUNAK" },
          { kode_mk: "IFB-301", nama_mk: "COMPUTER VISION" },
          { kode_mk: "IFB-302", nama_mk: "KEAMANAN JARINGAN" },
          { kode_mk: "IFB-303", nama_mk: "TEKNIK MULTIMEDIA" },
          { kode_mk: "IFB-304", nama_mk: "SISTEM PAKAR DAN BAHASA ALAMIAH" },
          { kode_mk: "IFB-305", nama_mk: "KECERDASAN BUATAN" },
          { kode_mk: "IFB-306", nama_mk: "PENGENALAN UCAPAN DAN TEKS KE UCAPAN" },
          { kode_mk: "IFB-307", nama_mk: "DATA MINING DAN INFORMATION RETRIEVAL" },
          { kode_mk: "IFB-308", nama_mk: "PEMROGRAMAN ROBOTIKA" },
          { kode_mk: "IFB-309", nama_mk: "PEMROGRAMAN IOT" },
          { kode_mk: "IFB-310", nama_mk: "MACHINE LEARNING" },
          { kode_mk: "IFB-312", nama_mk: "PEMROGRAMAN GAME" },
          { kode_mk: "IFB-351", nama_mk: "JARINGAN SYARAF TIRUAN" },
          { kode_mk: "IFB-352", nama_mk: "TRANSAKSI ELEKTRONIK" },
          { kode_mk: "IFB-353", nama_mk: "BASIS DATA LANJUT" },
          { kode_mk: "IFB-354", nama_mk: "BISNIS INTELIJEN" },
          { kode_mk: "IFB-355", nama_mk: "PEMROGRAMAN MOBILE" },
          { kode_mk: "IFB-356", nama_mk: "SISTEM OPERASI LANJUT" },
          { kode_mk: "IFB-401", nama_mk: "MANAJEMEN PROYEK" },
          { kode_mk: "IFB-451", nama_mk: "BIG DATA" },
          { kode_mk: "IFB-452", nama_mk: "KOMPUTASI AWAN" },
          { kode_mk: "IFB-453", nama_mk: "JARINGAN KOMPUTER LANJUT" },
          { kode_mk: "IFB-454", nama_mk: "DEEP LEARNING" },
          { kode_mk: "IFB-311", nama_mk: "BAHASA INGGRIS I" },
          { kode_mk: "IFB-407", nama_mk: "BAHASA INGGRIS II" },
          { kode_mk: "IFB-402", nama_mk: "BAHASA INGGRIS III" },
          { kode_mk: "IFB-404", nama_mk: "BAHASA INDONESIA" },
          { kode_mk: "IFB-405", nama_mk: "AGAMA" },
          { kode_mk: "IFB-409", nama_mk: "KEWIRAUSAHAAN" }
        ];
        
        async function runSeed() {
            try {
                document.getElementById('output').innerHTML = '<p>Memulai proses pengisian data mata kuliah...</p>';
                
                // Masukkan data baru
                const { data, error } = await supabase
                  .from('mata_kuliah')
                  .insert(mataKuliahData);
                
                if (error) {
                    document.getElementById('output').innerHTML = `<p style="color: red;">Error memasukkan data: ${error.message}</p>`;
                    return;
                }
                
                document.getElementById('output').innerHTML = `<p style="color: green;">Data mata kuliah berhasil dimasukkan!</p><p>Jumlah data yang dimasukkan: ${mataKuliahData.length}</p>`;
                
            } catch (error) {
                document.getElementById('output').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
            }
        }
    </script>
</body>
</html>
```

### Metode 2: Menggunakan Supabase Dashboard

1. Buka Supabase Dashboard
2. Pilih proyek yang sesuai
3. Klik "Table Editor"
4. Pilih tabel `mata_kuliah`
5. Klik tombol "Insert" atau "Add row"
6. Masukkan data untuk setiap mata kuliah:
   - `kode_mk`: Kode mata kuliah (misal: IFB-102)
   - `nama_mk`: Nama mata kuliah (misal: PENGANTAR IOT)
   - `mk_id` akan diisi otomatis

### Metode 3: Menggunakan CSV Import

1. Buka file `data/mata_kuliah.csv`
2. Di Supabase Dashboard, pilih "Table Editor"
3. Pilih tabel `mata_kuliah`
4. Klik "Insert" kemudian "Import"
5. Upload file CSV
6. Mapping kolom sesuai dengan struktur tabel
7. Klik "Import"

## Mengatur Row Level Security (RLS)

Karena kita menggunakan sistem autentikasi Google OAuth dan tidak menggunakan auth.uid() secara langsung, kita perlu mengatur RLS dengan policy yang lebih terbuka:

1. **Untuk Database**:
   - Jalankan script `scripts/comprehensive-rls-setup.sql` di SQL Editor Supabase
   - Script ini akan:
     - Mengaktifkan RLS untuk semua tabel
     - Membuat policy yang mengizinkan semua operasi
     - Memberikan hak akses yang diperlukan kepada role anon

2. **Untuk Storage**:
   - Script juga akan mengatur RLS untuk bucket `bank-soal`
   - Membuat bucket jika belum ada
   - Mengatur policy untuk operasi storage

## Verifikasi Data

Setelah mengisi data, verifikasi dengan query berikut:

```sql
SELECT * FROM mata_kuliah ORDER BY kode_mk;
```

atau melalui JavaScript:

```javascript
const { data, error } = await supabase
  .from('mata_kuliah')
  .select('*')
  .order('kode_mk');

if (error) {
  console.error('Error:', error);
} else {
  console.log('Data mata kuliah:', data);
}
```

## Troubleshooting

### Error 406 (Not Acceptable)
Jika mendapat error 406 saat mengakses data mata kuliah, pastikan:
1. Tabel `mata_kuliah` sudah dibuat
2. Kolom `kode_mk` ada dan memiliki constraint UNIQUE
3. RLS (Row Level Security) diatur dengan benar
4. API key memiliki akses yang cukup

### Data Duplikat
Jika ada data duplikat:
1. Gunakan `ON CONFLICT` clause saat insert
2. Atau hapus data yang sudah ada sebelum memasukkan data baru

### Format Data
Pastikan format data sesuai:
- `kode_mk`: String unik (misal: IFB-102)
- `nama_mk`: String (misal: PENGANTAR IOT)

### Error RLS
Jika mendapat error "new row violates row-level security policy":
1. Pastikan RLS sudah diatur dengan benar untuk database dan storage
2. Pastikan policy mengizinkan operasi yang diperlukan
3. Pastikan role anon memiliki hak akses yang diperlukan
4. Jalankan script `scripts/comprehensive-rls-setup.sql`