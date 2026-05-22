import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Track, Notifications } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { assetUrl } from '../../services/api';

export default function CaseView() {
  const { user } = useAuth();
  const [cases, setCases] = useState(null);
  const [notes, setNotes] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    (async () => {
      // public (by code) cached in sessionStorage
      const pub = sessionStorage.getItem('publicCase');
      if (pub && !user) {
        const c = JSON.parse(pub);
        setCases([c]); setActive(c); return;
      }
      if (user?.role === 'client') {
        const list = await Track.mine();
        setCases(list); setActive(list[0] || null);
        Notifications.list().then(setNotes).catch(() => {});
      } else {
        setCases([]);
      }
    })();
  }, [user]);

  if (cases === null) return <div className="max-w-5xl mx-auto px-4 py-10 space-y-3"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-40" /></div>;
  if (!active) return <div className="max-w-3xl mx-auto px-4 py-16"><EmptyState title="لا توجد قضايا" desc="لم يتم العثور على قضايا مرتبطة بحسابك." /></div>;

  const c = active;
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {user?.role === 'client' && (
        <div className="flex justify-end mb-4">
          <Link to="/track/password" className="text-sm text-gold hover:underline">تغيير كلمة المرور</Link>
        </div>
      )}
      {/* notifications */}
      {notes.length > 0 && (
        <div className="card mb-6 bg-gold/5 border-gold/30">
          <h3 className="text-gold font-bold mb-2">🔔 الإشعارات</h3>
          <ul className="space-y-1 text-sm">
            {notes.slice(0,5).map(n => <li key={n._id} className="text-white/80">• {n.message} <span className="text-white/40 text-xs">— {new Date(n.createdAt).toLocaleDateString('ar-EG')}</span></li>)}
          </ul>
        </div>
      )}

      {/* case header */}
      <motion.div initial={{y:10,opacity:0}} animate={{y:0,opacity:1}} className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-gold mb-1">رقم القضية</div>
            <div className="text-2xl font-black">{c.caseNumber}</div>
            <div className="mt-2 text-white/60">{c.caseType} • {c.court || '—'}</div>
          </div>
          <span className="badge bg-gold/10 text-gold border border-gold/30">{c.currentStatus}</span>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <Info label="اسم العميل" value={c.client?.name} />
          <Info label="الجلسة القادمة" value={c.nextSessionDate ? new Date(c.nextSessionDate).toLocaleDateString('ar-EG') : '—'} />
          <Info label="آخر تحديث" value={new Date(c.updatedAt).toLocaleDateString('ar-EG')} />
        </div>
        {c.lawyerNotes && (
          <div className="mt-4 p-4 rounded-lg bg-ink-700 border border-white/5">
            <div className="text-xs text-gold mb-1">ملاحظات المحامي</div>
            <p className="text-white/80 text-sm">{c.lawyerNotes}</p>
          </div>
        )}
      </motion.div>

      {/* timeline */}
      <div className="card mb-6">
        <h3 className="text-gold font-bold mb-4">⏱ الجدول الزمني</h3>
        {(!c.updates || c.updates.length === 0) ? <EmptyState title="لا توجد تحديثات" /> : (
          <ol className="relative border-r-2 border-gold/30 pr-6 space-y-6">
            {c.updates.slice().reverse().map((u,i) => (
              <motion.li key={u._id || i} initial={{x:10,opacity:0}} animate={{x:0,opacity:1}} transition={{delay:i*0.05}} className="relative">
                <span className="absolute -right-[33px] top-1 w-4 h-4 rounded-full bg-gold border-4 border-ink-800" />
                <div className="text-xs text-gold">{new Date(u.date).toLocaleDateString('ar-EG')}</div>
                <div className="font-bold mt-1">{u.title}</div>
                {u.notes && <p className="text-white/60 text-sm mt-1">{u.notes}</p>}
              </motion.li>
            ))}
          </ol>
        )}
      </div>

      {/* files */}
      <div className="card">
        <h3 className="text-gold font-bold mb-4">📎 الملفات</h3>
        {(!c.files || c.files.length === 0) ? <EmptyState title="لا توجد ملفات" icon="📂" /> : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {c.files.map(f => (
              <a key={f._id} href={assetUrl(f.url)} download={f.name} target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg bg-ink-700 hover:bg-ink-600 border border-white/5 transition flex items-center gap-3">
                <div className="text-2xl">📄</div>
                <div className="flex-1 truncate">
                  <div className="text-sm font-semibold truncate">{f.name}</div>
                  <div className="text-xs text-white/40">{(f.size/1024).toFixed(1)} KB — تنزيل</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function Info({ label, value }) {
  return <div><div className="text-xs text-white/40 mb-1">{label}</div><div className="font-semibold">{value || '—'}</div></div>;
}
