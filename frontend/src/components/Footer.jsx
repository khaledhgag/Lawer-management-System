import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SettingsAPI, assetUrl } from '../services/api';
import HighlightList from './HighlightList.jsx';
import SocialLinks from './SocialLinks.jsx';

export default function Footer() {
  const [s, setS] = useState(null);

  useEffect(() => {
    SettingsAPI.get().then(setS).catch(() => {});
  }, []);

  return (
    <footer className="mt-20 border-t border-white/5 bg-ink-800">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            {s?.logoUrl ? (
              <img src={assetUrl(s.logoUrl)} alt="" className="w-9 h-9 rounded-full object-cover border border-gold" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold">⚖</div>
            )}
            <span className="font-bold">{s?.officeName || 'مكتب المحاماة'}</span>
          </div>
          {s?.about && (
            <p className="text-white/60 text-sm mb-3 leading-relaxed">{s.about}</p>
          )}
          <HighlightList itemClass="text-white/60 text-sm" emojiClass="text-lg" />
        </div>
        <div>
          <h4 className="text-gold font-bold mb-3">روابط</h4>
          <ul className="space-y-2 text-white/70 text-sm">
            <li><Link to="/" className="hover:text-gold">الرئيسية</Link></li>
            <li><Link to="/track" className="hover:text-gold">متابعة قضية</Link></li>
            <li><Link to="/book" className="hover:text-gold">حجز استشارة</Link></li>
            <li><Link to="/contact" className="hover:text-gold">اتصل بنا</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-gold font-bold mb-3">تواصل</h4>
          {s?.address && <p className="text-white/70 text-sm">📍 {s.address}</p>}
          {s?.phone && <p className="text-white/70 text-sm mt-2">📞 {s.phone}</p>}
          {s?.email && <p className="text-white/70 text-sm mt-2">✉️ {s.email}</p>}
          {s?.officeHours && <p className="text-white/50 text-sm mt-2">🕐 {s.officeHours}</p>}
          <SocialLinks social={s?.social} className="mt-4" />
        </div>
      </div>
      <div className="text-center text-xs text-white/40 py-4 border-t border-white/5">
        © {new Date().getFullYear()} {s?.officeName || 'مكتب المحاماة'} — جميع الحقوق محفوظة
      </div>
    </footer>
  );
}
