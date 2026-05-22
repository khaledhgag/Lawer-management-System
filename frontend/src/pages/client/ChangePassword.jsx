import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Auth } from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

export default function ChangePassword() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  if (!user || user.role !== 'client') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-white/60 mb-4">يجب تسجيل الدخول أولاً</p>
        <Link to="/track/login" className="btn-gold">تسجيل الدخول</Link>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('كلمتا المرور غير متطابقتين');
    if (form.newPassword.length < 6) return toast.error('6 أحرف على الأقل');
    setLoading(true);
    try {
      await Auth.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('تم تغيير كلمة المرور');
      nav('/track/case');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <h2 className="text-xl font-black mb-4">تغيير كلمة المرور</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">كلمة المرور الحالية</label>
            <input type="password" className="input" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">كلمة المرور الجديدة</label>
            <input type="password" className="input" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">تأكيد الجديدة</label>
            <input type="password" className="input" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>
          <button disabled={loading} className="btn-gold w-full">{loading ? '...' : 'حفظ'}</button>
        </form>
        <Link to="/track/case" className="block text-center mt-4 text-sm text-gold">رجوع للقضية</Link>
      </div>
    </div>
  );
}
