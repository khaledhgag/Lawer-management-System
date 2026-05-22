import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Track } from '../../services/api';
import { buildWhatsAppLink, openWhatsApp } from '../../utils/whatsapp';

export default function TrackForgot() {
  const [form, setForm] = useState({ phone: '', trackingCode: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await Track.forgotPassword(form);
      setResult(r);
      toast.success('تم إنشاء كلمة مرور جديدة');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'البيانات غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const text = [
      'بيانات الدخول الجديدة:',
      `اسم المستخدم: ${result.username}`,
      `كلمة المرور: ${result.password}`,
      `رقم القضية: ${result.caseNumber}`,
    ].join('\n');
    const wa = buildWhatsAppLink(form.phone, text);
    return (
      <div className="max-w-md mx-auto px-4 py-16 card">
        <h2 className="text-xl font-black text-gold mb-4">كلمة مرور جديدة</h2>
        <div className="space-y-2 font-mono text-sm bg-ink-700 p-4 rounded-lg">
          <div>المستخدم: <b className="text-gold">{result.username}</b></div>
          <div>كلمة المرور: <b className="text-gold">{result.password}</b></div>
        </div>
        {wa && (
          <button type="button" onClick={() => openWhatsApp(wa)} className="btn-gold w-full mt-4 bg-[#25D366]">
            إرسال البيانات على واتساب (يدوي)
          </button>
        )}
        <Link to="/track/login" className="block text-center mt-4 text-gold text-sm">العودة لتسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h2 className="text-xl font-black mb-2">نسيت كلمة المرور؟</h2>
        <p className="text-white/60 text-sm mb-4">أدخل هاتفك وكود التتبع اللي استلمته مع القضية.</p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">رقم الهاتف</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          </div>
          <div>
            <label className="label">كود التتبع</label>
            <input className="input" value={form.trackingCode} onChange={(e) => setForm({ ...form, trackingCode: e.target.value })} required />
          </div>
          <button disabled={loading} className="btn-gold w-full">{loading ? '...' : 'استعادة كلمة المرور'}</button>
        </form>
        <Link to="/track/login" className="block text-center mt-4 text-sm text-white/60 hover:text-gold">رجوع</Link>
      </div>
    </div>
  );
}
