import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Auth, Track } from '../../services/api';
import { useAuth } from '../../context/AuthContext.jsx';

export default function TrackLogin() {
  const [tab, setTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const [acc, setAcc] = useState({ username:'', password:'' });
  const [code, setCode] = useState({ caseNumber:'', trackingCode:'' });

  const submitAcc = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await Auth.clientLogin(acc);
      login(r.token, { ...r.client, role:'client' });
      nav('/track/cases');
    } catch (e) { toast.error(e?.response?.data?.message || 'فشل الدخول'); }
    finally { setLoading(false); }
  };

  const submitCode = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const c = await Track.byCode(code);
      sessionStorage.setItem('publicCase', JSON.stringify(c));
      nav('/track/case');
    } catch (e) { toast.error(e?.response?.data?.message || 'بيانات غير صحيحة'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <div className="grid grid-cols-2 mb-6 bg-ink-700 rounded-lg p-1">
          <button onClick={()=>setTab('account')} className={`py-2 rounded-md text-sm font-bold transition ${tab==='account'?'bg-gold text-ink-900':'text-white/70'}`}>الدخول بالحساب</button>
          <button onClick={()=>setTab('code')} className={`py-2 rounded-md text-sm font-bold transition ${tab==='code'?'bg-gold text-ink-900':'text-white/70'}`}>الدخول برقم القضية</button>
        </div>
        {tab === 'account' ? (
          <form onSubmit={submitAcc} className="space-y-4">
            <div><label className="label">اسم المستخدم</label><input className="input" value={acc.username} onChange={e=>setAcc({...acc,username:e.target.value})} /></div>
            <div><label className="label">كلمة المرور</label><input type="password" className="input" value={acc.password} onChange={e=>setAcc({...acc,password:e.target.value})} /></div>
            <button disabled={loading} className="btn-gold w-full">{loading?'...':'دخول'}</button>
            <Link to="/track/forgot" className="block text-center text-sm text-gold hover:underline">نسيت كلمة المرور؟</Link>
          </form>
        ) : (
          <form onSubmit={submitCode} className="space-y-4">
            <div><label className="label">رقم القضية</label><input className="input" value={code.caseNumber} onChange={e=>setCode({...code,caseNumber:e.target.value})} /></div>
            <div><label className="label">كود التتبع</label><input className="input" value={code.trackingCode} onChange={e=>setCode({...code,trackingCode:e.target.value})} /></div>
            <button disabled={loading} className="btn-gold w-full">{loading?'...':'عرض القضية'}</button>
          </form>
        )}
      </div>
    </div>
  );
}
