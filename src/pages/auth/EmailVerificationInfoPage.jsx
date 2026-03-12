import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerificationInfoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const { user, login } = useAuth();

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      navigate('/kayit');
    }
  }, [location.state, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Eğer kullanıcı o an Firebase Auth state'inde yoksa yeniden giriş yapması gerekir
      // Kayıt işleminden hemen sonra buraya gelindiği için büyük ihtimalle `user` state'i doludur.
      if (!user) {
        setMessage('Güvenlik için lütfen giriş yapıp doğrulama e-postası talep edin.');
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      // import { sendEmailVerification } from 'firebase/auth' is needed, but an easier way is 
      // AuthContext'e resendVerificationEmail ekleyebiliriz ya da Firebase'deki o anki auth.currentUser'a gönderebiliriz.
      // Firebase currentUser şu an AuthContext'teki `user` objesi değil. Gerçek auth import edilmeli.
      const { auth } = await import('../../firebase');
      const { sendEmailVerification } = await import('firebase/auth');
      
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage('Doğrulama emaili yeniden gönderildi! Lütfen spam klasörünüzü de kontrol edin.');
        setMessageType('success');
      } else {
        setMessage('Lütfen önce e-posta ve şifrenizle uygulamaya giriş yapmayı deneyin.');
        setMessageType('error');
      }

    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        setMessage('Çok fazla istek gönderdik. Lütfen birkaç dakika bekleyin.');
      } else {
        setMessage('Email gönderilemedi. Lütfen daha sonra tekrar deneyin.');
      }
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

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
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Doğrulaması Gerekli</h2>
            <p className="text-gray-600 mb-6">
              Hesabınızı aktive etmek için email adresinizi doğrulamanız gerekiyor
            </p>
          </div>

          {/* Email Bilgisi */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-500">Doğrulama linki gönderilen adres:</p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>
            </div>
          </div>

          {/* Mesaj */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {messageType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <Mail className="h-5 w-5 text-red-600 mr-2" />
                )}
                <p className={`text-sm ${
                  messageType === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Bilgilendirme */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Email adresinize gönderdiğimiz doğrulama linkine tıklayın
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Doğrulama işlemi tamamlandığında giriş yapabilirsiniz
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700">
                  Email gelmediyse spam/gereksiz klasörünü kontrol edin
                </p>
              </div>
            </div>
          </div>

          {/* Butonlar */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin h-4 w-4 mr-2" />
                  Email Gönderiliyor...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Emaili Yeniden Gönder
                </>
              )}
            </button>

            <Link
              to="/giris"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
            >
              Doğruladım, Giriş Yap
            </Link>
          </div>

          {/* Yardım */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Doğrulama linki 24 saat boyunca geçerlidir
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Sorun yaşarsanız destek@yapimalzemesi.com adresine ulaşın
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationInfoPage;
