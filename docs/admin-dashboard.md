# Admin Dashboard Documentation

## Overview

The Admin Dashboard is a comprehensive management interface for the ICT Lab Question Bank system. It provides administrators with tools to manage user uploads, approve/reject submissions, and oversee the entire question bank ecosystem.

## Features

### 1. Statistics Overview
- Total Users count
- Official Documents count
- Pending Uploads count

### 2. Pending Uploads Management
- View all pending uploads in a sortable table
- Filter uploads by course
- Approve or reject uploads with one click
- View uploaded files directly

### 3. Official Documents Management
- View all approved documents
- Filter documents by course
- Delete documents if needed
- View documents directly

### 4. User Management
- View all registered users
- Filter users by name
- Delete users (except admins)
- View user roles and registration dates

## Access Requirements

To access the Admin Dashboard, a user must:
1. Be logged in with a valid Google account (@mhs.itenas.ac.id)
2. Have the 'admin' role in the profiles table

## Navigation

The dashboard can be accessed via the `/admin/dashboard.html` URL. Users without admin privileges will be automatically redirected to the homepage.

Navigation menu includes:
- Home (back to main site)
- Question Bank
- Upload page
- Logout

## Workflow

### Upload Approval Process
1. User uploads a file through the upload page
2. File is stored in Supabase Storage
3. Metadata is saved to the `upload_soal` table with 'pending' status
4. Admin reviews the upload in the dashboard
5. Admin clicks 'Approve' or 'Reject':
   - If Approved: Data moves from `upload_soal` to `dokumen_soal` table
   - If Rejected: Status in `upload_soal` changes to 'rejected'

## Technical Implementation

### Frontend Components
- HTML5 semantic markup
- CSS3 with responsive design
- JavaScript ES6 modules
- Supabase JavaScript client
- SweetAlert2 for notifications

### Backend Integration
- Supabase REST API for data operations
- Supabase Storage for file management
- Row Level Security (RLS) for access control

### Security Considerations
- Only users with 'admin' role can access the dashboard
- All operations are logged
- Secure API calls using Supabase client

## Customization

### Styling
The dashboard uses a clean, minimalist design with:
- Blue primary color scheme
- Responsive grid layout
- Card-based statistics display
- Table-based data presentation

### Extensibility
The dashboard is built with modular JavaScript classes that can be easily extended with new features.

## Troubleshooting

### Common Issues

1. **Access Denied**: 
   - Ensure user has 'admin' role in profiles table
   - Check that user is properly logged in

2. **Data Not Loading**:
   - Check network connectivity
   - Verify Supabase API keys
   - Check RLS policies

3. **Upload Errors**:
   - Check file size limits
   - Verify storage bucket permissions
   - Check foreign key constraints

### Debugging Tips

1. Use browser developer tools to monitor network requests
2. Check browser console for JavaScript errors
3. Verify data in Supabase dashboard tables
4. Check Supabase logs for API call errors

## Maintenance

### Regular Tasks

1. Monitor pending uploads and process in a timely manner
2. Review official documents for accuracy
3. Remove inactive users periodically
4. Backup database regularly

### Updates

When updating the dashboard:
1. Test all functionality in development environment
2. Update documentation accordingly
3. Notify admin users of changes
4. Monitor for issues after deployment