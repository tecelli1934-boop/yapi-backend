import { createContext, useContext, useState, useEffect } from 'react';

const ShoppingListContext = createContext();

export const ShoppingListProvider = ({ children }) => {
  const getInitialList = () => {
    try {
      const saved = localStorage.getItem('shoppingList');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const [items, setItems] = useState(getInitialList);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('shoppingList', JSON.stringify(items));
  }, [items]);

  const addItem = (name, quantity = 1, price = '') => {
    setItems(prev => [
      ...prev,
      { id: Date.now(), name, quantity, price, checked: false }
    ]);
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleChecked = (id) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item)
    );
  };

  const updateItem = (id, updates) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  };

  const clearChecked = () => {
    setItems(prev => prev.filter(item => !item.checked));
  };

  const clearAll = () => setItems([]);

  const total = items.reduce((sum, item) => {
    const p = parseFloat(item.price) || 0;
    return sum + p * item.quantity;
  }, 0);

  return (
    <ShoppingListContext.Provider
      value={{ items, isOpen, setIsOpen, addItem, removeItem, toggleChecked, updateItem, clearChecked, clearAll, total }}
    >
      {children}
    </ShoppingListContext.Provider>
  );
};

export const useShoppingList = () => {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error('useShoppingList must be used within ShoppingListProvider');
  return ctx;
};
