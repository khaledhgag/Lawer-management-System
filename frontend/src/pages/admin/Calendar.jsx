import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar as CalAPI } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function Calendar() {
  const [events, setEvents] = useState(null);

  useEffect(() => {
    CalAPI.events().then(setEvents).catch(() => setEvents([]));
  }, []);

  if (events === null) return <Skeleton className="h-64" />;

  const byDate = {};
  events.forEach((e) => {
    const key = new Date(e.date).toLocaleDateString('ar-EG');
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(e);
  });

  return (
    <div>
      <h2 className="text-2xl font-black mb-6">تقويم المواعيد</h2>
      <p className="text-white/50 text-sm mb-6">جلسات القضايا + استشارات محجوزة</p>

      {events.length === 0 ? (
        <EmptyState title="لا توجد مواعيد قريبة" icon="📅" />
      ) : (
        <div className="space-y-6">
          {Object.entries(byDate).map(([day, list]) => (
            <div key={day} className="card">
              <h3 className="font-bold text-gold mb-3">{day}</h3>
              <ul className="space-y-2">
                {list.map((e) => (
                  <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-ink-700">
                    <div>
                      <span className={`badge mr-2 ${e.type === 'session' ? 'bg-gold/15 text-gold' : 'bg-blue-500/15 text-blue-300'}`}>
                        {e.type === 'session' ? 'جلسة' : 'استشارة'}
                      </span>
                      <span className="font-semibold">{e.title}</span>
                      {e.meta?.time && <span className="text-white/50 text-sm mr-2">— {e.meta.time}</span>}
                    </div>
                    {e.type === 'session' && e.meta?.caseId && (
                      <Link to={`/admin/cases/${e.meta.caseId}`} className="text-gold text-sm hover:underline">
                        عرض القضية
                      </Link>
                    )}
                    {e.type === 'consultation' && (
                      <Link to="/admin/inbox" className="text-gold text-sm hover:underline">
                        صندوق الاستشارات
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
