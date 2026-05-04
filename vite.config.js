import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        product: 'product.html',
        category: 'category.html',
        checkout: 'checkout.html',
        orderConfirmation: 'order-confirmation.html',
        trackOrder: 'track-order.html',
        newIn: 'new-in.html',
        promo: 'promo.html',
        aboutUs: 'about-us.html',
        faq: 'faq.html',
        storeLocator: 'store-locator.html',
        blog: 'blog.html',
        blogRayon: 'blog-rayon-vs-crinkle-airflow.html',
        contact: 'contact.html',
        wishlist: 'wishlist.html',
        shippingPolicy: 'shipping-policy.html',
        returnPolicy: 'return-policy.html',
        terms: 'terms.html',
        privacy: 'privacy.html',
        productJessy: 'product-jessy-set.html',
        lpBatwing: 'setelan-wanita-batwing-rayon-salur.html',
        lpJessy: 'setelan-wanita-korea-kekinian-terbaru.html',
        flashSale: 'flash-sale.html',
        bestSeller: 'best-seller.html',
        setelan: 'setelan.html',
        dress: 'dress.html',
        atasan: 'atasan.html',
        bawahan: 'bawahan.html',
        bundling: 'bundling.html',
        clearance: 'clearance.html',
        diskon1030: 'diskon-10-30.html',
        diskon50: 'diskon-50.html',
        ratingTinggi: 'rating-tinggi.html',
        repeatOrder: 'repeat-order.html',
        restock: 'restock.html',
        terlarisMinggu: 'terlaris-minggu.html',
        terlarisBulan: 'terlaris-bulan.html',
        viral: 'viral.html',
        // Admin pages
        adminLogin: 'admin/login.html',
        adminDashboard: 'admin/index.html',
        adminOrders: 'admin/orders.html',
        adminProducts: 'admin/products.html',
        adminSettings: 'admin/settings.html',
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
