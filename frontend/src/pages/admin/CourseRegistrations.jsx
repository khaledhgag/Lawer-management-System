import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Courses } from '../../services/api';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { buildWhatsAppLink, openWhatsApp } from '../../utils/whatsapp';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const fmtDay = (d) => (d ? new Date(d).toLocaleDateString('ar-EG') : '—');

const yearLabel = (r) =>
  r.academicYear === 'خريج'
    ? `خريج${r.graduationYear ? ` — دفعة ${r.graduationYear}` : ''}`
    : r.academicYear;

function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-xs text-white/50 mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function CourseRegistrations() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = async () => {
    const params = {};
    if (filter) params.status = filter;
    if (search.trim()) params.q = search.trim();
    try {
      setList(await Courses.list(params));
    } catch {
      toast.error('تعذر تحميل التسجيلات');
    }
  };
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (id, status) => {
    await Courses.updateStatus(id, status);
    toast.success('تم تحديث الحالة');
    load();
    if (selected?._id === id) setSelected((s) => (s ? { ...s, status } : s));
  };

  const remove = async (id) => {
    if (!window.confirm('حذف طلب التسجيل نهائياً؟')) return;
    await Courses.remove(id);
    toast.success('تم الحذف');
    setSelected(null);
    load();
  };

  const openWa = (r) => {
    const text = [
      `مرحباً ${r.fullName}،`,
      'بخصوص تسجيلك في الدورة لدينا.',
    ].join('\n');
    const link = buildWhatsAppLink(r.phone, text);
    if (!link) return toast.error('رقم الهاتف غير صالح');
    openWhatsApp(link);
  };

  const copyText = (r) => [
    r.requestNumber,
    r.fullName,
    `كلية الحقوق - جامعة: ${r.university}`,
    `السنة الدراسية / خريج دفعة: ${yearLabel(r)}`,
    `العنوان: ${r.address}`,
    `رقم التليفون: ${r.phone}`,
    r.notes ? `ملاحظات: ${r.notes}` : '',
  ].filter(Boolean).join('\n');

  return (
    <div>
      <div className="card mb-4 flex flex-wrap gap-2">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="بحث بالاسم أو الهاتف أو الجامعة..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button type="button" onClick={load} className="btn-gold">بحث</button>
      </div>

      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <h2 className="text-2xl font-black">تسجيلات الدورة <span className="text-white/40 text-lg">({list.length})</span></h2>
        <select className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">الكل</option>
          <option value="pending">قيد المراجعة</option>
          <option value="contacted">تم التواصل</option>
          <option value="confirmed">مؤكد</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      {list.length === 0 ? <EmptyState title="لا توجد تسجيلات" icon="🎓" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60 text-right">
              <tr className="border-b border-white/5">
                <th className="p-3">الاسم</th>
                <th className="p-3">الجامعة</th>
                <th className="p-3">السنة / الدفعة</th>
                <th className="p-3 hidden md:table-cell">العنوان</th>
                <th className="p-3">التليفون</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr key={r._id} className="border-b border-white/5 hover:bg-ink-700/50">
                  <td className="p-3 font-semibold">{r.fullName}</td>
                  <td className="p-3">{r.university}</td>
                  <td className="p-3 whitespace-nowrap">{yearLabel(r)}</td>
                  <td className="p-3 hidden md:table-cell max-w-[200px]">
                    <span className="text-white/70 line-clamp-2" title={r.address}>{r.address}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap">{r.phone}</td>
                  <td className="p-3 text-xs text-white/50 whitespace-nowrap">{fmtDay(r.createdAt)}</td>
                  <td className="p-3"><StatusBadge status={r.status} /></td>
                  <td className="p-3 text-left whitespace-nowrap space-x-2 space-x-reverse">
                    <button type="button" onClick={() => setSelected(r)} className="text-gold hover:underline text-sm">تفاصيل</button>
                    <button type="button" onClick={() => openWa(r)} className="text-[#25D366] hover:underline text-sm">واتساب</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="text-xl font-black">{selected.fullName}</h3>
                <p className="text-white/60 text-sm mt-1">{selected.phone}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <DetailRow label="رقم الطلب">{selected.requestNumber || '—'}</DetailRow>
              <DetailRow label="تاريخ التسجيل">{fmtDate(selected.createdAt)}</DetailRow>
              <DetailRow label="كلية الحقوق - جامعة">{selected.university}</DetailRow>
              <DetailRow label="السنة الدراسية / خريج دفعة">{yearLabel(selected)}</DetailRow>
            </div>

            <DetailRow label="العنوان">
              <div className="bg-ink-700 p-3 rounded-lg whitespace-pre-wrap">{selected.address}</div>
            </DetailRow>

            {selected.notes && (
              <div className="mt-3">
                <DetailRow label="ملاحظات">
                  <div className="bg-ink-700 p-3 rounded-lg whitespace-pre-wrap">{selected.notes}</div>
                </DetailRow>
              </div>
            )}

            <CopyButton text={copyText(selected)} label="نسخ بيانات المتدرب" className="btn-ghost text-sm mt-4" />

            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10">
              <button type="button" onClick={() => openWa(selected)} className="btn-ghost text-[#25D366] border border-[#25D366]/30">واتساب</button>
              {selected.status !== 'contacted' && (
                <button type="button" onClick={() => setStatus(selected._id, 'contacted')} className="btn-ghost">تم التواصل</button>
              )}
              {selected.status !== 'confirmed' && (
                <button type="button" onClick={() => setStatus(selected._id, 'confirmed')} className="btn-gold">تأكيد التسجيل</button>
              )}
              {selected.status !== 'cancelled' && (
                <button type="button" onClick={() => setStatus(selected._id, 'cancelled')} className="btn-ghost text-red-300">إلغاء</button>
              )}
              <button type="button" onClick={() => remove(selected._id)} className="btn-ghost text-red-400">حذف</button>
              <button type="button" onClick={() => setSelected(null)} className="btn-ghost mr-auto">إغلاق</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
