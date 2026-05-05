// ========== HOMEDRESS_NA PRODUCT DATABASE ==========
// Single source of truth for all products. product.html reads ?id=slug from URL.

window.PRODUCTS = [
  // ===== SETELAN / SETS =====
  {
    id: 'setelan-santai-mint-premium',
    name: 'Setelan Santai Mint Premium',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','viral','terlaris-minggu','rating-tinggi','new-in'],
    price: 189000,
    originalPrice: 270000,
    discount: 30,
    description: 'Setelan santai premium dengan warna mint yang segar dan elegan. Dibuat dari bahan katun rayon premium yang adem, menyerap keringat, dan sangat nyaman dipakai seharian — baik di rumah, jalan-jalan santai, atau acara kasual.',
    details: ['Bahan: Katun Rayon Premium 100%','Adem & menyerap keringat','Include: Atasan + Celana','Cocok untuk: Santai, tidur, jalan-jalan'],
    sizes: ['S','M','L','XL','XXL'],
    disabledSizes: [],
    images: ['/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png','/images/Untitled_design-19_ecd62676-bd1a-4b2f-a5d3-ed2d838d8217.png','/images/3_7612f55d-46a6-49ac-9791-b1a123d4c6e8.png'],
    socialProof: '36 orang sedang melihat produk ini',
    related: ['dress-kasual-navy-blue','setelan-hitam-olahraga-santai','atasan-piyama-lengan-panjang','paket-bundling-2-dress']
  },
  {
    id: 'setelan-hitam-olahraga-santai',
    name: 'Setelan Hitam Olahraga & Santai',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','diskon-50','flash-sale'],
    price: 120000,
    originalPrice: 240000,
    discount: 50,
    description: 'Setelan eksklusif hitam ini dirancang khusus untuk kenyamanan maksimal, baik saat Anda berolahraga ringan, bersantai di rumah, maupun jalan-jalan santai. Terbuat dari bahan premium yang sejuk, menyerap keringat, dan tahan lama.',
    details: ['Bahan: Katun Combed 30s','Warna: Midnight Black','Include: Atasan + Celana panjang','Elastis & tidak mudah kusut'],
    sizes: ['XS','S','M','L','XL'],
    disabledSizes: ['XXL'],
    images: ['/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png','/images/13_2a0325a5-7366-447c-b9f4-18f8ccb48248.png','/images/BDB699C6-5555-4650-A463-0FE7112241FD.jpg'],
    socialProof: 'Populer! 50+ dilihat dalam 24 jam terakhir',
    related: ['setelan-santai-mint-premium','setelan-hitam-polos','celana-santai-hitam','t-shirt-santai-abu']
  },
  {
    id: 'setelan-hitam-polos',
    name: 'Setelan Hitam Polos',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','rating-tinggi','terlaris-minggu'],
    price: 160000,
    originalPrice: null,
    discount: 0,
    description: 'Setelan hitam polos yang timeless dan versatile. Desain minimalis namun tetap stylish, cocok untuk berbagai aktivitas dari rumah hingga hangout. Bahan lembut yang tidak gerah.',
    details: ['Bahan: Jersey Premium','Warna: Hitam Solid','Include: Atasan + Celana','Unisex design'],
    sizes: ['S','M','L','XL','XXL'],
    disabledSizes: [],
    images: ['/images/13_2a0325a5-7366-447c-b9f4-18f8ccb48248.png','/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png'],
    socialProof: 'Best seller minggu ini!',
    related: ['setelan-hitam-olahraga-santai','setelan-santai-mint-premium','celana-santai-hitam','atasan-piyama-lengan-panjang']
  },

  // ===== DRESS / HOMEDRESS =====
  {
    id: 'dress-kasual-navy-blue',
    name: 'Dress Kasual Navy Blue',
    brand: 'HOMEDRESS_NA',
    category: ['dress','restock','terlaris-bulan'],
    price: 145000,
    originalPrice: null,
    discount: 0,
    description: 'Dress kasual dengan warna navy blue yang elegan. Potongan A-line yang flattering untuk semua bentuk tubuh. Sangat nyaman untuk dipakai seharian, dari pagi sampai malam.',
    details: ['Bahan: Katun Rayon Viscose','Warna: Navy Blue','Model: A-line, loose fit','Panjang: Selutut'],
    sizes: ['S','M','L','XL'],
    disabledSizes: ['XXL'],
    images: ['/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png','/images/Untitled_design-18.png','/images/Untitled_design_29917e1b-5767-46fd-a07a-802abac5ece3.png'],
    socialProof: 'Laris Manis — 41 dilihat 12 jam terakhir',
    related: ['daster-modern-motif-bunga','setelan-santai-mint-premium','paket-bundling-2-dress','atasan-piyama-lengan-panjang']
  },
  {
    id: 'daster-modern-motif-bunga',
    name: 'Daster Modern Motif Bunga',
    brand: 'HOMEDRESS_NA',
    category: ['dress','new-in'],
    price: 135000,
    originalPrice: null,
    discount: 0,
    description: 'Daster modern dengan motif bunga yang cantik dan feminine. Desain up-to-date yang bikin kamu tetap stylish meskipun di rumah. Bahan adem dan jatuh sempurna di badan.',
    details: ['Bahan: Katun Rayon Premium','Motif: Floral / Bunga','Model: Midi dress, loose fit','Kancing depan untuk kemudahan'],
    sizes: ['All Size (S-XL)'],
    disabledSizes: [],
    images: ['/images/12_4c153cfc-80b6-4d22-8abe-0576d6ea0a01.png','/images/8_4f54fd4f-987c-41db-8642-28fe4c0b8413.png'],
    socialProof: 'New Arrival ✨',
    related: ['dress-kasual-navy-blue','paket-bundling-2-dress','atasan-piyama-lengan-panjang','celana-pendek-santai']
  },
  {
    id: 'paket-bundling-2-dress',
    name: 'Paket Bundling 2 Dress Kasual',
    brand: 'HOMEDRESS_NA',
    category: ['dress','diskon-10-30','bundling'],
    price: 250000,
    originalPrice: 290000,
    discount: 14,
    description: 'Hemat lebih banyak dengan paket bundling! Dapatkan 2 dress kasual pilihan dengan harga spesial. Cocok untuk stok pakaian rumah yang nyaman dan stylish.',
    details: ['Include: 2 pcs Dress Kasual','Bahan: Katun Rayon','Pilihan warna random (sesuai stok)','Hemat Rp 40.000 dari harga satuan'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/8_4f54fd4f-987c-41db-8642-28fe4c0b8413.png','/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png','/images/12_4c153cfc-80b6-4d22-8abe-0576d6ea0a01.png'],
    socialProof: 'Bundling — Hemat Rp 40.000!',
    related: ['dress-kasual-navy-blue','daster-modern-motif-bunga','setelan-santai-mint-premium','t-shirt-santai-abu']
  },

  // ===== ATASAN =====
  {
    id: 'atasan-piyama-lengan-panjang',
    name: 'Atasan Piyama Lengan Panjang',
    brand: 'HOMEDRESS_NA',
    category: ['atasan','viral','repeat-order'],
    price: 99000,
    originalPrice: null,
    discount: 0,
    description: 'Atasan piyama lengan panjang yang super lembut dan cozy. Perfect untuk tidur atau lounging di rumah. Desain simpel tapi tetap trendy.',
    details: ['Bahan: Katun Rayon','Model: Lengan panjang, kancing depan','Warna: Pastel','Adem, tidak gerah saat tidur'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/Untitled_design_29917e1b-5767-46fd-a07a-802abac5ece3.png','/images/Untitled_design-18.png'],
    socialProof: 'Repeat order terbanyak!',
    related: ['dress-kasual-navy-blue','setelan-santai-mint-premium','celana-pendek-santai','celana-santai-hitam']
  },
  {
    id: 't-shirt-santai-abu',
    name: 'T-Shirt Santai Abu-abu',
    brand: 'HOMEDRESS_NA',
    category: ['atasan','clearance'],
    price: 45000,
    originalPrice: 99000,
    discount: 55,
    description: 'T-shirt santai basic abu-abu dengan potongan relaxed fit. Harga clearance sale — stok terbatas! Bahan tetap berkualitas meski harga miring.',
    details: ['Bahan: Cotton Combed 24s','Warna: Abu-abu','Model: Regular fit','Clearance Sale — Stok Terbatas!'],
    sizes: ['M','L','XL'],
    disabledSizes: ['S','XXL'],
    images: ['/images/3_7612f55d-46a6-49ac-9791-b1a123d4c6e8.png','/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png'],
    socialProof: 'Clearance Sale — Hampir Habis!',
    related: ['atasan-piyama-lengan-panjang','celana-santai-hitam','setelan-hitam-polos','celana-pendek-santai']
  },

  // ===== BAWAHAN =====
  {
    id: 'celana-santai-hitam',
    name: 'Celana Santai Hitam',
    brand: 'HOMEDRESS_NA',
    category: ['bawahan','restock'],
    price: 85000,
    originalPrice: null,
    discount: 0,
    description: 'Celana santai hitam dengan karet pinggang yang fleksibel. Nyaman untuk tidur, olahraga ringan, atau sekadar rebahan. Bahan adem dan stretchy.',
    details: ['Bahan: Cotton Spandex','Warna: Hitam','Karet pinggang + tali serut','Saku samping'],
    sizes: ['S','M','L','XL','XXL'],
    disabledSizes: [],
    images: ['/images/BDB699C6-5555-4650-A463-0FE7112241FD.jpg','/images/D239A4C4-7E42-40D1-AFF4-687EF9947F48.jpg'],
    socialProof: 'Restock — Cepat habis!',
    related: ['celana-pendek-santai','setelan-hitam-polos','setelan-hitam-olahraga-santai','t-shirt-santai-abu']
  },
  {
    id: 'celana-pendek-santai',
    name: 'Celana Pendek Santai',
    brand: 'HOMEDRESS_NA',
    category: ['bawahan','new-in'],
    price: 65000,
    originalPrice: null,
    discount: 0,
    description: 'Celana pendek santai untuk aktivitas sehari-hari. Ringan, adem, dan bebas bergerak. Cocok untuk di rumah maupun olahraga ringan.',
    details: ['Bahan: Cotton Blend','Warna: Variasi (lihat pilihan)','Karet pinggang elastis','Panjang: Di atas lutut'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/629F5E92-479F-4E54-AE27-6D738460207B.jpg','/images/BDB699C6-5555-4650-A463-0FE7112241FD.jpg'],
    socialProof: 'New Arrival',
    related: ['celana-santai-hitam','setelan-hitam-polos','t-shirt-santai-abu','atasan-piyama-lengan-panjang']
  },

  // ===== FOOTWEAR (dari index.html) =====
  {
    id: 'progrid-omni-9',
    name: 'Progrid Omni 9 - Black / Silver',
    brand: 'SAUCONY',
    category: ['footwear','flash-sale'],
    price: 1400000,
    originalPrice: null,
    discount: 0,
    description: 'Saucony Progrid Omni 9 klasik dalam colorway Black/Silver. Teknologi PROGRID untuk cushioning optimal dan support maksimal. Cocok untuk running maupun daily wear.',
    details: ['Brand: Saucony','Teknologi: PROGRID Cushioning','Outsole: Rubber durable','Cocok untuk: Running & casual'],
    sizes: ['39','40','41','42','43','44'],
    disabledSizes: [],
    images: ['/images/8_4f54fd4f-987c-41db-8642-28fe4c0b8413.png','/images/13_2a0325a5-7366-447c-b9f4-18f8ccb48248.png'],
    socialProof: '33 orang menambahkan ke keranjang',
    related: ['progrid-guide-7','moab-speed-2','pulse-runner-marina','onesixty-runner-slate']
  },
  {
    id: 'moab-speed-2',
    name: 'MOAB Speed 2 Sport - Craig / Igneous',
    brand: 'MERRELL',
    category: ['footwear'],
    price: 1020000,
    originalPrice: 1100000,
    discount: 7,
    description: 'Merrell MOAB Speed 2 Sport dengan colorway Craig/Igneous. Trail shoe yang ringan dengan grip luar biasa. Bellows tongue menjaga debris tetap di luar.',
    details: ['Brand: Merrell','Teknologi: Vibram TC5+ outsole','Midsole: FloatPro Foam','Water resistant upper'],
    sizes: ['40','41','42','43','44'],
    disabledSizes: ['39'],
    images: ['/images/12_4c153cfc-80b6-4d22-8abe-0576d6ea0a01.png','/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png'],
    socialProof: 'Hanya tersisa 4!',
    related: ['progrid-omni-9','progrid-guide-7','pulse-runner-marina','onesixty-runner-slate']
  },
  {
    id: 'pulse-runner-marina',
    name: 'Pulse Runner - Marina',
    brand: 'GUESS',
    category: ['footwear'],
    price: 1900000,
    originalPrice: null,
    discount: 0,
    description: 'GUESS Pulse Runner dalam warna Marina yang bold dan eye-catching. Sneaker fashion-forward dengan detail premium dan kenyamanan sepanjang hari.',
    details: ['Brand: GUESS','Style: Lifestyle sneaker','Material: Mixed leather & mesh','Sole: Chunky platform'],
    sizes: ['38','39','40','41','42','43'],
    disabledSizes: [],
    images: ['/images/13_2a0325a5-7366-447c-b9f4-18f8ccb48248.png','/images/22_6e595fa5-ddea-40b4-afd7-6fecbec4a0ee.png'],
    socialProof: 'Premium Collection',
    related: ['onesixty-runner-slate','progrid-omni-9','moab-speed-2','progrid-guide-7']
  },
  {
    id: 'progrid-guide-7',
    name: 'Progrid Guide 7 Trainers - Blue',
    brand: 'SAUCONY',
    category: ['footwear','diskon-50','flash-sale'],
    price: 720000,
    originalPrice: 1200000,
    discount: 40,
    description: 'Saucony Progrid Guide 7 Trainers dalam colorway Blue yang ikonik. Stability shoe legendaris dengan cushioning responsif. Flash Sale — harga spesial!',
    details: ['Brand: Saucony','Teknologi: PROGRID + SRC Impact Zone','Support: Medial post','Best untuk: Stability running'],
    sizes: ['40','41','42','43','44'],
    disabledSizes: [],
    images: ['/images/17_35192b6b-4ccc-4e6a-9773-1db1109d9287.png','/images/8_4f54fd4f-987c-41db-8642-28fe4c0b8413.png'],
    socialProof: '67 orang melihat 12 jam terakhir',
    related: ['progrid-omni-9','moab-speed-2','pulse-runner-marina','onesixty-runner-slate']
  },
  {
    id: 'onesixty-runner-slate',
    name: 'OneSixty Runner - Slate',
    brand: 'GUESS',
    category: ['footwear'],
    price: 1600000,
    originalPrice: null,
    discount: 0,
    description: 'GUESS OneSixty Runner dalam warna Slate yang sleek dan modern. Desain retro-futuristic dengan comfort technology terkini.',
    details: ['Brand: GUESS','Style: Retro runner','Material: Suede & nylon','Sole: EVA lightweight'],
    sizes: ['39','40','41','42','43'],
    disabledSizes: ['44'],
    images: ['/images/22_6e595fa5-ddea-40b4-afd7-6fecbec4a0ee.png','/images/13_2a0325a5-7366-447c-b9f4-18f8ccb48248.png'],
    socialProof: 'Exclusive Collection',
    related: ['pulse-runner-marina','progrid-omni-9','moab-speed-2','progrid-guide-7']
  },

  // ===== INDEX HOMEPAGE PRODUCTS (sets from New In / Flash Sale) =====
  {
    id: 'ss26-cloud-mint-set',
    name: 'SS26 Cloud Mint Set - T Shirt / Short',
    brand: 'TRAILBERG',
    category: ['setelan','new-in'],
    price: 270000,
    originalPrice: null,
    discount: 0,
    description: 'Set olahraga cloud mint dari Trailberg koleksi SS26. T-shirt breathable dengan celana pendek matching. Perfect untuk gym, running, atau daily casual wear.',
    details: ['Brand: Trailberg','Include: T-Shirt + Short','Bahan: Dry-Fit Polyester','Quick-dry & anti-bau'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png','/images/Untitled_design-19_ecd62676-bd1a-4b2f-a5d3-ed2d838d8217.png'],
    socialProof: '36 orang menambahkan ke keranjang',
    related: ['fusion-dune-blue-set','flight-line-blue-set','westmore-light-grey-set','utility-blue-set']
  },
  {
    id: 'flight-line-blue-set',
    name: 'Flight Line Blue 3 Piece Set - Jacket / T Shirt / Short',
    brand: 'REPRIMO',
    category: ['setelan','new-in','flash-sale'],
    price: 1480000,
    originalPrice: null,
    discount: 0,
    description: 'Set premium 3 pcs dari Reprimo. Include jacket, t-shirt, dan short dalam colorway Flight Line Blue yang bold. High-performance fabric untuk atlet serius.',
    details: ['Brand: Reprimo','Include: Jacket + T-Shirt + Short','Bahan: Performance Blend','Water-resistant jacket'],
    sizes: ['S','M','L','XL'],
    disabledSizes: ['XXL'],
    images: ['/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png','/images/Untitled_design-18.png'],
    socialProof: '41 dilihat 12 jam terakhir',
    related: ['ss26-cloud-mint-set','fusion-dune-blue-set','westmore-light-grey-set','utility-blue-set']
  },
  {
    id: 'utility-blue-set',
    name: 'Utility Blue Set - T Shirt / Short',
    brand: 'UNDER ARMOUR',
    category: ['setelan','new-in'],
    price: 770000,
    originalPrice: null,
    discount: 0,
    description: 'Under Armour Utility Blue Set. T-shirt HeatGear dengan celana pendek yang ringan dan breathable. Teknologi anti-microba untuk freshness sepanjang hari.',
    details: ['Brand: Under Armour','Include: T-Shirt + Short','Teknologi: HeatGear','Anti-microbial & moisture-wicking'],
    sizes: ['S','M','L','XL','XXL'],
    disabledSizes: [],
    images: ['/images/Untitled_design-18.png','/images/Untitled_design_29917e1b-5767-46fd-a07a-802abac5ece3.png'],
    socialProof: 'Under Armour Official',
    related: ['ss26-cloud-mint-set','flight-line-blue-set','westmore-light-grey-set','fusion-dune-blue-set']
  },
  {
    id: 'fusion-dune-blue-set',
    name: 'Fusion Dune Blue Seamless Set - T Shirt / Short',
    brand: 'TRAILBERG',
    category: ['setelan','new-in'],
    price: 720000,
    originalPrice: null,
    discount: 0,
    description: 'Set seamless dari Trailberg dengan warna Dune Blue. Teknologi seamless construction untuk zero irritation dan maximum mobility.',
    details: ['Brand: Trailberg','Include: Seamless T-Shirt + Short','Konstruksi: Seamless knit','4-way stretch fabric'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/Untitled_design-19_ecd62676-bd1a-4b2f-a5d3-ed2d838d8217.png','/images/1_0d097d33-95ec-49db-909b-b31fb077219f.png'],
    socialProof: 'HOMEDRESS_NA Exclusive',
    related: ['ss26-cloud-mint-set','flight-line-blue-set','westmore-light-grey-set','utility-blue-set']
  },
  {
    id: 'westmore-light-grey-set',
    name: 'Westmore Light Grey Set - Quarter Zip / Short',
    brand: 'BERGHAUS',
    category: ['setelan','new-in'],
    price: 1450000,
    originalPrice: null,
    discount: 0,
    description: 'Berghaus Westmore set dalam Light Grey. Quarter zip top yang stylish dengan celana pendek matching. Material outdoor-grade yang tahan lama.',
    details: ['Brand: Berghaus','Include: Quarter Zip + Short','Bahan: Polartec fleece blend','UV Protection UPF 30+'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/Untitled_design_29917e1b-5767-46fd-a07a-802abac5ece3.png','/images/Untitled_design-22_95380a0c-9058-49dc-bafa-b6a272ab8fce.png'],
    socialProof: 'Berghaus Premium Collection',
    related: ['ss26-cloud-mint-set','flight-line-blue-set','fusion-dune-blue-set','utility-blue-set']
  },
  {
    id: 'dri-fit-challenger-shorts',
    name: 'Dri-FIT Challenger Shorts',
    brand: 'NIKE',
    category: ['bawahan','flash-sale'],
    price: 399000,
    originalPrice: 499000,
    discount: 20,
    description: 'Nike Dri-FIT Challenger Running Shorts. Celana pendek running iconic dengan teknologi Dri-FIT yang menjaga kamu tetap kering. Built-in brief untuk support ekstra.',
    details: ['Brand: Nike','Teknologi: Dri-FIT','Built-in brief','Reflective detail untuk visibility'],
    sizes: ['S','M','L','XL'],
    disabledSizes: [],
    images: ['/images/BDB699C6-5555-4650-A463-0FE7112241FD.jpg','/images/629F5E92-479F-4E54-AE27-6D738460207B.jpg'],
    socialProof: '-20% Flash Sale',
    related: ['celana-pendek-santai','celana-santai-hitam','performance-tech-socks','utility-blue-set']
  },
  {
    id: 'performance-tech-socks',
    name: 'Performance Tech Socks (3-Pack)',
    brand: 'UNDER ARMOUR',
    category: ['accessories','flash-sale'],
    price: 150000,
    originalPrice: 176000,
    discount: 15,
    description: 'Under Armour Performance Tech Socks pack isi 3 pasang. Bahan anti-bau dengan cushioning strategis di area tumit dan jari kaki. Perfect untuk setiap aktivitas.',
    details: ['Brand: Under Armour','Isi: 3 pasang','Anti-odor technology','Embedded arch support'],
    sizes: ['S (36-38)','M (39-42)','L (43-46)'],
    disabledSizes: [],
    images: ['/images/629F5E92-479F-4E54-AE27-6D738460207B.jpg','/images/EF98BC5E-3E05-40BC-A65D-BADFC2E66CB0.jpg'],
    socialProof: '-15% OFF — Best seller accessories',
    related: ['dri-fit-challenger-shorts','progrid-omni-9','progrid-guide-7','celana-pendek-santai']
  },

  // ===== LP PRODUCTS (Landing Page featured) =====
  {
    id: 'cantika-set-batwing',
    name: 'Cantika Set - Setelan Wanita Batwing Rayon Salur',
    brand: 'HOMEDRESS_NA',
    category: ['setelan','flash-sale','viral','new-in'],
    price: 129000,
    originalPrice: 199000,
    discount: 35,
    description: 'Cantika Set adalah pilihan terbaik untuk Anda yang mencari setelan wanita batwing dengan kenyamanan maksimal. Menggunakan bahan rayon salur berkualitas premium, setelan ini terasa sangat adem saat dipakai dan cocok untuk menemani rutinitas aktivitas sehari-hari. Desain longgar memberikan kesan santai namun tetap elegan.',
    details: ['Bahan: Rayon Salur Premium','Model: Batwing (Loose Fit)','Karakter: Lembut, jatuh, sangat adem','Pilihan Warna: Hitam, Putih','Menyerap keringat, anti gerah','Cocok untuk: Harian, santai, hangout'],
    sizes: ['All Size (S-XL)'],
    disabledSizes: [],
    images: [
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/817dbda748324cc7a6a3c84d0d0b40b2~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/4a5c460e9b0b4a7eb88f28b6cb45c36f~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/e1f3b63c39ca44498aa0b9a949fe6ff4~tplv-aphluv4xwc-origin-jpeg.jpeg'
    ],
    socialProof: '🔥 Flash Sale — 120+ terjual minggu ini',
    related: ['setelan-santai-mint-premium','setelan-hitam-olahraga-santai','dress-kasual-navy-blue','atasan-piyama-lengan-panjang']
  },
  {
    id: 'naila-set-vol2',
    name: 'NAILA SET vol.2 - Setelan Kulot Rayon',
    brand: 'HOMEDRESS_NA',
    category: ['setelan', 'new-in', 'viral'],
    price: 135000,
    originalPrice: 199000,
    discount: 32,
    description: 'Perkenalkan Naila Set LD 120cm Setelan Wanita Atasan dan Celana Panjang Kulot Rayon Motif Bisa Busui. Sangat nyaman untuk beraktivitas seharian.',
    details: ['Bahan: Rayon Adem', 'Ukuran: LD 120cm', 'Ramah Busui', 'Setelan Atasan + Celana Kulot'],
    sizes: ['All Size (S-XL)'],
    disabledSizes: [],
    images: [
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/b69e2e45c80e4be488d6a0dda8df0f43~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/09ac24f1de41443f88010e698b60b8b1~tplv-aphluv4xwc-crop-webp:1000:1000.webp'
    ],
    socialProof: 'Best Seller — Ramah Busui',
    related: ['tasya-set-cargo', 'fuji-oneset-blaster', 'setelan-santai-mint-premium']
  },
  {
    id: 'tasya-set-cargo',
    name: 'Tasya Setelan Kekinian OneSet Cargo',
    brand: 'HOMEDRESS_NA',
    category: ['setelan', 'best-seller'],
    price: 145000,
    originalPrice: 210000,
    discount: 30,
    description: 'HN-Tasya Setelan Wanita Kekinian Ld 120cm One Set Cargo Terbaru Outfit Daily Celana Panjang Lengan 3/4 Bahan Crinkle. Berbahan adem tidak mudah kusut nyaman dipakai.',
    details: ['Bahan: Crinkle Airflow', 'Lingkar Dada: 120cm', 'Panjang Baju: 65cm, Lengan 40cm', 'Saku Celana Cargo (Kiri Kanan)'],
    sizes: ['All Size (Fit 40-85kg)'],
    disabledSizes: [],
    images: [
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/93eed30ade39457cbba91443be7d10e8~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/79de53a9df1342bbad69b9554d15e192~tplv-aphluv4xwc-crop-webp:1280:1280.webp'
    ],
    socialProof: 'Hot Item 🔥 Outfit Daily',
    related: ['naila-set-vol2', 'fuji-oneset-blaster', 'setelan-hitam-olahraga-santai']
  },
  {
    id: 'fuji-oneset-blaster',
    name: 'HN - Fuji OneSet Blaster Hotpants',
    brand: 'HOMEDRESS_NA',
    category: ['setelan', 'viral'],
    price: 120000,
    originalPrice: 180000,
    discount: 33,
    description: 'Fuji OneSet Blaster setelan Wanita Daily Hotpants Baju Santai dan Celana Pendek Crinkle Airflow. Memiliki bahan yang Flowly dan nyaman dipakai harian.',
    details: ['Bahan: Crinkle Airflow', 'Lingkar Dada: 120cm', 'Celana Hotpants 50cm', 'Sangat nyaman dan flowly'],
    sizes: ['All Size (S-XL)'],
    disabledSizes: [],
    images: [
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/c54f033c4c82499490a7e659249eb350~tplv-aphluv4xwc-origin-jpeg.jpeg',
      'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/43fa4e7e0e78488fa275fe0d9bc4e538~tplv-aphluv4xwc-crop-webp:1600:1600.webp'
    ],
    socialProof: 'Viral di TikTok ✨',
    related: ['tasya-set-cargo', 'naila-set-vol2', 'celana-pendek-santai']
  }
];

// Helper: find product by ID (with fuzzy matching for slug variations)
window.getProductById = function(id) {
  if (!id) return null;
  // Exact match
  var exact = PRODUCTS.find(function(p) { return p.id === id; });
  if (exact) return exact;
  // Check if any product ID starts with the query or vice versa
  var startsWith = PRODUCTS.find(function(p) { return id.startsWith(p.id) || p.id.startsWith(id); });
  if (startsWith) return startsWith;
  // Partial match: check if product ID is contained in the query
  var partial = PRODUCTS.find(function(p) { return id.includes(p.id) || p.id.includes(id); });
  if (partial) return partial;
  // Last resort: match by first 3 words
  var words = id.split('-').slice(0, 3).join('-');
  if (words.length > 5) {
    var wordMatch = PRODUCTS.find(function(p) { return p.id.startsWith(words); });
    if (wordMatch) return wordMatch;
  }
  return null;
};

// Helper: get related products
window.getRelatedProducts = function(ids) {
  return ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
};
