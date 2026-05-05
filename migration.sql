-- =============================================
-- MIGRATION SCRIPT: KATEGORI & VARIAN
-- Copy paste kode di bawah ini ke SQL Editor Supabase
-- =============================================

-- 1. Buat Tabel Categories (Jika Belum Ada)
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan RLS untuk tabel categories (Abaikan error jika sudah aktif)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada, lalu buat baru (untuk menghindari error "already exists")
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages categories" ON categories;
CREATE POLICY "Service role manages categories" ON categories FOR ALL USING (auth.role() = 'service_role');

-- Masukkan data awal kategori
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

-- 2. Tambahkan kolom "variants" ke tabel "products"
-- Supabase tidak error jika kita menggunakan IF NOT EXISTS untuk penambahan kolom
ALTER TABLE products ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '[]'::jsonb;

-- =============================================
-- 3. FEATURED SECTIONS TABLE (Banners & Promos)
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

DROP POLICY IF EXISTS "Public can read active featured sections" ON featured_sections;
CREATE POLICY "Public can read active featured sections" 
ON featured_sections FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access featured sections" ON featured_sections;
CREATE POLICY "Service role full access featured sections" 
ON featured_sections FOR ALL 
USING (auth.role() = 'service_role');

-- =============================================
-- 4. UPDATE HERO SLIDER TABLE
-- =============================================
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS object_position TEXT DEFAULT 'center';

-- =============================================
-- 5. CATEGORIES & MENUS MANAGEMENT
-- =============================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'catalog', -- catalog, promo, best_seller
  image_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  parent_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  category_slug TEXT, -- links to categories.slug
  custom_url TEXT, -- alternative to category_slug
  menu_group TEXT NOT NULL, -- main_nav, footer_shop, footer_explore
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read menus" ON menus FOR SELECT USING (true);

-- Admin full access
CREATE POLICY "Admin full categories" ON categories FOR ALL USING (true);
CREATE POLICY "Admin full menus" ON menus FOR ALL USING (true);

-- =============================================
-- 6. INITIAL DATA SEEDING (RESTORE MISSING CONTENT)
-- =============================================

-- Categories
INSERT INTO categories (name, slug, type, image_url, is_featured, order_index) VALUES
('Setelan', 'setelan', 'catalog', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/93eed30ade39457cbba91443be7d10e8~tplv-aphluv4xwc-origin-jpeg.jpeg', true, 1),
('Footwear', 'footwear', 'catalog', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/629F5E92-479F-4E54-AE27-6D738460207B.jpg', true, 2),
('Atasan', 'atasan', 'catalog', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/7B439BBB-948E-41BF-B020-DE12C0DF956D.jpg', true, 3),
('Bawahan', 'bawahan', 'catalog', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/D239A4C4-7E42-40D1-AFF4-687EF9947F48.jpg', true, 4),
('Dress & Homedress', 'dress', 'catalog', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png', true, 5),
('New Arrival', 'new-in', 'catalog', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/Untitled_design-18.png', true, 6);

-- Root Menus
INSERT INTO menus (id, label, menu_group, order_index, custom_url) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Beranda', 'main_nav', 1, '/'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Flash Sale ⚡', 'main_nav', 2, '/flash-sale.html'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Best Seller 🔥', 'main_nav', 3, '/best-seller.html'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'New Arrival', 'main_nav', 4, '/new-in.html'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Semua Produk', 'main_nav', 5, '/category.html'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Promo Hari Ini 💸', 'main_nav', 6, '/promo.html'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'EXPLORE', 'main_nav', 7, '#');

-- Sub Menus (Best Seller)
INSERT INTO menus (id, label, parent_id, menu_group, order_index) VALUES
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'PALING DIMINATI', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'main_nav', 1),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'KAMI REKOMENDASIKAN', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'main_nav', 2);

-- Sub-sub Menus (PALING DIMINATI)
INSERT INTO menus (label, parent_id, menu_group, order_index, custom_url) VALUES
('Terlaris Minggu Ini', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'main_nav', 1, '/terlaris-minggu.html'),
('Terlaris Bulan Ini', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'main_nav', 2, '/terlaris-bulan.html'),
('Produk Rating Tinggi ⭐', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'main_nav', 3, '/rating-tinggi.html'),
('Repeat Order Terbanyak', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'main_nav', 4, '/repeat-order.html'),
('Lagi Viral 🔥', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'main_nav', 5, '/viral.html');

-- Sub-sub Menus (KAMI REKOMENDASIKAN)
INSERT INTO menus (label, parent_id, menu_group, order_index, custom_url) VALUES
('Setelan Viral', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'main_nav', 1, '/category.html?filter=setelan'),
('Homedress Nyaman', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'main_nav', 2, '/category.html?filter=dress'),
('Top Rating', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'main_nav', 3, '/rating-tinggi.html'),
('Paling Laku', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'main_nav', 4, '/best-seller.html');

-- Sub Menus (Promo Hari Ini)
INSERT INTO menus (id, label, parent_id, menu_group, order_index) VALUES
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'PROMO & DISKON', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'main_nav', 1);

-- Sub-sub Menus (PROMO & DISKON)
INSERT INTO menus (label, parent_id, menu_group, order_index, custom_url) VALUES
('Flash Sale ⚡', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'main_nav', 1, '/flash-sale.html'),
('Diskon 10–30%', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'main_nav', 2, '/diskon-10-30.html'),
('Diskon 50%++ 🔥', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'main_nav', 3, '/diskon-50.html'),
('Bundling Hemat', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'main_nav', 4, '/bundling.html'),
('Clearance Sale', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'main_nav', 5, '/clearance.html');

-- Pinned Sections (Featured Sections)
INSERT INTO featured_sections (title, subtitle, product_slug, image_url, video_url, type, order_index, is_active) VALUES
('NAILA SET VOL.2', 'Setelan Wanita Atasan dan Celana Panjang Kulot Rayon Motif. Nyaman, adem, dan ramah Busui.', 'naila-set-vol2', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/b69e2e45c80e4be488d6a0dda8df0f43~tplv-aphluv4xwc-origin-jpeg.jpeg', 'https://v16m-default.tiktokcdn.com/0d8eaf23fffa44fe84c1af504a1ec5a5/69f878ff/video/tos/alisg/tos-alisg-v-f466fc-sg/o8fmLq6eRQgGEiD5oCJLPUOIItGgrjGMBAeV5s/', 'pinned_banner', 1, true),
('TASYA SET CARGO', 'Setelan cargo premium dengan material crinkle airflow. Stylish dan fungsional.', 'tasya-set-cargo', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/93eed30ade39457cbba91443be7d10e8~tplv-aphluv4xwc-origin-jpeg.jpeg', 'https://v16m-default.tiktokcdn.com/f95701a5901540309995514f77c3be99/714152ff/video/tos/alisg/tos-alisg-v-f466fc-sg/oAALeAfInZAgfD4QIGLQAEnIAVgrNQAQfAgEBI/', 'pinned_banner', 2, true),
('FUJI ONESET BLASTER', 'Oneset motif blaster yang lagi viral. Nyaman untuk santai maupun jalan-jalan.', 'fuji-oneset-blaster', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/a86f789b1d834a358826760b73c4f971~tplv-aphluv4xwc-origin-jpeg.jpeg', null, 'pinned_banner', 3, true);

-- Footer Explore
INSERT INTO menus (label, menu_group, order_index, custom_url) VALUES
('About us', 'footer_explore', 1, '/about-us.html'),
('Blog: Rayon vs Crinkle', 'footer_explore', 2, '/blog-rayon-vs-crinkle-airflow.html'),
('FAQs', 'footer_explore', 3, '/faq.html'),
('Store Locator', 'footer_explore', 4, '/store-locator.html');

-- Footer Customer Care
INSERT INTO menus (label, menu_group, order_index, custom_url) VALUES
('Start A Return', 'footer_care', 1, '/return-policy.html'),
('Contact Us', 'footer_care', 2, '/contact.html'),
('Shipping Policy', 'footer_care', 3, '/shipping-policy.html'),
('Delivery Information', 'footer_care', 4, '/shipping-policy.html');
