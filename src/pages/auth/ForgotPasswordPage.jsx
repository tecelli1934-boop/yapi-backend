import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sifremi-unuttum`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Şifre sıfırlama linki email adresinize gönderildi!');
      } else {
        toast.error(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Email Gönderildi
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Şifre sıfırlama linki <span className="font-medium">{email}</span> adresine gönderildi.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">📧 Ne yapmalısınız?</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>1. Email kutunuzu kontrol edin</li>
                  <li>2. Spam/junk klasörünü kontrol edin</li>
                  <li>3. Şifre sıfırlama linkine tıklayın</li>
                  <li>4. Yeni şifrenizi belirleyin</li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-medium text-yellow-900 mb-2">⏰ Önemli Bilgi</h3>
                <p className="text-sm text-yellow-700">
                  Bu link 1 saat boyunca geçerlidir. Süre dolmadan önce işlemi tamamlamalısınız.
                </p>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Başka Email Gönder
                </button>
                
                <Link
                  to="/giris"
                  className="w-full flex justify-center items-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-bold text-primary-600">🏗️ Yapı Malzemesi</span>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
            Şifrenizi mi Unuttunuz?
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Email adresinizi girin, şifre sıfırlama linkini size gönderelim.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-secondary-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                Email Adresi
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="ornek@email.com"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Şifre Sıfırlama Linki Gönder'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/giris"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Giriş Sayfasına Dön
              </Link>
            </div>
          </form>
        </div>

        <div className="text-center text-sm text-secondary-500">
          <p>Yardım için: destek@yapimalzemesi.com</p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
