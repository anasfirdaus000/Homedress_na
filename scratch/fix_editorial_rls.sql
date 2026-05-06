-- 1. Perbaiki RLS site_settings agar Admin bisa simpan
DROP POLICY IF EXISTS "Service role manages settings" ON site_settings;
CREATE POLICY "Admin manages settings" ON site_settings 
FOR ALL USING (
  (auth.jwt() ->> 'email') = 'homedressnaweb@gmail.com'
);

-- 2. Pastikan data awal Editorial ada (jika belum ada)
INSERT INTO site_settings (key, value) VALUES
('editorial_1', '{"title": "ELEGANSI<br/>HARIAN", "desc": "Homedress dirancang eksklusif dari bahan premium yang memberikan kilau sutra yang mewah di setiap helai.", "bg_image": "/images/hero_editorial.png", "product_image": "/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png", "link": "/category.html?filter=homedress"}'),
('editorial_2', '{"title": "KENYAMANAN<br/>MAKSIMAL", "desc": "Koleksi One Set dengan bahan rayon organik yang adem dan lembut di kulit.", "bg_image": "/images/editorial_bag.png", "product_image": "/images/8_4f54fd4f-987c-41db-8642-28fe4c0b8413.png", "link": "/category.html?filter=one-set"}'),
('editorial_3', '{"title": "GAYA<br/>MODERN", "desc": "Tampil stylish dengan motif modern yang memberikan kesan mewah namun tetap nyaman.", "bg_image": "/images/editorial_modern.png", "product_image": "/images/3_7612f55d-46a6-49ac-9791-b1a123d4c6e8.png", "link": "/category.html?filter=gamis"}')
ON CONFLICT (key) DO NOTHING;
