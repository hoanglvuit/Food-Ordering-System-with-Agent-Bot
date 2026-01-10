import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { vouchersAPI } from '../../services/api';

const AdminVouchers = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discount_type: 'fixed',
    discount_value: '',
    min_order_value: '',
    is_active: true,
  });

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const data = await vouchersAPI.getAll();
      setVouchers(data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
      addToast('Lỗi khi tải danh sách voucher', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await vouchersAPI.create({
        ...formData,
        discount_value: parseFloat(formData.discount_value),
        min_order_value: parseFloat(formData.min_order_value) || 0,
        code: formData.code || undefined, // Let backend generate if empty
      });
      setShowModal(false);
      resetForm();
      loadVouchers();
      addToast('Tạo voucher thành công!', 'success');
    } catch (error) {
      console.error('Error creating voucher:', error);
      addToast(error.response?.data?.detail || 'Lỗi khi tạo voucher', 'error');
    }
  };

  const handleDelete = async (voucherId) => {
    if (!confirm('Bạn có chắc muốn xóa voucher này?')) return;
    try {
      await vouchersAPI.delete(voucherId);
      loadVouchers();
      addToast('Xóa voucher thành công!', 'success');
    } catch (error) {
      console.error('Error deleting voucher:', error);
      addToast(error.response?.data?.detail || 'Lỗi khi xóa voucher', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      discount_type: 'fixed',
      discount_value: '',
      min_order_value: '',
      is_active: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Quản lý Voucher</h1>
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
              + Thêm voucher
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
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Giá trị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Đơn tối thiểu
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
                {vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {voucher.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-mono">
                      {voucher.code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {voucher.discount_type === 'fixed' ? 'Cố định' : 'Phần trăm'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {voucher.discount_type === 'fixed'
                        ? `${voucher.discount_value.toLocaleString('vi-VN')}₫`
                        : `${voucher.discount_value}%`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {voucher.min_order_value.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${voucher.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {voucher.is_active ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => handleDelete(voucher.id)}
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
            <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 transform transition-all animate-scale-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Thêm voucher mới
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên voucher *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã voucher (để trống để tự động tạo)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại giảm giá *
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="fixed">Cố định (VND)</option>
                    <option value="percent">Phần trăm (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá trị giảm giá *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step={formData.discount_type === 'percent' ? '0.1' : '1000'}
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={
                      formData.discount_type === 'fixed'
                        ? 'Ví dụ: 50000'
                        : 'Ví dụ: 10'
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn hàng tối thiểu (VND)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.min_order_value}
                    onChange={(e) =>
                      setFormData({ ...formData, min_order_value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

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
                    Tạo mới
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

export default AdminVouchers;
