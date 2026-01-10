import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { itemsAPI } from '../services/api';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const data = await itemsAPI.getById(id);
      setItem(data);
    } catch (error) {
      console.error('Error loading item:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((i) => i.id === item.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: item.id,
        title: item.title,
        price: item.discount
          ? item.price * (1 - item.discount / 100)
          : item.price,
        image_url: item.image_url,
        quantity: quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    addToast(`Đã thêm ${quantity} "${item.title}" vào giỏ hàng`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Không tìm thấy sản phẩm</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finalPrice = item.discount
    ? item.price * (1 - item.discount / 100)
    : item.price;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/')}
          className="text-orange-600 hover:text-orange-700 mb-6 flex items-center gap-2"
        >
          ← Quay lại
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div>
              {item.image_url ? (
                <img
                  src={`http://localhost:8000${item.image_url}`}
                  alt={item.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-400">No Image</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {item.title}
              </h1>

              {item.description && (
                <p className="text-gray-600 mb-6">{item.description}</p>
              )}

              <div className="mb-6">
                {item.category && item.category.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Danh mục:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.category.map((cat, idx) => (
                        <span
                          key={idx}
                          className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.flavour && item.flavour.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">
                      Hương vị:
                    </span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.flavour.map((flav, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {flav}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  {item.discount ? (
                    <>
                      <span className="text-3xl font-bold text-orange-600">
                        {finalPrice.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        {item.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-bold">
                        -{item.discount}%
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-orange-600">
                      {item.price.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>
                {item.purchase_count > 0 && (
                  <p className="text-gray-500 text-sm">
                    Đã bán: {item.purchase_count}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label className="text-sm font-medium text-gray-700">
                  Số lượng:
                </label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-6 py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={addToCart}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium text-lg"
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
