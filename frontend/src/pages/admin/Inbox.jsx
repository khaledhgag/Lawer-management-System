import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Consultations } from '../../services/api';
import StatusBadge from '../../components/StatusBadge.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { buildWhatsAppLink, formatReplyPreview, openWhatsApp } from '../../utils/whatsapp';
import CopyButton from '../../components/CopyButton.jsx';

const fmtDate = (d) => (d ? new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
const fmtDay = (d) => (d ? new Date(d).toLocaleDateString('ar-EG') : '—');

function DetailRow({ label, children }) {
  return (
    <div>
      <div className="text-xs text-white/50 mb-1">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export default function Inbox() {
  const [list, setList] = useState([]);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('view');
  const [reply, setReply] = useState({ appointmentDate:'', appointmentTime:'', fees:'', message:'' });
  const [sendWa, setSendWa] = useState(true);

  const load = async () => {
    const params = {};
    if (filter) params.status = filter;
    if (search.trim()) params.q = search.trim();
    setList(await Consultations.list(params));
  };
  useEffect(() => { load(); }, [filter]);

  const openView = (c) => { setSelected(c); setMode('view'); };
  const openReply = (c) => {
    setSelected(c);
    setMode('reply');
    setReply({ appointmentDate:'', appointmentTime:'', fees:'', message:'' });
  };
  const close = () => setSelected(null);

  const setStatus = async (id, status) => {
    await Consultations.updateStatus(id, status);
    toast.success('تم تحديث الحالة');
    load();
    if (selected?._id === id) setSelected((s) => (s ? { ...s, status } : s));
  };

  const openClientWa = (c, replyDraft) => {
    const text = replyDraft
      ? formatReplyPreview(c, replyDraft)
      : [
          `مرحباً ${c.fullName}،`,
          'بخصوص طلب الاستشارة القانونية لدينا.',
          c.details ? `ملخص الطلب: ${c.details}` : null,
        ].filter(Boolean).join('\n');
    const link = buildWhatsAppLink(c.phone, text);
    if (!link) return toast.error('رقم العميل غير صالح');
    openWhatsApp(link);
  };

  const send = async () => {
    try {
      const updated = await Consultations.reply(selected._id, { ...reply, sendWhatsApp: sendWa });
      if (updated.whatsapp?.sent) {
        toast.success('تم الحفظ وإرسال واتساب للعميل');
      } else if (updated.whatsapp?.link) {
        openWhatsApp(updated.whatsapp.link);
        toast.success('تم الحفظ — افتح واتساب لإرسال الرسالة للعميل');
      } else {
        toast.success('تم إرسال الرد');
      }
      setSelected(updated);
      setMode('view');
      load();
    } catch {
      toast.error('خطأ');
    }
  };

  return (
    <div>
      <div className="card mb-4 flex flex-wrap gap-2">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="بحث بالاسم أو الهاتف..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
        <button type="button" onClick={load} className="btn-gold">بحث</button>
      </div>
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <h2 className="text-2xl font-black">صندوق الاستشارات</h2>
        <select className="input w-auto" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="">الكل</option>
          <option value="pending">قيد الانتظار</option>
          <option value="replied">تم الرد</option>
          <option value="booked">تم الحجز</option>
          <option value="completed">مكتملة</option>
        </select>
      </div>

      {list.length===0 ? <EmptyState title="لا توجد استشارات" icon="📭" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60 text-right">
              <tr className="border-b border-white/5">
                <th className="p-3">الاسم</th>
                <th className="p-3">الهاتف</th>
                <th className="p-3 hidden md:table-cell">البريد</th>
                <th className="p-3">النوع</th>
                <th className="p-3 min-w-[140px]">التفاصيل</th>
                <th className="p-3">التاريخ</th>
                <th className="p-3">الحالة</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {list.map(c => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-ink-700/50">
                  <td className="p-3 font-semibold">{c.fullName}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3 hidden md:table-cell text-white/60">{c.email || '—'}</td>
                  <td className="p-3">{c.type}</td>
                  <td className="p-3 max-w-[200px]">
                    {c.details ? (
                      <span className="text-white/70 line-clamp-2" title={c.details}>{c.details}</span>
                    ) : (
                      <span className="text-white/30">—</span>
                    )}
                  </td>
                  <td className="p-3 text-xs text-white/50 whitespace-nowrap">{fmtDay(c.createdAt)}</td>
                  <td className="p-3"><StatusBadge status={c.status} /></td>
                  <td className="p-3 text-left whitespace-nowrap space-x-2 space-x-reverse">
                    <button type="button" onClick={()=>openView(c)} className="text-gold hover:underline text-sm">تفاصيل</button>
                    <button type="button" onClick={()=>openClientWa(c)} className="text-[#25D366] hover:underline text-sm">واتساب</button>
                    <button type="button" onClick={()=>openReply(c)} className="text-white/70 hover:underline text-sm">رد</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={close}>
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start gap-3 mb-4">
              <div>
                <h3 className="text-xl font-black">{selected.fullName}</h3>
                <p className="text-white/60 text-sm mt-1">{selected.phone}{selected.email ? ` • ${selected.email}` : ''}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <DetailRow label="رقم الطلب">{selected.requestNumber || '—'}</DetailRow>
              <DetailRow label="نوع الاستشارة">{selected.type}</DetailRow>
              <DetailRow label="تاريخ الطلب">{fmtDate(selected.createdAt)}</DetailRow>
            </div>
            <CopyButton
              text={`${selected.fullName}\n${selected.phone}\n${selected.email || ''}\n${selected.type}\n${selected.details || ''}`}
              label="نسخ بيانات العميل"
              className="btn-ghost text-sm mb-3"
            />

            <DetailRow label="تفاصيل الطلب">
              <div className="bg-ink-700 p-3 rounded-lg whitespace-pre-wrap">
                {selected.details || <span className="text-white/40">لا توجد تفاصيل مكتوبة</span>}
              </div>
            </DetailRow>

            {selected.reply?.repliedAt && (
              <div className="mt-4 p-3 rounded-lg border border-gold/20 bg-gold/5">
                <h4 className="font-bold text-gold text-sm mb-2">رد المكتب</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <DetailRow label="الموعد">{fmtDay(selected.reply.appointmentDate)} — {selected.reply.appointmentTime || '—'}</DetailRow>
                  <DetailRow label="الرسوم">{selected.reply.fees != null && selected.reply.fees !== '' ? `${selected.reply.fees} جنيه` : '—'}</DetailRow>
                </div>
                {selected.reply.message && (
                  <p className="text-sm mt-2 text-white/80">{selected.reply.message}</p>
                )}
                <p className="text-xs text-white/40 mt-2">تاريخ الرد: {fmtDate(selected.reply.repliedAt)}</p>
              </div>
            )}

            {mode === 'reply' ? (
              <div className="mt-5 pt-5 border-t border-white/10">
                <h4 className="font-bold text-gold mb-3">رد وحجز موعد</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="label">تاريخ الموعد</label><input type="date" className="input" value={reply.appointmentDate} onChange={e=>setReply({...reply,appointmentDate:e.target.value})} /></div>
                  <div><label className="label">الوقت</label><input className="input" placeholder="6 مساءً" value={reply.appointmentTime} onChange={e=>setReply({...reply,appointmentTime:e.target.value})} /></div>
                  <div className="col-span-2"><label className="label">الرسوم (جنيه)</label><input type="number" className="input" value={reply.fees} onChange={e=>setReply({...reply,fees:e.target.value})} /></div>
                  <div className="col-span-2"><label className="label">الرسالة</label><textarea rows="3" className="input" value={reply.message} onChange={e=>setReply({...reply,message:e.target.value})} placeholder="تم تحديد موعد الاستشارة" /></div>
                </div>
                <label className="flex items-center gap-2 mt-3 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={sendWa} onChange={e=>setSendWa(e.target.checked)} className="accent-gold" />
                  إرسال الرد على واتساب العميل (أو فتح واتساب بعد الحفظ)
                </label>
                <div className="flex flex-wrap gap-2 mt-5">
                  <button type="button" onClick={send} className="btn-gold flex-1 min-w-[120px]">إرسال + حجز</button>
                  <button type="button" onClick={()=>openClientWa(selected, reply)} className="btn-ghost text-[#25D366]">معاينة واتساب</button>
                  <button type="button" onClick={()=>setMode('view')} className="btn-ghost">رجوع</button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-white/10">
                <button type="button" onClick={()=>openClientWa(selected)} className="btn-ghost text-[#25D366] border border-[#25D366]/30">واتساب العميل</button>
                <button type="button" onClick={()=>openReply(selected)} className="btn-gold">رد على الطلب</button>
                {selected.status !== 'completed' && (
                  <button type="button" onClick={()=>setStatus(selected._id,'completed')} className="btn-ghost">تعيين كمكتملة</button>
                )}
                {selected.status === 'pending' && (
                  <button type="button" onClick={()=>setStatus(selected._id,'replied')} className="btn-ghost">تم الرد (بدون حجز)</button>
                )}
                <button type="button" onClick={close} className="btn-ghost mr-auto">إغلاق</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
