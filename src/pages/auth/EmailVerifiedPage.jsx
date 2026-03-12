import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

const EmailVerifiedPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/auth/email-dogrula/${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess(true);
        } else {
          setError(data.message || 'Email doğrulanamadı');
        }
      } catch (err) {
        setError('Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setError('Geçersiz doğrulama linki');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Email Doğrulanıyor...</h2>
              <p className="text-gray-600 mt-2">Lütfen bekleyin</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link 
          to="/" 
          className="flex items-center justify-center text-primary-600 hover:text-primary-700 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Link>

        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
          {success ? (
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Doğrulandı!</h2>
                <p className="text-gray-600 mb-6">
                  Hesabınız başarıyla aktive edildi. Artık alışveriş yapabilirsiniz!
                </p>
              </div>

              {/* Başarı İkonları */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-600">Hesap Aktif</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <ShoppingBag className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">Alışveriş</p>
                </div>
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-xs text-gray-600">Güvenli</p>
                </div>
              </div>

              {/* Butonlar */}
              <div className="space-y-3">
                <Link
                  to="/giris"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Giriş Yap ve Alışverişe Başla
                </Link>

                <Link
                  to="/urunler"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Ürünleri Keşfet
                </Link>
              </div>

              {/* Bilgilendirme */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Şimdi ne yapabilirsiniz?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Giriş yaparak hesabınıza erişin</li>
                  <li>• Binlerce yapı malzemesi arasından seçim yapın</li>
                  <li>• Favori ürünlerinizi ekleyin</li>
                  <li>• Güvenli alışverişin tadını çıkarın</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-red-600" />
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Doğrulama Başarısız</h2>
                <p className="text-gray-600 mb-6">
                  {error || 'Email doğrulanırken bir hata oluştu'}
                </p>
              </div>

              {/* Hata Bilgisi */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-2">Olası Nedenler:</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Doğrulama linkinin süresi dolmuş olabilir</li>
                  <li>• Link zaten kullanılmış olabilir</li>
                  <li>• Geçersiz bir link kullanılıyor olabilir</li>
                </ul>
              </div>

              {/* Butonlar */}
              <div className="space-y-3">
                <Link
                  to="/kayit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Yeni Kayıt Oluştur
                </Link>

                <Link
                  to="/giris"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                >
                  Giriş Yap
                </Link>
              </div>

              {/* Yardım */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Sorun devam ediyorsa destek@yapimalzemesi.com adresine ulaşın
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerifiedPage;
