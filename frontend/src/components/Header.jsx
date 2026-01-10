import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated, isSuperuser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-2xl font-bold text-orange-600">FoodShop</span>
          </Link>

          <nav className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
            >
              Trang chủ
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  Đơn hàng
                </Link>
                <Link
                  to="/cart"
                  className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  Giỏ hàng
                </Link>
                {isSuperuser && (
                  <Link
                    to="/admin"
                    className="text-gray-700 hover:text-orange-600 transition-colors font-medium"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  {user?.email || 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
