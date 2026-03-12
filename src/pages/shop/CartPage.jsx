import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { ShoppingBag, ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';

import { useSettings } from '../../contexts/SettingsContext';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { settings } = useSettings();

  const subtotal = cart.items.reduce((acc, item) => acc + item.totalPrice, 0);
  const kdvRate = settings.kdvRate / 100;
  const kdv = subtotal * kdvRate;
  const shippingFee = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee;
  const total = subtotal + kdv + shippingFee;

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-primary-600 hover:text-primary-700 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Alışverişe Devam Et
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-industrial p-12 text-center">
          <ShoppingBag className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Sepetiniz Boş</h2>
          <p className="text-secondary-600 mb-8">
            Henüz sepetinize ürün eklemediniz.
          </p>
          <Link 
            to="/urunler" 
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition inline-block"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Alışverişe Devam Et
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-secondary-800 mb-8">Sepetim</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sepet Ürünleri */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-industrial p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-6">Sepet Ürünleri</h2>
            
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-secondary-200 rounded-lg">
                  <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto flex-grow">
                    {/* Ürün Görseli */}
                    <div className="w-20 h-20 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.images && item.images[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-secondary-400" style={{display: item.images && item.images[0] ? 'none' : 'flex'}}>
                        📦
                      </div>
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="flex-grow">
                      <h3 className="font-medium text-secondary-800 mb-1 line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-secondary-600 sm:mb-2">
                        {item.variationText && `${item.variationText} • `}
                        ₺{item.price.toFixed(2)}
                      </p>
                      
                      {/* Miktar Kontrolleri - Masaüstü */}
                      <div className="hidden sm:flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        
                        <button
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fiyat, Sil ve Mobil Miktar */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:block mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-secondary-100">
                    {/* Miktar Kontrolleri - Mobil */}
                    <div className="flex sm:hidden items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-10 text-center font-medium">{item.quantity}</span>
                      
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="w-8 h-8 rounded-full border border-secondary-300 flex items-center justify-center hover:bg-secondary-100 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 sm:block text-right">
                      <p className="font-semibold text-secondary-800 sm:mb-2 text-lg sm:text-base">
                        ₺{item.totalPrice.toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Sepetten Çıkar"
                      >
                        <Trash2 className="w-5 h-5 sm:w-4 sm:h-4 ml-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Özet */}
        <div>
          <div className="bg-white rounded-lg shadow-industrial p-6">
            <h2 className="text-xl font-semibold text-secondary-800 mb-6">Sipariş Özeti</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-secondary-600">Ara Toplam:</span>
                <span className="font-medium">₺{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">KDV (%{settings.kdvRate}):</span>
                <span className="font-medium">₺{kdv.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-600">Kargo:</span>
                <span className="font-medium">
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-bold text-sm">Ücretsiz</span>
                  ) : (
                    `₺${shippingFee.toFixed(2)}`
                  )}
                </span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[10px] text-primary-600 italic">
                  * ₺{settings.freeShippingThreshold} üzeri alışverişlerde kargo bedava!
                </p>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Toplam:</span>
                  <span className="text-lg font-bold text-primary-600">₺{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link 
              to="/checkout" 
              className="w-full bg-primary-600 text-white py-3 rounded-md hover:bg-primary-700 transition text-center block"
            >
              Ödemeye Geç
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
