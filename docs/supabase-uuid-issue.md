# Masalah dengan Tabel Profiles di Supabase

Berdasarkan error yang muncul:
```
Error checking existing user: {code: '22P02', details: null, hint: null, message: 'invalid input syntax for type uuid: "116104627935258850162"'}
```

Masalah ini terjadi karena Google User ID berupa string numerik panjang, sedangkan kolom `user_id` di tabel `profiles` bertipe `uuid`.

## Solusi

Kita perlu mengonversi Google User ID ke format UUID yang kompatibel dengan PostgreSQL. Ada beberapa pendekatan:

1. **Mengubah tipe kolom user_id dari uuid ke text** - Ini adalah solusi termudah tetapi mungkin tidak optimal untuk kinerja.

2. **Mengonversi Google User ID ke UUID yang valid** - Ini adalah pendekatan yang lebih baik secara arsitektural.

## Rekomendasi

Saya merekomendasikan pendekatan kedua karena:
- Memelihara integritas tipe data
- Konsisten dengan desain database
- Lebih aman dan efisien

## Perubahan yang Diperlukan

1. Memperbarui fungsi `saveUserProfile` dan `getUserProfile` di `supabase.js` untuk mengonversi Google User ID ke UUID yang valid.

2. Alternatifnya, jika Anda ingin mengubah struktur tabel, Anda bisa menjalankan perintah SQL berikut di Supabase:

```sql
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
```

Namun, pendekatan yang lebih baik adalah mengonversi ID Google ke format UUID yang valid dalam kode JavaScript.