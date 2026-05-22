/**
 * صور الصفحة الرئيسية — frontend/public/images/home/
 *
 * hero.jpg  → 4:5 (عمودي) — مثال: 900×1125 أو 800×1000 px
 * about.jpg → 16:9 (عريض) — مثال: 1280×720 أو 1920×1080 px
 *
 * شعار المكتب (من الإعدادات): مربع 1:1 — مثال: 512×512 أو 800×800 px، PNG بخلفية شفافة أفضل
 */
export const homeImages = {
  hero: '/images/home/hero.jpg',
  about: '/images/home/about.jpg',
};

export const imageSpecs = {
  hero: { ratio: '4:5', width: 900, height: 1125 },
  about: { ratio: '16:9', width: 1280, height: 720 },
  logo: { ratio: '1:1', width: 512, height: 512 },
};
