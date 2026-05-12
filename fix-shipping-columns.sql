-- =============================================
-- MIGRATION: Tambah kolom untuk Biteship Shipping
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Tambah kolom shipping metadata ke tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_area_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin_area_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_name TEXT;

-- 2. Tambah kolom weight & stock ke products (jika belum ada)
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 300;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER;

-- 3. Verifikasi kolom berhasil ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('shipping_courier_name','shipping_method_code','destination_area_id','origin_area_id','origin_name','destination_name')
ORDER BY column_name;
