import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Footer = () => {
  const [contactInfo, setContactInfo] = useState({
    address: 'Ankara Sanayi Sitesi, No: 123 Ankara',
    phone: '+90 312 000 00 00',
    email: 'info@ramazanseven.com'
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

  return (
    <footer className="bg-anthracite text-white pt-16 pb-8 mt-auto border-t border-secondary-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo ve Hakkında */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-primary-500">YapıMalzemesi</h3>
            <p className="text-secondary-400 text-sm leading-relaxed">
              1994'ten beri kaliteli yapı malzemeleri ve profesyonel çözümlerle inşaat sektörüne değer katıyoruz. 
              Müşteri memnuniyeti ve dürüstlük temel ilkemizdir.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-secondary-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-secondary-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-primary-500/30 pb-2 inline-block">Hızlı Erişim</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-secondary-400 hover:text-white transition-colors text-sm">Ana Sayfa</Link></li>
              <li><Link to="/urunler" className="text-secondary-400 hover:text-white transition-colors text-sm">Tüm Ürünler</Link></li>
              <li><Link to="/favoriler" className="text-secondary-400 hover:text-white transition-colors text-sm">Favorilerim</Link></li>
              <li><Link to="/profil" className="text-secondary-400 hover:text-white transition-colors text-sm">Hesabım</Link></li>
            </ul>
          </div>

          {/* Kurumsal */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-primary-500/30 pb-2 inline-block">Kurumsal</h4>
            <ul className="space-y-3">
              <li><Link to="/gizlilik-politikasi" className="text-secondary-400 hover:text-white transition-colors text-sm">Gizlilik Politikası</Link></li>
              <li><Link to="/mesafeli-satis-sozlesmesi" className="text-secondary-400 hover:text-white transition-colors text-sm">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link to="/iade-kosullari" className="text-secondary-400 hover:text-white transition-colors text-sm">İade ve İptal Şartları</Link></li>
              <li><Link to="/iletisim" className="text-secondary-400 hover:text-white transition-colors text-sm">İletişim</Link></li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-primary-500/30 pb-2 inline-block">Bize Ulaşın</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-secondary-400 text-sm whitespace-pre-wrap">{contactInfo.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-secondary-400 text-sm">{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-500 flex-shrink-0" />
                <span className="text-secondary-400 text-sm">{contactInfo.email}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-secondary-800 text-center text-sm text-secondary-500">
          <p>&copy; {new Date().getFullYear()} YapıMalzemesi - Ramazan Seven. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
