import { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import FavoriteButton from '../ui/FavoriteButton';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [imageError, setImageError] = useState(false);
  const isAddingRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (product.variations) {
      if (product.variations.type === 'length') {
        setSelectedVariation(product.variations.options[0]);
      } else if (product.variations.type === 'color' || product.variations.type === 'technical') {
        setSelectedVariation(product.variations.options[0]);
      } else if (product.variations.type === 'combined') {
        setSelectedVariation({
          dimension: product.variations.dimensions[0].size,
          color: product.variations.colors[0].value,
        });
      }
    }
  }, [product]);

  const getCurrentPrice = () => {
    if (!product.variations) return product.price || product.basePrice || 0;
    switch (product.variations.type) {
      case 'length':
        return (product.basePrice * selectedVariation) / 100;
      case 'color':
      case 'technical':
        return selectedVariation?.price || product.basePrice;
      case 'combined':
        const dim = product.variations.dimensions.find(d => d.size === selectedVariation?.dimension);
        return dim?.price || product.basePrice;
      default:
        return product.price || product.basePrice || 0;
    }
  };

  const handleAddToCart = () => {
    if (isAddingRef.current) return;
    
    isAddingRef.current = true;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const cartItem = {
      id: product.id || product._id,
      name: product.name,
      image: product.image,
      price: getCurrentPrice(),
      quantity: 1,
    };

    if (product.variations) {
      if (product.variations.type === 'length') {
        cartItem.selectedLength = selectedVariation;
        cartItem.variationText = `${selectedVariation} cm`;
        cartItem.variationKey = `len-${selectedVariation}`;
      } else if (product.variations.type === 'color') {
        cartItem.selectedColor = selectedVariation.value;
        cartItem.variationText = selectedVariation.value;
        cartItem.variationKey = `color-${selectedVariation.value}`;
      } else if (product.variations.type === 'technical') {
        cartItem.selectedTech = selectedVariation.value;
        cartItem.variationText = selectedVariation.value;
        cartItem.variationKey = `tech-${selectedVariation.value}`;
      } else if (product.variations.type === 'combined') {
        cartItem.selectedDimension = selectedVariation.dimension;
        cartItem.selectedColor = selectedVariation.color;
        cartItem.variationText = `${selectedVariation.dimension} / ${selectedVariation.color}`;
        cartItem.variationKey = `dim-${selectedVariation.dimension}-color-${selectedVariation.color}`;
      }
    } else {
      cartItem.variationKey = 'default';
      cartItem.variationText = '';
    }

    addToCart(cartItem);
    
    timeoutRef.current = setTimeout(() => {
      isAddingRef.current = false;
      timeoutRef.current = null;
    }, 2000);
  };

  const renderVariations = () => {
    if (!product.variations) return null;

    switch (product.variations.type) {
      case 'length':
        return (
          <div className="mb-4">
            <label className="block text-sm text-secondary-600 mb-1">Uzunluk (cm):</label>
            <select
              value={selectedVariation}
              onChange={(e) => setSelectedVariation(Number(e.target.value))}
              className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              {product.variations.options.map((len) => (
                <option key={len} value={len}>{len} cm</option>
              ))}
            </select>
          </div>
        );

      case 'color':
        return (
          <div className="mb-4">
            <label className="block text-sm text-secondary-600 mb-1">Renk:</label>
            <div className="flex gap-2">
              {product.variations.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSelectedVariation(opt)}
                  className={`w-8 h-8 rounded-full border-2 ${
                    selectedVariation?.value === opt.value
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-secondary-300'
                  }`}
                  style={{ backgroundColor: opt.color }}
                  title={opt.value}
                />
              ))}
            </div>
          </div>
        );

      case 'technical':
        return (
          <div className="mb-4">
            <label className="block text-sm text-secondary-600 mb-1">Tip:</label>
            <select
              value={selectedVariation?.value}
              onChange={(e) => {
                const opt = product.variations.options.find(o => o.value === e.target.value);
                setSelectedVariation(opt);
              }}
              className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
            >
              {product.variations.options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.value}</option>
              ))}
            </select>
          </div>
        );

      case 'combined':
        return (
          <div className="space-y-2 mb-4">
            <div>
              <label className="block text-sm text-secondary-600 mb-1">Ölçü:</label>
              <select
                value={selectedVariation?.dimension}
                onChange={(e) =>
                  setSelectedVariation({ ...selectedVariation, dimension: e.target.value })
                }
                className="w-full p-2 border border-secondary-300 rounded-md focus:ring-2 focus:ring-primary-500"
              >
                {product.variations.dimensions.map((dim) => (
                  <option key={dim.size} value={dim.size}>{dim.size}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-secondary-600 mb-1">Renk:</label>
              <div className="flex gap-2">
                {product.variations.colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      setSelectedVariation({ ...selectedVariation, color: color.value })
                    }
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedVariation?.color === color.value
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-secondary-300'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.value}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-industrial p-4 flex flex-col border border-secondary-200 hover:shadow-lg transition relative">
      <FavoriteButton product={product} />
      
      {/* Tükendi Rozeti */}
      {product.stock <= 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
          Tükendi
        </div>
      )}

      {/* Resim alanı - hata durumunda placeholder */}
      {imageError ? (
        <div className={`w-full h-48 bg-secondary-200 flex items-center justify-center mb-4 rounded ${product.stock <= 0 ? 'opacity-50' : ''}`}>
          <span className="text-secondary-500 text-sm">Resim yüklenemedi</span>
        </div>
      ) : (
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-48 object-contain mb-4 ${product.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
          onError={() => setImageError(true)}
        />
      )}

      <h3 className="text-lg font-semibold text-secondary-800 mb-1">{product.name}</h3>

      {product.description && (
        <p className="text-sm text-secondary-500 mb-2 line-clamp-2">{product.description}</p>
      )}

      {renderVariations()}

      <div className="mt-2 mb-4">
        {/* İndirim durumu varsa eski fiyatı üstünü çizerek göster */}
        {product.basePrice && product.price && product.basePrice > product.price ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-secondary-400 line-through">
              {product.basePrice.toFixed(2)} TL
            </span>
            <div className="text-xl font-bold text-red-600">
              {getCurrentPrice().toFixed(2)} TL
            </div>
          </div>
        ) : (
          <div className="text-xl font-bold text-secondary-900">
            {getCurrentPrice().toFixed(2)} TL
          </div>
        )}

        {product.variations?.type === 'length' && (
          <span className="text-sm font-normal text-secondary-500 mt-1 block">
            (Birim: {product.basePrice} TL/m)
          </span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (product.stock > 0) handleAddToCart();
        }}
        onMouseDown={(e) => e.preventDefault()}
        disabled={product.stock <= 0}
        className={`mt-auto w-full font-medium py-2 px-4 rounded-md transition ${
          product.stock <= 0 
            ? 'bg-secondary-200 text-secondary-500 cursor-not-allowed' 
            : 'bg-primary-600 hover:bg-primary-700 text-white'
        }`}
      >
        {product.stock <= 0 ? 'Tükendi' : 'Sepete Ekle'}
      </button>
    </div>
  );
};

export default ProductCard;