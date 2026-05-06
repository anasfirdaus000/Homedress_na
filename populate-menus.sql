-- 1. Bersihkan Data Lama (Opsional, gunakan jika ingin reset)
-- TRUNCATE categories CASCADE;
-- TRUNCATE menus CASCADE;

-- 2. Populate Categories
INSERT INTO categories (name, slug, type, is_featured, order_index) VALUES
('Homedress', 'homedress', 'catalog', true, 1),
('One Set', 'one-set', 'catalog', true, 2),
('Gamis', 'gamis', 'catalog', true, 3),
('Athleisure', 'athleisure', 'catalog', true, 4),
('New Arrival', 'new-in', 'catalog', false, 5),
('Flash Sale', 'flash-sale', 'promo', false, 6)
ON CONFLICT (slug) DO NOTHING;

-- 3. Populate Menus (Header - main_nav)
INSERT INTO menus (label, menu_group, category_slug, custom_url, order_index) VALUES
('Beranda', 'main_nav', NULL, '/', 1),
('New Arrival ✨', 'main_nav', 'new-in', NULL, 2),
('Homedress', 'main_nav', 'homedress', NULL, 3),
('One Set', 'main_nav', 'one-set', NULL, 4),
('Flash Sale ⚡', 'main_nav', 'flash-sale', NULL, 5),
('Tentang Kami', 'main_nav', NULL, '/about-us.html', 6);

-- 4. Populate Menus (Footer - SHOP)
INSERT INTO menus (label, menu_group, category_slug, custom_url, order_index) VALUES
('Semua Koleksi', 'footer_shop', NULL, '/category.html', 1),
('Homedress', 'footer_shop', 'homedress', NULL, 2),
('One Set', 'footer_shop', 'one-set', NULL, 3),
('Gamis Modern', 'footer_shop', 'gamis', NULL, 4),
('Promo Hari Ini', 'footer_shop', 'flash-sale', NULL, 5);

-- 5. Populate Menus (Footer - EXPLORE)
INSERT INTO menus (label, menu_group, category_slug, custom_url, order_index) VALUES
('Tentang HOMEDRESS_NA', 'footer_explore', NULL, '/about-us.html', 1),
('Blog & Artikel', 'footer_explore', NULL, '/blog.html', 2),
('Lokasi Toko', 'footer_explore', NULL, '/store-locator.html', 3),
('Kontak Kami', 'footer_explore', NULL, '/contact.html', 4);

-- 6. Populate Menus (Footer - CARE)
INSERT INTO menus (label, menu_group, category_slug, custom_url, order_index) VALUES
('Lacak Pesanan', 'footer_care', NULL, '/track-order.html', 1),
('Tanya Jawab (FAQ)', 'footer_care', NULL, '/faq.html', 2),
('Kebijakan Pengiriman', 'footer_care', NULL, '/shipping-policy.html', 3),
('Kebijakan Pengembalian', 'footer_care', NULL, '/return-policy.html', 4),
('Syarat & Ketentuan', 'footer_care', NULL, '/terms.html', 5);
