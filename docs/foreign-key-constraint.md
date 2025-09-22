# Masalah Foreign Key Constraint di Tabel profiles

## Masalah

Error yang muncul:
```
{code: '23503', details: 'Key (user_id)=(19e6b97f-0000-0000-0000-000000000000) is not present in table "users".', hint: null, message: 'insert or update on table "profiles" violates foreign key constraint "profiles_user_id_fkey"'}
```

## Penyebab

Masalah ini terjadi karena foreign key constraint antara tabel `profiles` dan `auth.users`. Kolom `user_id` di tabel `profiles` merupakan foreign key yang merujuk ke kolom `id` di tabel `auth.users`. Ketika mencoba menyimpan data ke tabel `profiles`, sistem memeriksa apakah `user_id` tersebut ada di tabel `auth.users`. Jika tidak ada, maka terjadi error.

## Solusi

Ada beberapa pendekatan untuk menyelesaikan masalah ini:

### Pendekatan 1: Menghapus Foreign Key Constraint (Tidak Disarankan)
```sql
ALTER TABLE profiles DROP CONSTRAINT profiles_user_id_fkey;
```

**Kelemahan:**
- Menghilangkan integritas referensial
- Bisa menyebabkan data yang tidak konsisten

### Pendekatan 2: Menggunakan UUID dari Supabase Auth (Disarankan)
Daripada mengonversi Google User ID ke UUID, lebih baik menggunakan sistem autentikasi Supabase yang sebenarnya. Ini memerlukan perubahan arsitektur:

1. Menggunakan Google OAuth melalui Supabase Auth
2. Membiarkan Supabase menghasilkan UUID yang sesuai
3. Menghubungkan tabel `profiles` dengan user yang sudah terdaftar di Supabase Auth

### Pendekatan 3: Menyimpan Google User ID sebagai String (Alternatif)
Mengubah tipe kolom `user_id` di tabel `profiles` menjadi `TEXT` dan menyimpan Google User ID secara langsung:

```sql
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
```

## Rekomendasi

Untuk sistem saat ini, pendekatan ketiga adalah yang paling mudah dan cepat untuk diimplementasikan, karena:
1. Tidak memerlukan perubahan besar pada arsitektur
2. Masih mempertahankan fungsionalitas yang dibutuhkan
3. Mudah diimplementasikan tanpa perlu konfigurasi tambahan

## Implementasi Pendekatan 3

1. Jalankan perintah SQL berikut di Supabase:
```sql
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
```

2. Perbarui fungsi `saveUserProfile` untuk tidak mengonversi Google User ID:
```javascript
// Alih-alih:
// const userId = stringToUUID(userInfo.sub);

// Gunakan langsung:
const userId = userInfo.sub;
```

## Pertimbangan Keamanan

Dengan pendekatan ini, pastikan:
1. Validasi email tetap dilakukan untuk domain @mhs.itenas.ac.id
2. Data pengguna tetap aman dan tidak dapat diakses oleh pihak yang tidak berwenang
3. Session management tetap dilakukan dengan benar