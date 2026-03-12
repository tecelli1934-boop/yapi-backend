import { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    shippingFee: 50,
    freeShippingThreshold: 1000,
    kdvRate: 20
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        } else {
          // Varsayılan ayarları oluştur
          await setDoc(docRef, settings);
        }
      } catch (error) {
        console.error("Ayarlar çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      setMessage({ type: 'success', text: 'Ayarlar başarıyla güncellendi.' });
    } catch (error) {
      console.error("Güncelleme hatası:", error);
      setMessage({ type: 'error', text: 'Ayarlar güncellenirken bir hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-8">Yükleniyor...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-secondary-800">Sistem Ayarları</h1>
      </div>

      <div className="bg-white rounded-lg shadow-industrial p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Kargo Ücreti */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Sabit Kargo Ücreti (₺)
            </label>
            <input
              type="number"
              value={settings.shippingFee}
              onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
              className="w-full p-2.5 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
              min="0"
            />
          </div>

          {/* Ücretsiz Kargo Sınırı */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Ücretsiz Kargo Alt Limiti (₺)
            </label>
            <input
              type="number"
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              className="w-full p-2.5 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
              min="0"
            />
          </div>

          {/* KDV Oranı */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              KDV Oranı (%)
            </label>
            <input
              type="number"
              value={settings.kdvRate}
              onChange={(e) => setSettings({ ...settings, kdvRate: Number(e.target.value) })}
              className="w-full p-2.5 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              required
              min="0"
              max="100"
            />
          </div>

          {message.text && (
            <div className={`p-4 rounded-md flex items-center gap-3 ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <div>
                <p className="font-medium">{message.text}</p>
                {message.type === 'error' && (
                  <p className="text-xs mt-1">İpucu: Firestore izinlerini kontrol edin veya yönetici hesabınızın gerçek bir oturum olduğundan emin olun.</p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 rounded-md font-bold text-white transition flex items-center justify-center gap-2 ${
              saving ? 'bg-secondary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            <Save className="w-5 h-5" />
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
