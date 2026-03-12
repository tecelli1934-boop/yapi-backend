import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ReturnPolicy = () => {
  const [data, setData] = useState({ title: 'İade ve İptal Koşulları', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'site_content', 'return');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setData(docSnap.data());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center py-20">Yükleniyor...</div>;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-industrial p-8 md:p-12 border border-secondary-100">
        <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-8 border-b-4 border-primary-500 pb-4 inline-block">
          {data.title}
        </h1>
        
        <div className="space-y-6 text-secondary-700 leading-relaxed whitespace-pre-wrap">
          {data.content || "İçerik henüz eklenmemiş."}
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;
