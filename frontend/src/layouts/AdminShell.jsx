import { useAuth } from '../context/AuthContext.jsx';
import AdminLogin from '../pages/admin/AdminLogin.jsx';
import AdminLayout from './AdminLayout.jsx';

/** /admin — تسجيل دخول إن لم تكن مسجّلاً، وإلا لوحة الإدارة */
export default function AdminShell() {
  const { user } = useAuth();
  if (!user || user.role !== 'admin') return <AdminLogin />;
  return <AdminLayout />;
}
