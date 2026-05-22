import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
const items = [
  { to:'/admin',          label:'لوحة التحكم', icon:'📊', end:true },
  { to:'/admin/cases',    label:'القضايا',     icon:'📁' },
  { to:'/admin/inbox',    label:'الاستشارات',  icon:'📨' },
  { to:'/admin/calendar', label:'التقويم',     icon:'📅' },
  { to:'/admin/settings', label:'الإعدادات',   icon:'⚙️' },
];
export default function AdminLayout() {
  const { logout, user } = useAuth(); const nav = useNavigate();
  return (
    <div className="min-h-screen flex bg-ink-900 text-white" dir="rtl">
      <aside className="w-64 bg-ink-800 border-l border-white/5 p-4 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold">⚖</div>
          <span className="font-bold">لوحة الإدارة</span>
        </div>
        <nav className="space-y-1">
          {items.map(i => (
            <NavLink key={i.to} to={i.to} end={i.end} className={({isActive}) => `flex items-center gap-3 px-3 py-2 rounded-lg transition ${isActive?'bg-gold text-ink-900 font-bold':'text-white/80 hover:bg-white/5'}`}>
              <span>{i.icon}</span><span>{i.label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={() => { logout(); nav('/admin'); }} className="mt-8 w-full btn-ghost py-2 text-sm">تسجيل خروج</button>
      </aside>
      <div className="flex-1">
        <header className="h-16 border-b border-white/5 bg-ink-800/50 flex items-center justify-between px-6">
          <h1 className="font-bold text-gold">مرحباً {user?.name || 'المدير'}</h1>
          <span className="text-xs text-white/50">{new Date().toLocaleDateString('ar-EG')}</span>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
