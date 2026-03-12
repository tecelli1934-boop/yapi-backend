import React, { useState } from 'react';
import { useCategories } from '../../contexts/CategoryContext';
import { Plus, Edit, Trash2, Save, XCircle, Eye, EyeOff, Check } from 'lucide-react';

const CategoryManagement = () => {
  const { categories, addCategory, updateCategory, deleteCategory, loading, error } = useCategories();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null); // Silinecek kategori ID'si
  const [formData, setFormData] = useState({
    name: '',
    parentId: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({ name: '', parentId: '', isActive: true });
    setEditingId(null);
    setShowForm(false);
    setConfirmingDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await addCategory(formData);
      }
      resetForm();
    } catch (err) {
      alert("Hata: " + err.message);
    }
  };

  const handleEdit = (category) => {
    setFormData({
      name: category.name,
      parentId: category.parentId || '',
      isActive: category.isActive !== undefined ? category.isActive : true
    });
    setEditingId(category.id);
    setShowForm(true);
    setConfirmingDelete(null);
  };

  const handleToggleStatus = async (category) => {
    try {
      await updateCategory(category.id, { 
        ...category,
        isActive: !category.isActive 
      });
    } catch (err) {
      alert("Görünürlük değiştirme hatası: " + err.message);
    }
  };

  const handleConfirmDelete = async (id) => {
    try {
      await deleteCategory(id);
      setConfirmingDelete(null);
    } catch (err) {
      alert("Silme hatası: " + err.message);
    }
  };

  if (loading) return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p className="text-secondary-500">Kategoriler yükleniyor...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg">
      <p className="font-bold">Hata oluştu:</p>
      <p>{error}</p>
    </div>
  );

  // Sadece ana kategoriler (parentId olmayanlar veya null/boş olanlar)
  const mainCategories = categories.filter(c => !c.parentId || c.parentId === '');

  // Hiyerarşik kategorilere göre tabloyu filtrele (görünümü düzenlemek için)
  const getSubcats = (pid) => categories.filter(c => c.parentId === pid);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-secondary-100">
        <div>
          <h2 className="text-2xl font-bold text-secondary-800">Kategori Yönetimi</h2>
          <p className="text-secondary-500 text-sm">Ürün kategorilerini ve hiyerarşiyi buradan yönetin.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg font-semibold"
        >
          <Plus className="w-5 h-5" /> Yeni Kategori
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-primary-100 p-6 mb-6 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary-600"></div>
          <h3 className="text-xl font-bold text-secondary-800 mb-6 flex items-center gap-2">
            {editingId ? <Edit className="w-5 h-5 text-primary-600" /> : <Plus className="w-5 h-5 text-primary-600" />}
            {editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 uppercase tracking-wider">Kategori Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Alüminyum Profiller"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-1.5 uppercase tracking-wider">Üst Kategori</label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="w-full px-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                >
                  <option value="">-- Ana Kategori (Ebeveyn Yok) --</option>
                  {mainCategories.map(cat => (
                    cat.id !== editingId && (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    )
                  ))}
                </select>
                <p className="text-xs text-secondary-500 mt-1.5 italic">Alt kategori ise buradan ana grubunu seçebilirsiniz.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary-50 p-3 rounded-lg border border-secondary-100">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-secondary-700 cursor-pointer">
                Bu kategori sitede aktif (görünür) olsun
              </label>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 pt-4 border-t border-secondary-100 mt-6">
              <button
                type="button"
                onClick={resetForm}
                className="order-2 md:order-1 px-5 py-2.5 border border-secondary-300 text-secondary-600 rounded-lg hover:bg-secondary-50 transition-all font-semibold flex items-center justify-center gap-2"
              >
                <XCircle className="w-5 h-5" /> Vazgeç
              </button>
              <button
                type="submit"
                className="order-1 md:order-2 flex items-center justify-center gap-2 px-8 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg active:scale-95 transition-all font-bold"
              >
                <Save className="w-5 h-5" /> {editingId ? 'Değişiklikleri Kaydet' : 'Kategoriyi Oluştur'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kategori Listesi */}
      <div className="bg-white rounded-xl shadow-industrial border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-secondary-900 border-b border-secondary-800">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-secondary-300 uppercase tracking-widest">Kategori ve Hiyerarşi</th>
                <th className="px-6 py-4 text-xs font-black text-secondary-300 uppercase tracking-widest">Durum</th>
                <th className="px-6 py-4 text-xs font-black text-secondary-300 uppercase tracking-widest text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center">
                    <div className="text-4xl mb-4">🗂️</div>
                    <p className="text-secondary-500 font-medium">Kategori listeniz henüz boş.</p>
                  </td>
                </tr>
              ) : (
                mainCategories.map(mainCat => {
                  const subs = getSubcats(mainCat.id);
                  const isPassive = mainCat.isActive === false;
                  const isConfirming = confirmingDelete === mainCat.id;

                  return (
                    <React.Fragment key={mainCat.id}>
                      <tr className={`hover:bg-primary-50/30 transition-colors ${isPassive ? 'bg-secondary-50/50' : 'bg-white'}`}>
                        <td className="px-6 py-5">
                          <div className={`font-bold transition-all ${isPassive ? 'text-secondary-400 line-through opacity-60' : 'text-secondary-800 text-lg'}`}>
                            {mainCat.name}
                          </div>
                          <div className="text-[10px] text-secondary-400 font-mono mt-1">ID: {mainCat.id}</div>
                        </td>
                        <td className="px-6 py-5">
                          {isPassive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary-100 text-secondary-600 rounded-full text-xs font-bold ring-1 ring-inset ring-secondary-200">
                              <EyeOff className="w-3 h-3" /> GİZLİ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold ring-1 ring-inset ring-green-600/20">
                              <Eye className="w-3 h-3" /> AKTİF
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end items-center gap-2">
                            {isConfirming ? (
                              <div className="flex items-center gap-2 bg-red-50 p-1.5 rounded-lg border border-red-100 animate-pulse">
                                <span className="text-[10px] font-bold text-red-600 px-2 uppercase">Silinsin mi?</span>
                                <button 
                                  onClick={() => handleConfirmDelete(mainCat.id)}
                                  className="bg-red-600 text-white p-2 rounded-md hover:bg-red-700 shadow-sm flex items-center gap-1 text-xs font-bold"
                                >
                                  <Save className="w-4 h-4" /> KAYDET VE SİL
                                </button>
                                <button 
                                  onClick={() => setConfirmingDelete(null)}
                                  className="bg-white border border-secondary-300 text-secondary-600 p-2 rounded-md hover:bg-secondary-50"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <button 
                                  onClick={() => handleToggleStatus(mainCat)}
                                  className={`p-2 rounded-md transition-all ${isPassive ? 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                  title={isPassive ? 'Aktif Et' : 'Pasife Al'}
                                >
                                  {isPassive ? <Eye className="w-4.4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button 
                                  onClick={() => handleEdit(mainCat)} 
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md transition-all"
                                  title="Düzenle"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setConfirmingDelete(mainCat.id)} 
                                  className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-all"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {subs.map(subCat => {
                        const subPassive = subCat.isActive === false;
                        const subConfirming = confirmingDelete === subCat.id;
                        return (
                          <tr key={subCat.id} className={`hover:bg-secondary-50 transition-colors ${subPassive ? 'bg-secondary-50/30' : 'bg-secondary-50/10'}`}>
                            <td className="px-6 py-3 pl-12 border-l-2 border-primary-100">
                              <div className={`flex items-center gap-2 ${subPassive ? 'opacity-50 grayscale' : ''}`}>
                                <span className="text-primary-300 font-bold">↳</span>
                                <span className={`font-semibold ${subPassive ? 'text-secondary-400 line-through' : 'text-secondary-700'}`}>{subCat.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3">
                              {subPassive ? (
                                <span className="text-[10px] font-black text-secondary-400">GİZLİ</span>
                              ) : (
                                <span className="text-[10px] font-black text-green-600/70">AKTİF</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end items-center gap-1.5 opacity-80 hover:opacity-100">
                                {subConfirming ? (
                                  <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-md border border-red-100">
                                    <button 
                                      onClick={() => handleConfirmDelete(subCat.id)}
                                      className="bg-red-600 text-white px-2 py-1 rounded text-[10px] font-bold"
                                    >
                                      SİL
                                    </button>
                                    <button onClick={() => setConfirmingDelete(null)}><XCircle className="w-3.5 h-3.5 text-secondary-400" /></button>
                                  </div>
                                ) : (
                                  <>
                                    <button 
                                      onClick={() => handleToggleStatus(subCat)}
                                      className={`p-1.5 rounded transition-all ${subPassive ? 'text-secondary-400' : 'text-green-500'}`}
                                    >
                                      {subPassive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>
                                    <button onClick={() => handleEdit(subCat)} className="p-1.5 text-blue-500"><Edit className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => setConfirmingDelete(subCat.id)} className="p-1.5 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;
