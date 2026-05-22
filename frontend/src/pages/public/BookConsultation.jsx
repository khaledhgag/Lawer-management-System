import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Consultations } from '../../services/api';
import { openWhatsApp } from '../../utils/whatsapp';

const TYPES = ['مدني','جنائي','أسرة','شركات','عقارات','أخرى'];

export default function BookConsultation() {
  const [form, setForm] = useState({ fullName:'', phone:'', email:'', type:'مدني', details:'' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [officeWa, setOfficeWa] = useState(null);
  const [requestInfo, setRequestInfo] = useState(null);

  const change = (k) => (e) => setForm({...form, [k]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone) return toast.error('الاسم والهاتف مطلوبان');
    setLoading(true);
    try {
      const res = await Consultations.create(form);
      if (res?.whatsappOffice?.link) setOfficeWa(res.whatsappOffice.link);
      setRequestInfo({ requestNumber: res.requestNumber, phone: form.phone });
      setDone(true);
      toast.success('تم إرسال طلبك بنجاح');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <motion.div initial={{scale:0}} animate={{scale:1}} className="text-7xl mb-4">✅</motion.div>
      <h2 className="text-3xl font-black mb-3">تم استلام طلبك</h2>
      {requestInfo?.requestNumber && (
        <div className="bg-ink-700 rounded-xl p-4 mb-4 inline-block text-right">
          <div className="text-xs text-white/50">رقم الطلب — احتفظ به للمتابعة</div>
          <div className="text-2xl font-black text-gold mt-1">{requestInfo.requestNumber}</div>
        </div>
      )}
      <p className="text-white/70">سنتواصل معك على {requestInfo?.phone || 'هاتفك'} خلال 24 ساعة لتأكيد الموعد.</p>
      {officeWa && (
        <button type="button" onClick={() => openWhatsApp(officeWa)} className="btn-gold mt-6">
          تواصل معنا على واتساب
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}}>
        <h1 className="text-4xl font-black mb-2">حجز <span className="text-gold">استشارة</span></h1>
        <p className="text-white/60 mb-8">املأ النموذج وسنتواصل معك خلال 24 ساعة.</p>
        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">الاسم الكامل *</label>
            <input className="input" value={form.fullName} onChange={change('fullName')} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">رقم الهاتف *</label>
              <input className="input" value={form.phone} onChange={change('phone')} />
            </div>
            <div>
              <label className="label">البريد الإلكتروني (اختياري)</label>
              <input type="email" className="input" value={form.email} onChange={change('email')} />
            </div>
          </div>
          <div>
            <label className="label">نوع الاستشارة</label>
            <select className="input" value={form.type} onChange={change('type')}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">تفاصيل مختصرة</label>
            <textarea rows="5" className="input" placeholder="اكتب تفاصيل مختصرة" value={form.details} onChange={change('details')} />
          </div>
          <button disabled={loading} className="btn-gold w-full">
            {loading ? '...جاري الإرسال' : 'إرسال'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
