import { useState, useEffect } from 'react';
import { useOrders } from '../../contexts/OrderContext';
import { CheckCircle, XCircle, Clock, Check } from 'lucide-react';

const Orders = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Toast'u otomatik kapat
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleApprove = (orderId, currentStatus) => {
    try {
      // Tik: onayla -> completed yap
      if (currentStatus !== 'completed') {
        updateOrderStatus(orderId, 'completed');
        setToast({ show: true, message: 'Sipariş onaylandı!', type: 'success' });
      } else {
        setToast({ show: true, message: 'Sipariş zaten onaylanmış.', type: 'info' });
      }
    } catch (error) {
      console.error('Onaylama hatası:', error);
      setToast({ show: true, message: 'Bir hata oluştu.', type: 'error' });
    }
  };

  const handleReject = (orderId, currentStatus) => {
    try {
      // Çarpı: beklemede yap (iptal/red)
      if (currentStatus !== 'pending') {
        updateOrderStatus(orderId, 'pending');
        setToast({ show: true, message: 'Sipariş beklemede işaretlendi.', type: 'warning' });
      } else {
        setToast({ show: true, message: 'Sipariş zaten beklemede.', type: 'info' });
      }
    } catch (error) {
      console.error('Beklemede işaretleme hatası:', error);
      setToast({ show: true, message: 'Bir hata oluştu.', type: 'error' });
    }
  };

  return (
    <div className="relative">
      <h2 className="text-2xl font-bold text-secondary-800 mb-6">Tüm Siparişler</h2>
      <div className="bg-white rounded-lg shadow-industrial overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-secondary-100">
            <tr>
              <th className="p-3">Sipariş No</th>
              <th className="p-3">Tarih</th>
              <th className="p-3">Müşteri</th>
              <th className="p-3">Ürünler</th>
              <th className="p-3">Ara Toplam</th>
              <th className="p-3">KDV</th>
              <th className="p-3">Genel Toplam</th>
              <th className="p-3">Ödeme Yöntemi</th>
              <th className="p-3">Adres</th>
              <th className="p-3">Durum</th>
              <th className="p-3">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="11" className="p-6 text-center text-secondary-500">
                  Henüz sipariş yok.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-secondary-200 hover:bg-secondary-50">
                  <td className="p-3 font-medium">#{order.id}</td>
                  <td className="p-3">{new Date(order.date).toLocaleDateString('tr-TR')}</td>
                  <td className="p-3">{order.customerName}</td>
                  <td className="p-3">
                    <ul className="list-disc list-inside">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm">
                          {item.name} {item.variationText && `(${item.variationText})`} x {item.quantity} = {item.totalPrice.toFixed(2)} TL
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="p-3">{order.subtotal.toFixed(2)} TL</td>
                  <td className="p-3">{order.kdv.toFixed(2)} TL</td>
                  <td className="p-3 font-bold text-primary-600">{order.total.toFixed(2)} TL</td>
                  <td className="p-3">
                    {order.paymentMethod === 'credit' && 'Kredi Kartı'}
                    {order.paymentMethod === 'transfer' && 'Havale/EFT'}
                    {order.paymentMethod === 'cash' && 'Kapıda Ödeme'}
                  </td>
                  <td className="p-3 max-w-xs truncate">{order.address}</td>
                  <td className="p-3">
                    {order.status === 'pending' ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Clock size={14} /> Beklemede
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                        <Check size={14} /> Onaylandı
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(order.id, order.status)}
                        className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition"
                        title="Onayla"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => handleReject(order.id, order.status)}
                        className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition"
                        title="Beklemede işaretle"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Toast Bildirimi */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border-l-4 p-4 w-80 z-50 animate-slideIn"
          style={{
            borderLeftColor:
              toast.type === 'success' ? '#10b981' :
              toast.type === 'warning' ? '#f59e0b' :
              toast.type === 'error' ? '#ef4444' :
              '#3b82f6'
          }}
        >
          <p className="text-secondary-800 font-medium">{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default Orders;