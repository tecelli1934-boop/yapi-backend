const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

const testProducts = [
  {
    name: 'Alüminyum Kompozit Panel',
    category: 'aluminyum',
    basePrice: 250,
    stock: 100,
    description: 'Dış cephe için alüminyum kompozit panel',
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
    variations: {
      type: 'length',
      unit: 'mm',
      dimensions: [
        { size: '2000x1000', price: 250 },
        { size: '3000x1500', price: 350 },
        { size: '4000x2000', price: 450 }
      ]
    }
  },
  {
    name: 'PVC Kapı',
    category: 'pvc',
    basePrice: 1800,
    stock: 25,
    description: 'Yalıtımlı PVC kapı',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    variations: {
      type: 'color',
      colors: [
        { value: 'beyaz', color: '#ffffff' },
        { value: 'kahverengi', color: '#8B4513' },
        { value: 'gri', color: '#808080' }
      ]
    }
  },
  {
    name: 'Demir Korkuluk',
    category: 'demir',
    basePrice: 450,
    stock: 50,
    description: 'Modern demir korkuluk',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    variations: {
      type: 'length',
      unit: 'cm',
      dimensions: [
        { size: '100', price: 450 },
        { size: '150', price: 650 },
        { size: '200', price: 850 }
      ]
    }
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut ürünleri temizle
    await Product.deleteMany({});
    console.log('Mevcut ürünler temizlendi');

    // Test ürünlerini ekle
    const products = await Product.create(testProducts);
    console.log(`${products.length} test ürünü eklendi`);

    console.log('Ürünler:');
    products.forEach(p => {
      console.log(`- ${p.name} (${p.category}) - ${p.price} TL - Stok: ${p.stock}`);
    });

    await mongoose.disconnect();
    console.log('İşlem tamamlandı');
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

seedProducts();
