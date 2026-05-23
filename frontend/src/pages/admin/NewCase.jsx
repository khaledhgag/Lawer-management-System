import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Cases } from '../../services/api';
import { buildWhatsAppLink, formatNewCaseMessage, openWhatsApp } from '../../utils/whatsapp';

const TYPES = ['مدني', 'جنائي', 'أسرة', 'شركات', 'عقارات', 'أخرى'];
const EMPTY_CASE = { caseNumber: '', caseType: 'مدني', court: '', nextSessionDate: '', currentStatus: 'قيد المراجعة', notes: '' };

export default function NewCase() {
  const nav = useNavigate();
  const [mode, setMode] = useState('new'); // 'new' | 'existing'

  // existing client search
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const debounceRef = useRef(null);

  // form fields
  const [clientForm, setClientForm] = useState({ clientName: '', phone: '', email: '' });
  const [caseForm, setCaseForm] = useState(EMPTY_CASE);
  const [done, setDone] = useState(null);
  const [loading, setLoading] = useState(false);

  // search with debounce
  useEffect(() => {
    if (mode !== 'existing') return;
    if (!query.trim()) { setResults([]); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try { setResults(await Cases.searchClients(query)); }
      catch { setResults([]); }
      finally { setSearching(false); }
    }, 350);
  }, [query, mode]);

  const cc = (k) => (e) => setClientForm({ ...clientForm, [k]: e.target.value });
  const cs = (k) => (e) => setCaseForm({ ...caseForm, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'existing' && !selectedClient) {
      return toast.error('اختر عميلاً من نتائج البحث أولاً');
    }
    setLoading(true);
    try {
      const payload = mode === 'existing'
        ? { clientId: selectedClient._id, ...caseForm }
        : { ...clientForm, ...caseForm };
      const r = await Cases.create(payload);
      setDone({
        creds: r.credentials,
        clientName: mode === 'existing' ? selectedClient.name : clientForm.clientName,
        phone: mode === 'existing' ? selectedClient.phone : clientForm.phone,
        isExisting: mode === 'existing',
      });
      toast.success('تم إنشاء القضية');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  const getWaLink = () => {
    if (!done?.phone || !done?.creds) return null;
    const trackUrl = `${window.location.origin}/track`;
    const text = formatNewCaseMessage({ clientName: done.clientName, credentials: done.creds, trackUrl });
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
    const text = formatNewCaseMessage({ clientName: done.clientName, credentials: done.creds, trackUrl });
    try { await navigator.clipboard.writeText(text); toast.success('تم نسخ الرسالة'); }
    catch { toast.error('تعذر النسخ'); }
  };

  const resetForm = () => {
    setDone(null);
    setClientForm({ clientName: '', phone: '', email: '' });
    setCaseForm(EMPTY_CASE);
    setSelectedClient(null);
    setQuery('');
    setResults([]);
  };

  // ── success screen ─────────────────────────────────────────────────────────
  if (done) {
    const { creds } = done;
    return (
      <div className="max-w-xl mx-auto card">
        <h2 className="text-2xl font-black text-gold mb-2">تم إنشاء القضية</h2>
        {done.isExisting ? (
          <p className="text-white/60 mb-4">
            تمت إضافة القضية للعميل: <b className="text-white">{done.clientName}</b>
          </p>
        ) : (
          <p className="text-white/60 mb-4">
            أرسل بيانات الدخول للعميل على الرقم: <b className="text-white">{done.phone}</b>
          </p>
        )}
        <div className="space-y-2 bg-ink-700 p-4 rounded-lg font-mono text-sm">
          {!creds.existingClient && (
            <>
              <div>اسم المستخدم: <b className="text-gold">{creds.username}</b></div>
              <div>كلمة المرور: <b className="text-gold">{creds.password}</b></div>
            </>
          )}
          {creds.existingClient && (
            <div className="text-white/50 text-xs">العميل لديه حساب مسبق — لا توجد كلمة مرور جديدة</div>
          )}
          <div>رقم القضية: <b className="text-gold">{creds.caseNumber}</b></div>
          <div>كود التتبع: <b className="text-gold">{creds.trackingCode}</b></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {!done.isExisting && (
            <button type="button" onClick={sendWhatsApp} className="btn-gold bg-[#25D366] hover:opacity-90 border-0">
              فتح واتساب وإرسال يدوي
            </button>
          )}
          <button type="button" onClick={copyCredentials} className="btn-ghost">نسخ نص الرسالة</button>
          <button type="button" onClick={() => nav('/admin/cases')} className="btn-ghost">الذهاب للقضايا</button>
          <button type="button" onClick={resetForm} className="btn-ghost">إضافة قضية أخرى</button>
        </div>
        {!done.isExisting && (
          <p className="text-xs text-white/40 mt-4">يفتح واتساب برسالة جاهزة — اضغط إرسال من تطبيقك (تحويل يدوي).</p>
        )}
      </div>
    );
  }

  // ── form ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-black mb-6">إضافة قضية جديدة</h2>

      {/* mode toggle */}
      <div className="grid grid-cols-2 mb-6 bg-ink-700 rounded-lg p-1 max-w-sm">
        <button
          type="button"
          onClick={() => { setMode('new'); setSelectedClient(null); setQuery(''); setResults([]); }}
          className={`py-2 rounded-md text-sm font-bold transition ${mode === 'new' ? 'bg-gold text-ink-900' : 'text-white/70'}`}
        >
          عميل جديد
        </button>
        <button
          type="button"
          onClick={() => setMode('existing')}
          className={`py-2 rounded-md text-sm font-bold transition ${mode === 'existing' ? 'bg-gold text-ink-900' : 'text-white/70'}`}
        >
          عميل موجود
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {/* ── existing client search ── */}
        {mode === 'existing' && (
          <div className="card mb-2">
            <label className="label">ابحث عن العميل (الاسم أو الهاتف)</label>
            <input
              className="input"
              placeholder="اكتب للبحث..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelectedClient(null); }}
            />
            {searching && <div className="text-xs text-white/40 mt-2">جارٍ البحث...</div>}
            {results.length > 0 && !selectedClient && (
              <ul className="mt-2 divide-y divide-white/5 border border-white/10 rounded-lg overflow-hidden">
                {results.map((cl) => (
                  <li
                    key={cl._id}
                    onClick={() => { setSelectedClient(cl); setResults([]); setQuery(cl.name); }}
                    className="px-4 py-3 hover:bg-ink-600 cursor-pointer flex justify-between items-center transition"
                  >
                    <div>
                      <div className="font-semibold">{cl.name}</div>
                      <div className="text-xs text-white/40">{cl.phone}</div>
                    </div>
                    <span className="text-xs text-gold/60 font-mono">{cl.username}</span>
                  </li>
                ))}
              </ul>
            )}
            {selectedClient && (
              <div className="mt-3 p-3 rounded-lg bg-gold/5 border border-gold/30 flex justify-between items-center">
                <div>
                  <div className="font-bold text-gold">{selectedClient.name}</div>
                  <div className="text-xs text-white/50">{selectedClient.phone} • {selectedClient.username}</div>
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedClient(null); setQuery(''); }}
                  className="text-xs text-white/40 hover:text-red-400 transition"
                >
                  تغيير
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── new client fields ── */}
        {mode === 'new' && (
          <div className="card grid md:grid-cols-2 gap-4">
            <div><label className="label">اسم العميل *</label><input className="input" value={clientForm.clientName} onChange={cc('clientName')} required /></div>
            <div><label className="label">رقم الهاتف *</label><input className="input" value={clientForm.phone} onChange={cc('phone')} required placeholder="01xxxxxxxxx" /></div>
            <div className="md:col-span-2"><label className="label">البريد الإلكتروني</label><input type="email" className="input" value={clientForm.email} onChange={cc('email')} /></div>
          </div>
        )}

        {/* ── case fields (always shown) ── */}
        <div className="card grid md:grid-cols-2 gap-4">
          <div><label className="label">رقم القضية *</label><input className="input" value={caseForm.caseNumber} onChange={cs('caseNumber')} required placeholder="مثال: 2026/12345" /></div>
          <div><label className="label">نوع القضية *</label><select className="input" value={caseForm.caseType} onChange={cs('caseType')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">المحكمة</label><input className="input" value={caseForm.court} onChange={cs('court')} /></div>
          <div><label className="label">تاريخ الجلسة القادمة</label><input type="date" className="input" value={caseForm.nextSessionDate} onChange={cs('nextSessionDate')} /></div>
          <div className="md:col-span-2"><label className="label">الحالة الحالية</label><input className="input" value={caseForm.currentStatus} onChange={cs('currentStatus')} /></div>
          <div className="md:col-span-2"><label className="label">ملاحظات المحامي</label><textarea rows="4" className="input" value={caseForm.notes} onChange={cs('notes')} /></div>
          <div className="md:col-span-2">
            <button disabled={loading} className="btn-gold w-full">
              {loading ? '...' : mode === 'existing' ? 'إضافة القضية للعميل' : 'إنشاء وتوليد البيانات'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
