import { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown, Plus, Minus } from 'lucide-react';

function GuestSelector({ adults, children, onUpdate, maxGuests = 10 }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const totalGuests = adults + children;

  const handleIncrement = (type) => {
    if (totalGuests >= maxGuests) return;

    if (type === 'adults') {
      onUpdate({ adults: adults + 1, children });
    } else {
      onUpdate({ adults, children: children + 1 });
    }
  };

  const handleDecrement = (type) => {
    if (type === 'adults' && adults > 1) {
      onUpdate({ adults: adults - 1, children });
    } else if (type === 'children' && children > 0) {
      onUpdate({ adults, children: children - 1 });
    }
  };

  const getGuestText = () => {
    const parts = [];
    if (adults > 0) {
      parts.push(`${adults} ${adults === 1 ? 'adulto' : 'adultos'}`);
    }
    if (children > 0) {
      parts.push(`${children} ${children === 1 ? 'niño' : 'niños'}`);
    }
    return parts.join(', ') || '0 huéspedes';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 border rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary transition"
      >
        <div className="flex items-center gap-2">
          <Users size={18} className="text-gray-600" />
          <span className="text-sm font-medium text-gray-900">{getGuestText()}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-xl shadow-xl z-50 py-4 px-4">
          {/* Adultos */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Adultos</p>
              <p className="text-xs text-gray-500">13 años o más</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDecrement('adults')}
                disabled={adults <= 1}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition
                  ${adults <= 1
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }
                `}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{adults}</span>
              <button
                type="button"
                onClick={() => handleIncrement('adults')}
                disabled={totalGuests >= maxGuests}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition
                  ${totalGuests >= maxGuests
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }
                `}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Niños */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1">
              <p className="font-semibold text-gray-900">Niños</p>
              <p className="text-xs text-gray-500">0 - 12 años</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleDecrement('children')}
                disabled={children <= 0}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition
                  ${children <= 0
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }
                `}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold text-gray-900">{children}</span>
              <button
                type="button"
                onClick={() => handleIncrement('children')}
                disabled={totalGuests >= maxGuests}
                className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center transition
                  ${totalGuests >= maxGuests
                    ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                    : 'border-primary text-primary hover:bg-primary hover:text-white'
                  }
                `}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Info de capacidad */}
          <div className="pt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">
                Total: {totalGuests} de {maxGuests} huéspedes
              </span>
              {totalGuests >= maxGuests && (
                <span className="text-amber-600 font-medium">
                  Capacidad máxima alcanzada
                </span>
              )}
            </div>
            <div className="mt-2 bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  totalGuests >= maxGuests ? 'bg-amber-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min((totalGuests / maxGuests) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Botón Cerrar */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full mt-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition"
          >
            Listo
          </button>
        </div>
      )}
    </div>
  );
}

export default GuestSelector;
