import { Link } from 'react-router-dom';
import useAsync from '../../hooks/useAsync';
import { Cases } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { data, loading } = useAsync(() => Cases.stats(), []);
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
      </div>
    );
  }

  const cards = [
    { label: 'إجمالي القضايا', value: data?.totalCases || 0, icon: '📁', color: 'from-gold/20' },
    { label: 'استشارات جديدة', value: data?.pendingConsult || 0, icon: '📨', color: 'from-blue-500/20' },
    { label: 'مواعيد قادمة', value: data?.upcoming || 0, icon: '📅', color: 'from-emerald-500/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.07 }}
            className={`card bg-gradient-to-bl ${c.color} to-ink-800`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-white/60">{c.label}</div>
                <div className="text-4xl font-black mt-1">{c.value}</div>
              </div>
              <div className="text-4xl">{c.icon}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gold">جلسات هذا الأسبوع</h3>
          <Link to="/admin/calendar" className="text-sm text-gold hover:underline">التقويم ←</Link>
        </div>
        {(data?.weekSessions || []).length === 0 ? (
          <p className="text-white/50 text-center py-6">لا توجد جلسات خلال 7 أيام</p>
        ) : (
          <div className="space-y-2">
            {data.weekSessions.map((c) => (
              <Link
                key={c._id}
                to={`/admin/cases/${c._id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-ink-700 hover:bg-ink-600 transition"
              >
                <div>
                  <div className="font-semibold">{c.client?.name}</div>
                  <div className="text-xs text-white/50">{c.caseNumber}</div>
                </div>
                <span className="text-gold text-sm">
                  {new Date(c.nextSessionDate).toLocaleDateString('ar-EG')}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gold">آخر النشاطات</h3>
          <Link to="/admin/cases" className="text-sm text-gold hover:underline">عرض الكل ←</Link>
        </div>
        <div className="space-y-2">
          {(data?.recent || []).map((c) => (
            <Link
              key={c._id}
              to={`/admin/cases/${c._id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-ink-700 hover:bg-ink-600 transition"
            >
              <div>
                <div className="font-semibold">{c.client?.name}</div>
                <div className="text-xs text-white/50">{c.caseNumber} • {c.caseType}</div>
              </div>
              <span className="badge bg-gold/10 text-gold">{c.currentStatus}</span>
            </Link>
          ))}
          {(!data?.recent || data.recent.length === 0) && (
            <p className="text-white/50 text-center py-6">لا توجد نشاطات بعد</p>
          )}
        </div>
      </div>
    </div>
  );
}
