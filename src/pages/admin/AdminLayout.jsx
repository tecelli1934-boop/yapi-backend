import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package, FileText } from 'lucide-react';

const AdminLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="text-center p-8">Yükleniyor...</div>;

  // Eğer kullanıcı yoksa veya admin değilse ana sayfaya yönlendir
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-secondary-100 flex flex-col md:flex-row">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-64 md:min-h-screen bg-anthracite text-white p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl font-bold text-primary-500 hidden md:block">Admin Panel</h2>
        </div>
        
        <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0 hide-scrollbar">
          <Link to="/admin" className="flex items-center gap-2 p-2 hover:bg-secondary-700 rounded transition whitespace-nowrap">
            <LayoutDashboard className="w-4 h-4" /> <span className="text-sm md:text-base">Dashboard</span>
          </Link>
          <Link to="/admin/urunler" className="flex items-center gap-2 p-2 hover:bg-secondary-700 rounded transition whitespace-nowrap">
            <Package className="w-4 h-4" /> <span className="text-sm md:text-base">Ürünler</span>
          </Link>
          <Link to="/admin/kategoriler" className="flex items-center gap-2 p-2 hover:bg-secondary-700 rounded transition whitespace-nowrap">
            <LayoutDashboard className="w-4 h-4" /> <span className="text-sm md:text-base">Kategoriler</span>
          </Link>
          <Link to="/admin/siparisler" className="flex items-center gap-2 p-2 hover:bg-secondary-700 rounded transition whitespace-nowrap">
            <ShoppingBag className="w-4 h-4" /> <span className="text-sm md:text-base">Siparişler</span>
          </Link>
          <Link to="/admin/sayfalar" className="flex items-center gap-2 p-2 hover:bg-secondary-700 rounded transition whitespace-nowrap text-secondary-300">
            <FileText className="w-4 h-4" /> <span className="text-sm md:text-base">Sayfa Yönetimi</span>
          </Link>
          <Link to="/admin/ayarlar" className="flex items-center gap-2 p-2 hover:bg-secondary-700 rounded transition text-primary-400 whitespace-nowrap">
            <Settings className="w-4 h-4" /> <span className="text-sm md:text-base">Ayarlar</span>
          </Link>
        </nav>
      </aside>
      
      <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;