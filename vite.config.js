import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: 'index.html',
        product: 'product.html',
        category: 'category.html',
        checkout: 'checkout.html',
        orderConfirmation: 'order-confirmation.html',
        trackOrder: 'track-order.html',
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
        account: 'account.html',
        login: 'login.html',
        register: 'register.html',
        cantikaLP: 'setelan-wanita-batwing-rayon-salur.html',
        jessySet: 'product-jessy-set.html',
        tasyaCargo: 'tasya-setelan-wanita-kekinian-cargo.html',
        koreaSet: 'setelan-wanita-korea-kekinian-terbaru.html',
        // Admin pages
        adminLogin: 'admin/login.html',
        adminDashboard: 'admin/index.html',
        adminOrders: 'admin/orders.html',
        adminProducts: 'admin/products.html',
        adminCategories: 'admin/categories.html',
        adminFeatured: 'admin/featured.html',
        adminMenus: 'admin/menus.html',
        adminSettings: 'admin/settings.html',
        adminHero: 'admin/hero.html',
        adminNewsletter: 'admin/newsletter.html',
        adminShipping: 'admin/shipping.html',
        adminShippingLabel: 'admin/shipping-label.html',
        adminAbout: 'admin/about.html',
      }
    }
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3003'
    }
  }
});
