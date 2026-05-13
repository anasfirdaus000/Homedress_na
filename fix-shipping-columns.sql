-- =============================================
-- MIGRATION: Kolom Shipping & Tracking untuk Orders
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- =============================================

-- 1. Kolom shipping metadata (dari Biteship checkout)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_area_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin_area_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_name TEXT;

-- 2. Kolom tracking/resi (dari Biteship create-shipment)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_status TEXT;

-- 3. Kolom weight & stock di products
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 300;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER;

-- 4. Kolom Louvin payment gateway
ALTER TABLE orders ADD COLUMN IF NOT EXISTS louvin_transaction_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_qr_string TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_va_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_expiry TIMESTAMPTZ;

-- 5. Pastikan RLS mengizinkan service_role
DROP POLICY IF EXISTS "Service role manages orders" ON orders;
CREATE POLICY "Service role manages orders" ON orders FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role manages order items" ON order_items;
CREATE POLICY "Service role manages order items" ON order_items FOR ALL USING (auth.role() = 'service_role');

-- 6. Verifikasi (akan menampilkan kolom yang baru ditambahkan)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN (
  'shipping_courier_name','shipping_method_code','destination_area_id',
  'origin_area_id','origin_name','destination_name',
  'shipping_tracking_number','shipping_courier','shipping_status',
  'louvin_transaction_id','payment_qr_string','payment_va_number','payment_expiry'
)
ORDER BY column_name;
