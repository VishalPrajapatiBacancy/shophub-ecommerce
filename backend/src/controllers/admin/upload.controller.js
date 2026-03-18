import { supabase } from '../../config/database.js';
import { config } from '../../config/env.js';

const BUCKET = 'admin-uploads';

async function ensureBucket() {
  // Try to list bucket contents — succeeds if bucket exists
  const { error: listError } = await supabase.storage.from(BUCKET).list('', { limit: 1 });
  if (!listError) return; // bucket exists and is accessible

  // Bucket missing — create it via Management REST API using service role key
  const serviceKey = config.supabaseServiceRoleKey;
  const supabaseUrl = config.supabaseUrl;

  const res = await fetch(`${supabaseUrl}/storage/v1/bucket`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
      file_size_limit: 5242880,
      allowed_mime_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    }),
  });

  const json = await res.json();

  // "already exists" is fine
  if (!res.ok && !json?.error?.toLowerCase().includes('already exist') && !json?.message?.toLowerCase().includes('already exist')) {
    throw new Error(
      `Storage bucket "${BUCKET}" could not be created: ${json?.message || json?.error || res.statusText}`
    );
  }
}

/**
 * POST /admin/upload
 * Accepts multipart/form-data with a single "file" field.
 * Uploads to Supabase Storage and returns the public HTTPS URL.
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const { folder = 'general' } = req.body;
    const file = req.file;

    await ensureBucket();

    const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '-').toLowerCase();
    const path = `${folder}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    res.json({ success: true, url: data.publicUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
