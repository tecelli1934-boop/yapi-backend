import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import GoogleLoginButton from '../../components/ui/GoogleLoginButton';

import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('İsim alanı zorunludur');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email alanı zorunludur');
      return false;
    }
    if (!/^[\w.-]+@[\w.-]+\.\w{2,}$/.test(formData.email)) {
      setError('Geçerli bir email adresi girin');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }
    // Telefon isteğe bağlı - girilmişse doğrula
    if (formData.phone && !/^(\+90|0)?\s*5\d{2}\s*\d{3}\s*\d{4}$/.test(formData.phone)) {
      setError('Geçerli bir Türk telefon numarası girin (veya boş bırakın)');
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await register(formData.name.trim(), formData.email.trim().toLowerCase(), formData.password);
      setSuccess('Kayıt başarılı! Lütfen e-postanızı doğrulayın.');
      setLoading(false); 
      // Doğrulama bilgi sayfasına yönlendir ve e-posta adresini ilet
      setTimeout(() => navigate('/email-dogrulama-bilgi', { state: { email: formData.email.trim().toLowerCase() } }), 1500);
    } catch (err) {
      console.error('Firebase kayıt hatası:', err);
      const code = err.code;
      if (code === 'auth/email-already-in-use') {
        setError('Bu e-posta adresi zaten kayıtlı.');
      } else if (code === 'auth/weak-password') {
        setError('Şifre çok zayıf. Daha güçlü bir şifre deneyin.');
      } else if (code === 'auth/operation-not-allowed') {
        setError('E-posta/Şifre girişi Firebase\'de etkinleştirilmemiş.');
      } else if (code === 'auth/network-request-failed') {
        setError('İnternet bağlantısı hatası. Tekrar deneyin.');
      } else {
        setError(`Kayıt hatası: ${code || err.message || 'Bilinmeyen hata'}`);
      }
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
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Yapı Malzemesi</h2>
            <p className="mt-2 text-gray-600">Hesap oluşturun ve alışverişe başlayın</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Google ile Kayıt */}
            <GoogleLoginButton label="Google ile Kayıt Ol" />

            {/* Ayraç */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">veya e-posta ile</span>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-16 pr-4 py-3 border border-gray-300 rounded-md placeholder-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="Adınız Soyadınız"
                  style={{ paddingLeft: '2.8rem' }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Adresi
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-16 pr-4 py-3 border border-gray-300 rounded-md placeholder-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="ornek@email.com"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Telefon Numarası
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-16 pr-4 py-3 border border-gray-300 rounded-md placeholder-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="05551234567"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Şifre
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-16 pr-12 py-3 border border-gray-300 rounded-md placeholder-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="En az 6 karakter"
                  style={{ paddingLeft: '3rem' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                En az 6 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Şifre Tekrar
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full pl-16 pr-12 py-3 border border-gray-300 rounded-md placeholder-gray-700 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  placeholder="Şifrenizi tekrar girin"
                  style={{ paddingLeft: '3rem' }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center z-10"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {/* KVKK Onay */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="kvkk"
                  name="kvkk"
                  type="checkbox"
                  required
                  checked={formData.kvkk || false}
                  onChange={(e) => setFormData({...formData, kvkk: e.target.checked})}
                  className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="kvkk" className="font-medium text-gray-700 leading-snug">
                  <Link to="/gizlilik-politikasi" target="_blank" className="text-primary-600 hover:underline">Üyelik Sözleşmesi</Link> ve{' '}
                  <Link to="/gizlilik-politikasi" target="_blank" className="text-primary-600 hover:underline">KVKK Aydınlatma Metni</Link>'ni okudum, onaylıyorum.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || !formData.kvkk}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Zaten hesabınız var mı?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/giris"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
              >
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
