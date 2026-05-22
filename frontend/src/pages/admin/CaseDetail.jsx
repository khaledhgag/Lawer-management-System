import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Cases } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import CopyButton from '../../components/CopyButton.jsx';
import { waTemplates } from '../../config/waTemplates';
import { buildWhatsAppLink, clientSummaryText, formatCaseUpdateMessage, openWhatsApp } from '../../utils/whatsapp';
import { assetUrl } from '../../services/api';

export default function CaseDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [c, setC] = useState(null);
  const [upd, setUpd] = useState({ title: '', notes: '', date: '' });
  const [file, setFile] = useState(null);
  const [waTpl, setWaTpl] = useState('');

  const load = async () => setC(await Cases.get(id));
  useEffect(() => { load(); }, [id]);

  const openWa = (text) => {
    const link = buildWhatsAppLink(c.client?.phone, text);
    if (!link) return toast.error('رقم غير صالح');
    openWhatsApp(link);
  };

  const addUpdate = async (e) => {
    e.preventDefault();
    if (!upd.title) return toast.error('العنوان مطلوب');
    try {
      await Cases.addUpdate(id, upd);
      toast.success('تم إضافة التحديث وإشعار العميل');
      const msg = formatCaseUpdateMessage(c, upd);
      setUpd({ title: '', notes: '', date: '' });
      await load();
      if (window.confirm('فتح واتساب لإبلاغ العميل؟')) openWa(msg);
    } catch {
      toast.error('خطأ');
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('اختر ملف');
    const fd = new FormData();
    fd.append('file', file);
    try {
      await Cases.addFile(id, fd);
      setFile(null);
      toast.success('تم رفع الملف');
      load();
    } catch {
      toast.error('فشل الرفع');
    }
  };

  const saveCase = async (e) => {
    e.preventDefault();
    try {
      await Cases.update(id, {
        currentStatus: c.currentStatus,
        nextSessionDate: c.nextSessionDate,
        lawyerNotes: c.lawyerNotes,
        internalNotes: c.internalNotes,
      });
      toast.success('تم الحفظ');
    } catch {
      toast.error('خطأ');
    }
  };

  const archive = async () => {
    if (!window.confirm('أرشفة القضية؟ لن تظهر في القائمة الرئيسية.')) return;
    await Cases.archive(id);
    toast.success('تم الأرشفة');
    nav('/admin/cases');
  };

  if (!c) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <div className="text-gold text-xs">{c.caseNumber} • {c.trackingCode}</div>
            <h2 className="text-2xl font-black mt-1">{c.client?.name}</h2>
            <div className="text-white/60 mt-1">{c.caseType} • {c.court || '—'}</div>
          </div>
          <div className="flex flex-wrap gap-2 items-start">
            <CopyButton text={clientSummaryText(c)} label="نسخ بيانات العميل" />
            <button type="button" onClick={() => openWa(waTpl || waTemplates[3].text)} className="btn-ghost text-[#25D366] text-sm">
              واتساب
            </button>
            <button type="button" onClick={() => Cases.exportPdf(id, `${c.caseNumber}.pdf`)} className="btn-ghost text-sm">
              PDF
            </button>
            {!c.archived && (
              <button type="button" onClick={archive} className="btn-ghost text-sm text-white/50">
                أرشفة
              </button>
            )}
          </div>
        </div>
        <div className="text-sm text-white/60 mt-3">
          <div>👤 {c.client?.username}</div>
          <div>📞 {c.client?.phone}</div>
        </div>
        <select className="input mt-3 max-w-xs text-sm" value={waTpl} onChange={(e) => setWaTpl(e.target.value)}>
          <option value="">قالب واتساب...</option>
          {waTemplates.map((t) => (
            <option key={t.id} value={t.text}>{t.label}</option>
          ))}
        </select>
      </div>

      <form onSubmit={saveCase} className="card grid md:grid-cols-3 gap-4">
        <div>
          <label className="label">الحالة</label>
          <input className="input" value={c.currentStatus || ''} onChange={(e) => setC({ ...c, currentStatus: e.target.value })} />
        </div>
        <div>
          <label className="label">الجلسة القادمة</label>
          <input
            type="date"
            className="input"
            value={c.nextSessionDate ? c.nextSessionDate.slice(0, 10) : ''}
            onChange={(e) => setC({ ...c, nextSessionDate: e.target.value })}
          />
        </div>
        <div className="md:col-span-3">
          <label className="label">ملاحظات للعميل (تظهر في المتابعة)</label>
          <textarea rows="2" className="input" value={c.lawyerNotes || ''} onChange={(e) => setC({ ...c, lawyerNotes: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="label text-amber-400/90">ملاحظات داخلية (لا تظهر للعميل)</label>
          <textarea rows="3" className="input border-amber-500/20" value={c.internalNotes || ''} onChange={(e) => setC({ ...c, internalNotes: e.target.value })} />
        </div>
        <div className="md:col-span-3 text-left">
          <button type="submit" className="btn-gold">حفظ التعديلات</button>
        </div>
      </form>

      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={addUpdate} className="card space-y-3">
          <h3 className="font-bold text-gold">إضافة تحديث</h3>
          <input className="input" placeholder="العنوان" value={upd.title} onChange={(e) => setUpd({ ...upd, title: e.target.value })} />
          <input type="date" className="input" value={upd.date} onChange={(e) => setUpd({ ...upd, date: e.target.value })} />
          <textarea rows="3" className="input" placeholder="ملاحظات" value={upd.notes} onChange={(e) => setUpd({ ...upd, notes: e.target.value })} />
          <button type="submit" className="btn-gold w-full">إضافة + إشعار العميل</button>
        </form>

        <form onSubmit={uploadFile} className="card space-y-3">
          <h3 className="font-bold text-gold">رفع ملف</h3>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} className="input file:bg-gold file:text-ink-900 file:border-0 file:px-3 file:py-1 file:rounded file:ml-2 file:font-bold" />
          <button type="submit" className="btn-gold w-full">رفع</button>
        </form>
      </div>

      <div className="card">
        <h3 className="font-bold text-gold mb-4">الجدول الزمني</h3>
        <ol className="relative border-r-2 border-gold/30 pr-6 space-y-5">
          {c.updates.slice().reverse().map((u, i) => (
            <li key={u._id || i} className="relative">
              <span className="absolute -right-[33px] top-1 w-4 h-4 rounded-full bg-gold border-4 border-ink-800" />
              <div className="text-xs text-gold">{new Date(u.date).toLocaleDateString('ar-EG')}</div>
              <div className="font-bold mt-1">{u.title}</div>
              {u.notes && <p className="text-white/60 text-sm mt-1">{u.notes}</p>}
            </li>
          ))}
        </ol>
      </div>

      <div className="card">
        <h3 className="font-bold text-gold mb-4">الملفات</h3>
        {c.files.length === 0 ? (
          <p className="text-white/50">لا توجد ملفات</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {c.files.map((f) => (
              <a key={f._id} href={assetUrl(f.url)} download target="_blank" rel="noopener noreferrer" className="p-3 rounded-lg bg-ink-700 hover:bg-ink-600 flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div className="flex-1 truncate"><div className="text-sm truncate">{f.name}</div></div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
