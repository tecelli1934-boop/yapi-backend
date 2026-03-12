import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase oturum durumunu takip et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // E-posta dogrulamasi kontrolu
        const isGoogleUser = firebaseUser.providerData?.some(p => p.providerId === 'google.com');
        const userEmailString = (firebaseUser.email || '').toLowerCase().trim();
        const isAdminTestAccount = userEmailString === 'admin@test.com';

        if (!firebaseUser.emailVerified && !isGoogleUser && !isAdminTestAccount) {
          // Doğrulanmamışsa oturumu kapat ve user state'ine alma
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        // Firestore'dan ek kullanıcı bilgilerini al (rol vb.)
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const extra = userDoc.exists() ? userDoc.data() : {};
          
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || extra.name || firebaseUser.email?.split('@')[0],
            email: firebaseUser.email,
            picture: firebaseUser.photoURL || extra.picture || null,
            role: isAdminTestAccount ? 'admin' : (extra.role || 'user'),
            googleId: isGoogleUser ? firebaseUser.providerData.find(p => p.providerId === 'google.com').uid : null,
            address: extra.address || '',
            city: extra.city || '',
            phone: extra.phone || '',
          });
        } catch (error) {
          console.error("🔥 [AuthContext] Error getting Firestore data:", error);
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0],
            email: firebaseUser.email,
            picture: firebaseUser.photoURL || null,
            role: isAdminTestAccount ? 'admin' : 'user',
            googleId: null,
            address: '',
            city: '',
            phone: '',
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // E-posta / Şifre ile Giriş
  const login = async (email, password) => {
    const userEmailString = (email || '').toLowerCase().trim();
    const isAdminTestAccount = userEmailString === 'admin@test.com';

    let firebaseUser;
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = result.user;
    } catch (authError) {
      // Emergency Bypass: Eğer admin@test.com girildiyse ve auth hatası alındıysa (internet yoksa veya auth bozuksa)
      // yerel bir oturum simüle et.
      if (isAdminTestAccount && password === 'admin123') {
        console.warn('⚠️ [AuthContext] Auth Failed, Using Emergency Bypass for Admin');
        const simulatedUser = {
          uid: 'emergency-admin-uid',
          email: 'admin@test.com',
          displayName: 'Yönetici (Yedek Giriş)',
          emailVerified: true,
          role: 'admin'
        };
        setUser(simulatedUser);
        return simulatedUser;
      }
      throw authError; // Normal kullanıcılar için hatayı fırlat
    }

    // E-posta doğrulaması kontrolü (Sistem yöneticisi hariç)
    if (!firebaseUser.emailVerified && !isAdminTestAccount) {
      await signOut(auth); // Doğrulanmamışsa çıkış yap
      throw new Error('Lütfen önce e-postanıza gönderilen doğrulama linkine tıklayın!');
    }

    // Role bilgisini anlık çekip dön (Yönlendirme için)
    let role = 'user';
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      role = isAdminTestAccount ? 'admin' : (userDoc.exists() ? userDoc.data().role : 'user');
    } catch (e) {
      if (isAdminTestAccount) role = 'admin';
    }

    return { ...firebaseUser, role };
  };

  // Google ile Giriş
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;

    // Firestore'da kullanıcı yoksa oluştur
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        picture: firebaseUser.photoURL,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    }

    return firebaseUser;
  };

  // E-posta / Şifre ile Kayıt
  const register = async (name, email, password) => {
    // 1. Firebase Auth'a kaydet
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = result.user;

    // 2. Profil adını güncelle ve Doğrulama E-postası gönder
    try {
      await updateProfile(firebaseUser, { displayName: name });
      await sendEmailVerification(firebaseUser); // Kullanıcıya doğrulama maili gönder
    } catch (e) {
      console.warn('Profil/Doğrulama maili hatası:', e);
    }

    // 3. Firestore'a kaydet (hata olursa kayıt yine de tamamlanır)
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        picture: null,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore kayıt hatası (önemli değil):', e);
    }

    return firebaseUser;
  };

  // Çıkış
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Kullanıcı Bilgilerini Güncelle (Adres, Telefon vb.)
  const updateUserData = async (data) => {
    if (!user?.uid) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, data, { merge: true });
    
    // Yerel state'i güncelle
    setUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};