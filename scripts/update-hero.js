
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';
// Load env from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length === 2) {
    env[parts[0].trim()] = parts[1].trim();
  }
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

// Configure Supabase
const supabase = createClient(
  env.VITE_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const slides = [
  {
    localPath: 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\73f5c442-dea8-43dd-8b47-a083f571c1ca\\hero_homedress_luxury_1778237813635.png',
    title: 'Elegansi\nHarian',
    subtitle: 'Koleksi Homedress Premium\ndengan Bahan Silk yang Mewah',
    link_url: '/category.html?filter=homedress',
    slide_order: 1
  },
  {
    localPath: 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\73f5c442-dea8-43dd-8b47-a083f571c1ca\\hero_oneset_elegant_1778237829153.png',
    title: 'Kenyamanan\nMaksimal',
    subtitle: 'One Set Rayon Organik\nAdem & Lembut di Kulit',
    link_url: '/category.html?filter=one-set',
    slide_order: 2
  },
  {
    localPath: 'C:\\Users\\acer\\.gemini\\antigravity\\brain\\73f5c442-dea8-43dd-8b47-a083f571c1ca\\hero_new_arrival_chic_1778237845353.png',
    title: 'Gaya\nModern',
    subtitle: 'Tampil Stylish Setiap Hari\ndengan Motif Eksklusif',
    link_url: '/category.html?filter=new-in',
    slide_order: 3
  }
];

async function run() {
  console.log('🚀 Starting Hero Slider Update...');

  try {
    // 1. Clear existing slides (optional, or we can just upsert)
    // We'll delete all existing and insert new ones to keep it clean
    console.log('🧹 Clearing old slides...');
    const { error: delError } = await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
    if (delError) throw delError;

    for (const slide of slides) {
      console.log(`📤 Uploading image for: ${slide.title.replace('\n', ' ')}...`);
      
      const uploadResult = await cloudinary.uploader.upload(slide.localPath, {
        folder: 'homedress_na/hero',
        format: 'webp',
        quality: 'auto'
      });

      console.log(`✅ Uploaded to: ${uploadResult.secure_url}`);

      const payload = {
        title: slide.title,
        subtitle: slide.subtitle,
        link_url: slide.link_url,
        image_url: uploadResult.secure_url,
        slide_order: slide.slide_order,
        is_active: true,
        object_position: 'center'
      };

      console.log('💾 Saving to Supabase...');
      const { error: insError } = await supabase.from('hero_slides').insert([payload]);
      if (insError) throw insError;
    }

    console.log('✨ All slides updated successfully!');

  } catch (err) {
    console.error('❌ Error updating hero slides:', err);
  }
}

run();
