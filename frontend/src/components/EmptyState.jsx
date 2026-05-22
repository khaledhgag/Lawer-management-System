export default function EmptyState({ title='لا توجد بيانات', desc='سيظهر هنا المحتوى عند توفره.', icon='📭' }) {
  return (
    <div className="card text-center py-12">
      <div className="text-5xl mb-3">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="text-white/60 text-sm mt-1">{desc}</p>
    </div>
  );
}
