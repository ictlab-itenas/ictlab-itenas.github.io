# Google Sheets Database Setup

## Langkah-langkah Setup Google Sheets sebagai Database

### 1. Buat Google Spreadsheet

1. Buka [Google Sheets](https://sheets.google.com/)
2. Buat spreadsheet baru dengan nama "ICT Lab Users Database"
3. Buat header di baris pertama:
   - Column A: Email
   - Column B: Name
   - Column C: Login Time
   - Column D: Last Active
   - Column E: Login Count
4. Copy Spreadsheet ID dari URL (bagian setelah `/d/` dan sebelum `/edit`)
   - URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

### 2. Setup Google Apps Script

1. Di Google Sheets, klik **Extensions** > **Apps Script**
2. Hapus kode default dan paste kode berikut:

```javascript
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    if (data.action === 'saveUser') {
      return saveUser(sheet, data);
    } else if (data.action === 'getUser') {
      return getUser(sheet, data);
    } else if (data.action === 'updateLastActive') {
      return updateLastActive(sheet, data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid action'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function saveUser(sheet, data) {
  const email = data.email;
  const name = data.name;
  const loginTime = new Date().toISOString();
  
  // Check if user already exists
  const emailColumn = sheet.getRange('A:A').getValues();
  let userRow = -1;
  
  for (let i = 1; i < emailColumn.length; i++) {
    if (emailColumn[i][0] === email) {
      userRow = i + 1;
      break;
    }
  }
  
  if (userRow > 0) {
    // Update existing user
    const currentCount = sheet.getRange(userRow, 5).getValue() || 0;
    sheet.getRange(userRow, 3).setValue(loginTime); // Login Time
    sheet.getRange(userRow, 4).setValue(loginTime); // Last Active
    sheet.getRange(userRow, 5).setValue(currentCount + 1); // Login Count
  } else {
    // Add new user
    const newRow = sheet.getLastRow() + 1;
    sheet.getRange(newRow, 1).setValue(email);
    sheet.getRange(newRow, 2).setValue(name);
    sheet.getRange(newRow, 3).setValue(loginTime);
    sheet.getRange(newRow, 4).setValue(loginTime);
    sheet.getRange(newRow, 5).setValue(1);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'User saved successfully'
  })).setMimeType(ContentService.MimeType.JSON);
}

function getUser(sheet, data) {
  const email = data.email;
  const emailColumn = sheet.getRange('A:A').getValues();
  
  for (let i = 1; i < emailColumn.length; i++) {
    if (emailColumn[i][0] === email) {
      const rowData = sheet.getRange(i + 1, 1, 1, 5).getValues()[0];
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        user: {
          email: rowData[0],
          name: rowData[1],
          loginTime: rowData[2],
          lastActive: rowData[3],
          loginCount: rowData[4]
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'User not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

function updateLastActive(sheet, data) {
  const email = data.email;
  const emailColumn = sheet.getRange('A:A').getValues();
  
  for (let i = 1; i < emailColumn.length; i++) {
    if (emailColumn[i][0] === email) {
      sheet.getRange(i + 1, 4).setValue(new Date().toISOString());
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Last active updated'
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    message: 'User not found'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput('ICT Lab Database API is running');
}
```

3. Klik **Save** dan beri nama project "ICT Lab Database API"
4. Klik **Deploy** > **New deployment**
5. Pilih type: **Web app**
6. Execute as: **Me**
7. Who has access: **Anyone**
8. Klik **Deploy**
9. Copy **Web app URL** yang dihasilkan

### 3. Update Konfigurasi Website ✅ SELESAI

Konfigurasi sudah lengkap:
- ✅ `YOUR_GOOGLE_CLIENT_ID_HERE` → `932373464615-f07kgcbiulom1g59nrs5i6k696m5lq3t.apps.googleusercontent.com`
- ✅ `YOUR_APPS_SCRIPT_URL_HERE` → `https://script.google.com/macros/s/AKfycbxpH3tbEZ_C9jWvXZQhefCIhCps1aKZm01TQURPxyvCbIKb0Jw6yyMuoUyWzCARZVMs-w/exec`

### 4. Test Setup

1. Test Google OAuth login
2. Periksa apakah data tersimpan di spreadsheet
3. Test validasi domain email @itenas.ac.id

## Security Notes

- Apps Script berjalan dengan permission Google account Anda
- Pastikan hanya domain @itenas.ac.id yang bisa login
- Data tersimpan langsung di Google Sheets yang aman
- Gunakan HTTPS untuk production

## Troubleshooting

### Error "Script not found"
- Pastikan deployment sudah benar
- Cek permission Apps Script

### Error "Access denied"
- Pastikan "Who has access" diset ke "Anyone"
- Cek apakah spreadsheet bisa diakses

### Email validation tidak bekerja
- Periksa domain email di kode JavaScript
- Test dengan email @itenas.ac.id yang valid
