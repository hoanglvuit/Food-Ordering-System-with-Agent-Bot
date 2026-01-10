import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { shippingAPI } from '../../services/api';

const AdminShipping = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    base_fee: 30000,
    price_per_km: 5000,
    is_active: true,
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await shippingAPI.getConfig();
      setConfig(data);
      if (data) {
        setFormData({
          base_fee: data.base_fee || 30000,
          price_per_km: data.price_per_km || 5000,
          is_active: data.is_active !== undefined ? data.is_active : true,
        });
      }
    } catch (error) {
      console.error('Error loading shipping config:', error);
      addToast('Lỗi khi tải cấu hình vận chuyển', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await shippingAPI.updateConfig({
        ...formData,
        base_fee: parseFloat(formData.base_fee),
        price_per_km: parseFloat(formData.price_per_km),
      });
      loadConfig();
      addToast('Cập nhật cấu hình thành công!', 'success');
    } catch (error) {
      console.error('Error updating shipping config:', error);
      addToast(error.response?.data?.detail || 'Lỗi khi cập nhật cấu hình', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Cấu hình Vận chuyển
          </h1>
          <button
            onClick={() => navigate('/admin')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Quay lại
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Cài đặt phí vận chuyển
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phí cơ bản (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.base_fee}
                    onChange={(e) =>
                      setFormData({ ...formData, base_fee: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Phí cố định cho mỗi đơn hàng
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá mỗi km (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={formData.price_per_km}
                    onChange={(e) =>
                      setFormData({ ...formData, price_per_km: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Phí tính theo khoảng cách vận chuyển
                  </p>
                </div>

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
                    <span className="text-sm text-gray-700">Kích hoạt</span>
                  </label>
                </div>

                {config && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">
                      Cấu hình hiện tại:
                    </h3>
                    <p className="text-sm text-gray-600">
                      Phí cơ bản: {config.base_fee?.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-sm text-gray-600">
                      Giá mỗi km: {config.price_per_km?.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-sm text-gray-600">
                      Trạng thái:{' '}
                      {config.is_active ? 'Đang hoạt động' : 'Không hoạt động'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => loadConfig()}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Lưu cấu hình
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

export default AdminShipping;
