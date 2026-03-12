import { useState } from 'react';
import ProductCard from '../../components/product/ProductCard';
import { useProducts } from '../../contexts/ProductContext';
import { useCategories } from '../../contexts/CategoryContext';
import SEO from '../../components/common/SEO';


const AllProductsPage = () => {
  const { products, loading, error } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (loading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center shadow-sm">
          Aman! Ürünler yüklenirken bir sorun oluştu: {error}
        </div>
      </div>
    );
  }

  // Filter products - Move after loading checks
  const filteredProducts = (products || []).filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Tüm Ürünler"
        description="Geniş ürün yelpazemizdeki tüm yapı malzemelerini keşfedin. Alüminyum profiller, PVC aksesuarları ve daha fazlası."
        url="/urunler"
      />
      <h1 className="text-3xl font-bold text-secondary-800 mb-8">Tüm Ürünler</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-industrial p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Ürün Ara
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ürün adıyla ara..."
              className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-secondary-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories.filter(cat => (!cat.parentId || cat.parentId === '') && cat.isActive !== false).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-industrial p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
            {searchTerm ? 'Ürün Bulunamadı' : 'Bu Kategoride Ürün Yok'}
          </h2>
          <p className="text-secondary-600 mb-8">
            {searchTerm 
              ? `'${searchTerm}' için ürün bulunamadı. Farklı bir kelime deneyin.`
              : 'Bu kategoride henüz ürün eklenmemiş.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition"
            >
              Aramayı Temizle
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} product={product} />
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredProducts.length > 0 && (
        <div className="mt-8 text-center text-secondary-600">
          {filteredProducts.length} ürün bulundu
        </div>
      )}
    </div>
  );
};

export default AllProductsPage;
