// Supabase client configuration
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Read Supabase configuration from window.__ENV__ (for static hosting) with fallbacks
const SUPABASE_URL = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_URL)
  ? window.__ENV__.SUPABASE_URL
  : 'https://puknlynkeluidmexyosm.supabase.co';

const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__.SUPABASE_ANON_KEY)
  ? window.__ENV__.SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1a25seW5rZWx1aWRtZXh5b3NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0NDY4MjAsImV4cCI6MjA3NDAyMjgyMH0.gZX3mHN2LXorriSAWfvrFO-6A_z2ZWXyIXMNT4VNDRY';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Save user profile to Supabase profiles table
 * @param {Object} userInfo - User information from Google OAuth
 * @returns {Promise<Object>} - Result of the operation
 */
export async function saveUserProfile(userInfo) {
  try {
    // Use Google user ID directly (no conversion needed if we change table structure)
    const userId = userInfo.sub;
    
    console.log('Saving user profile:', { 
      userId: userId,
      name: userInfo.name,
      email: userInfo.email
    });
    
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking existing user:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // If user exists, update their last login time
    if (existingUser) {
      console.log('User exists, updating profile');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          name: userInfo.name,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return { success: false, error: updateError.message };
      }

      return { success: true, message: 'User profile updated successfully' };
    }

    // If user doesn't exist, create new profile
    console.log('User does not exist, creating new profile');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name: userInfo.name,
        role: 'mahasiswa',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, message: 'User profile created successfully' };
  } catch (error) {
    console.error('Unexpected error in saveUserProfile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user profile from Supabase
 * @param {string} userId - User ID from Google OAuth
 * @returns {Promise<Object>} - User profile data
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getUserProfile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save upload data to Supabase upload_soal table
 * @param {Object} uploadData - Upload data
 * @returns {Promise<Object>} - Result of the operation
 */
export async function saveUploadData(uploadData) {
  try {
    console.log('Saving upload data:', uploadData);
    
    // Karena kita tidak menggunakan auth.uid(), kita akan membiarkan RLS memeriksa policy yang lebih terbuka
    const { error: insertError } = await supabase
      .from('upload_soal')
      .insert({
        mk_id: uploadData.mk_id,
        tahun: uploadData.tahun,
        jenis_ujian: uploadData.jenis_ujian,
        file_url: uploadData.file_url,
        uploaded_by: uploadData.uploaded_by,
        status: uploadData.status || 'pending',
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error saving upload data:', insertError);
      return { success: false, error: insertError.message };
    }

    return { success: true, message: 'Upload data saved successfully' };
  } catch (error) {
    console.error('Unexpected error in saveUploadData:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get mata kuliah by kode_mk
 * @param {string} kodeMk - Kode mata kuliah
 * @returns {Promise<Object>} - Mata kuliah data
 */
export async function getMataKuliahByKode(kodeMk) {
  try {
    console.log('Fetching mata kuliah with kode_mk:', kodeMk);
    
    const { data, error } = await supabase
      .from('mata_kuliah')
      .select('mk_id')
      .eq('kode_mk', kodeMk)
      .single();

    if (error) {
      console.error('Error fetching mata kuliah:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.error('Mata kuliah not found for kode_mk:', kodeMk);
      return { success: false, error: 'Mata kuliah tidak ditemukan' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getMataKuliahByKode:', error);
    return { success: false, error: error.message };
  }
}

/** 
 * Get pending uploads for admin dashboard
 * @returns {Promise<Object>} - Pending uploads data
 */
export async function getPendingUploads() {
  try {
    const { data, error } = await supabase
      .from('upload_soal')
      .select(`
        *,
        mata_kuliah(kode_mk, nama_mk),
        profiles!upload_soal_uploaded_by_fkey(name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending uploads:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getPendingUploads:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all users for admin dashboard
 * @returns {Promise<Object>} - Users data
 */
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getAllUsers:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all dokumen soal for admin dashboard
 * @returns {Promise<Object>} - Dokumen soal data
 */
export async function getAllDokumenSoal() {
  try {
    const { data, error } = await supabase
      .from('dokumen_soal')
      .select(`
        *,
        mata_kuliah(kode_mk, nama_mk),
        profiles!dokumen_soal_uploaded_by_fkey(name),
        approvedBy:profiles!dokumen_soal_approved_by_fkey(name)
      `)
      .order('created_at', { ascending: false });

    console.log('getAllDokumenSoal result:', { data, error });

    if (error) {
      console.error('Error fetching dokumen soal:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error in getAllDokumenSoal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Approve upload and move to dokumen_soal
 * @param {string} uploadId - Upload ID
 * @param {string} approvedBy - User ID of approver
 * @returns {Promise<Object>} - Result of the operation
 */
export async function approveUpload(uploadId, approvedBy) {
  try {
    // Get upload data
    const { data: uploadData, error: fetchError } = await supabase
      .from('upload_soal')
      .select('*')
      .eq('upload_id', uploadId)
      .single();

    if (fetchError) {
      console.error('Error fetching upload data:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Insert into dokumen_soal
    const { error: insertError } = await supabase
      .from('dokumen_soal')
      .insert({
        mk_id: uploadData.mk_id,
        tahun: uploadData.tahun,
        jenis_ujian: uploadData.jenis_ujian,
        file_url: uploadData.file_url,
        uploaded_by: uploadData.uploaded_by, // Add uploaded_by information
        approved_by: approvedBy,
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting into dokumen_soal:', insertError);
      return { success: false, error: insertError.message };
    }

    // Update upload status
    const { error: updateError } = await supabase
      .from('upload_soal')
      .update({ 
        status: 'approved',
        reviewed_by: approvedBy,
      })
      .eq('upload_id', uploadId);

    if (updateError) {
      console.error('Error updating upload status:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, message: 'Upload approved successfully' };
  } catch (error) {
    console.error('Unexpected error in approveUpload:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reject upload
 * @param {string} uploadId - Upload ID
 * @param {string} rejectedBy - User ID of rejector
 * @returns {Promise<Object>} - Result of the operation
 */
export async function rejectUpload(uploadId, rejectedBy) {
  try {
    const { error: updateError } = await supabase
      .from('upload_soal')
      .update({ 
        status: 'rejected',
        reviewed_by: rejectedBy,
      })
      .eq('upload_id', uploadId);

    if (updateError) {
      console.error('Error updating upload status:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true, message: 'Upload rejected successfully' };
  } catch (error) {
    console.error('Unexpected error in rejectUpload:', error);
    return { success: false, error: error.message };
  }
}