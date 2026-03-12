import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, Heart, Settings, LogOut, Shield, Bell, Key, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

const ProfilePage = () => {
  const { user, logout, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Kullanıcı siparişlerini çek
  useEffect(() => {
    if (user?.email && activeTab === 'orders') {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          const q = query(
            collection(db, 'orders'),
            where('customerInfo.email', '==', user.email)
          );
          const querySnapshot = await getDocs(q);
          const orders = querySnapshot.docs
            .map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Hafızada sırala (Index hatasını önlemek için)
          
          setUserOrders(orders);
        } catch (error) {
          console.error("Siparişler çekilemedi:", error);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [user, activeTab]);

  const handleLogout = () => {
    logout();
    navigate('/giris');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-secondary-800 mb-8">Profilim</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Menü */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-industrial p-6">
            <div className="text-center mb-6">
              {user?.picture ? (
                <img src={user.picture} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary-200 shadow-sm" />
              ) : (
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-secondary-800">{user?.name || 'Kullanıcı'}</h3>
              <p className="text-secondary-600">{user?.email || ''}</p>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition text-left ${
                  activeTab === 'profile' 
                    ? 'text-primary-600 bg-primary-50 font-medium' 
                    : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <User className="w-4 h-4" />
                Profil Bilgileri
              </button>
              <Link 
                to="/favoriler" 
                className="flex items-center gap-3 px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-md"
              >
                <Heart className="w-4 h-4" />
                Favorilerim
              </Link>
              <button 
                onClick={() => setActiveTab('address')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition text-left ${
                  activeTab === 'address' 
                    ? 'text-primary-600 bg-primary-50 font-medium' 
                    : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Adres Bilgileri
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition text-left ${
                  activeTab === 'orders' 
                    ? 'text-primary-600 bg-primary-50 font-medium' 
                    : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Siparişlerim
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition text-left ${
                  activeTab === 'settings' 
                    ? 'text-primary-600 bg-primary-50 font-medium' 
                    : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                Ayarlar
              </button>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition text-left mt-4"
              >
                <LogOut className="w-4 h-4" />
                Çıkış Yap
              </button>
            </nav>
          </div>
        </div>

        {/* İçerik */}
        <div className="lg:col-span-2">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-industrial p-6 mb-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-600" /> Profil Bilgileri
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Ad Soyad</label>
                  <input type="text" readOnly value={user?.name || ''} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-md text-secondary-800" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">E-posta Adresi</label>
                  <input type="email" readOnly value={user?.email || ''} className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-md text-secondary-800" />
                </div>
                {user?.googleId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Google Hesabı ile Doğrulandı</h4>
                      <p className="text-sm text-green-700">Bu hesap Google ile güvenli bir şekilde giriş yaptı.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Adres Bilgileri Sekmesi */}
          {activeTab === 'address' && (
            <div className="bg-white rounded-lg shadow-industrial p-6 mb-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" /> Adres Bilgileri
              </h2>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  phone: formData.get('phone'),
                  city: formData.get('city'),
                  address: formData.get('address'),
                };
                try {
                  setSavingAddress(true);
                  await updateUserData(data);
                  alert('Adres bilgileriniz başarıyla güncellendi.');
                } catch (err) {
                  alert('Güncelleme sırasında bir hata oluştu.');
                } finally {
                  setSavingAddress(false);
                }
              }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Telefon Numarası</label>
                  <input 
                    type="tel" 
                    name="phone"
                    defaultValue={user?.phone || ''} 
                    placeholder="05XX XXX XX XX"
                    className="w-full px-4 py-2 border border-secondary-200 rounded-md text-secondary-800 focus:ring-primary-500 focus:border-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Şehir</label>
                  <input 
                    type="text" 
                    name="city"
                    defaultValue={user?.city || ''} 
                    className="w-full px-4 py-2 border border-secondary-200 rounded-md text-secondary-800 focus:ring-primary-500 focus:border-primary-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">Açık Adres</label>
                  <textarea 
                    name="address"
                    defaultValue={user?.address || ''} 
                    rows="4"
                    className="w-full px-4 py-2 border border-secondary-200 rounded-md text-secondary-800 focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={savingAddress}
                  className={`w-full py-3 rounded-md font-bold text-white transition ${
                    savingAddress ? 'bg-secondary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {savingAddress ? 'Kaydediliyor...' : 'Adres Bilgilerini Kaydet'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-industrial p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-600" /> Siparişlerim
              </h2>

              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-secondary-600">Siparişleriniz yükleniyor...</p>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="text-center py-12 bg-secondary-50 rounded-lg">
                  <ShoppingBag className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                  <p className="text-secondary-600 mb-4">Henüz bir siparişiniz bulunmuyor.</p>
                  <Link to="/urunler" className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition">
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => (
                    <div key={order.id} className="border border-secondary-100 rounded-lg p-4 hover:border-primary-200 transition">
                      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                        <div>
                          <p className="text-sm text-secondary-500">Sipariş No</p>
                          <p className="font-mono font-bold text-secondary-800">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Tarih</p>
                          <p className="text-secondary-800">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Toplam (KDV Dahil)</p>
                          <p className="font-bold text-primary-600">₺{order.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status === 'pending' ? 'Bekliyor' :
                             order.status === 'processing' ? 'Hazırlanıyor' :
                             order.status === 'shipped' ? 'Kargoda' :
                             order.status === 'delivered' ? 'Teslim Edildi' : 'İptal Edildi'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-secondary-50 rounded p-3 text-sm">
                        <p className="font-medium text-secondary-700 mb-2">Ürünler:</p>
                        <ul className="space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between text-secondary-600">
                              <span>{item.name} x {item.quantity}</span>
                              <span className="font-medium">₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-lg shadow-industrial p-6">
              <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary-600" /> Hesap Ayarları
              </h2>

              <div className="space-y-8">
                <section className="pb-8 border-b border-secondary-100">
                  <h3 className="text-lg font-medium text-secondary-900 mb-4 flex items-center gap-2">
                    <Key className="w-4 h-4 text-secondary-400" /> Şifre İşlemleri
                  </h3>
                  <p className="text-sm text-secondary-600 mb-6 font-industrial">
                    Güvenliğiniz için şifre değişikliği e-posta üzerinden yapılmaktadır. 
                    Aşağıdaki butona tıkladığınızda e-posta adresinize bir sıfırlama bağlantısı gönderilir.
                  </p>
                  
                  <button 
                    onClick={async () => {
                      try {
                        const { sendPasswordResetEmail } = await import('firebase/auth');
                        const { auth } = await import('../../firebase');
                        await sendPasswordResetEmail(auth, user.email);
                        alert(`Şifre sıfırlama e-postası ${user.email} adresine gönderildi. Lütfen gelen kutunuzu kontrol edin.`);
                      } catch (err) {
                        alert('Hata: ' + err.message);
                      }
                    }}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded hover:bg-primary-700 transition font-bold"
                  >
                    Şifre Sıfırlama E-postası Gönder
                  </button>
                </section>

                <section>
                  <h3 className="text-lg font-medium text-red-600 mb-2">Hesap Yönetimi</h3>
                  <div className="p-4 bg-secondary-50 border border-secondary-200 rounded-lg">
                    <p className="text-sm text-secondary-800 font-bold mb-1">Hesabı Kapat</p>
                    <p className="text-xs text-secondary-600">Hesap silme işlemleri için destek ekibimizle görüşebilirsiniz.</p>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
