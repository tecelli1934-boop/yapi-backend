import { useState } from 'react';
import { ShoppingCart, Plus, Trash2, X, CheckCircle2, Circle, RotateCcw } from 'lucide-react';
import { useShoppingList } from '../../contexts/ShoppingListContext';

const ShoppingListFAB = () => {
  const { items, isOpen, setIsOpen, addItem, removeItem, toggleChecked, updateItem, clearChecked, clearAll, total } = useShoppingList();
  const [newName, setNewName] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newPrice, setNewPrice] = useState('');

  const uncheckedCount = items.filter(i => !i.checked).length;

  const handleAdd = (e) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    addItem(name, parseInt(newQty) || 1, newPrice);
    setNewName('');
    setNewQty('1');
    setNewPrice('');
  };

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Alışveriş Listesi"
      >
        <ShoppingCart className="w-6 h-6" />
        {uncheckedCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {uncheckedCount}
          </span>
        )}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
        >
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-secondary-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-secondary-800">Alışveriş Listesi</h2>
                {items.length > 0 && (
                  <span className="text-xs bg-primary-100 text-primary-700 rounded-full px-2 py-0.5 font-medium">
                    {items.length} ürün
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {items.some(i => i.checked) && (
                  <button
                    onClick={clearChecked}
                    className="text-secondary-400 hover:text-red-500 transition text-xs flex items-center gap-1"
                    title="Alınanları sil"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Alınanları Temizle
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-secondary-400 hover:text-secondary-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add Item Form */}
            <form onSubmit={handleAdd} className="p-4 border-b border-secondary-100 bg-secondary-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ürün adı..."
                  className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <input
                  type="number"
                  value={newQty}
                  min="1"
                  onChange={e => setNewQty(e.target.value)}
                  placeholder="Adet"
                  className="w-16 px-2 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 text-center"
                />
                <input
                  type="number"
                  value={newPrice}
                  step="0.01"
                  min="0"
                  onChange={e => setNewPrice(e.target.value)}
                  placeholder="₺ fiyat"
                  className="w-20 px-2 py-2 border border-secondary-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
                <button
                  type="submit"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg transition flex items-center gap-1 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Ekle
                </button>
              </div>
            </form>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {items.length === 0 ? (
                <div className="text-center py-12 text-secondary-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Liste boş. Yukarıdan ürün ekleyin.</p>
                </div>
              ) : (
                items.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      item.checked
                        ? 'bg-secondary-50 border-secondary-200 opacity-60'
                        : 'bg-white border-secondary-200 shadow-sm'
                    }`}
                  >
                    <button
                      onClick={() => toggleChecked(item.id)}
                      className="text-primary-500 hover:text-primary-700 transition flex-shrink-0"
                    >
                      {item.checked
                        ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                        : <Circle className="w-5 h-5" />
                      }
                    </button>

                    <span className={`flex-1 text-sm font-medium ${item.checked ? 'line-through text-secondary-400' : 'text-secondary-800'}`}>
                      {item.name}
                    </span>

                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-12 text-center border border-secondary-200 rounded-md text-sm py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />

                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-secondary-400 text-xs">₺</span>
                      <input
                        type="number"
                        value={item.price}
                        step="0.01"
                        min="0"
                        onChange={e => updateItem(item.id, { price: e.target.value })}
                        placeholder="0"
                        className="w-20 pl-5 pr-1 border border-secondary-200 rounded-md text-sm py-0.5 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      />
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-secondary-300 hover:text-red-500 transition flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer with total */}
            {items.length > 0 && (
              <div className="p-4 border-t border-secondary-100 flex items-center justify-between bg-secondary-50">
                <button
                  onClick={() => { if (window.confirm('Tüm listeyi temizlemek istiyor musunuz?')) clearAll(); }}
                  className="text-xs text-red-400 hover:text-red-600 transition"
                >
                  Tümünü Sil
                </button>
                <div className="text-right">
                  <div className="text-xs text-secondary-500">Tahmini Toplam</div>
                  <div className="text-lg font-bold text-primary-600">
                    ₺{total.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ShoppingListFAB;
