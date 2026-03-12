// seed.js - MongoDB'ye örnek ürünleri ekler
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Ürün modelini import et
const Product = require('./models/Product');

// Örnek ürün verileri (style olanlar technical olarak değiştirildi)
const sampleProducts = [
  {
    name: "Alüminyum Profil 60x20",
    category: "aluminyum",
    basePrice: 50,
    image: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=300&h=200&fit=crop",
    stock: 100,
    variations: {
      type: "length",
      unit: "cm",
      options: [60, 80, 90, 100, 120]
    }
  },
  {
    name: "Kapı Koruma Profili",
    category: "aluminyum",
    basePrice: 40,
    image: "https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop",
    stock: 85,
    variations: {
      type: "length",
      unit: "cm",
      options: [80, 90, 100, 110]
    }
  },
  {
    name: "50'lik Boru",
    category: "aluminyum",
    basePrice: 120,
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=300&h=200&fit=crop",
    stock: 60,
    variations: {
      type: "length",
      unit: "cm",
      options: [80, 90, 100, 150, 200]
    }
  },
  {
    name: "Kapı Kolu Modern",
    category: "kapi-pencere",
    basePrice: 150,
    image: "https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop",
    stock: 45,
    variations: {
      type: "color",
      options: [
        { value: "Siyah", color: "#000000", price: 150 },
        { value: "Beyaz", color: "#FFFFFF", price: 150 },
        { value: "Gri", color: "#808080", price: 155 }
      ]
    }
  },
  {
    name: "Menteşe Aldoks",
    category: "kapi-pencere",
    basePrice: 30,
    image: "https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop",
    stock: 200,
    variations: {
      type: "color",
      options: [
        { value: "Siyah", color: "#000000", price: 30 },
        { value: "Beyaz", color: "#FFFFFF", price: 30 }
      ]
    }
  },
  {
    name: "WC Penceresi 40x40",
    category: "pvc",
    basePrice: 400,
    image: "https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop",
    stock: 25,
    variations: {
      type: "combined",
      dimensions: [
        { size: "40x40", price: 400 },
        { size: "50x50", price: 450 }
      ],
      colors: [
        { value: "Beyaz", color: "#FFFFFF" },
        { value: "Gri", color: "#808080" }
      ]
    }
  },
  {
    name: "Ysb Vida 4.8x16 (1500 Adet)",
    category: "vida",
    basePrice: 200,
    image: "https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop",
    stock: 500,
    variations: {
      type: "technical",
      options: [
        { value: "Ysb 4.8x16 (1500 Adet)", price: 200 },
        { value: "Ysb 5.0x20 (1000 Adet)", price: 220 }
      ]
    }
  },
  {
    name: "Dekoratif Duvar Rafı Modern",
    category: "dekoratif",
    basePrice: 350,
    image: "https://images.unsplash.com/photo-1581267501165-7a6f4c6b3f1e?w=300&h=200&fit=crop",
    stock: 15,
    variations: {
      type: "technical", // style yerine technical yapıldı
      options: [
        { value: "Modern", price: 350 },
        { value: "Vintage", price: 380 }
      ]
    }
  }
];

// MongoDB'ye bağlan ve verileri ekle
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB bağlantısı başarılı, seed işlemi başlıyor...');
    
    // Mevcut ürünleri temizle
    await Product.deleteMany({});
    console.log('Mevcut ürünler silindi.');
    
    // Yeni ürünleri ekle
    const result = await Product.insertMany(sampleProducts);
    console.log(`${result.length} ürün başarıyla eklendi.`);
    
    // Bağlantıyı kapat
    mongoose.connection.close();
    console.log('Seed işlemi tamamlandı, bağlantı kapatıldı.');
  })
  .catch(err => {
    console.error('Seed hatası:', err);
    mongoose.connection.close();
  });