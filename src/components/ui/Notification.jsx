import { useCart } from '../../contexts/CartContext';
import { useOrders } from '../../contexts/OrderContext';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, ShoppingCart } from 'lucide-react';

const Notification = () => {
  const { notification: cartNotification, hideNotification: hideCartNotification } = useCart();
  const { notification: orderNotification, hideNotification: hideOrderNotification } = useOrders();

  // Hangi bildirim gösterilecek? Öncelik sırası: orderNotification > cartNotification
  const activeNotification = orderNotification?.show 
    ? { ...orderNotification, hide: hideOrderNotification } 
    : cartNotification?.show 
    ? { ...cartNotification, hide: hideCartNotification } 
    : null;

  if (!activeNotification) return null;

  const { show, message, type, hide } = activeNotification;

  if (!show) return null;

  const bgColor = type === 'success' ? 'border-green-500' : type === 'warning' ? 'border-yellow-500' : 'border-red-500';
  const Icon = type === 'success' ? CheckCircle : type === 'warning' ? XCircle : XCircle;

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border-l-4 ${bgColor} p-4 w-80 z-50 animate-slideIn`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 ${type === 'success' ? 'text-green-500' : 'text-yellow-500'}`} />
        <div className="flex-1">
          <p className="text-secondary-800 font-medium mb-2">{message}</p>
          {type === 'success' && message.includes('Sipariş') && (
            <Link
              to="/admin/siparisler"
              onClick={hide}
              className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white text-sm py-1 px-3 rounded-md transition"
            >
              <ShoppingCart size={16} />
              Siparişleri Gör
            </Link>
          )}
        </div>
        <button onClick={hide} className="text-secondary-400 hover:text-secondary-600">
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default Notification;