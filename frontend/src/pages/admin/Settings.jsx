import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { SettingsAPI, assetUrl } from '../../services/api';

export default function Settings() {
  const [s, setS] = useState(null);
  const [logo, setLogo] = useState(null);

  useEffect(() => { SettingsAPI.get().then(setS); }, []);
  if (!s) return null;
  const set = (k,v) => setS({...s, [k]: v});
  const setSocial = (k,v) => setS({...s, social: {...s.social, [k]: v}});

  const save = async (e) => {
    e.preventDefault();
    try {
      if (logo) {
        const fd = new FormData();
        Object.entries(s).forEach(([k,v]) => {
          if (k === 'social') fd.append('social', JSON.stringify(v));
          else if (typeof v === 'string') fd.append(k, v);
        });
        fd.append('logo', logo);
        await SettingsAPI.update(fd);
      } else {
        await SettingsAPI.update(s);
      }
      toast.success('تم الحفظ');
    } catch { toast.error('خطأ'); }
  };

  return (
    <form onSubmit={save} className="max-w-3xl space-y-4">
      <h2 className="text-2xl font-black mb-2">إعدادات المكتب</h2>
      <div className="card grid md:grid-cols-2 gap-4">
        <div><label className="label">اسم المكتب</label><input className="input" value={s.officeName||''} onChange={e=>set('officeName',e.target.value)} /></div>
        <div><label className="label">الهاتف</label><input className="input" value={s.phone||''} onChange={e=>set('phone',e.target.value)} /></div>
        <div><label className="label">البريد</label><input className="input" value={s.email||''} onChange={e=>set('email',e.target.value)} /></div>
        <div><label className="label">العنوان</label><input className="input" value={s.address||''} onChange={e=>set('address',e.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">ساعات العمل</label><input className="input" value={s.officeHours||''} onChange={e=>set('officeHours',e.target.value)} placeholder="الأحد – الخميس: 10 ص – 6 م" /></div>
        <div className="md:col-span-2"><label className="label">نبذة عن المكتب</label><textarea rows="4" className="input" value={s.about||''} onChange={e=>set('about',e.target.value)} /></div>
        <div className="md:col-span-2">
          <label className="label">شعار المكتب</label>
          <input type="file" accept="image/*" onChange={e=>setLogo(e.target.files[0])} className="input file:bg-gold file:text-ink-900 file:border-0 file:px-3 file:py-1 file:rounded file:ml-2 file:font-bold" />
          {s.logoUrl && <img src={assetUrl(s.logoUrl)} alt="logo" className="mt-3 h-20 rounded" />}
          <p className="text-xs text-white/40 mt-2">
            شعار «من نحن»: مربع <b className="text-white/60">512×512</b> أو <b className="text-white/60">800×800</b> px (PNG شفاف أفضل).
            بدون شعار: ضع صورة عريضة <b className="text-white/60">1280×720</b> (16:9) في public/images/home/about.jpg —
            الهيرو: <b className="text-white/60">900×1125</b> (4:5) في hero.jpg
          </p>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-bold text-gold">خريطة Google (الصفحة الرئيسية)</h3>
        <textarea
          rows="4"
          className="input font-mono text-xs"
          placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
          value={s.mapEmbed||''}
          onChange={e=>set('mapEmbed',e.target.value)}
        />
        <p className="text-xs text-white/40">من Google Maps → مشاركة → تضمين خريطة → انسخ كود iframe</p>
      </div>

      <div className="card grid md:grid-cols-2 gap-4">
        <h3 className="md:col-span-2 font-bold text-gold">روابط التواصل</h3>
        <div><label className="label">Facebook</label><input className="input" value={s.social?.facebook||''} onChange={e=>setSocial('facebook',e.target.value)} /></div>
        <div><label className="label">Instagram</label><input className="input" value={s.social?.instagram||''} onChange={e=>setSocial('instagram',e.target.value)} /></div>
        <div><label className="label">Twitter</label><input className="input" value={s.social?.twitter||''} onChange={e=>setSocial('twitter',e.target.value)} /></div>
        <div>
          <label className="label">WhatsApp (رقم المكتب)</label>
          <input className="input" placeholder="01100722665" value={s.social?.whatsapp||''} onChange={e=>setSocial('whatsapp',e.target.value)} />
          <p className="text-xs text-white/40 mt-1">يُستخدم لزر واتساب في الموقع ورسائل الاستشارات</p>
        </div>
      </div>

      <button className="btn-gold">حفظ الإعدادات</button>
    </form>
  );
}
