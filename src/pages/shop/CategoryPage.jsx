import { useParams, Link } from 'react-router-dom';
import ProductCard from '../../components/product/ProductCard';
import { useProducts } from '../../contexts/ProductContext';
import { useCategories } from '../../contexts/CategoryContext';
import SEO from '../../components/common/SEO';

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const { products, loading, error } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();
  
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
          Aman! Kategori yüklenirken bir sorun oluştu: {error}
        </div>
      </div>
    );
  }

  // Slug'dan kategori bilgisini bul
  const category = categories.find(c => c.slug === categorySlug);
  const categoryId = category?.id;

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Kategori Bulunamadı</h3>
          <p className="text-red-700 mb-4">
            Aradığınız kategori mevcut değil.
          </p>
          <Link 
            to="/urunler" 
            className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition inline-block"
          >
            Tüm Ürünlere Git
          </Link>
        </div>
      </div>
    );
  }

  // Kategoriye göre ürünleri filtrele
  const categoryProducts = products.filter(product => 
    product.category === categoryId
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title={category.name}
        description={category.description || `${category.name} kategorisindeki kaliteli yapı malzemeleri.`}
        keywords={`${category.name}, yapı malzemeleri, hırdavat, ramazan seven`}
        url={`/kategori/${categorySlug}`}
      />
      {/* Kategori Başlığı */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-800 mb-4">{category.name}</h1>
        <p className="text-secondary-600">{category.description}</p>
      </div>

      {/* Ürünler */}
      {categoryProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-industrial p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-semibold text-secondary-800 mb-4">
            Bu Kategoride Henüz Ürün Yok
          </h2>
          <p className="text-secondary-600 mb-8">
            {category.name} kategorisinde yakında ürünler eklenecektir.
          </p>
          <Link 
            to="/urunler" 
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition inline-block"
          >
            Diğer Kategorilere Göz At
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-secondary-600">
            {categoryProducts.length} ürün bulundu
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id || product._id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryPage;
