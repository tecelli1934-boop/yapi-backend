import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useRef } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useCategories } from '../../contexts/CategoryContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const timeoutRef = useRef(null);
  const { cart } = useCart();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { categories, getSubcategories } = useCategories();

  const itemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const favCount = favorites.items.length;

  const handleMouseEnter = (categoryId) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenDropdown(categoryId);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  return (
    <nav className="bg-anthracite text-white shadow-industrial sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center h-16">
          <Link to="/" className="text-xl font-bold text-primary-500 mr-8">
            YapıMalzemesi
          </Link>

          {/* Kategori Butonları - Desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              to="/urunler"
              className="px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-md transition"
            >
              Tüm Ürünler
            </Link>
            
            {categories.filter(cat => (!cat.parentId || cat.parentId === '') && cat.isActive !== false).map((category) => {
              const subcategories = getSubcategories(category.id).filter(s => s.isActive !== false);
              return (
                <div
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(category.id)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center gap-1 px-3 py-2 text-sm hover:bg-primary-600 hover:text-white rounded-md transition">
                    {category.name}
                    {subcategories.length > 0 && <ChevronDown className="w-3 h-3" />}
                  </button>
                  
                  {openDropdown === category.id && (
                    <div
                      className="absolute top-full left-0 mt-1 w-64 bg-white text-secondary-800 rounded-lg shadow-xl border border-secondary-200 z-50"
                      onMouseEnter={() => handleMouseEnter(category.id)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="py-2">
                        <Link
                          to={`/kategori/${category.slug}`}
                          className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600 transition font-semibold"
                          onClick={() => setOpenDropdown(null)}
                        >
                          Tüm {category.name}
                        </Link>
                        
                        {subcategories.length > 0 && (
                          <>
                            <div className="border-t border-secondary-100 my-1"></div>
                            {subcategories.map(sub => (
                              <Link
                                key={sub.id}
                                to={`/kategori/${sub.slug}`}
                                className="block px-4 py-2 hover:bg-primary-50 hover:text-primary-600 transition text-sm"
                                onClick={() => setOpenDropdown(null)}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link to="/favoriler" className="relative">
              <Heart className="w-6 h-6" />
              {favCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/profil" className="flex items-center gap-1 hover:text-primary-400">
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className="flex items-center gap-1 bg-primary-700/50 hover:bg-primary-600 px-3 py-1.5 rounded-md transition-all border border-primary-500/30" 
                    title="Yönetim Paneli"
                  >
                    <LayoutDashboard className="w-5 h-5 text-primary-400" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden lg:inline">Admin Panel</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  to="/kayit" 
                  className="bg-secondary-700 hover:bg-secondary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-secondary-600"
                >
                  Kayıt Ol
                </Link>
                <Link 
                  to="/giris" 
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border border-primary-500"
                >
                  Giriş
                </Link>
              </div>
            )}

            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link to="/" className="block py-2 hover:text-primary-400">Ana Sayfa</Link>
            
            <div className="border-t border-secondary-700 pt-2 mt-2">
              <div className="text-sm text-secondary-400 mb-2">Kategoriler</div>
              {categories.filter(cat => (!cat.parentId || cat.parentId === '') && cat.isActive !== false).map((category) => (
                <div key={category.id}>
                  <Link
                    to={`/kategori/${category.slug}`}
                    className="block py-2 pl-4 hover:text-primary-400 text-sm font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {category.name}
                  </Link>
                  {getSubcategories(category.id).filter(s => s.isActive !== false).map(sub => (
                    <Link
                      key={sub.id}
                      to={`/kategori/${sub.slug}`}
                      className="block py-1 pl-8 hover:text-primary-400 text-xs text-secondary-300"
                      onClick={() => setIsOpen(false)}
                    >
                      - {sub.name}
                    </Link>
                  ))}
                </div>
              ))}
              <Link
                to="/urunler"
                className="block py-2 pl-4 hover:text-primary-400 text-sm font-semibold text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Tüm Ürünler
              </Link>
            </div>
            
            <Link to="/favoriler" className="block py-2 hover:text-primary-400">Favoriler</Link>
            {!user && <Link to="/giris" className="block py-2 hover:text-primary-400">Giriş</Link>}
            {!user && <Link to="/kayit" className="block py-2 hover:text-primary-400">Kayıt Ol</Link>}
            {user?.role === 'admin' && (
              <Link to="/admin" className="block py-2 hover:text-primary-400">Admin Panel</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
