const map = {
  pending:   { t:'قيد الانتظار',  c:'bg-yellow-500/15 text-yellow-300' },
  replied:   { t:'تم الرد',       c:'bg-blue-500/15 text-blue-300' },
  booked:    { t:'تم الحجز',      c:'bg-emerald-500/15 text-emerald-300' },
  completed: { t:'مكتملة',        c:'bg-gold/15 text-gold' },
};
export default function StatusBadge({ status }) {
  const x = map[status] || { t: status, c: 'bg-white/10 text-white' };
  return <span className={`badge ${x.c}`}>{x.t}</span>;
}
