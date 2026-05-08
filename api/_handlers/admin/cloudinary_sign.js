/**
 * Cloudinary Signature Generator
 * POST /api/admin/cloudinary-sign
 * Generates a signature for direct browser-to-cloudinary upload.
 */
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdmin } from '../../_lib/auth.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // 1. Authenticate Admin
  const user = await verifyAdmin(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { timestamp, folder } = req.body;
    
    // 2. Generate Signature
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: folder || 'homedress_na' },
      process.env.CLOUDINARY_API_SECRET
    );

    return res.status(200).json({
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
