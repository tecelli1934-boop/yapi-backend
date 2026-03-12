import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { Save, FileText, Phone, MapPin, Mail, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const PageManagement = () => {
  const [activeTab, setActiveTab] = useState('privacy');
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [contactData, setContactData] = useState({
    address: '',
    phone: '',
    mobile: '',
    email: '',
    workingHours: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, 'site_content', activeTab);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (activeTab === 'contact') {
          setContactData(data);
        } else {
          setContent(data.content || '');
          setTitle(data.title || '');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeTab]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'site_content', activeTab);
      const dataToSave = activeTab === 'contact' 
        ? { ...contactData, id: 'contact', title: 'İletişim Bilgileri' }
        : { content, title, id: activeTab };
      
      await setDoc(docRef, dataToSave);
      toast.success("Değişiklikler başarıyla kaydedildi!");
    } catch (error) {
      console.error("Kaydetme hatası:", error);
      toast.error("Hata oluştu, tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Gizlilik Politikası', icon: FileText },
    { id: 'sales', label: 'Satış Sözleşmesi', icon: FileText },
    { id: 'return', label: 'İade Koşulları', icon: FileText },
    { id: 'contact', label: 'İletişim Bilgileri', icon: Phone },
  ];

  if (loading) return <div className="p-8 text-center">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-secondary-800">Sayfa ve İçerik Yönetimi</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Kaydediliyor...' : 'DEĞİŞİKLİKLERİ KAYDET'}
        </button>
      </div>

      {/* Sekmeler */}
      <div className="flex overflow-x-auto gap-2 p-1 bg-secondary-100 rounded-xl no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id 
              ? 'bg-white text-primary-600 shadow-sm' 
              : 'text-secondary-500 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-industrial border border-secondary-100 p-6 md:p-8">
        {activeTab === 'contact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black text-secondary-500 uppercase tracking-tighter flex items-center gap-2">
                  <MapPin className="w-3 h-3" /> Adres Bilgisi
                </span>
                <textarea
                  value={contactData.address}
                  onChange={(e) => setContactData({...contactData, address: e.target.value})}
                  rows="3"
                  className="mt-1 w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-secondary-500 uppercase tracking-tighter flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Sabit Telefon
                </span>
                <input
                  type="text"
                  value={contactData.phone}
                  onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                  className="mt-1 w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-secondary-500 uppercase tracking-tighter flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Cep Telefonu
                </span>
                <input
                  type="text"
                  value={contactData.mobile}
                  onChange={(e) => setContactData({...contactData, mobile: e.target.value})}
                  className="mt-1 w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </label>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-black text-secondary-500 uppercase tracking-tighter flex items-center gap-2">
                  <Mail className="w-3 h-3" /> E-posta Adresi
                </span>
                <input
                  type="email"
                  value={contactData.email}
                  onChange={(e) => setContactData({...contactData, email: e.target.value})}
                  className="mt-1 w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-secondary-500 uppercase tracking-tighter flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Çalışma Saatleri (Footer & İletişim)
                </span>
                <textarea
                  value={contactData.workingHours}
                  onChange={(e) => setContactData({...contactData, workingHours: e.target.value})}
                  rows="3"
                  className="mt-1 w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </label>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex gap-3 text-amber-800 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>Burada yapacağınız değişiklikler sitenin en altındaki bilgiler ve iletişim sayfası için anında geçerli olacaktır.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-secondary-500 uppercase tracking-tighter">Sayfa Başlığı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl font-bold text-lg"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-secondary-500 uppercase tracking-tighter">Sayfa İçeriği (Yasal Metin)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="15"
                className="w-full px-4 py-4 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm leading-relaxed"
                placeholder="Buraya sayfa içeriğini yazın..."
              ></textarea>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PageManagement;
