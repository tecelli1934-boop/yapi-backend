import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState(null);
  const [isReset, setIsReset] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (password) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;

    return {
      hasLower,
      hasUpper,
      hasNumber,
      hasSpecial,
      isLongEnough,
      isValid: hasLower && hasUpper && hasNumber && isLongEnough
    };
  };

  const passwordStrength = checkPasswordStrength(password);

  // Check token validity on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        // We'll check token validity when user tries to reset
        setIsTokenValid(true);
      } catch (error) {
        setIsTokenValid(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return;
    }

    if (!passwordStrength.isValid) {
      toast.error('Şifre gerekli kriterleri karşılamıyor');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/sifre-sifirlama/${token}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsReset(true);
        toast.success('Şifreniz başarıyla güncellendi!');
        setTimeout(() => {
          navigate('/giris');
        }, 3000);
      } else {
        toast.error(data.message || 'Bir hata oluştu');
        if (data.message?.includes('geçersiz') || data.message?.includes('dolmuş')) {
          setIsTokenValid(false);
        }
      }
    } catch (error) {
      toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isTokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-primary-600 mx-auto" />
          <p className="mt-4 text-secondary-600">Kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  if (isTokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Geçersiz Link
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Bu şifre sıfırlama linki geçersiz veya süresi dolmuş.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-secondary-200">
            <div className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-medium text-red-900 mb-2">⚠️ Ne oldu?</h3>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Link süresi dolmuş olabilir (1 saat)</li>
                  <li>• Link zaten kullanılmış olabilir</li>
                  <li>• Link bozuk veya hatalı olabilir</li>
                </ul>
              </div>

              <div className="flex flex-col space-y-3">
                <Link
                  to="/sifremi-unuttum"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Yeni Link İste
                </Link>
                
                <Link
                  to="/giris"
                  className="w-full flex justify-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm text-sm font-medium text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-secondary-900">
              Şifre Güncellendi!
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Şifreniz başarıyla güncellendi. Yönlendiriliyorsunuz...
            </p>
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
            Yeni Şifre Belirle
          </h2>
          <p className="mt-2 text-sm text-secondary-600">
            Güvenli bir şifre belirleyin.
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-sm border border-secondary-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                Yeni Şifre
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Yeni şifreniz"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                Şifreyi Tekrarla
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-secondary-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-md placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Şifrenizi tekrar girin"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-secondary-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-secondary-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-secondary-700">Şifre Gücü:</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    <div className={`w-4 h-4 rounded-full mr-2 ${passwordStrength.isLongEnough ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.isLongEnough ? 'text-green-700' : 'text-gray-500'}>
                      En az 8 karakter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`w-4 h-4 rounded-full mr-2 ${passwordStrength.hasLower ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.hasLower ? 'text-green-700' : 'text-gray-500'}>
                      Küçük harf (a-z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`w-4 h-4 rounded-full mr-2 ${passwordStrength.hasUpper ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.hasUpper ? 'text-green-700' : 'text-gray-500'}>
                      Büyük harf (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <div className={`w-4 h-4 rounded-full mr-2 ${passwordStrength.hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={passwordStrength.hasNumber ? 'text-green-700' : 'text-gray-500'}>
                      Rakam (0-9)
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading || !passwordStrength.isValid || password !== confirmPassword}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Güncelleniyor...
                  </>
                ) : (
                  'Şifreyi Güncelle'
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/giris"
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-500"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
