# Solusi untuk Masalah UUID di Supabase

## Masalah

Ketika mencoba menyimpan Google User ID ke tabel `profiles` di Supabase, terjadi error:
```
Error checking existing user: {code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "116104627935258850162"'}
```

## Penyebab

Google User ID berupa string numerik panjang (`116104627935258850162`), sedangkan kolom `user_id` di tabel `profiles` bertipe `uuid` yang mengharapkan format UUID standar (8-4-4-4-12).

## Solusi

Kami telah mengimplementasikan fungsi `stringToUUID()` di `supabase.js` yang mengonversi Google User ID ke format UUID yang valid:

```javascript
function stringToUUID(str) {
  // Create a hash of the input string
  let hash = '';
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to hexadecimal string
  let hex = Math.abs(hash).toString(16);
  
  // Pad or trim to ensure we have enough characters
  hex = hex.padEnd(32, '0').substring(0, 32);
  
  // Format as UUID (8-4-4-4-12)
  const uuid = `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
  
  return uuid.toLowerCase();
}
```

## Cara Kerja

1. Fungsi ini mengambil string input (Google User ID)
2. Membuat hash dari string input menggunakan algoritma sederhana
3. Mengonversi hash ke representasi heksadesimal
4. Memastikan hasil memiliki panjang 32 karakter dengan padding atau trimming
5. Memformat hasil sesuai standar UUID (8-4-4-4-12)
6. Mengembalikan string dalam format UUID yang valid

## Contoh

Input: `116104627935258850162`
Output: `31313631-3034-3632-3739-333532353838` (contoh output, aktual akan berbeda karena menggunakan hash)

## Keuntungan Pendekatan Hash

1. **Konsisten** - Setiap input yang sama akan menghasilkan output yang sama
2. **Valid** - Output selalu dalam format UUID yang valid
3. **Aman** - Tidak mengekspos informasi sensitif dari ID asli
4. **Efisien** - Proses konversi cepat dan ringan

## Alternatif

Jika Anda lebih memilih mengubah struktur tabel daripada mengonversi ID, Anda bisa menjalankan perintah SQL berikut di Supabase:

```sql
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
```

Namun, pendekatan konversi ID lebih disukai karena:
1. Memelihara integritas tipe data
2. Konsisten dengan desain database
3. Lebih aman dan efisien