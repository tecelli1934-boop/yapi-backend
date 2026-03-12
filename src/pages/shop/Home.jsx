import { Link } from 'react-router-dom';
import SEO from '../../components/common/SEO';

const Home = () => {
  return (
    <div>
      <SEO 
        title="Ana Sayfa" 
        description="Ramazan Seven - Profesyonel Yapı Malzemeleri. Proje bazlı profil kesim, her ölçü ve renk seçeneği ile yanınızdayız."
      />
      {/* Hero Bölümü */}
      <section className="bg-gradient-to-r from-anthracite to-secondary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Profesyonel Yapı Malzemeleri
          </h1>
          <p className="text-xl text-secondary-200 mb-8 max-w-2xl mx-auto">
            Proje bazlı profil kesim, her ölçü ve renk seçeneği ile yanınızdayız.
          </p>
          <p className="text-lg text-secondary-300 mb-8">
            📦 Üst menüdeki kategorilerden istediğiniz ürünü keşfedin!
          </p>
        </div>
      </section>

      {/* Tanıtım Bölümü */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sol Taraf - Metin */}
            <div>
              <h2 className="text-3xl font-bold text-secondary-800 mb-6">
                30 Yıllık Tecrübe ile Kalite
              </h2>
              <p className="text-lg text-secondary-600 mb-6">
                1994'ten beri yapı sektörüne hizmet veriyoruz. Alüminyum profiller, kapı pencere aksesuarları, 
                PVC ürünleri ve daha fazlası için güvenilir adresiniz.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-800">Proje Bazlı Kesim</h3>
                    <p className="text-secondary-600">İhtiyacınıza özel ölçüde profil kesimi</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-800">Geniş Ürün Yelpazesi</h3>
                    <p className="text-secondary-600">Alüminyum, PVC, demir ve aksesuar çeşitleri</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    ✓
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-800">Hızlı Teslimat</h3>
                    <p className="text-secondary-600">Stoktan aynı gün kargo imkanı</p>
                  </div>
                </div>
              </div>

              <Link
                to="/urunler"
                className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition"
              >
                Ürünleri Keşfet
              </Link>
            </div>

            {/* Sağ Taraf - Görsel */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-6 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏗️</div>
                      <div className="font-semibold text-primary-800">Alüminyum</div>
                      <div className="text-sm text-primary-600">Profiller & Aksesuarlar</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg p-6 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🚪</div>
                      <div className="font-semibold text-secondary-800">Kapı & Pencere</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg p-6 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🔧</div>
                      <div className="font-semibold text-secondary-800">Vida & Hırdavat</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg p-6 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🏠</div>
                      <div className="font-semibold text-primary-800">PVC Grubu</div>
                      <div className="text-sm text-primary-600">Profiller & Sistemler</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* İstatistikler */}
      <section className="bg-secondary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-2">30+</div>
              <div className="text-secondary-300">Yıl Tecrübe</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-2">5000+</div>
              <div className="text-secondary-300">Mutlu Müşteri</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-2">100+</div>
              <div className="text-secondary-300">Ürün Çeşidi</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400 mb-2">24/7</div>
              <div className="text-secondary-300">Destek</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
