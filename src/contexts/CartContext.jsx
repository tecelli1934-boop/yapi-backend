import { createContext, useContext, useReducer, useEffect, useState } from 'react';

const CartContext = createContext();

// Benzersiz anahtar oluştur
const generateItemKey = (item) => {
  const base = `${item._id || item.id}`;
  if (item.variationKey) return `${base}-${item.variationKey}`;
  return base;
};

const ACTIONS = {
  ADD_TO_CART: 'ADD_TO_CART',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_TO_CART: {
      const newItem = action.payload;
      const key = generateItemKey(newItem);
      
      const existingItem = state.items.find((item) => generateItemKey(item) === key);

      if (existingItem) {
        const updatedItems = state.items.map((item) => {
          if (generateItemKey(item) === key) {
            return {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: item.price * (item.quantity + 1)
            };
          }
          return item;
        });
        return { ...state, items: updatedItems };
      } else {
        const itemWithKey = { 
          ...newItem, 
          key,
          quantity: 1,
          totalPrice: newItem.price * 1
        };
        return { ...state, items: [...state.items, itemWithKey] };
      }
    }

    case ACTIONS.REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter((item) => item.key !== action.payload),
      };

    case ACTIONS.UPDATE_QUANTITY: {
      const { key, newQuantity } = action.payload;
      if (newQuantity < 1) return state;
      const updatedItems = state.items.map((item) => {
        if (item.key === key) {
          const updated = { ...item, quantity: newQuantity };
          updated.totalPrice = updated.price * updated.quantity;
          return updated;
        }
        return item;
      });
      return { ...state, items: updatedItems };
    }

    case ACTIONS.CLEAR_CART:
      return { items: [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : { items: [] };
    } catch {
      return { items: [] };
    }
  };
  const initialState = getInitialState();

  const [state, dispatch] = useReducer(cartReducer, initialState);
  const [notification, setNotification] = useState({ show: false, message: '' });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  // Bildirimi 3 saniye sonra otomatik kapat
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const addToCart = (product) => {
    dispatch({ type: ACTIONS.ADD_TO_CART, payload: product });
    setNotification({ show: true, message: 'Ürün sepete eklendi!' });
  };

  const removeFromCart = (key) => {
    dispatch({ type: ACTIONS.REMOVE_FROM_CART, payload: key });
  };

  const updateQuantity = (key, newQuantity) => {
    dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { key, newQuantity } });
  };

  const clearCart = () => {
    dispatch({ type: ACTIONS.CLEAR_CART });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '' });
  };

  return (
    <CartContext.Provider
      value={{
        cart: state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        notification,
        hideNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};