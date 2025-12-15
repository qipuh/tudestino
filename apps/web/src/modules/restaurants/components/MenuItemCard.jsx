import { Star, Leaf, Flame } from 'lucide-react';

function MenuItemCard({ item, onSelect }) {
  const getSpicyIndicator = (level) => {
    if (level === 0) return null;
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: level }, (_, i) => (
          <Flame key={i} size={14} className="text-red-500 fill-current" />
        ))}
      </div>
    );
  };

  return (
    <div
      onClick={() => onSelect && onSelect(item)}
      className={`bg-white border border-gray-200 rounded-lg p-4 ${
        onSelect ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
    >
      <div className="flex gap-4">
        {/* Imagen del plato */}
        {item.image && (
          <div className="w-24 h-24 flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}

        {/* Información del plato */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{item.name}</h4>
              {item.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
            <div className="text-lg font-bold text-primary ml-4">
              {item.currency === 'PEN' ? 'S/' : '$'} {item.price.toFixed(2)}
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-2">
            {item.isVegan && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                <Leaf size={12} />
                Vegano
              </span>
            )}
            {item.isVegetarian && !item.isVegan && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                <Leaf size={12} />
                Vegetariano
              </span>
            )}
            {item.isGlutenFree && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                Sin Gluten
              </span>
            )}
            {item.spicyLevel > 0 && getSpicyIndicator(item.spicyLevel)}
          </div>

          {/* Rating y popularidad */}
          <div className="flex items-center gap-4 text-sm">
            {item.averageRating > 0 && (
              <div className="flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="font-semibold">{item.averageRating.toFixed(1)}</span>
                {item.totalReviews > 0 && (
                  <span className="text-gray-500">({item.totalReviews})</span>
                )}
              </div>
            )}
            {item.orderCount > 0 && (
              <span className="text-gray-500">
                {item.orderCount} pedidos
              </span>
            )}
            {!item.isAvailable && (
              <span className="text-red-500 font-semibold">No disponible</span>
            )}
          </div>

          {/* Ingredientes */}
          {item.ingredients && item.ingredients.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {item.ingredients.join(', ')}
            </p>
          )}

          {/* Alérgenos */}
          {item.allergens && item.allergens.length > 0 && (
            <p className="text-xs text-orange-600 mt-1">
              ⚠️ Contiene: {item.allergens.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MenuItemCard;
