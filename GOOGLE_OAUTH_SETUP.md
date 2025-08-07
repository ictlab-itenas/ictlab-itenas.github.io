# Google OAuth Setup Instructions

## Langkah-langkah Setup Google OAuth

### 1. Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan Google+ API atau Google Identity API

### 2. Buat OAuth 2.0 Client ID

1. Pergi ke **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **OAuth 2.0 Client ID**
3. Pilih **Web application**
4. Isi nama aplikasi (contoh: "ICT Lab Website")
5. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:3000` (untuk development)
   - `https://yourdomain.com` (untuk production)
6. Tambahkan **Authorized redirect URIs**:
   - `http://localhost:3000/login.html`
   - `https://yourdomain.com/login.html`
7. Klik **Create**
8. Copy **Client ID** yang dihasilkan

### 3. Update Client ID di Website

1. Buka file `login.html`
2. Ganti `YOUR_GOOGLE_CLIENT_ID_HERE` dengan Client ID yang sudah didapat
3. Update di dua tempat:
   - `data-client_id="YOUR_GOOGLE_CLIENT_ID_HERE"`
   - `const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID_HERE';`

### 4. Testing

1. Jalankan website di local server atau deploy ke hosting
2. Buka halaman login
3. Test Google Sign-In
4. Periksa console browser untuk error debugging

## Contoh Client ID
```javascript
// Ganti dengan Client ID yang sebenarnya
const GOOGLE_CLIENT_ID = '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com';
```

## Domain yang Diizinkan
Pastikan domain website sudah ditambahkan ke:
- Authorized JavaScript origins
- Authorized redirect URIs

## Troubleshooting

### Error "Not authorized"
- Periksa apakah domain sudah ditambahkan ke authorized origins
- Pastikan protocol (http/https) sesuai

### Button tidak muncul
- Periksa Client ID sudah benar
- Cek console browser untuk error
- Pastikan Google API script sudah ter-load

### Token tidak valid
- Periksa waktu sistem (token sensitive terhadap waktu)
- Pastikan Client ID masih aktif

## Security Notes

1. **Jangan expose Client Secret** di frontend
2. **Validasi token** di backend jika memungkinkan
3. **Set proper CORS** headers
4. **Monitor usage** di Google Cloud Console

## Production Checklist

- [ ] Client ID sudah diganti dari placeholder
- [ ] Domain production sudah ditambahkan ke authorized origins
- [ ] HTTPS sudah aktif (required untuk production)
- [ ] Privacy Policy dan Terms of Service sudah ada
- [ ] Error handling sudah proper

## Backend Integration (Optional)

Jika ingin integrasi dengan backend:

```javascript
// Kirim token ke backend untuk validasi
fetch('/api/auth/google', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    token: response.credential
  })
})
.then(response => response.json())
.then(data => {
  // Handle response
});
```
