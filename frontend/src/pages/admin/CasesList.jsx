import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cases } from '../../services/api';
import Skeleton from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function CasesList() {
  const [q, setQ] = useState('');
  const [archived, setArchived] = useState(false);
  const [list, setList] = useState(null);

  const load = async (query = '', arch = archived) => {
    setList(null);
    setList(await Cases.list(query, arch));
  };
  useEffect(() => { load(); }, [archived]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-black">{archived ? 'قضايا مؤرشفة' : 'القضايا'}</h2>
        <Link to="/admin/cases/new" className="btn-gold">+ إضافة قضية</Link>
      </div>
      <div className="card mb-4 space-y-3">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="بحث: اسم / هاتف / رقم قضية"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(q)}
          />
          <button type="button" onClick={() => load(q)} className="btn-gold">بحث</button>
        </div>
        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
          <input type="checkbox" checked={archived} onChange={(e) => setArchived(e.target.checked)} className="accent-gold" />
          عرض المؤرشفة فقط
        </label>
      </div>
      {list === null ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState title="لا توجد قضايا" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-white/60 text-right">
              <tr className="border-b border-white/5">
                <th className="p-3">العميل</th>
                <th className="p-3">رقم القضية</th>
                <th className="p-3">النوع</th>
                <th className="p-3">الحالة</th>
                <th className="p-3">الجلسة القادمة</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c._id} className="border-b border-white/5 hover:bg-ink-700/50">
                  <td className="p-3 font-semibold">{c.client?.name}</td>
                  <td className="p-3 text-gold">{c.caseNumber}</td>
                  <td className="p-3">{c.caseType}</td>
                  <td className="p-3"><span className="badge bg-gold/10 text-gold">{c.currentStatus}</span></td>
                  <td className="p-3">
                    {c.nextSessionDate ? new Date(c.nextSessionDate).toLocaleDateString('ar-EG') : '—'}
                  </td>
                  <td className="p-3 text-left">
                    <Link to={`/admin/cases/${c._id}`} className="text-gold hover:underline">عرض ←</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
