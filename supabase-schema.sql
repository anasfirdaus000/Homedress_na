-- =============================================
-- HOMEDRESS_NA E-Commerce Database Schema
-- Run this SQL in Supabase Dashboard > SQL Editor
-- =============================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Service role manages categories" ON categories FOR ALL USING (auth.role() = 'service_role');

-- Insert default categories
INSERT INTO categories (name, slug) VALUES 
('Atasan', 'atasan'),
('Bawahan', 'bawahan'),
('Dress', 'dress'),
('Setelan', 'setelan'),
('New In ✨', 'new-in'),
('Flash Sale 🔥', 'flash-sale'),
('Bundling Hemat', 'bundling'),
('Clearance', 'clearance')
ON CONFLICT (slug) DO NOTHING;

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'HOMEDRESS_NA',
  category TEXT[] DEFAULT '{}',
  price INTEGER NOT NULL,
  original_price INTEGER,
  discount INTEGER DEFAULT 0,
  description TEXT,
  details JSONB DEFAULT '[]',
  sizes JSONB DEFAULT '[]',
  disabled_sizes JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  video_embed_url TEXT,
  social_proof TEXT,
  related_ids TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  shipping_address TEXT NOT NULL,
  city TEXT,
  postal_code TEXT,
  province TEXT,
  notes TEXT,
  payment_method TEXT DEFAULT 'transfer',
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_cost INTEGER DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','confirmed','processing','shipped','completed','cancelled')),
  louvin_transaction_id TEXT,
  payment_qr_string TEXT,
  payment_va_number TEXT,
  payment_expiry TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  size TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. NOTIFICATIONS LOG TABLE
CREATE TABLE IF NOT EXISTS notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'whatsapp',
  provider TEXT DEFAULT 'fonnte',
  recipient TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. SITE SETTINGS TABLE (CMS)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Products: anyone can READ active products
CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);

-- Products: only service_role (backend API) can INSERT/UPDATE/DELETE
CREATE POLICY "Service role manages products" ON products
  FOR ALL USING (auth.role() = 'service_role');

-- Orders: only service_role (backend API) can manage
CREATE POLICY "Service role manages orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages order items" ON order_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role manages notifications" ON notifications_log
  FOR ALL USING (auth.role() = 'service_role');

-- Site settings: anyone can READ, only service_role can WRITE
CREATE POLICY "Public can read settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Service role manages settings" ON site_settings
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- =============================================
-- DEFAULT SITE SETTINGS
-- =============================================
INSERT INTO site_settings (key, value) VALUES
  ('announcement_bar', '{"text": "GRATIS ONGKIR untuk pembelian di atas Rp 200.000 🚚", "is_active": true}'),
  ('hero_banner', '{"title": "Homewear Premium untuk Wanita Aktif", "subtitle": "Nyaman dipakai seharian — dari santai di rumah hingga hangout kasual", "cta_text": "BELANJA SEKARANG", "cta_link": "/category.html", "bg_image": "/images/Parallax_image_banner_mobile_768_x_1113_px.png"}'),
  ('flash_sale', '{"is_active": true, "end_date": "2026-06-01T23:59:59", "discount_text": "Diskon s/d 50%"}'),
  ('promo_popup', '{"is_active": true, "title": "SPESIAL HARI INI", "text": "Diskon hingga 50% untuk semua kategori!", "image": "/images/45964E36-0747-4AB6-8315-23B1C57EA16E.jpg", "cta_text": "LIHAT PROMO", "cta_link": "/promo.html"}'),
  ('social_links', '{"tiktok": "https://www.tiktok.com/@homedress_na", "instagram": "", "whatsapp": "6285216854492"}')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- HELPER FUNCTION: generate order number
-- =============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today_count INTEGER;
  today_str TEXT;
BEGIN
  today_str := TO_CHAR(NOW(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE order_number LIKE 'HDN-' || today_str || '-%';
  RETURN 'HDN-' || today_str || '-' || LPAD(today_count::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 6. USER PROFILES TABLE (Customers)
-- =============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  postal_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- User profiles: user can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- User profiles: user can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- User profiles: user can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Service role manages all
CREATE POLICY "Service role manages user profiles" ON user_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- TABLE: hero_slides
-- ==========================================
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  link_url TEXT,
  image_url TEXT,
  video_url TEXT,
  slide_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  object_position TEXT DEFAULT 'center',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS for hero_slides
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Policy: Public can read active hero slides
CREATE POLICY "Public can read active hero slides" 
ON hero_slides FOR SELECT 
USING (is_active = true);

-- Policy: Service role has full access (for Admin API)
CREATE POLICY "Service role full access hero slides" 
ON hero_slides FOR ALL 
USING (true)
WITH CHECK (true);

-- =============================================
-- 6. FEATURED SECTIONS TABLE (Banners & Promos)
-- =============================================
CREATE TABLE IF NOT EXISTS featured_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'pinned_banner' or 'floating_promo'
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  video_url TEXT,
  product_slug TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE featured_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active featured sections" 
ON featured_sections FOR SELECT 
USING (is_active = true);

CREATE POLICY "Service role full access featured sections" 
ON featured_sections FOR ALL 
USING (auth.role() = 'service_role');

