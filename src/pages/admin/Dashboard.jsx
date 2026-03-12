import { useState, useEffect, useMemo } from 'react';
import {
  Package,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Edit,
  Save,
  XCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useProducts } from '../../contexts/ProductContext';
import { useCategories } from '../../contexts/CategoryContext';
import { db } from '../../firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

const Dashboard = () => {
  const { products, loading: productsLoading } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [selectedCard, setSelectedCard] = useState('satış');

  // Grafik Renkleri
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Siparişleri Firestore'dan gerçek zamanlı çek
  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setOrdersLoading(false);
    }, (error) => {
      console.error("Dashboard sipariş çekme hatası:", error);
      setOrdersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Grafik Verilerini Hazırla (useMemo ile performans optimizasyonu)
  const salesChartData = useMemo(() => {
    const dailyDataMap = {};
    
    // Son 7 günü 0 verisiyle başlat (Tarihsel sıralama garantisi)
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      dailyDataMap[dateStr] = { date: dateStr, satış: 0, kar: 0, sipariş: 0 };
    }

    orders.filter(o => o.status !== 'cancelled').forEach(order => {
      const date = order.createdAt?.toDate ? 
        order.createdAt.toDate().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : 
        new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      
      if (dailyDataMap[date]) {
        dailyDataMap[date].satış += order.total || 0;
        dailyDataMap[date].sipariş += 1;
        
        // Tahmini kar hesapla
        const cost = order.items.reduce((sum, item) => {
          const product = products.find(p => p.id === item.id || p._id === item.id);
          return sum + ((product?.basePrice || item.price * 0.7) * item.quantity);
        }, 0);
        dailyDataMap[date].kar += (order.total - cost);
      }
    });

    return Object.values(dailyDataMap);
  }, [orders, products]);

  const categoryChartData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: products.filter(p => p.category === cat.id).length
    })).filter(d => d.value > 0);
  }, [categories, products]);

  const categoryStockValueData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.name,
      value: products
        .filter(p => p.category === cat.id)
        .reduce((sum, p) => sum + (p.stock * (p.basePrice || p.price * 0.7)), 0)
    })).filter(d => d.value > 0);
  }, [categories, products]);

  const orderStatusData = useMemo(() => {
    const statuses = {
      'pending': { name: 'Bekleyen', value: 0 },
      'processing': { name: 'İşleniyor', value: 0 },
      'shipped': { name: 'Kargoda', value: 0 },
      'delivered': { name: 'Teslim Edildi', value: 0 },
      'cancelled': { name: 'İptal', value: 0 }
    };
    orders.forEach(o => {
      if (statuses[o.status]) statuses[o.status].value++;
    });
    return Object.values(statuses).filter(d => d.value > 0);
  }, [orders]);

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="text-secondary-600">Veriler yükleniyor...</p>
      </div>
    );
  }

  // Hesaplamalar
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalSales = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
  
  const totalCost = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => {
    return sum + o.items.reduce((itemSum, item) => {
      const product = products.find(p => p.id === item.id || p._id === item.id);
      return itemSum + ((product?.basePrice || item.price * 0.7) * item.quantity);
    }, 0);
  }, 0);

  const totalProfit = totalSales - totalCost;
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * (p.basePrice || p.price * 0.7)), 0);

  const cards = [
    { id: 'ürünler', title: 'Toplam Ürün', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'siparişler', title: 'Toplam Sipariş', value: totalOrders, icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
    { id: 'satış', title: 'Toplam Satış', value: `₺${totalSales.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
    { id: 'kar', title: 'Tahmini Kar', value: `₺${totalProfit.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`, icon: TrendingUp, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' },
    { id: 'stok', title: 'Stok Değeri', value: `₺${totalStockValue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}`, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { id: 'bekleyen', title: 'Bekleyen', value: pendingOrders, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100' }
  ];

  const lowStockProducts = products.filter(p => p.stock < 10);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-secondary-900 tracking-tight">DASHBOARD</h2>
          <p className="text-secondary-500 text-sm">İşletmenizin genel durumu ve analitik verileri.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-secondary-400 bg-white px-3 py-2 rounded-full shadow-sm border border-secondary-100">
          <Clock size={14} />
          SON GÜNCELLEME: {new Date().toLocaleTimeString('tr-TR')}
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => setSelectedCard(card.id)}
            className={`relative group text-left p-5 rounded-2xl transition-all duration-300 border-2 overflow-hidden ${
              selectedCard === card.id 
              ? `${card.border} bg-white shadow-xl scale-[1.02] ring-4 ring-opacity-10 ring-secondary-900` 
              : 'border-transparent bg-white shadow-sm hover:shadow-md hover:translate-y-[-2px]'
            }`}
          >
            <div className={`p-2 rounded-xl inline-flex items-center justify-center mb-3 ${card.bg} ${card.color} group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <p className="text-secondary-500 text-xs font-bold uppercase tracking-wider mb-1">{card.title}</p>
            <p className="text-xl font-black text-secondary-900 truncate tracking-tight">{card.value}</p>
            
            {selectedCard === card.id && (
              <div className="absolute right-2 bottom-2 text-secondary-200">
                <ChevronRight size={20} />
              </div>
            )}
            
            {/* Alt Süreç Çizgisi */}
            <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${
              selectedCard === card.id ? 'bg-secondary-900 w-full' : 'bg-transparent w-0'
            }`} />
          </button>
        ))}
      </div>

      {/* Dinamik Grafik Alanı */}
      <div className="bg-white rounded-3xl shadow-industrial border border-secondary-100 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-secondary-900 flex items-center gap-2 capitalize">
            {selectedCard} Analizi
          </h3>
          <div className="flex gap-2">
            {['7G', '30G', '12A'].map(t => (
              <button key={t} className="px-3 py-1 text-[10px] font-black rounded-lg border border-secondary-200 text-secondary-600 hover:bg-secondary-50">
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            {selectedCard === 'satış' || selectedCard === 'kar' ? (
              <AreaChart data={salesChartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedCard === 'satış' ? '#6366f1' : '#10b981'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={selectedCard === 'satış' ? '#6366f1' : '#10b981'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(val) => `₺${val.toLocaleString()}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => [`₺${val.toLocaleString()}`, selectedCard === 'satış' ? 'Günlük Gelir' : 'Günlük Kar']}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedCard} 
                  stroke={selectedCard === 'satış' ? '#6366f1' : '#10b981'} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  strokeWidth={4}
                  animationDuration={1500}
                />
              </AreaChart>
            ) : selectedCard === 'siparişler' ? (
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => [`${val} Adet`, 'Sipariş Sayısı']}
                />
                <Bar dataKey="sipariş" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500} />
              </BarChart>
            ) : selectedCard === 'ürünler' || selectedCard === 'stok' ? (
              <BarChart data={selectedCard === 'ürünler' ? categoryChartData : categoryStockValueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(val) => selectedCard === 'stok' ? `₺${(val/1000).toFixed(0)}k` : val}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(val) => [selectedCard === 'stok' ? `₺${val.toLocaleString()}` : `${val} Ürün`, selectedCard === 'stok' ? 'Stok Değeri' : 'Ürün Sayısı']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50} animationDuration={1500}>
                  {(selectedCard === 'ürünler' ? categoryChartData : categoryStockValueData).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    formatter={(val, name) => [`${val} Sipariş`, name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Düşük Stok Listesi */}
        <div className="bg-white rounded-3xl shadow-industrial border border-secondary-100 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
              <AlertTriangle className="text-yellow-500" /> Kritik Stok Durumu
            </h3>
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {lowStockProducts.length} Ürün Kalıyor
            </span>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {lowStockProducts.map(product => (
              <div key={product._id} className="group p-4 rounded-2xl bg-secondary-50 hover:bg-white border border-transparent hover:border-secondary-100 transition-all flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-bold text-secondary-900 truncate">{product.name}</p>
                  <p className="text-xs text-secondary-500 font-medium">Stok: <span className="text-red-600 font-bold">{product.stock}</span> adet kaldı</p>
                </div>
                <button className="p-2 rounded-lg bg-white shadow-sm text-primary-600 hover:bg-primary-600 hover:text-white transition-colors">
                  <Edit size={16} />
                </button>
              </div>
            ))}
            {lowStockProducts.length === 0 && <p className="text-center py-10 text-secondary-400 font-medium italic">Tüm stoklar yeterli seviyede.</p>}
          </div>
        </div>

        {/* En Çok Satanlar */}
        <div className="bg-secondary-900 rounded-3xl shadow-2xl p-6 text-white overflow-hidden relative">
          <TrendingUp className="absolute top-[-20px] right-[-20px] w-48 h-48 text-white opacity-[0.03]" />
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            ⭐ Yıldız Ürünler (En Çok Satan)
          </h3>
          <div className="space-y-4">
            {orders.length > 0 ? products.slice(0, 3).sort((a,b) => b.sold - a.sold).map((product, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center font-black text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold text-sm">{product.name}</p>
                    <p className="text-xs text-white/50">{product.sold || 0} Adet Satıldı</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-primary-400 font-black">₺{(product.price * (product.sold || 0)).toLocaleString()}</p>
                  <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest text-right">Ciro</p>
                </div>
              </div>
            )) : <p className="text-white/40 italic">Veri toplanıyor...</p>}
          </div>
          
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] leading-relaxed text-white/60">
            📊 Not: Bu veriler gerçek zamanlı sipariş akışına göre güncellenmektedir. Satış performansı dönemsel dalgalanmalar gösterebilir.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
