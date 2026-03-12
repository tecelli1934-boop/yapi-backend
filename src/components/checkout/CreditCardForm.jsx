import React, { useState } from 'react';
import { CreditCard, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

const CreditCardForm = ({ onSubmit, amount, isSubmitting, disabled }) => {
  const [cardData, setCardData] = useState({
    holderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: ''
  });

  const [errors, setErrors] = useState({});

  // Kart Numarası Formatlama (4'lü gruplar)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Son Kullanma Tarihi Formatlama (MM/YY)
  const formatExpiry = (value) => {
    return value
      .replace(/[^0-9]/g, '')
      .replace(/^([2-9])$/g, '0$1')
      .replace(/^(1[3-9])$/g, '0$1')
      .replace(/^([0-1][0-2])([0-9]{2,4})/, '$1/$2')
      .substring(0, 5);
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    
    if (name === 'cardNumber') value = formatCardNumber(value);
    if (name === 'expiryDate') value = formatExpiry(value);
    if (name === 'cvc') value = value.replace(/[^0-9]/g, '').substring(0, 3);
    
    setCardData({ ...cardData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const validate = () => {
    const newErrors = {};
    if (!cardData.holderName) newErrors.holderName = 'İsim gerekli';
    if (cardData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Geçersiz kart numarası';
    if (cardData.expiryDate.length < 5) newErrors.expiryDate = 'Geçersiz tarih';
    if (cardData.cvc.length < 3) newErrors.cvc = 'Geçersiz CVC';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleManualSubmit = () => {
    if (validate()) {
      onSubmit(cardData);
    }
  };

  return (
    <div className="bg-secondary-50 p-6 rounded-2xl border border-secondary-200 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-secondary-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-600" /> Kart Bilgileriniz
        </h3>
        <div className="flex gap-2">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Visa" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="Mastercard" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">Kart Üzerindeki İsim</label>
          <input
            type="text"
            name="holderName"
            value={cardData.holderName}
            onChange={handleChange}
            placeholder="AD SOYAD"
            className={`w-full px-4 py-3 bg-white border ${errors.holderName ? 'border-red-500' : 'border-secondary-200'} rounded-xl focus:ring-2 focus:ring-primary-500 outline-none uppercase font-bold`}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">Kart Numarası</label>
          <div className="relative">
            <input
              type="text"
              name="cardNumber"
              value={cardData.cardNumber}
              onChange={handleChange}
              placeholder="0000 0000 0000 0000"
              className={`w-full px-4 py-3 bg-white border ${errors.cardNumber ? 'border-red-500' : 'border-secondary-200'} rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-lg tracking-wider`}
            />
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-300" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">Son Kullanma</label>
            <input
              type="text"
              name="expiryDate"
              value={cardData.expiryDate}
              onChange={handleChange}
              placeholder="AA / YY"
              className={`w-full px-4 py-3 bg-white border ${errors.expiryDate ? 'border-red-500' : 'border-secondary-200'} rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono`}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-secondary-500 uppercase tracking-widest">CVC / CVV</label>
            <input
              type="text"
              name="cvc"
              value={cardData.cvc}
              onChange={handleChange}
              placeholder="123"
              className={`w-full px-4 py-3 bg-white border ${errors.cvc ? 'border-red-500' : 'border-secondary-200'} rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono`}
            />
          </div>
        </div>

        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 flex gap-3 text-primary-800 text-xs">
          <ShieldCheck className="w-5 h-5 flex-shrink-0" />
          <p>Kuveyt Türk altyapısı ile 256-bit SSL üzerinden korunuyorsunuz. Kart bilgileriniz kesinlikle kaydedilmez.</p>
        </div>

        <button
          type="button"
          onClick={handleManualSubmit}
          disabled={isSubmitting || disabled}
          className="w-full bg-secondary-900 hover:bg-black text-white py-4 rounded-xl font-black text-sm tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {isSubmitting ? 'İŞLENİYOR...' : `ÖDEMEYİ TAMAMLA (₺${amount.toLocaleString()})`}
        </button>
      </div>
    </div>
  );
};

export default CreditCardForm;
