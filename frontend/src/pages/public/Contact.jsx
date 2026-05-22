import { useEffect, useState } from 'react';
import { SettingsAPI } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import SocialLinks from '../../components/SocialLinks.jsx';
import HighlightList from '../../components/HighlightList.jsx';

export default function Contact() {
  const [s, setS] = useState(null);

  useEffect(() => {
    SettingsAPI.get().then(setS).catch(() => {});
  }, []);

  if (!s) return <div className="max-w-3xl mx-auto px-4 py-16"><Skeleton className="h-64" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black mb-2">اتصل <span className="text-gold">بنا</span></h1>
      <p className="text-white/60 mb-10">نحن هنا لمساعدتك في استفساراتك القانونية.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <h2 className="font-bold text-gold">{s.officeName}</h2>
          {s.address && <p className="text-white/80">📍 {s.address}</p>}
          {s.phone && <p className="text-white/80">📞 {s.phone}</p>}
          {s.email && <p className="text-white/80">✉️ {s.email}</p>}
          {s.officeHours && (
            <p className="text-white/60 text-sm border-t border-white/10 pt-3">🕐 {s.officeHours}</p>
          )}
          <HighlightList className="border-t border-white/10 pt-4" />
          <SocialLinks social={s.social} className="pt-2" />
        </div>

        <div className="card p-0 overflow-hidden min-h-[280px]">
          {s.mapEmbed ? (
            <div
              className="w-full h-full min-h-[280px] [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:min-h-[280px]"
              dangerouslySetInnerHTML={{ __html: s.mapEmbed }}
            />
          ) : (
            <div className="flex items-center justify-center h-full min-h-[280px] text-white/40 text-sm p-6 text-center">
              أضف الخريطة من الإعدادات
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
