import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [contactInfo, setContactInfo] = useState({
    address: 'Yükleniyor...',
    phone: '',
    mobile: '',
    email: '',
    workingHours: ''
  });

  useEffect(() => {
    const docRef = doc(db, 'site_content', 'contact');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setContactInfo(docSnap.data());
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Mesajınız alındı! En kısa sürede size dönüş yapacağız.");
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-secondary-900 mb-4">İletişim</h1>
        <p className="text-secondary-600 max-w-2xl mx-auto">
          Sorularınız, iş birlikleri veya özel siparişleriniz için bizi arayabilir veya form doldurabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* İletişim Bilgileri */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-industrial border border-secondary-100 h-full">
            <h3 className="text-xl font-bold text-secondary-800 mb-8">Bize Ulaşın</h3>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary-800">Adres</h4>
                  <p className="text-secondary-600 text-sm mt-1 whitespace-pre-wrap">
                    {contactInfo.address}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary-800">Telefon</h4>
                  <p className="text-secondary-600 text-sm mt-1">{contactInfo.phone}</p>
                  {contactInfo.mobile && <p className="text-secondary-600 text-sm">{contactInfo.mobile}</p>}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary-800">E-posta</h4>
                  <p className="text-secondary-600 text-sm mt-1">{contactInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-secondary-800">Mesai Saatleri</h4>
                  <p className="text-secondary-600 text-sm mt-1 whitespace-pre-wrap">{contactInfo.workingHours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* İletişim Formu */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-industrial border border-secondary-100">
            <h3 className="text-xl font-bold text-secondary-800 mb-6 flex items-center gap-2">
              <Send className="w-5 h-5 text-primary-600" /> Mesaj Gönderin
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary-500 uppercase tracking-tighter">Adınız Soyadınız</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-secondary-500 uppercase tracking-tighter">E-posta Adresiniz</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-secondary-500 uppercase tracking-tighter">Konu</label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  placeholder="Hangi konuda bize ulaşmak istersiniz?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-secondary-500 uppercase tracking-tighter">Mesajınız</label>
                <textarea
                  required
                  rows="5"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                  placeholder="Detaylı mesajınızı buraya yazın..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                GÖNDER <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Harita Placeholder */}
      <div className="mt-12 bg-secondary-200 rounded-2xl h-[400px] flex items-center justify-center overflow-hidden border border-secondary-300 relative group">
        <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=40.0,32.8&zoom=13&size=1000x400&scale=2')] bg-cover opacity-60"></div>
        <div className="relative z-10 bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-white max-w-sm text-center">
          <MapPin className="w-10 h-10 text-primary-600 mx-auto mb-4" />
          <h4 className="font-black text-lg text-secondary-900 mb-2">Konumumuzu Görün</h4>
          <p className="text-secondary-600 text-sm mb-4">Ankara merkezli depomuzu ve üretim merkezimizi haritada bulabilirsiniz.</p>
          <button className="bg-secondary-900 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-black transition-colors">
            GOOGLE HARİTALARDA AÇ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
