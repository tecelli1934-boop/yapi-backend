import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, Truck, Package, Trash2 } from 'lucide-react';

const OrderManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Firestore'dan siparişleri gerçek zamanlı çek
  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error("Siparişler çekilirken hata:", err);
      setError("Siparişler yüklenemedi.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtreleme mantığı
  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = 
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerInfo?.name && order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerInfo?.email && order.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { label: 'İşleniyor', color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { label: 'Kargoda', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      // onSnapshot otomatik güncelleyeceği için ek bir state yönetimine gerek yok
    } catch (err) {
      alert("Durum güncellenirken hata oluştu: " + err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Bu siparişi tamamen silmek istediğinizden emin misiniz?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
      } catch (err) {
        alert("Sipariş silinirken hata oluştu: " + err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-12">Siparişler yükleniyor...</div>;
  if (error) return <div className="text-center py-12 text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-secondary-800">Sipariş Yönetimi</h2>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg shadow-industrial p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Sipariş Ara</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Müşteri adı, e-posta veya ID..."
                className="w-full pl-10 pr-3 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Durum Filtresi</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="pending">Beklemede</option>
              <option value="processing">İşleniyor</option>
              <option value="shipped">Kargoda</option>
              <option value="delivered">Teslim Edildi</option>
              <option value="cancelled">İptal Edildi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sipariş Tablosu */}
      <div className="bg-white rounded-lg shadow-industrial overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Müşteri</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Tutar</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Tarih</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">Durum</th>
                <th className="px-6 py-4 text-xs font-bold text-secondary-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredOrders.map((order) => {
                const config = getStatusConfig(order.status);
                const Icon = config.icon;
                return (
                  <tr key={order.id} className="hover:bg-secondary-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-secondary-900">{order.customerInfo?.name}</div>
                      <div className="text-xs text-secondary-500">{order.customerInfo?.email}</div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${order.customerType === 'guest' ? 'bg-orange-50 text-orange-600 border border-orange-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {order.customerType === 'guest' ? 'MİSAFİR' : 'ÜYE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-secondary-900">
                      ₺{order.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} <span className="text-[10px] text-secondary-500 font-normal block">KDV Dahil</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-secondary-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${config.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 hover:bg-secondary-100 rounded text-secondary-600 transition" title="Detay">
                          <Eye className="w-5 h-5" />
                        </button>
                        
                        {order.status === 'pending' && (
                          <button onClick={() => updateOrderStatus(order.id, 'processing')} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition" title="İşleme Al">
                            <Package className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button onClick={() => updateOrderStatus(order.id, 'shipped')} className="p-1.5 hover:bg-purple-50 text-purple-600 rounded transition" title="Kargola">
                            <Truck className="w-5 h-5" />
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="p-1.5 hover:bg-green-50 text-green-600 rounded transition" title="Teslim Et">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                          <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="p-1.5 hover:bg-red-50 text-red-600 rounded transition" title="İptal Et">
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteOrder(order.id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="p-12 text-center text-secondary-500">Henüz sipariş bulunmuyor.</div>
        )}
      </div>

      {/* Sipariş Detay Modalı */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-secondary-100 flex justify-between items-center bg-secondary-50">
              <h3 className="text-xl font-bold text-secondary-900">Sipariş Detayı</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-secondary-200 rounded-full transition"><XCircle className="w-6 h-6 text-secondary-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-3">Müşteri & Teslimat</h4>
                  <div className="space-y-1 text-secondary-800">
                    <p className="font-bold text-lg">{selectedOrder.customerInfo?.name}</p>
                    <p className="text-sm">{selectedOrder.customerInfo?.email}</p>
                    <p className="text-sm">{selectedOrder.customerInfo?.phone}</p>
                    <div className="mt-3 pt-3 border-t border-secondary-100 text-sm italic">
                      {selectedOrder.customerInfo?.address}
                    </div>
                  </div>
                </section>
                <section>
                  <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-3">Sipariş Durumu</h4>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold ${getStatusConfig(selectedOrder.status).color}`}>
                    {selectedOrder.status.toUpperCase()}
                  </div>
                  <p className="text-[10px] text-secondary-400 mt-2">ID: {selectedOrder.id}</p>
                </section>
              </div>

              <section>
                <h4 className="text-xs font-bold text-secondary-400 uppercase tracking-widest mb-4">Ürünler</h4>
                <div className="bg-secondary-50 rounded-xl overflow-hidden border border-secondary-100">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary-100/50 text-secondary-600">
                      <tr>
                        <th className="px-4 py-2 text-left">Ürün</th>
                        <th className="px-4 py-2 text-center">Adet</th>
                        <th className="px-4 py-2 text-right">Tutar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2 font-medium">
                            <span className="font-bold block">{item.name}</span>
                            {item.variation && <span className="text-[10px] text-secondary-500">{item.variation}</span>}
                          </td>
                          <td className="px-4 py-2 text-center text-secondary-600">{item.quantity}</td>
                          <td className="px-4 py-2 text-right font-medium">₺{(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-secondary-100/30">
                      <tr>
                        <td colSpan="2" className="px-4 py-1 text-right text-secondary-500">Ara Toplam:</td>
                        <td className="px-4 py-1 text-right">₺{selectedOrder.subTotal?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="px-4 py-1 text-right text-secondary-500">KDV (%20):</td>
                        <td className="px-4 py-1 text-right">₺{selectedOrder.kdv?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr>
                        <td colSpan="2" className="px-4 py-1 text-right text-secondary-500">Kargo:</td>
                        <td className="px-4 py-1 text-right">{selectedOrder.shipping === 0 ? 'Ücretsiz' : `₺${selectedOrder.shipping?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`}</td>
                      </tr>
                      <tr className="font-bold text-primary-600">
                        <td colSpan="2" className="px-4 py-2 text-right">Toplam (KDV Dahil):</td>
                        <td className="px-4 py-2 text-right">₺{selectedOrder.total?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </section>
            </div>
            <div className="p-4 bg-secondary-50 border-t border-secondary-100 flex justify-end">
               <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-secondary-800 text-white rounded-lg font-bold hover:bg-black transition">Kapat</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
