import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SettingsAPI } from '../services/api';

export default function Navbar() {
  const [s, setS] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    SettingsAPI.get().then(setS).catch(() => {});
  }, []);

  const item = ({ isActive }) =>
    `block px-3 py-2 text-sm transition ${isActive ? 'text-gold' : 'text-white/80 hover:text-gold'}`;

  const links = (
    <>
      <NavLink to="/" className={item} end onClick={() => setOpen(false)}>الرئيسية</NavLink>
      <NavLink to="/track" className={item} onClick={() => setOpen(false)}>متابعة قضية</NavLink>
      <NavLink to="/book" className={item} onClick={() => setOpen(false)}>حجز استشارة</NavLink>
      <NavLink to="/contact" className={item} onClick={() => setOpen(false)}>اتصل بنا</NavLink>
    </>
  );

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur bg-ink-900/70 border-b border-white/5"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          {s?.logoUrl ? (
            <img src={s.logoUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-gold" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold flex items-center justify-center text-gold shrink-0">⚖</div>
          )}
          <span className="font-bold tracking-wide truncate text-sm md:text-base">
            {s?.officeName || 'مكتب المحاماة'}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">{links}</nav>

        <button
          type="button"
          className="md:hidden p-2 text-gold"
          aria-label="القائمة"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 bg-ink-900 px-4 py-3 overflow-hidden"
          >
            {links}
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
