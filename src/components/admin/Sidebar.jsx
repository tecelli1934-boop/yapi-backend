import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const menu = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/urunler', icon: Package, label: 'Ürünler' },
    { path: '/admin/siparisler', icon: ShoppingBag, label: 'Siparişler' },
  ];

  return (
    <aside className="w-64 bg-anthracite text-white flex flex-col">
      <div className="p-4 text-xl font-bold text-primary-500 border-b border-secondary-700">
        Admin Panel
      </div>
      <nav className="flex-1 p-4">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 rounded-md mb-1 transition ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-secondary-700'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-secondary-700">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-red-600 transition"
        >
          <LogOut size={20} />
          Çıkış
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;