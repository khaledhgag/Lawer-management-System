import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Auth } from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const [form, setForm] = useState({ username:'', password:'' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate(); const { login } = useAuth();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await Auth.adminLogin(form);
      login(r.token, { ...r.admin, role:'admin' });
      nav('/admin');
    } catch (e) { toast.error(e?.response?.data?.message || 'فشل الدخول'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-ink-900 relative">
      <Link to="/" className="absolute top-6 right-6 btn-ghost text-sm">
        ← الصفحة الرئيسية
      </Link>
      <motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} className="card w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">⚖️</div>
          <h1 className="text-2xl font-black">دخول الإدارة</h1>
          <p className="text-white/60 text-sm">منطقة محمية - للمسؤولين فقط</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">اسم المستخدم</label><input className="input" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
          <div><label className="label">كلمة المرور</label><input type="password" className="input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /></div>
          <button disabled={loading} className="btn-gold w-full">{loading?'...':'دخول'}</button>
        </form>
        <Link to="/" className="btn-ghost w-full mt-4 text-center block">
          العودة للصفحة الرئيسية
        </Link>
      </motion.div>
    </div>
  );
}
