import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Chào mừng, {user?.email || 'Admin'}!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/items"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">🍔</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Quản lý Sản phẩm
                </h3>
                <p className="text-gray-600 text-sm">Thêm, sửa, xóa sản phẩm</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/vouchers"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">🎫</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Quản lý Voucher
                </h3>
                <p className="text-gray-600 text-sm">Tạo và quản lý mã giảm giá</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">👥</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Quản lý Người dùng
                </h3>
                <p className="text-gray-600 text-sm">Xem và quản lý tài khoản</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">📦</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Quản lý Đơn hàng
                </h3>
                <p className="text-gray-600 text-sm">Xem tất cả đơn hàng</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/shipping"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Cấu hình Vận chuyển
                </h3>
                <p className="text-gray-600 text-sm">Thiết lập phí vận chuyển</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
