import { createContext, useContext, useReducer, useEffect } from 'react';

const FavoritesContext = createContext();

const ACTIONS = {
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  CLEAR_FAVORITES: 'CLEAR_FAVORITES',
};

// Favori ürün benzersiz anahtarı (ürün id + varyasyon)
const generateFavoriteKey = (product) => {
  const id = product.id || product._id;
  return `${id}-${product.variationKey || 'default'}`;
};

const favoritesReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_FAVORITE: {
      const product = action.payload;
      const key = generateFavoriteKey(product);
      const exists = state.items.some((item) => generateFavoriteKey(item) === key);
      if (exists) return state;
      return { ...state, items: [...state.items, { ...product, favoriteKey: key }] };
    }
    case ACTIONS.REMOVE_FAVORITE: {
      return {
        ...state,
        items: state.items.filter((item) => generateFavoriteKey(item) !== action.payload),
      };
    }
    case ACTIONS.CLEAR_FAVORITES:
      return { items: [] };
    default:
      return state;
  }
};

export const FavoritesProvider = ({ children }) => {
  const storedFavorites = localStorage.getItem('favorites');
  const initialState = storedFavorites ? JSON.parse(storedFavorites) : { items: [] };

  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(state));
  }, [state]);

  const addFavorite = (product) => {
    dispatch({ type: ACTIONS.ADD_FAVORITE, payload: product });
  };

  const removeFavorite = (key) => {
    dispatch({ type: ACTIONS.REMOVE_FAVORITE, payload: key });
  };

  const clearFavorites = () => {
    dispatch({ type: ACTIONS.CLEAR_FAVORITES });
  };

  const isFavorite = (product) => {
    const key = generateFavoriteKey(product);
    return state.items.some((item) => generateFavoriteKey(item) === key);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites: state,
        addFavorite,
        removeFavorite,
        clearFavorites,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};