import { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';

const CategoryContext = createContext();

export const useCategories = () => {
  return useContext(CategoryContext);
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firestore'tan gerçek zamanlı kategorileri çekme
  useEffect(() => {
    const q = query(collection(db, 'categories'), orderBy('order', 'asc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setCategories(cats);
      setLoading(false);
      
      // Duplikasyon temizliği tamamlandı, gerekirse manuel çağrılabilir.
      if (cats.length > 0 && !loading) {
        // cleanupDuplicates(); 
      }
    }, (err) => {
      console.error("Kategori çekme hatası:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // KRİTİK: Mükerrer Kategorileri Temizleme (Migration)
  const cleanupDuplicates = async () => {
    if (categories.length === 0) return;
    
    console.log("Veritabanı temizliği başlatılıyor...");
    const nameMap = {}; // name -> [ids]
    
    categories.forEach(cat => {
      const name = cat.name.trim().toLowerCase();
      if (!nameMap[name]) nameMap[name] = [];
      nameMap[name].push(cat);
    });

    const batch = writeBatch(db);
    let hasChanges = false;

    for (const name in nameMap) {
      const group = nameMap[name];
      if (group.length > 1) {
        // İlk bulunanı ana kategori kabul et, diğerlerini sil ve ürünlerini buna taşı
        const primaryCat = group[0];
        const duplicates = group.slice(1);

        console.log(`'${primaryCat.name}' için ${duplicates.length} duplikasyon bulundu.`);

        for (const duplicate of duplicates) {
          // Bu kategoriye ait ürünleri bul
          const productsRef = collection(db, 'products');
          const productQ = query(productsRef, where('category', '==', duplicate.id));
          const productSnap = await getDocs(productQ);

          if (!productSnap.empty) {
            productSnap.docs.forEach(pDoc => {
              batch.update(pDoc.ref, { category: primaryCat.id });
            });
          }

          // Mükerrer kategoriyi sil
          batch.delete(doc(db, 'categories', duplicate.id));
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      await batch.commit();
      console.log("Temizlik tamamlandı. Mükerrer kayıtlar silindi ve ürünler taşındı.");
      return true;
    }
    console.log("Mükerrer kayıt bulunamadı, veritabanı temiz.");
    return false;
  };

  // Yeni Kategori Ekleme
  const addCategory = async (categoryData) => {
    try {
      // Slug oluştur
      const slug = categoryData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const order = categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 1;

      const finalData = {
        name: categoryData.name.trim(),
        parentId: categoryData.parentId || null,
        slug,
        order,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'categories'), finalData);
      return true;
    } catch (err) {
      console.error("Kategori ekleme hatası:", err);
      throw err;
    }
  };

  // Kategori Güncelleme
  const updateCategory = async (id, categoryData) => {
    try {
      const categoryRef = doc(db, 'categories', id);
      
      const updateData = { 
        ...categoryData,
        name: categoryData.name?.trim(),
        parentId: categoryData.parentId || null 
      };
      
      // İsim değiştiyse slug'ı da güncelle
      if (categoryData.name) {
         updateData.slug = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
      }

      // Dokümanda id alanı saklamamaya çalış (Firestore'un kendi ID'si yeterli)
      delete updateData.id;

      await updateDoc(categoryRef, {
        ...updateData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      console.error("Kategori güncelleme hatası:", err);
      throw err;
    }
  };

  // Kategori Silme
  const deleteCategory = async (id, reassignToId = 'diger') => {
    try {
      // Bu kategoriye ait ürünleri bul ve başka bir kategoriye taşı
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('category', '==', id));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      
      if (!querySnapshot.empty) {
        querySnapshot.docs.forEach((productDoc) => {
          batch.update(productDoc.ref, { category: reassignToId });
        });
        console.log(`${querySnapshot.size} ürün yeni kategoriye (${reassignToId}) taşındı.`);
      }

      // Alt kategorileri varsa onları da ana kategoriye çek
      const subCatsQ = query(collection(db, 'categories'), where('parentId', '==', id));
      const subCatsSnapshot = await getDocs(subCatsQ);
      if (!subCatsSnapshot.empty) {
        subCatsSnapshot.docs.forEach((catDoc) => {
          batch.update(catDoc.ref, { parentId: null });
        });
      }

      // Kategoriyi sil
      batch.delete(doc(db, 'categories', id));
      
      await batch.commit();
      return true;
    } catch (err) {
      console.error("Kategori silme hatası:", err);
      throw err;
    }
  };

  // Alt kategorileri bulma helper'ı
  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const value = {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    cleanupDuplicates
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};
