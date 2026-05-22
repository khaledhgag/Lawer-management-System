import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SettingsAPI, assetUrl } from '../../services/api';
import { homeImages } from '../../config/homeImages';
import HomeImage from '../../components/HomeImage';
import HighlightList from '../../components/HighlightList.jsx';
import SocialLinks from '../../components/SocialLinks.jsx';

const heroFallback = (
  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-ink-700 to-ink-800">
    <div className="text-center p-8">
      <div className="text-8xl mb-4">👨‍⚖️</div>
      <p className="text-white/40 text-sm">ضع صورة في public/images/home/hero.jpg</p>
    </div>
  </div>
);

const aboutFallback = (
  <div className="absolute inset-0 flex items-center justify-center bg-ink-800 text-white/30 text-sm">
    ضع صورة في public/images/home/about.jpg
  </div>
);

export default function Home() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    SettingsAPI.get().then(setSettings).catch(() => {});
  }, []);

  const aboutSrc = homeImages.about;
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-800 to-ink-900" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.7 }}>
            <span className="badge bg-gold/10 text-gold border border-gold/30">
              {settings?.officeName || 'مكتب قانوني متخصص'}
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-black leading-tight">
              العدالة <span className="text-gold">حقك</span><br />ونحن نوصلها إليك
            </h1>
            <HighlightList className="mt-6" itemClass="text-white/70 text-lg" emojiClass="text-2xl" />
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/track" className="btn-gold">متابعة قضية</Link>
              <Link to="/book" className="btn-ghost">حجز استشارة</Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl bg-ink-800 border border-gold/20 shadow-gold overflow-hidden relative">
              <HomeImage
                src={homeImages.hero}
                alt="المحامي أو فريق المكتب"
                className="absolute inset-0 w-full h-full object-cover"
                fallback={heroFallback}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-gold text-ink-900 px-6 py-4 rounded-2xl font-bold shadow-gold">
              +500 قضية ناجحة
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA CARDS */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div whileHover={{ y: -5 }} className="card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold flex items-center justify-center text-3xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold mb-2">متابعة القضية</h3>
              <p className="text-white/60 mb-6">تابع حالة قضيتك، الجلسات القادمة، الملفات والتحديثات في أي وقت.</p>
              <Link to="/track" className="btn-gold w-full">ابدأ المتابعة</Link>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -5 }} className="card relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-bl from-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold flex items-center justify-center text-3xl mb-4">📅</div>
              <h3 className="text-2xl font-bold mb-2">حجز موعد استشارة</h3>
              <p className="text-white/60 mb-6">احجز استشارتك القانونية بسرعة وسهولة، وسنتواصل معك في أقرب وقت.</p>
              <Link to="/book" className="btn-gold w-full">احجز الآن</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="badge bg-gold/10 text-gold border border-gold/30">من نحن</span>
            <h2 className="text-3xl md:text-4xl font-black mt-3">
              {settings?.officeName || (
                <>مكتب قانوني <span className="text-gold">رائد</span></>
              )}
            </h2>
            {settings?.about && (
              <p className="mt-4 text-white/70 leading-relaxed">{settings.about}</p>
            )}
            <HighlightList className="mt-4" itemClass="text-white/70" emojiClass="text-xl" />
            <SocialLinks social={settings?.social} className="mt-5" />
          </div>
          <div className="rounded-2xl bg-ink-800 border border-white/5 overflow-hidden relative aspect-video w-full">
            <HomeImage
              src={aboutSrc}
              alt="صورة المكتب"
              className="absolute inset-0 w-full h-full object-cover"
              fallback={aboutFallback}
            />
          </div>
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="bg-ink-800/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-3xl font-black mb-12">خبرتنا <span className="text-gold">بأرقام</span></h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[['10+', 'سنة خبرة'], ['300+', 'قضية'], ['95%', 'معدل نجاح']].map(([n, l]) => (
              <div key={l} className="card text-center">
                <div className="text-4xl font-black text-gold">{n}</div>
                <div className="text-white/60 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT + MAP */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-2xl font-bold mb-4 text-gold">تواصل معنا</h3>
            {settings?.address && <p className="text-white/70">📍 {settings.address}</p>}
            {settings?.phone && <p className="text-white/70 mt-2">📞 {settings.phone}</p>}
            {settings?.email && <p className="text-white/70 mt-2">✉️ {settings.email}</p>}
            <SocialLinks social={settings?.social} className="mt-4" />
            {!settings?.address && !settings?.phone && (
              <p className="text-white/50 text-sm">حدّث بيانات التواصل من لوحة الإعدادات</p>
            )}
          </div>
          <div className="card p-0 overflow-hidden aspect-video">
            {settings?.mapEmbed ? (
              <div
                className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[280px]"
                dangerouslySetInnerHTML={{ __html: settings.mapEmbed }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 text-sm p-4 text-center">
                أضف كود خريطة Google من الإعدادات (حقل mapEmbed)
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
