import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Yükleniyor...</div>;

  // Kullanıcı yoksa veya admin değilse ana sayfaya yönlendir
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary-100">
      <div className="bg-anthracite text-white p-4 shadow-industrial">
        <h1 className="text-xl font-bold">Admin Paneli</h1>
      </div>
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;