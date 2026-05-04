/**
 * Admin Upload API (Cloudinary)
 * POST /api/admin/upload
 * Accepts a base64 encoded image and uploads it to Cloudinary.
 * Returns the secure URL of the uploaded image.
 */
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Admin Helper
async function verifyAdmin(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Config for Vercel Serverless to accept larger payloads (for base64 images)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1. Authenticate Admin
  const user = await verifyAdmin(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Extract base64 image from body
  const { file, folder } = req.body || {};
  
  if (!file) {
    return res.status(400).json({ error: 'Tidak ada file yang dikirim' });
  }

  try {
    // 3. Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file, {
      folder: folder || 'homedress_na/products',
      // Optional: automatically convert and compress
      format: 'webp',
      quality: 'auto'
    });

    // 4. Return the secure URL
    return res.status(200).json({ 
      success: true, 
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
    
  } catch (err) {
    console.error('Cloudinary Upload Error:', err);
    return res.status(500).json({ 
      error: 'Gagal mengupload gambar ke Cloudinary',
      details: err.message
    });
  }
}
