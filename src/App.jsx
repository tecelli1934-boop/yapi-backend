import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { ProductProvider } from './contexts/ProductContext';
import { ShoppingListProvider } from './contexts/ShoppingListContext';
import ShoppingListFAB from './components/ui/ShoppingListFAB';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/shop/Home';
import AllProductsPage from './pages/shop/AllProductsPage';
import CategoryPage from './pages/shop/CategoryPage';
import CartPage from './pages/shop/CartPage';
import LoginPage from './pages/shop/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import EmailVerificationInfoPage from './pages/auth/EmailVerificationInfoPage';
import EmailVerifiedPage from './pages/auth/EmailVerifiedPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import ProfilePage from './pages/shop/ProfilePage';
import FavoritesPage from './pages/shop/FavoritesPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminSettings from './pages/admin/AdminSettings';
import PageManagement from './pages/admin/PageManagement';
import { seedSiteContent } from './utils/seedSiteContent';
import { auth, db, messaging, getToken, onMessage } from './firebase';
import axios from 'axios';
import { useEffect } from 'react';

import { OrderProvider } from './contexts/OrderContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { CategoryProvider } from './contexts/CategoryContext';

// Legal & Contact Pages
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import SalesContract from './pages/legal/SalesContract';
import ReturnPolicy from './pages/legal/ReturnPolicy';
import ContactPage from './pages/shop/ContactPage';

function App() {
  useEffect(() => {
    seedSiteContent();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <CategoryProvider>
            <OrderProvider>
              <ProductProvider>
                <CartProvider>
                  <FavoritesProvider>
                    <ShoppingListProvider>
                      <div className="flex flex-col min-h-screen">
                        <Navbar />
                        <main className="flex-grow">
                    <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/urunler" element={<AllProductsPage />} />
                    <Route path="/kategori/:categorySlug" element={<CategoryPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/giris" element={<LoginPage />} />
                    <Route path="/kayit" element={<RegisterPage />} />
                    <Route path="/email-dogrulama-bilgi" element={<EmailVerificationInfoPage />} />
                    <Route path="/email-dogrula/:token" element={<EmailVerifiedPage />} />
                    <Route path="/sifremi-unuttum" element={<ForgotPasswordPage />} />
                    <Route path="/sifre-sifirlama/:token" element={<ResetPasswordPage />} />
                    <Route path="/profil" element={<ProfilePage />} />
                    <Route path="/favoriler" element={<FavoritesPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/iletisim" element={<ContactPage />} />
                    <Route path="/gizlilik-politikasi" element={<PrivacyPolicy />} />
                    <Route path="/mesafeli-satis-sozlesmesi" element={<SalesContract />} />
                    <Route path="/iade-kosullari" element={<ReturnPolicy />} />

                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route index element={<Dashboard />} />
                      <Route path="urunler" element={<ProductManagement />} />
                      <Route path="kategoriler" element={<CategoryManagement />} />
                      <Route path="siparisler" element={<OrderManagement />} />
                      <Route path="sayfalar" element={<PageManagement />} />
                      <Route path="ayarlar" element={<AdminSettings />} />
                    </Route>
                  </Routes>
                        </main>
                        <Footer />
                        <ShoppingListFAB />
                      </div>
                    </ShoppingListProvider>
                  </FavoritesProvider>
                </CartProvider>
              </ProductProvider>
            </OrderProvider>
          </CategoryProvider>
        </SettingsProvider>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;
