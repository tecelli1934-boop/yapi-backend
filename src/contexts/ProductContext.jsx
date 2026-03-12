import { createContext, useContext, useState, useEffect } from 'react';
import { collection, doc, setDoc, getDocs, updateDoc, deleteDoc, query, onSnapshot, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { products as mockProducts } from '../data/mockProducts';
import { useCategories } from './CategoryContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { categories, loading: categoriesLoading } = useCategories();

  // Firestore'dan ürünleri dinle
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'products'));
    
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      try {
        if (querySnapshot.empty) {
          // Eğer Firestore tamamen boşsa (ilk kurulum), mock ürünleri Firestore'a yükle
          console.log("Firestore boş, varsayılan ürünler yükleniyor...");
          const batchPromises = mockProducts.map(async (p) => {
            const docRef = doc(db, 'products', p.id.toString());
            const normalizedProduct = {
              ...p,
              id: p.id.toString(),
              _id: p.id.toString(),
              price: p.price || p.basePrice || 0,
              stock: p.stock || 100,
              image: p.image || '/placeholder-product.jpg',
              images: p.images || [p.image || '/placeholder-product.jpg'],
              createdAt: new Date().toISOString()
            };
            return setDoc(docRef, normalizedProduct);
          });
          await Promise.all(batchPromises);
          // Yüklendikten sonra onSnapshot tekrar tetiklenecek
        } else {
          // Firestore'da veri varsa state'e al
          const productsData = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            _id: doc.id
          }));
          setProducts(productsData);
        }
      } catch (err) {
        console.error("Ürünler getirilirken hata:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore dinleme hatası:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // KRİTİK: Ürün-Kategori eşleşmesini düzelten Migration
  // Kategorisi hala 'slug' olan ürünleri bulup 'id' ile günceller
  useEffect(() => {
    const migrateCategories = async () => {
      if (loading || categoriesLoading || products.length === 0 || categories.length === 0) return;

      const productsToMigrate = products.filter(p => {
        // Eğer kategori alanı bir slug ise (ID değildir)
        // Basit bir kontrol: kategori ID'leri genelde uzun veya rastgele karakterler, 
        // sluglar ise mockProducts'takilerdir veya bilinenler
        const cat = categories.find(c => c.id === p.category);
        if (!cat) {
          // Eğer ID ile eşleşmiyorsa, slug ile eşleşen var mı bak
          const matchingBySlug = categories.find(c => c.slug === p.category);
          return !!matchingBySlug;
        }
        return false;
      });

      if (productsToMigrate.length > 0) {
        console.log(`${productsToMigrate.length} ürün için kategori göçü başlatılıyor...`);
        const batch = writeBatch(db);
        let count = 0;

        productsToMigrate.forEach(p => {
          const matchingCat = categories.find(c => c.slug === p.category);
          if (matchingCat) {
            batch.update(doc(db, 'products', p.id), { category: matchingCat.id });
            count++;
          }
        });

        if (count > 0) {
          try {
            await batch.commit();
            console.log(`${count} ürün başarıyla yeni kategori sistemine taşındı.`);
          } catch (err) {
            console.error("Migration hatası:", err);
          }
        }
      }
    };

    migrateCategories();
  }, [products, categories, loading, categoriesLoading]);

  // Yeni ürün ekleme (Firestore'a)
  const addProduct = async (productData) => {
    try {
      // Rastgele bir ID oluştur
      const newId = Date.now().toString();
      const newProduct = {
        ...productData,
        id: newId,
        _id: newId,
        createdAt: new Date().toISOString(),
        // Eğer satış fiyatı verilmemişse normal price'ı satış fiyatı say
        salePrice: productData.salePrice || productData.price || 0,
      };

      await setDoc(doc(db, 'products', newId), newProduct);
      return newProduct;
    } catch (err) {
      console.error("Ürün ekleme hatası:", err);
      throw err;
    }
  };

  // Ürün güncelleme (Firestore'da)
  const updateProduct = async (id, productData) => {
    try {
      const idStr = id?.toString();
      const productRef = doc(db, 'products', idStr);
      
      const updateData = {
        ...productData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(productRef, updateData);
      return { id: idStr, ...updateData };
    } catch (err) {
      console.error("Ürün güncelleme hatası:", err);
      throw err;
    }
  };

  // Ürün silme (Firestore'dan)
  const deleteProduct = async (id) => {
    try {
      const idStr = id?.toString();
      await deleteDoc(doc(db, 'products', idStr));
    } catch (err) {
      console.error("Ürün silme hatası:", err);
      throw err;
    }
  };

  // Geriye dönük uyumluluk için fetchProducts manuel çağırma (onSnapshot yapıyor ama eski kodlar çağırabilir)
  const fetchProducts = () => {
    // onSnapshot zaten hallediyor, boş fonksiyon bırakıyoruz ki eski componentler hata atmasın
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};