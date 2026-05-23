import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Track, Notifications } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const STATUS_COLORS = {
  'قيد المراجعة': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'جارٍ النظر': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'منتهية': 'bg-green-500/10 text-green-400 border-green-500/30',
  'موقوفة': 'bg-red-500/10 text-red-400 border-red-500/30',
};

export default function MyCasesList() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [cases, setCases] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'client') { nav('/track/login'); return; }
    Track.mine().then(setCases).catch(() => setCases([]));
    Notifications.list()
      .then((ns) => setUnreadCount(ns.filter((n) => !n.read).length))
      .catch(() => {});
  }, [user]);

  if (cases === null)
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-3">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-black">قضاياي</h1>
          <p className="text-white/50 text-sm mt-1">مرحباً، {user?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <span className="text-xs bg-gold/10 text-gold border border-gold/30 px-3 py-1 rounded-full">
              {unreadCount} إشعار جديد
            </span>
          )}
          <Link to="/track/password" className="text-sm text-white/50 hover:text-gold transition">
            تغيير كلمة المرور
          </Link>
          <button
            onClick={() => { logout(); nav('/track/login'); }}
            className="text-sm text-white/50 hover:text-red-400 transition"
          >
            خروج
          </button>
        </div>
      </div>

      {cases.length === 0 ? (
        <EmptyState title="لا توجد قضايا" desc="لم يتم العثور على قضايا مرتبطة بحسابك." />
      ) : (
        <div className="space-y-4">
          {cases.map((c, i) => (
            <motion.div
              key={c._id}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              className="card hover:border-gold/40 transition cursor-pointer"
              onClick={() => nav(`/track/case/${c._id}`)}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs text-gold font-mono bg-gold/10 px-2 py-0.5 rounded">
                      {c.caseNumber}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${
                        STATUS_COLORS[c.currentStatus] ||
                        'bg-white/5 text-white/60 border-white/10'
                      }`}
                    >
                      {c.currentStatus}
                    </span>
                  </div>
                  <div className="font-bold text-lg">{c.caseType}</div>
                  {c.court && (
                    <div className="text-white/50 text-sm mt-1">{c.court}</div>
                  )}
                </div>
                <div className="text-left shrink-0 space-y-1">
                  {c.nextSessionDate && (
                    <div className="text-xs text-white/40">
                      الجلسة القادمة:{' '}
                      <span className="text-white/70">
                        {new Date(c.nextSessionDate).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-white/40">
                    آخر تحديث:{' '}
                    <span className="text-white/70">
                      {new Date(c.updatedAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  {c.updates?.length > 0 && (
                    <div className="text-xs text-white/40">
                      {c.updates.length} تحديث
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <span className="text-xs text-gold hover:underline">عرض التفاصيل ←</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
