import { Link } from 'react-router-dom';

const ItemCard = ({ item }) => {
  const finalPrice = item.discount
    ? item.price * (1 - item.discount / 100)
    : item.price;

  return (
    <Link
      to={`/item/${item.id}`}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative">
        {item.image_url ? (
          <img
            src={`http://localhost:8000${item.image_url}`}
            alt={item.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        {item.discount && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            -{item.discount}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {item.title}
        </h3>
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {item.discount ? (
              <>
                <span className="text-orange-600 font-bold text-lg">
                  {finalPrice.toLocaleString('vi-VN')}₫
                </span>
                <span className="text-gray-400 line-through text-sm">
                  {item.price.toLocaleString('vi-VN')}₫
                </span>
              </>
            ) : (
              <span className="text-orange-600 font-bold text-lg">
                {item.price.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
          {item.purchase_count > 0 && (
            <span className="text-gray-500 text-xs">
              Đã bán: {item.purchase_count}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
