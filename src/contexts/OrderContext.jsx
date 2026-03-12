import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc } from 'firebase/firestore';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Firestore'dan tüm siparişleri gerçek zamanlı çek (Admin ve Dashboard için)
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("OrderContext Firestore hatası:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Yeni sipariş ekleme (Checkout sayfasında kullanılabilir)
  const addOrder = useCallback(async (orderData) => {
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        ...orderData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      console.error("Sipariş ekleme hatası:", error);
      throw error;
    }
  }, []);

  // Sipariş durumu güncelleme
  const updateOrderStatus = useCallback(async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
    } catch (error) {
      console.error("Sipariş durumu güncelleme hatası:", error);
      throw error;
    }
  }, []);

  // İstatistik Yardımcıları
  const getTotalSales = useCallback(() => {
    return orders
      .filter(o => o.status !== 'cancelled')
      .reduce((total, order) => total + (order.total || 0), 0);
  }, [orders]);

  const getPendingOrdersCount = useCallback(() => {
    return orders.filter(order => order.status === 'pending').length;
  }, [orders]);

  const getCompletedOrdersCount = useCallback(() => {
    return orders.filter(order => order.status === 'delivered').length;
  }, [orders]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        getTotalSales,
        getPendingOrdersCount,
        getCompletedOrdersCount,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};