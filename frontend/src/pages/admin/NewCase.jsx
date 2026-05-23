import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Cases } from '../../services/api';
import { buildWhatsAppLink, formatNewCaseMessage, openWhatsApp } from '../../utils/whatsapp';

const TYPES = ['مدني','جنائي','أسرة','شركات','عقارات','أخرى'];

export default function NewCase() {
  const [form, setForm] = useState({ clientName:'', phone:'', email:'', caseNumber:'', caseType:'مدني', court:'', nextSessionDate:'', currentStatus:'قيد المراجعة', notes:'' });
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const c = (k) => (e) => setForm({...form, [k]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await Cases.create(form);
      setDone({
        creds: r.credentials,
        clientName: form.clientName,
        phone: form.phone,
      });
      toast.success('تم إنشاء القضية');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  const getWaLink = () => {
    if (!done?.phone || !done?.creds) return null;
    const trackUrl = `${window.location.origin}/track`;
    const text = formatNewCaseMessage({
      clientName: done.clientName,
      credentials: done.creds,
      trackUrl,
    });
    return buildWhatsAppLink(done.phone, text);
  };

  const sendWhatsApp = () => {
    const link = getWaLink();
    if (!link) return toast.error('رقم الهاتف غير صالح');
    openWhatsApp(link);
  };

  const copyCredentials = async () => {
    if (!done?.creds) return;
    const trackUrl = `${window.location.origin}/track`;
    const text = formatNewCaseMessage({
      clientName: done.clientName,
      credentials: done.creds,
      trackUrl,
    });
    try {
      await navigator.clipboard.writeText(text);
      toast.success('تم نسخ الرسالة');
    } catch {
      toast.error('تعذر النسخ');
    }
  };

  if (done) {
    const { creds } = done;
    return (
      <div className="max-w-xl mx-auto card">
        <h2 className="text-2xl font-black text-gold mb-2">تم إنشاء القضية</h2>
        <p className="text-white/60 mb-4">
          أرسل بيانات الدخول للعميل على الرقم: <b className="text-white">{done.phone}</b>
        </p>
        <div className="space-y-2 bg-ink-700 p-4 rounded-lg font-mono text-sm">
          <div>اسم المستخدم: <b className="text-gold">{creds.username}</b></div>
          <div>كلمة المرور: <b className="text-gold">{creds.password}</b></div>
          <div>رقم القضية: <b className="text-gold">{creds.caseNumber}</b></div>
          <div>كود التتبع: <b className="text-gold">{creds.trackingCode}</b></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={sendWhatsApp} className="btn-gold bg-[#25D366] hover:opacity-90 border-0">
            فتح واتساب وإرسال يدوي
          </button>
          <button type="button" onClick={copyCredentials} className="btn-ghost">
            نسخ نص الرسالة
          </button>
          <button type="button" onClick={() => nav('/admin/cases')} className="btn-ghost">
            الذهاب للقضايا
          </button>
          <button
            type="button"
            onClick={() => { setDone(null); setForm({ clientName:'', phone:'', email:'', caseType:'مدني', court:'', nextSessionDate:'', currentStatus:'قيد المراجعة', notes:'' }); }}
            className="btn-ghost"
          >
            إضافة قضية أخرى
          </button>
        </div>
        <p className="text-xs text-white/40 mt-4">
          يفتح واتساب برسالة جاهزة — اضغط إرسال من تطبيقك (تحويل يدوي).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-black mb-6">إضافة قضية جديدة</h2>
      <form onSubmit={submit} className="card grid md:grid-cols-2 gap-4">
        <div><label className="label">اسم العميل *</label><input className="input" value={form.clientName} onChange={c('clientName')} required /></div>
        <div><label className="label">رقم القضية *</label><input className="input" value={form.caseNumber} onChange={c('caseNumber')} required placeholder="مثال: 2026/12345" /></div>
        <div><label className="label">رقم الهاتف *</label><input className="input" value={form.phone} onChange={c('phone')} required placeholder="01xxxxxxxxx" /></div>
        <div><label className="label">البريد الإلكتروني</label><input type="email" className="input" value={form.email} onChange={c('email')} /></div>
        <div><label className="label">نوع القضية *</label><select className="input" value={form.caseType} onChange={c('caseType')}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
        <div><label className="label">المحكمة</label><input className="input" value={form.court} onChange={c('court')} /></div>
        <div><label className="label">تاريخ الجلسة القادمة</label><input type="date" className="input" value={form.nextSessionDate} onChange={c('nextSessionDate')} /></div>
        <div className="md:col-span-2"><label className="label">الحالة الحالية</label><input className="input" value={form.currentStatus} onChange={c('currentStatus')} /></div>
        <div className="md:col-span-2"><label className="label">ملاحظات المحامي</label><textarea rows="4" className="input" value={form.notes} onChange={c('notes')} /></div>
        <div className="md:col-span-2"><button disabled={loading} className="btn-gold w-full">{loading?'...':'إنشاء وتوليد البيانات'}</button></div>
      </form>
    </div>
  );
}
