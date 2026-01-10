import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { itemsAPI, adminItemsAPI } from '../../services/api';

const AdminItems = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    discount: '',
    category: [],
    flavour: [],
    image: null,
    is_active: true,
  });

  const categories = ['main_dish', 'dessert', 'drink', 'side'];
  const flavours = ['spicy', 'sour', 'sweet', 'salty', 'bitter'];

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await itemsAPI.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
      addToast('Lỗi khi tải danh sách sản phẩm', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        // Update - Note: Backend may not have PUT endpoint yet
        try {
          await adminItemsAPI.update(editingItem.id, {
            ...formData,
            price: parseInt(formData.price),
            discount: formData.discount ? parseFloat(formData.discount) : null,
          });
          addToast('Cập nhật thành công!', 'success');
        } catch (updateError) {
          if (updateError.message?.includes('chưa được implement')) {
            addToast('Tính năng cập nhật chưa được hỗ trợ. Vui lòng thêm endpoint PUT /items/:id vào backend.', 'info');
            return;
          }
          throw updateError;
        }
      } else {
        await adminItemsAPI.create({
          ...formData,
          price: parseInt(formData.price),
          discount: formData.discount ? parseFloat(formData.discount) : null,
        });
        addToast('Tạo sản phẩm thành công!', 'success');
      }
      setShowModal(false);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      addToast(
        error.message ||
        error.response?.data?.detail ||
        (editingItem
          ? 'Lỗi khi cập nhật sản phẩm'
          : 'Lỗi khi tạo sản phẩm'),
        'error'
      );
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      price: '',
      description: '',
      discount: '',
      category: [],
      flavour: [],
      image: null,
      is_active: true,
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      price: item.price || '',
      description: item.description || '',
      discount: item.discount || '',
      category: item.category || [],
      flavour: item.flavour || [],
      image: null,
      is_active: item.is_active !== undefined ? item.is_active : true,
    });
    setShowModal(true);
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await adminItemsAPI.delete(itemId);
      loadItems();
      addToast('Xóa sản phẩm thành công!', 'success');
    } catch (error) {
      console.error('Error deleting item:', error);
      if (error.message?.includes('chưa được implement')) {
        addToast('Tính năng xóa chưa được hỗ trợ. Vui lòng thêm endpoint DELETE /items/:id vào backend.', 'info');
      } else {
        addToast(error.message || error.response?.data?.detail || 'Lỗi khi xóa sản phẩm', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Sản phẩm</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/admin')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              + Thêm sản phẩm
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hình ảnh
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giảm giá
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      {item.image_url ? (
                        <img
                          src={`http://localhost:8000${item.image_url}`}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded"></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description?.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.price.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.discount ? `${item.discount}%` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${item.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {item.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity animate-fade-in">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transform transition-all animate-scale-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editingItem ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giảm giá (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.category.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                category: [...formData.category, cat],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                category: formData.category.filter((c) => c !== cat),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hương vị
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {flavours.map((flav) => (
                      <label key={flav} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.flavour.includes(flav)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                flavour: [...formData.flavour, flav],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                flavour: formData.flavour.filter((f) => f !== flav),
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-700">{flav}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hình ảnh
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.files[0] })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {editingItem && (
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({ ...formData, is_active: e.target.checked })
                        }
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Hoạt động</span>
                    </label>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingItem ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminItems;
