import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Courses } from '../../services/api';

const YEARS = ['الفرقة الأولى','الفرقة الثانية','الفرقة الثالثة','الفرقة الرابعة','خريج'];

export default function CourseRegister() {
  const [form, setForm] = useState({
    fullName:'', university:'', academicYear:'الفرقة الأولى', graduationYear:'', address:'', phone:'', notes:'',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);

  const change = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isGraduate = form.academicYear === 'خريج';

  const submit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.university || !form.address || !form.phone) {
      return toast.error('من فضلك أكمل كل الحقول المطلوبة');
    }
    setLoading(true);
    try {
      const res = await Courses.create(form);
      setDone({ requestNumber: res.requestNumber, phone: form.phone });
      toast.success('تم تسجيلك في الدورة بنجاح');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'حدث خطأ');
    } finally { setLoading(false); }
  };

  if (done) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <motion.div initial={{scale:0}} animate={{scale:1}} className="text-7xl mb-4">🎓</motion.div>
      <h2 className="text-3xl font-black mb-3">تم استلام طلب التسجيل</h2>
      {done.requestNumber && (
        <div className="bg-ink-700 rounded-xl p-4 mb-4 inline-block text-right">
          <div className="text-xs text-white/50">رقم الطلب — احتفظ به للمتابعة</div>
          <div className="text-2xl font-black text-gold mt-1">{done.requestNumber}</div>
        </div>
      )}
      <p className="text-white/70">سنتواصل معك على {done.phone} لتأكيد موعد بدء الدورة.</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}}>
        <h1 className="text-4xl font-black mb-2">التسجيل في <span className="text-gold">الدورة</span></h1>
        <p className="text-white/60 mb-8">املأ البيانات التالية وسنتواصل معك لتأكيد التسجيل.</p>

        <form onSubmit={submit} className="card space-y-4">
          <div>
            <label className="label">الاسم *</label>
            <input className="input" value={form.fullName} onChange={change('fullName')} />
          </div>

          <div>
            <label className="label">كلية الحقوق - جامعة *</label>
            <input className="input" placeholder="مثال: القاهرة" value={form.university} onChange={change('university')} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">السنة الدراسية / خريج دفعة *</label>
              <select className="input" value={form.academicYear} onChange={change('academicYear')}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {isGraduate && (
              <div>
                <label className="label">دفعة (سنة التخرج)</label>
                <input className="input" placeholder="مثال: 2023" value={form.graduationYear} onChange={change('graduationYear')} />
              </div>
            )}
          </div>

          <div>
            <label className="label">العنوان *</label>
            <input className="input" value={form.address} onChange={change('address')} />
          </div>

          <div>
            <label className="label">رقم التليفون *</label>
            <input className="input" inputMode="tel" value={form.phone} onChange={change('phone')} />
          </div>

          <div>
            <label className="label">ملاحظات (اختياري)</label>
            <textarea rows="3" className="input" value={form.notes} onChange={change('notes')} />
          </div>

          <button disabled={loading} className="btn-gold w-full">
            {loading ? '...جاري الإرسال' : 'تسجيل'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
