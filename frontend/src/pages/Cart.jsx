import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ordersAPI, vouchersAPI, shippingAPI } from '../services/api';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState('');
  const [vouchers, setVouchers] = useState([]);
  const [selectedVoucherId, setSelectedVoucherId] = useState('');
  const [loading, setLoading] = useState(false);
  const [shippingConfig, setShippingConfig] = useState({ base_fee: 0, price_per_km: 0 });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadVouchers();
    loadCart();
    loadShippingConfig();
  }, [isAuthenticated, navigate]);

  const loadCart = () => {
    const saved = localStorage.getItem('cart');
    if (saved) {
      setCartItems(JSON.parse(saved));
    }
  };

  const loadVouchers = async () => {
    try {
      const data = await vouchersAPI.getAll();
      setVouchers(data);
    } catch (error) {
      console.error('Error loading vouchers:', error);
    }
  };

  const loadShippingConfig = async () => {
    try {
      const config = await shippingAPI.getConfig();
      setShippingConfig(config);
    } catch (error) {
      console.error('Error loading shipping config:', error);
    }
  };

  const updateQuantity = (itemId, change) => {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item
      );
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
  };

  const removeItem = (itemId) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.id !== itemId);
      localStorage.setItem('cart', JSON.stringify(updated));
      return updated;
    });
    addToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const selectedVoucher = vouchers.find(v => v.id === parseInt(selectedVoucherId));

  const calculateTotal = () => {
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    let discount = 0;
    if (selectedVoucher) {
      if (selectedVoucher.discount_type === 'fixed' || selectedVoucher.discount_type === 'FIXED') {
        discount = selectedVoucher.discount_value;
      } else {
        discount = (subtotal * selectedVoucher.discount_value) / 100;
      }
    }

    // We only show base fee here. Actual fee depends on distance calculated on backend.
    const shipping = shippingConfig.base_fee;
    const final = subtotal - discount + shipping;
    // Round all values to avoid decimal display
    return {
      subtotal: Math.round(subtotal),
      discount: Math.round(discount),
      shipping: Math.round(shipping),
      final: Math.round(final)
    };
  };

  const handleCheckout = async () => {
    if (!address.trim()) {
      addToast('Vui lòng nhập địa chỉ giao hàng', 'warning');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        address: address,
        items: cartItems.map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
        })),
        voucher_code: selectedVoucher?.code || null,
      };

      await ordersAPI.create(orderData);
      localStorage.removeItem('cart');
      addToast('Đặt hàng thành công!', 'success');
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      addToast('Đặt hàng thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotal();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-6 flex gap-4"
              >
                {item.image_url && (
                  <img
                    src={`http://localhost:8000${item.image_url}`}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-orange-600 font-bold mb-4">
                    {item.price.toLocaleString('vi-VN')}₫
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="px-4 py-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin đơn hàng
              </h2>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder="Nhập địa chỉ của bạn"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn voucher giảm giá
                </label>
                <select
                  value={selectedVoucherId}
                  onChange={(e) => setSelectedVoucherId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Không sử dụng voucher --</option>
                  {vouchers.filter(v => v.is_active).map((voucher) => (
                    <option key={voucher.id} value={voucher.id}>
                      {voucher.name} - {voucher.discount_type === 'fixed' || voucher.discount_type === 'FIXED'
                        ? `${voucher.discount_value.toLocaleString('vi-VN')}₫`
                        : `${voucher.discount_value}%`} (Mã: {voucher.code})
                    </option>
                  ))}
                </select>
                {selectedVoucher && (
                  <p className="text-green-600 text-sm mt-2">
                    Đã chọn: {selectedVoucher.name}
                  </p>
                )}
              </div>

              <div className="border-t pt-4 space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{totals.subtotal.toLocaleString('vi-VN')}₫</span>
                </div>
                {selectedVoucher && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{totals.discount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Phí ship (ước tính từ):</span>
                  <span>{totals.shipping.toLocaleString('vi-VN')}₫</span>
                </div>
                <p className="text-xs text-gray-500 italic">
                  *Phí ship thực tế sẽ được tính dựa trên khoảng cách sau khi đặt hàng.
                </p>
                <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t">
                  <span>Tổng cộng (dự kiến):</span>
                  <span className="text-orange-600">
                    {totals.final.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || !address.trim()}
                className="w-full bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
