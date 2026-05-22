import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl font-black text-gold">404</div>
      <h2 className="text-2xl mt-3 mb-2">الصفحة غير موجودة</h2>
      <Link to="/" className="btn-gold mt-4">العودة للرئيسية</Link>
    </div>
  );
}
