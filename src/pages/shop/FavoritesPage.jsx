import { Link } from 'react-router-dom';
import { useFavorites } from '../../contexts/FavoritesContext';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';

const FavoritesPage = () => {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();

  const handleRemoveFavorite = (key) => {
    removeFavorite(key);
  };

  const handleClearAll = () => {
    if (window.confirm('Tüm favorileri temizlemek istediğinizden emin misiniz?')) {
      clearFavorites();
    }
  };

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

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-secondary-800">Favorilerim</h1>
        {favorites.items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 transition text-sm"
          >
            Tümünü Temizle
          </button>
        )}
      </div>

      {favorites.items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-industrial p-12 text-center">
          <Heart className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">Favorileriniz Boş</h2>
          <p className="text-secondary-600 mb-8">
            Henüz favorilerinize ürün eklemediniz.
          </p>
          <Link 
            to="/urunler" 
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition inline-block"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-industrial p-6">
          <h2 className="text-xl font-semibold text-secondary-800 mb-6">
            Favori Ürünleriniz ({favorites.items.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.items.map((item) => (
              <div key={item.favoriteKey} className="bg-white border border-secondary-200 rounded-lg p-4 hover:shadow-lg transition relative">
                {/* Favori Silme Butonu - Sağ Üst Köşe */}
                <button
                  onClick={() => handleRemoveFavorite(item.favoriteKey)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition shadow-sm"
                  title="Favorilerden Çıkar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Ürün Görseli */}
                <div className="w-full h-48 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
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
                <div className="space-y-2">
                  <h3 className="font-medium text-secondary-800 text-sm">{item.name}</h3>
                  
                  {item.variationText && (
                    <p className="text-xs text-secondary-600">{item.variationText}</p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-primary-600">
                      ₺{item.price?.toFixed(2) || '0.00'}
                    </p>
                  </div>

                  {/* Stok Durumu */}
                  {item.stock !== undefined && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-secondary-600">Stok:</span>
                      <span className={`font-medium ${
                        item.stock < 10 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.stock} adet
                      </span>
                    </div>
                  )}

                  {/* Sepete Ekle Butonu */}
                  <Link
                    to="/urunler"
                    className="block w-full bg-primary-600 text-white text-center py-2 px-3 rounded-md hover:bg-primary-700 transition text-sm mt-3"
                  >
                    Sepete Ekle
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
