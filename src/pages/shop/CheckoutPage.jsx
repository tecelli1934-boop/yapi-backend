import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Truck, Shield, CheckCircle } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import { useSettings } from '../../contexts/SettingsContext';
import CreditCardForm from '../../components/checkout/CreditCardForm';
import axios from 'axios';

const CheckoutPage = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const { settings, loading: loadingSettings } = useSettings();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    paymentMethod: 'bank_transfer'
  });

  const [legalAccepted, setLegalAccepted] = useState(false);

  // Kullanıcı bilgileri değiştikçe formu güncelle
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city,
      }));
    }
  }, [user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  
  // Kupon State'leri
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Kupon Doğrulama
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsValidatingCoupon(true);
    setCouponError('');
    
    try {
      const { query, where, collection, getDocs } = await import('firebase/firestore');
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.toUpperCase().trim()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setCouponError('Geçersiz kupon kodu.');
        setAppliedCoupon(null);
      } else {
        const couponData = querySnapshot.docs[0].data();
        // Geçerlilik kontrolleri
        const now = new Date();
        const expiry = couponData.expiryDate ? new Date(couponData.expiryDate) : null;
        
        if (!couponData.active) {
          setCouponError('Bu kupon artık aktif değil.');
        } else if (expiry && now > expiry) {
          setCouponError('Bu kuponun süresi dolmuş.');
        } else if (subTotal < (couponData.minAmount || 0)) {
          setCouponError(`Bu kupon için minimum ₺${couponData.minAmount} alışveriş yapmalısınız.`);
        } else {
          setAppliedCoupon(couponData);
          setCouponError('');
        }
      }
    } catch (err) {
      setCouponError('Kupon doğrulanırken bir hata oluştu.');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Sepet tutarlarını hesapla
  const subTotal = cart.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // İndirim hesapla
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = (subTotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === 'fixed') {
      discountAmount = appliedCoupon.value;
    }
  }

  const finalSubTotal = subTotal - discountAmount;
  const shipping = finalSubTotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const kdv = finalSubTotal * (settings.kdvRate / 100);
  const total = finalSubTotal + shipping + kdv;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreditCardSubmit = (cardData) => {
    // Form verilerini cardData ile birleştirip handleSubmit'i tetikle
    handleSubmit({ cardData });
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault(); // Form submit olayından geliyorsa
    if (cart.items.length === 0) return alert('Sepetiniz boş!');
    
    setIsSubmitting(true);
    try {
      // 1. Kredi Kartı ise Önce Ödemeyi Al
      let paymentResult = { success: true, transactionId: null };
      
      if (formData.paymentMethod === 'credit_card') {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/process`, {
          orderData: {
            amount: total,
            orderId: `ORD_${Date.now()}`,
            okUrl: window.location.origin + '/payment-success',
            failUrl: window.location.origin + '/payment-failure'
          },
          cardData: e.cardData // Bileşenden gelen kart verisi
        }, {
          withCredentials: true,
          timeout: 60000
        });
        
        if (!response.data.success) {
          throw new Error(response.data.error || 'Ödeme işlemi başarısız.');
        }
        paymentResult = response.data;
      }

      const { writeBatch, doc, getDoc, increment, collection } = await import('firebase/firestore');
      const batch = writeBatch(db);
      
      // 2. Stok kontrolü yap
      for (const item of cart.items) {
        const itemRef = doc(db, 'products', item.id || item._id);
        const itemSnap = await getDoc(itemRef);
        
        if (!itemSnap.exists()) {
          throw new Error(`${item.name} ürünü veri tabanında bulunamadı.`);
        }
        
        const currentStock = itemSnap.data().stock || 0;
        if (currentStock < item.quantity) {
          throw new Error(`${item.name} ürünü için yetersiz stok! (Mevcut: ${currentStock})`);
        }
        
        batch.update(itemRef, {
          stock: increment(-item.quantity)
        });
      }

      const orderData = {
        orderItems: cart.items.map(item => ({
          id: item.id || item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          totalPrice: item.totalPrice,
          image: item.image,
          variationText: item.variationText || '',
          variationKey: item.variationKey || ''
        })),
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        address: `${formData.address}, ${formData.city}`,
        paymentMethod: formData.paymentMethod === 'credit_card' ? 'credit_card' : 'bank_transfer',
        shippingAddress: {
          street: formData.address,
          city: formData.city,
          district: formData.city,
          zipCode: '00000'
        },
        itemsPrice: subTotal,
        shippingPrice: shipping,
        totalAmount: total
      };

      // Backend API'sine gönder
      const apiUrl = import.meta.env.VITE_API_URL || 'https://yapi-backend.onrender.com';
      
      console.log("Sipariş verisi gönderiliyor:", orderData);
      console.log("İstek atılan URL:", `${apiUrl}/api/orders`);
      
      const response = await axios.post(`${apiUrl}/api/orders`, orderData, {
        withCredentials: true,
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      }).catch(error => {
        console.error("Sipariş API hatası:", error);
        
        // Network error için özel handling
        if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          throw new Error('Backend sunucusuna ulaşılamıyor. Lütfen internet bağlantınızı kontrol edin.');
        }
        
        // Timeout için özel handling
        if (error.code === 'ECONNABORTED') {
          throw new Error('İstek zaman aşımına uğradı. Lütfen tekrar deneyin.');
        }
        
        // CORS error için özel handling
        if (error.response?.status === 403) {
          throw new Error('CORS hatası. Backend ayarlarını kontrol edin.');
        }
        
        // Diğer hatalar
        throw new Error(error.response?.data?.message || error.message || 'Sipariş oluşturulamadı.');
      });
      
      // Başarılı ise siparişi tamamla
      const backendOrderId = response.data.data.order.id || response.data.data.order._id;
      setOrderId(backendOrderId.toString());
      setIsSuccess(true);
      clearCart();
    } catch (error) {
      console.error("Sipariş hatası:", error);
      alert(error.response?.data?.message || error.message || "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-industrial border-t-4 border-green-500">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-secondary-800 mb-2">Siparişiniz Alındı!</h1>
          <p className="text-secondary-600 mb-6">
            Sipariş Numaranız: <span className="font-mono font-bold text-primary-600">#{orderId?.slice(-6).toUpperCase()}</span>
          </p>
          <div className="bg-secondary-50 p-4 rounded text-left mb-6 text-sm">
            <p><strong>Teslimat:</strong> {formData.name}</p>
            <p><strong>E-posta:</strong> {formData.email}</p>
            <p><strong>Ödeme Yöntemi:</strong> {formData.paymentMethod === 'bank_transfer' ? 'Banka Havalesi / EFT' : 'Kredi Kartı'}</p>
          </div>

          {formData.paymentMethod === 'bank_transfer' && (
            <div className="bg-primary-50 border border-primary-100 p-5 rounded-lg text-left mb-6">
              <h3 className="text-primary-800 font-bold mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Ödeme Bilgileri
              </h3>
              <div className="space-y-2 text-sm text-secondary-700">
                <p><strong>Firma Adı:</strong> RS YAPI VE İNŞAAT MALZEMELERİ</p>
                <p><strong>Banka:</strong> [LÜTFEN BANKA ADINI BURAYA YAZINIZ]</p>
                <div className="bg-white p-3 border border-primary-200 rounded font-mono text-xs break-all">
                  <strong>IBAN:</strong> TR00 0000 0000 0000 0000 0000 00
                </div>
                <p className="text-[10px] text-secondary-500 mt-2 italic">* Lütfen açıklama kısmına sipariş numaranızı <strong>#{orderId?.slice(-6).toUpperCase()}</strong> yazmayı unutmayınız. Ödemeniz onaylandıktan sonra siparişiniz işleme alınacaktır.</p>
              </div>
            </div>
          )}
          <Link to="/urunler" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition">
            Alışverişe Devam Et
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/cart" className="inline-flex items-center text-primary-600 hover:text-primary-700 transition">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sepete Geri Dön
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-secondary-800 mb-8">Ödeme Bilgileri</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-industrial p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-6">Teslimat & İletişim</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-secondary-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">E-posta</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-secondary-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0(5XX) XXX XX XX"
                  className="w-full p-2.5 border border-secondary-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Şehir</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-secondary-300 rounded focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-1">Açık Adres</label>
                <textarea
                  name="address"
                  required
                  rows="3"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-secondary-300 rounded focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-industrial p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-600" /> Ödeme Yöntemi
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'bank_transfer' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3">
                  <span className="block font-bold text-secondary-800">Banka Havalesi / EFT</span>
                  <span className="text-xs text-secondary-500">Sipariş sonrası IBAN bilgilerini göreceksiniz.</span>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${formData.paymentMethod === 'credit_card' ? 'border-primary-500 bg-primary-50' : 'border-secondary-200 hover:bg-secondary-50'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="credit_card"
                  checked={formData.paymentMethod === 'credit_card'}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600"
                />
                <div className="ml-3">
                  <span className="block font-bold text-secondary-800">Kredi Kartı / Banka Kartı</span>
                  <span className="text-xs text-secondary-500">Kuveyt Türk altyapısı ile güvenli ödeme.</span>
                </div>
              </label>

              {formData.paymentMethod === 'credit_card' && (
                <CreditCardForm 
                  onSubmit={handleCreditCardSubmit} 
                  amount={total} 
                  isSubmitting={isSubmitting} 
                  disabled={!legalAccepted}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Özet */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-industrial p-6 sticky top-24">
            <h2 className="text-xl font-semibold text-secondary-800 mb-6">Sipariş Özeti</h2>
            
            <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.key} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-secondary-800 line-clamp-1">{item.name}</p>
                    <p className="text-secondary-500">{item.quantity} x ₺{item.price.toLocaleString()}</p>
                  </div>
                  <span className="font-semibold ml-2">₺{item.totalPrice.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Kupon Kodu */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-secondary-700 mb-2">Kupon Kodu</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="KODUNUZ"
                  className="flex-1 p-2 border border-secondary-300 rounded focus:ring-primary-500 focus:border-primary-500 uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon || !couponCode}
                  className="bg-secondary-800 text-white px-4 py-2 rounded hover:bg-black disabled:bg-secondary-300 transition"
                >
                  {isValidatingCoupon ? '...' : 'Uygula'}
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              {appliedCoupon && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Kupon uygulandı: %{appliedCoupon.value} indirim
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-secondary-100 mb-6">
              <div className="flex justify-between text-secondary-600">
                <span>Ara Toplam</span>
                <span>₺{subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>İndirim ({appliedCoupon?.code})</span>
                  <span>-₺{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-secondary-600">
                <span>Kargo</span>
                <span>{shipping === 0 ? 'Ücretsiz' : `₺${shipping.toLocaleString()}`}</span>
              </div>
              <div className="flex justify-between text-secondary-600">
                <span>KDV (%{settings.kdvRate})</span>
                <span>₺{kdv.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Toplam (KDV Dahil)</span>
                  <span className="text-primary-600">₺{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-secondary-50 p-4 rounded-lg border border-secondary-200 mb-6 font-medium text-sm">
              <div className="flex items-start gap-3">
                <input
                  id="legalConsent"
                  type="checkbox"
                  required
                  className="mt-1 w-4 h-4 text-primary-600 border-secondary-300 rounded focus:ring-primary-500"
                  onChange={(e) => setLegalAccepted(e.target.checked)}
                />
                <label htmlFor="legalConsent" className="text-secondary-700 leading-snug">
                  <Link to="/mesafeli-satis-sozlesmesi" target="_blank" className="text-primary-600 hover:underline">Mesafeli Satış Sözleşmesi</Link> ve{' '}
                  <Link to="/iade-kosullari" target="_blank" className="text-primary-600 hover:underline">Ön Bilgilendirme Formu</Link>'nu okudum ve kabul ediyorum.
                </label>
              </div>
            </div>

            {formData.paymentMethod !== 'credit_card' && (
              <button 
                type="submit"
                disabled={isSubmitting || cart.items.length === 0 || !legalAccepted}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isSubmitting || !legalAccepted ? 'bg-secondary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? 'İşleniyor...' : 'Siparişi Onayla'}
              </button>
            )}

            <div className="mt-6 space-y-3 pt-6 border-t border-secondary-100">
              <div className="flex items-center gap-2 text-xs text-secondary-500">
                <Truck className="w-4 h-4" />
                <span>₺{settings.freeShippingThreshold} Üzeri Ücretsiz Kargo</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-secondary-500">
                <Shield className="w-4 h-4" />
                <span>256-bit SSL Güvenli Ödeme Altyapısı</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
