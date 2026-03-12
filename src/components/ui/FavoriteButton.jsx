import { useFavorites } from '../../contexts/FavoritesContext';
import { Heart } from 'lucide-react';

const generateKey = (product) => {
  const id = product.id || product._id;
  const variation = product.variationKey || 'default';
  return `${id}-${variation}`;
};

const FavoriteButton = ({ product }) => {
  const { favorites, addFavorite, removeFavorite } = useFavorites();
  const key = generateKey(product);
  const isFav = favorites.items.some(item => generateKey(item) === key);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(key);
    } else {
      addFavorite(product);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:scale-110 transition ${
        isFav ? 'text-red-500' : 'text-secondary-400'
      }`}
    >
      <Heart className={isFav ? 'fill-red-500' : ''} size={20} />
    </button>
  );
};

export default FavoriteButton;