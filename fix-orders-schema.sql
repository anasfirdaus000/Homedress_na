-- =============================================
-- FIX SCHEMA: Tambahkan kolom user_id ke tabel orders
-- Jalankan kode ini di SQL Editor Supabase Anda
-- =============================================

-- 1. Tambahkan kolom user_id jika belum ada
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Tambahkan kolom pendukung Louvin ke tabel orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS louvin_transaction_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_qr_string TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_va_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_expiry TIMESTAMPTZ;

-- 3. Pastikan tabel orders memiliki kolom tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_courier TEXT;

-- 4. Pastikan tabel order_items memiliki kolom product_image
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_image TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS size TEXT;

-- 4. Reload Schema Cache (Opsional tapi disarankan)
-- Catatan: Supabase biasanya otomatis reload, jika tidak, Anda bisa klik "Reload Schema" di API Settings.

-- 4. Pastikan RLS juga mengizinkan service_role (untuk checkout otomatis)
DROP POLICY IF EXISTS "Service role manages orders" ON orders;
CREATE POLICY "Service role manages orders" ON orders FOR ALL USING (auth.role() = 'service_role');
