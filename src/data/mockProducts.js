// Kategoriler
export const categories = [
  { id: 'tumu', name: 'Tüm Ürünler', slug: 'tumu' },
  { id: 'aluminyum', name: 'Alüminyum', slug: 'aluminyum' },
  { id: 'kapi-pencere', name: 'Kapı & Pencere Aksesuar', slug: 'kapi-pencere' },
  { id: 'pvc', name: 'PVC Grubu', slug: 'pvc' },
  { id: 'demir', name: 'Demir Hırdavat', slug: 'demir' },
  { id: 'vida', name: 'Vida Çeşitleri', slug: 'vida' },
  { id: 'dekoratif', name: 'Dekoratif', slug: 'dekoratif' },
];

// Ürünler (her birine özel görsel)
export const products = [
  // ALÜMİNYUM
  {
    id: 1,
    name: 'Alüminyum Profil 60x20',
    category: 'aluminyum',
    basePrice: 50,
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=200&fit=crop',
    variations: {
      type: 'length',
      unit: 'cm',
      options: [60, 80, 90, 100, 120],
    },
  },
  {
    id: 2,
    name: 'Kapı Koruma Profili',
    category: 'aluminyum',
    basePrice: 40,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'length',
      unit: 'cm',
      options: [80, 90, 100, 110],
    },
  },
  {
    id: 3,
    name: 'Halı Bandı 5m',
    category: 'aluminyum',
    basePrice: 120,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 4,
    name: '50\'lik Boru',
    category: 'aluminyum',
    basePrice: 120,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&h=200&fit=crop',
    variations: {
      type: 'length',
      unit: 'cm',
      options: [80, 90, 100, 150, 200],
    },
  },
  {
    id: 5,
    name: 'Alüminyum Armatür',
    category: 'aluminyum',
    basePrice: 85,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },

  // KAPI & PENCERE AKSESUAR
  {
    id: 6,
    name: 'Kapı Kolu Modern',
    category: 'kapi-pencere',
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Siyah', color: '#000000', price: 150 },
        { value: 'Beyaz', color: '#FFFFFF', price: 150 },
        { value: 'Gri', color: '#808080', price: 155 },
        { value: 'Antrasit', color: '#2b2b2b', price: 160 },
      ],
    },
  },
  {
    id: 7,
    name: 'Eksenel Pencere Kolu',
    category: 'kapi-pencere',
    basePrice: 90,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Beyaz', color: '#FFFFFF', price: 90 },
        { value: 'Gri', color: '#808080', price: 95 },
        { value: 'Siyah', color: '#000000', price: 100 },
      ],
    },
  },
  {
    id: 8,
    name: 'Kapı Kilidi',
    category: 'kapi-pencere',
    basePrice: 120,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'technical',
      options: [
        { value: '25mm Makaralı', price: 120 },
        { value: '20mm Makaralı', price: 110 },
        { value: '25mm Dilli', price: 125 },
        { value: '20mm Dilli', price: 115 },
      ],
    },
  },
  {
    id: 9,
    name: 'Menteşe Aldoks',
    category: 'kapi-pencere',
    basePrice: 30,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Siyah', color: '#000000', price: 30 },
        { value: 'Beyaz', color: '#FFFFFF', price: 30 },
        { value: 'Gri', color: '#808080', price: 32 },
      ],
    },
  },
  {
    id: 10,
    name: 'Menteşe C60',
    category: 'kapi-pencere',
    basePrice: 35,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Siyah', color: '#000000', price: 35 },
        { value: 'Beyaz', color: '#FFFFFF', price: 35 },
      ],
    },
  },
  {
    id: 11,
    name: 'Isı Yalıtımlı Menteşe',
    category: 'kapi-pencere',
    basePrice: 45,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Gri', color: '#808080', price: 45 },
        { value: 'Antrasit', color: '#2b2b2b', price: 48 },
      ],
    },
  },
  {
    id: 12,
    name: 'Merpo Sürgü',
    category: 'kapi-pencere',
    basePrice: 60,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Beyaz', color: '#FFFFFF', price: 60 },
        { value: 'Gri', color: '#808080', price: 62 },
        { value: 'Siyah', color: '#000000', price: 65 },
      ],
    },
  },
  {
    id: 13,
    name: 'Kapı Bareli',
    category: 'kapi-pencere',
    basePrice: 80,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 14,
    name: 'Kapı Hidroliği',
    category: 'kapi-pencere',
    basePrice: 200,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 15,
    name: 'Kapı Otomasyon Kilidi',
    category: 'kapi-pencere',
    basePrice: 350,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },

  // PVC GRUBU
  {
    id: 16,
    name: 'PVC Armatür',
    category: 'pvc',
    basePrice: 45,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 17,
    name: 'PVC Kapı Menteşesi',
    category: 'pvc',
    basePrice: 25,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Beyaz', color: '#FFFFFF', price: 25 },
        { value: 'Gri', color: '#808080', price: 27 },
      ],
    },
  },
  {
    id: 18,
    name: 'PVC Kapı Kolu',
    category: 'pvc',
    basePrice: 50,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Beyaz', color: '#FFFFFF', price: 50 },
        { value: 'Gri', color: '#808080', price: 52 },
      ],
    },
  },
  {
    id: 19,
    name: 'PVC Pencere Kolu',
    category: 'pvc',
    basePrice: 40,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'color',
      options: [
        { value: 'Beyaz', color: '#FFFFFF', price: 40 },
        { value: 'Gri', color: '#808080', price: 42 },
      ],
    },
  },
  {
    id: 20,
    name: 'WC Penceresi 40x40',
    category: 'pvc',
    basePrice: 400,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'combined',
      dimensions: [
        { size: '40x40', price: 400 },
        { size: '50x50', price: 450 },
        { size: '60x40', price: 480 },
      ],
      colors: [
        { value: 'Beyaz', color: '#FFFFFF' },
        { value: 'Gri', color: '#808080' },
      ],
    },
  },

  // DEMİR HIRDAVAT
  {
    id: 21,
    name: 'Mil Menteşe',
    category: 'demir',
    basePrice: 15,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 22,
    name: 'Kapı Kilidi (Demir)',
    category: 'demir',
    basePrice: 60,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 23,
    name: 'Kapı Tokmağı',
    category: 'demir',
    basePrice: 30,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 24,
    name: 'Kapı Makarası',
    category: 'demir',
    basePrice: 20,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },

  // VİDA ÇEŞİTLERİ
  {
    id: 25,
    name: 'Ysb Vida 4.8x16 (1500 Adet)',
    category: 'vida',
    basePrice: 200,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'technical',
      options: [
        { value: 'Ysb 4.8x16 (1500 Adet)', price: 200 },
        { value: 'Ysb 5.0x20 (1000 Adet)', price: 220 },
        { value: 'Ysb 6.3x25 (500 Adet)', price: 180 },
      ],
    },
  },
  {
    id: 26,
    name: 'Yhb Vida 4.8x16 (1500 Adet)',
    category: 'vida',
    basePrice: 210,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'technical',
      options: [
        { value: 'Yhb 4.8x16 (1500 Adet)', price: 210 },
        { value: 'Yhb 5.0x20 (1000 Adet)', price: 230 },
      ],
    },
  },
  {
    id: 27,
    name: 'Trapez Vida 4.8x25 (500 Adet)',
    category: 'vida',
    basePrice: 150,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },

  // DEKORATİF
  {
    id: 28,
    name: 'Dekoratif Duvar Rafı Modern',
    category: 'dekoratif',
    basePrice: 350,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: {
      type: 'style',
      options: [
        { value: 'Modern', price: 350 },
        { value: 'Vintage', price: 380 },
        { value: 'Endüstriyel', price: 400 },
      ],
    },
  },
  {
    id: 29,
    name: 'Dekoratif Duvar Rafı Vintage',
    category: 'dekoratif',
    basePrice: 380,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
  {
    id: 30,
    name: 'Dekoratif Duvar Rafı Endüstriyel',
    category: 'dekoratif',
    basePrice: 400,
    image: 'https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop',
    variations: null,
  },
];