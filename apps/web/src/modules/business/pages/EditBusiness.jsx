import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import useBusiness from '../hooks/useBusiness';
import ImageUpload from '../../../components/ImageUpload';
import BusinessLayout from '../components/BusinessLayout';
import { useSidebar } from '../../../contexts/SidebarContext';

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon para el marcador
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Componente para manejar clics en el mapa
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

// Componente para actualizar la vista del mapa
function MapUpdater({ center }) {
  const map = useMapEvents({});

  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);

  return null;
}

const businessTypes = [
  { value: 'hotel', label: 'Hotel / Alojamiento', icon: 'bed-outline', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { value: 'restaurant', label: 'Restaurante', icon: 'restaurant-outline', color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { value: 'entertainment', label: 'Entretenimiento', icon: 'musical-notes-outline', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { value: 'tours', label: 'Tours y Excursiones', icon: 'map-outline', color: 'text-green-600', bgColor: 'bg-green-50' },
  { value: 'transport', label: 'Transporte', icon: 'car-outline', color: 'text-gray-600', bgColor: 'bg-gray-50', comingSoon: true },
  { value: 'spa', label: 'Spa y Bienestar', icon: 'sparkles-outline', color: 'text-pink-600', bgColor: 'bg-pink-50' },
];

// Configuración de subtipos de alojamiento y sus categorías
const hotelSubtypes = {
  hotel: {
    label: 'Hotel',
    icon: 'business-outline',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    categories: [
      { value: '1-star', label: '1 Estrella', stars: 1 },
      { value: '2-star', label: '2 Estrellas', stars: 2 },
      { value: '3-star', label: '3 Estrellas', stars: 3 },
      { value: '4-star', label: '4 Estrellas', stars: 4 },
      { value: '5-star', label: '5 Estrellas', stars: 5 },
      { value: '5-star-grand', label: '5 Estrellas Gran Lujo', stars: 5, grand: true },
    ]
  },
  hostel: {
    label: 'Hostal / Albergue',
    icon: 'home-outline',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    categories: [
      { value: 'basic', label: 'Básica' },
      { value: 'standard', label: 'Estándar' },
      { value: 'superior', label: 'Superior' },
    ]
  },
  apartment: {
    label: 'Apartamento Turístico',
    icon: 'apps-outline',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    categories: [
      { value: '1-key', label: '1 Llave', keys: 1 },
      { value: '2-key', label: '2 Llaves', keys: 2 },
      { value: '3-key', label: '3 Llaves', keys: 3 },
      { value: '4-key', label: '4 Llaves', keys: 4 },
      { value: '5-key', label: '5 Llaves', keys: 5 },
    ]
  },
  bnb: {
    label: 'Bed & Breakfast',
    icon: 'bed-outline',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    categories: [
      { value: 'basic', label: 'Básica' },
      { value: 'standard', label: 'Estándar' },
      { value: 'superior', label: 'Superior' },
    ]
  },
  resort: {
    label: 'Resort / Complejo',
    icon: 'water-outline',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    categories: [
      { value: '3-star', label: '3 Estrellas', stars: 3 },
      { value: '4-star', label: '4 Estrellas', stars: 4 },
      { value: '5-star', label: '5 Estrellas', stars: 5 },
    ]
  },
  villa: {
    label: 'Villa / Chalet',
    icon: 'home-sharp',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    categories: [
      { value: 'standard', label: 'Estándar' },
      { value: 'superior', label: 'Superior' },
      { value: 'luxury', label: 'De Lujo' },
    ]
  },
  guesthouse: {
    label: 'Posada / Casa Rural',
    icon: 'leaf-outline',
    color: 'text-lime-600',
    bgColor: 'bg-lime-50',
    borderColor: 'border-lime-200',
    categories: [
      { value: '1-spike', label: '1 Espiga', spikes: 1 },
      { value: '2-spike', label: '2 Espigas', spikes: 2 },
      { value: '3-spike', label: '3 Espigas', spikes: 3 },
      { value: '4-spike', label: '4 Espigas', spikes: 4 },
      { value: '5-spike', label: '5 Espigas', spikes: 5 },
    ]
  },
  motel: {
    label: 'Motel',
    icon: 'car-outline',
    color: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    categories: [
      { value: '1-star', label: '1 Estrella', stars: 1 },
      { value: '2-star', label: '2 Estrellas', stars: 2 },
      { value: '3-star', label: '3 Estrellas', stars: 3 },
    ]
  },
  homestay: {
    label: 'Casa Particular',
    icon: 'people-outline',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    categories: [
      { value: 'unrated', label: 'Sin categoría oficial' },
    ]
  },
  parador: {
    label: 'Parador',
    icon: 'library-outline',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    categories: [
      { value: '3-star', label: '3 Estrellas', stars: 3 },
      { value: '4-star', label: '4 Estrellas', stars: 4 },
      { value: '5-star', label: '5 Estrellas', stars: 5 },
    ]
  },
  glamping: {
    label: 'Glamping',
    icon: 'bonfire-outline',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    categories: [
      { value: 'basic', label: 'Básica' },
      { value: 'luxury', label: 'Lujo' },
      { value: 'ultra-luxury', label: 'Ultra Lujo' },
    ]
  },
  youth_hostel: {
    label: 'Albergue Juvenil',
    icon: 'backpack-outline',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    categories: [
      { value: '1-backpack', label: '1 Mochila', backpacks: 1 },
      { value: '2-backpack', label: '2 Mochilas', backpacks: 2 },
      { value: '3-backpack', label: '3 Mochilas', backpacks: 3 },
    ]
  },
  pension: {
    label: 'Pensión',
    icon: 'business-outline',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    categories: [
      { value: '1-star', label: '1 Estrella', stars: 1 },
      { value: '2-star', label: '2 Estrellas', stars: 2 },
      { value: '3-star', label: '3 Estrellas', stars: 3 },
    ]
  },
};

// Configuración de tipos de restaurantes y categorías gastronómicas
const restaurantSubtypes = {
  fine_dining: {
    label: 'Alta Cocina / Fine Dining',
    icon: 'diamond-outline',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    cuisineTypes: [
      { value: 'peruvian', label: 'Peruana', icon: '🇵🇪' },
      { value: 'fusion', label: 'Fusión', icon: '🌟' },
      { value: 'international', label: 'Internacional', icon: '🌍' },
      { value: 'french', label: 'Francesa', icon: '🇫🇷' },
      { value: 'italian', label: 'Italiana', icon: '🇮🇹' },
      { value: 'japanese', label: 'Japonesa', icon: '🇯🇵' },
      { value: 'mediterranean', label: 'Mediterránea', icon: '🫒' },
      { value: 'molecular', label: 'Molecular', icon: '⚗️' },
    ]
  },
  casual: {
    label: 'Restaurante Casual',
    icon: 'restaurant-outline',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    cuisineTypes: [
      { value: 'peruvian', label: 'Peruana', icon: '🇵🇪' },
      { value: 'criolla', label: 'Criolla', icon: '🍲' },
      { value: 'italian', label: 'Italiana', icon: '🇮🇹' },
      { value: 'chinese', label: 'China / Chifa', icon: '🥢' },
      { value: 'mexican', label: 'Mexicana', icon: '🇲🇽' },
      { value: 'american', label: 'Americana', icon: '🇺🇸' },
      { value: 'international', label: 'Internacional', icon: '🌍' },
      { value: 'vegetarian', label: 'Vegetariana', icon: '🥗' },
    ]
  },
  cevicheria: {
    label: 'Cevichería',
    icon: 'fish-outline',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    cuisineTypes: [
      { value: 'peruvian_seafood', label: 'Mariscos Peruanos', icon: '🦐' },
      { value: 'traditional', label: 'Tradicional', icon: '🐟' },
      { value: 'fusion', label: 'Fusión Marina', icon: '🌊' },
    ]
  },
  parrilla: {
    label: 'Parrilla / Steakhouse',
    icon: 'flame-outline',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    cuisineTypes: [
      { value: 'argentine', label: 'Argentina', icon: '🇦🇷' },
      { value: 'peruvian', label: 'Peruana', icon: '🇵🇪' },
      { value: 'brazilian', label: 'Brasileña', icon: '🇧🇷' },
      { value: 'uruguayan', label: 'Uruguaya', icon: '🇺🇾' },
    ]
  },
  pizzeria: {
    label: 'Pizzería',
    icon: 'pizza-outline',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    cuisineTypes: [
      { value: 'italian', label: 'Italiana Tradicional', icon: '🇮🇹' },
      { value: 'neapolitan', label: 'Napolitana', icon: '🍕' },
      { value: 'gourmet', label: 'Gourmet', icon: '✨' },
      { value: 'casual', label: 'Casual', icon: '🍴' },
    ]
  },
  fast_food: {
    label: 'Comida Rápida',
    icon: 'fast-food-outline',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    cuisineTypes: [
      { value: 'burgers', label: 'Hamburguesas', icon: '🍔' },
      { value: 'chicken', label: 'Pollo', icon: '🍗' },
      { value: 'pizza', label: 'Pizza', icon: '🍕' },
      { value: 'sandwiches', label: 'Sándwiches', icon: '🥪' },
      { value: 'mexican', label: 'Mexicana', icon: '🌮' },
    ]
  },
  buffet: {
    label: 'Buffet',
    icon: 'fast-food-outline',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    cuisineTypes: [
      { value: 'international', label: 'Internacional', icon: '🌍' },
      { value: 'peruvian', label: 'Peruana', icon: '🇵🇪' },
      { value: 'chinese', label: 'China', icon: '🥢' },
      { value: 'mixed', label: 'Mixto', icon: '🍽️' },
    ]
  },
  cafeteria: {
    label: 'Cafetería / Café',
    icon: 'cafe-outline',
    color: 'text-brown-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    cuisineTypes: [
      { value: 'specialty_coffee', label: 'Café de Especialidad', icon: '☕' },
      { value: 'bakery', label: 'Pastelería', icon: '🥐' },
      { value: 'brunch', label: 'Brunch', icon: '🥞' },
      { value: 'desserts', label: 'Postres', icon: '🍰' },
    ]
  },
  peruvian: {
    label: 'Restaurante Peruano Especializado',
    icon: 'restaurant-outline',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    cuisineTypes: [
      { value: 'nikkei', label: 'Nikkei', icon: '🍱' },
      { value: 'amazonian', label: 'Amazónica', icon: '🌿' },
      { value: 'andean', label: 'Andina', icon: '🏔️' },
      { value: 'coastal', label: 'Costeña', icon: '🌊' },
      { value: 'novo_andino', label: 'Novo Andino', icon: '⛰️' },
    ]
  },
  vegetarian: {
    label: 'Vegetariano / Vegano',
    icon: 'leaf-outline',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    cuisineTypes: [
      { value: 'vegetarian', label: 'Vegetariano', icon: '🥗' },
      { value: 'vegan', label: 'Vegano', icon: '🌱' },
      { value: 'organic', label: 'Orgánico', icon: '🌿' },
      { value: 'healthy', label: 'Saludable', icon: '💚' },
    ]
  },
  asian: {
    label: 'Cocina Asiática',
    icon: 'restaurant-outline',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    cuisineTypes: [
      { value: 'chinese', label: 'China / Chifa', icon: '🥢' },
      { value: 'japanese', label: 'Japonesa', icon: '🇯🇵' },
      { value: 'thai', label: 'Tailandesa', icon: '🇹🇭' },
      { value: 'korean', label: 'Coreana', icon: '🇰🇷' },
      { value: 'vietnamese', label: 'Vietnamita', icon: '🇻🇳' },
      { value: 'fusion', label: 'Fusión Asiática', icon: '🌏' },
    ]
  },
  bar_restaurant: {
    label: 'Bar Restaurante',
    icon: 'beer-outline',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    cuisineTypes: [
      { value: 'tapas', label: 'Tapas', icon: '🍢' },
      { value: 'pub_food', label: 'Comida de Pub', icon: '🍺' },
      { value: 'international', label: 'Internacional', icon: '🌍' },
      { value: 'casual', label: 'Casual', icon: '🍴' },
    ]
  },
  bistro: {
    label: 'Bistró',
    icon: 'wine-outline',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    cuisineTypes: [
      { value: 'french', label: 'Francesa', icon: '🇫🇷' },
      { value: 'mediterranean', label: 'Mediterránea', icon: '🫒' },
      { value: 'fusion', label: 'Fusión', icon: '✨' },
      { value: 'contemporary', label: 'Contemporánea', icon: '🍷' },
    ]
  },
};

// Configuración de tipos de entretenimiento y sus categorías
const entertainmentSubtypes = {
  bar: {
    label: 'Bar / Pub',
    icon: 'beer-outline',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    categories: [
      { value: 'sports_bar', label: 'Bar Deportivo', icon: '⚽' },
      { value: 'irish_pub', label: 'Pub Irlandés', icon: '🍀' },
      { value: 'wine_bar', label: 'Bar de Vinos', icon: '🍷' },
      { value: 'cocktail_bar', label: 'Bar de Cócteles', icon: '🍸' },
      { value: 'beer_bar', label: 'Bar Cervecero', icon: '🍺' },
      { value: 'lounge', label: 'Lounge Bar', icon: '🛋️' },
    ]
  },
  nightclub: {
    label: 'Discoteca / Club Nocturno',
    icon: 'radio-outline',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    categories: [
      { value: 'nightclub', label: 'Discoteca General', icon: '🎵' },
      { value: 'electronic', label: 'Música Electrónica', icon: '🎧' },
      { value: 'latin', label: 'Música Latina', icon: '💃' },
      { value: 'reggaeton', label: 'Reggaetón', icon: '🔥' },
      { value: 'rock', label: 'Rock', icon: '🎸' },
      { value: 'mixed', label: 'Música Variada', icon: '🎶' },
    ]
  },
  karaoke: {
    label: 'Karaoke',
    icon: 'mic-outline',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    categories: [
      { value: 'karaoke_bar', label: 'Karaoke Bar', icon: '🎤' },
      { value: 'karaoke_private', label: 'Karaoke Privado (Cabinas)', icon: '🚪' },
      { value: 'karaoke_restaurant', label: 'Karaoke Restaurante', icon: '🍽️' },
    ]
  },
  casino: {
    label: 'Casino / Juegos',
    icon: 'game-controller-outline',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    categories: [
      { value: 'casino', label: 'Casino', icon: '🎰' },
      { value: 'slots', label: 'Sala de Tragamonedas', icon: '🎲' },
      { value: 'poker', label: 'Sala de Póker', icon: '🃏' },
      { value: 'bingo', label: 'Bingo', icon: '🎯' },
    ]
  },
  live_music: {
    label: 'Música en Vivo',
    icon: 'musical-notes-outline',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    categories: [
      { value: 'live_band', label: 'Bandas en Vivo', icon: '🎸' },
      { value: 'jazz_club', label: 'Club de Jazz', icon: '🎷' },
      { value: 'acoustic', label: 'Música Acústica', icon: '🎻' },
      { value: 'tribute', label: 'Bandas Tributo', icon: '⭐' },
    ]
  },
  brewery: {
    label: 'Cervecería Artesanal',
    icon: 'beer-outline',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    categories: [
      { value: 'brewpub', label: 'Brewpub (Producción propia)', icon: '🏭' },
      { value: 'taproom', label: 'Taproom', icon: '🍻' },
      { value: 'beer_garden', label: 'Beer Garden', icon: '🌳' },
    ]
  },
  lounge: {
    label: 'Lounge / Bar de Ambiente',
    icon: 'wine-outline',
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    categories: [
      { value: 'lounge_bar', label: 'Lounge Bar', icon: '🍸' },
      { value: 'shisha_lounge', label: 'Shisha Lounge', icon: '💨' },
      { value: 'rooftop', label: 'Rooftop Lounge', icon: '🌆' },
      { value: 'cocktail_lounge', label: 'Cocktail Lounge', icon: '🍹' },
    ]
  },
  entertainment_center: {
    label: 'Centro de Entretenimiento',
    icon: 'game-controller-outline',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    categories: [
      { value: 'arcade', label: 'Arcade / Juegos', icon: '🕹️' },
      { value: 'bowling', label: 'Bowling', icon: '🎳' },
      { value: 'billiards', label: 'Billar / Pool', icon: '🎱' },
      { value: 'escape_room', label: 'Escape Room', icon: '🔐' },
      { value: 'virtual_reality', label: 'Realidad Virtual', icon: '🥽' },
    ]
  },
};

// Configuración de tipos de spa y bienestar y sus categorías
const spaSubtypes = {
  day_spa: {
    label: 'Day Spa',
    icon: 'sparkles-outline',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    categories: [
      { value: 'full_service', label: 'Servicio Completo', icon: '✨' },
      { value: 'relaxation', label: 'Relajación', icon: '🧘' },
      { value: 'beauty', label: 'Belleza y Estética', icon: '💅' },
      { value: 'wellness', label: 'Bienestar Integral', icon: '🌿' },
    ]
  },
  medical_spa: {
    label: 'Medical Spa',
    icon: 'medical-outline',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    categories: [
      { value: 'aesthetic', label: 'Medicina Estética', icon: '💉' },
      { value: 'dermatology', label: 'Dermatología', icon: '🔬' },
      { value: 'anti_aging', label: 'Anti-Envejecimiento', icon: '⏰' },
      { value: 'laser', label: 'Tratamientos Láser', icon: '✨' },
      { value: 'body_sculpting', label: 'Escultura Corporal', icon: '💪' },
    ]
  },
  wellness_center: {
    label: 'Centro de Bienestar',
    icon: 'fitness-outline',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    categories: [
      { value: 'holistic', label: 'Bienestar Holístico', icon: '🌸' },
      { value: 'yoga', label: 'Yoga y Meditación', icon: '🧘‍♀️' },
      { value: 'nutrition', label: 'Nutrición y Dietética', icon: '🥗' },
      { value: 'fitness', label: 'Fitness y Ejercicio', icon: '🏋️' },
      { value: 'therapy', label: 'Terapias Alternativas', icon: '🌿' },
    ]
  },
  massage_center: {
    label: 'Centro de Masajes',
    icon: 'hand-left-outline',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    categories: [
      { value: 'therapeutic', label: 'Masaje Terapéutico', icon: '💆' },
      { value: 'sports', label: 'Masaje Deportivo', icon: '⚽' },
      { value: 'relaxation', label: 'Masaje Relajante', icon: '😌' },
      { value: 'hot_stone', label: 'Piedras Calientes', icon: '🪨' },
      { value: 'aromatherapy', label: 'Aromaterapia', icon: '🌺' },
      { value: 'reflexology', label: 'Reflexología', icon: '👣' },
    ]
  },
  thermal_spa: {
    label: 'Spa Termal / Baños Termales',
    icon: 'water-outline',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    categories: [
      { value: 'hot_springs', label: 'Aguas Termales', icon: '♨️' },
      { value: 'mud_baths', label: 'Baños de Lodo', icon: '🏞️' },
      { value: 'hydrotherapy', label: 'Hidroterapia', icon: '💧' },
      { value: 'sauna', label: 'Sauna y Vapor', icon: '🔥' },
    ]
  },
  beauty_salon: {
    label: 'Salón de Belleza & Spa',
    icon: 'cut-outline',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    categories: [
      { value: 'hair', label: 'Peluquería y Estilismo', icon: '💇' },
      { value: 'nails', label: 'Manicure y Pedicure', icon: '💅' },
      { value: 'facial', label: 'Tratamientos Faciales', icon: '🧖' },
      { value: 'makeup', label: 'Maquillaje', icon: '💄' },
      { value: 'waxing', label: 'Depilación', icon: '✨' },
    ]
  },
  resort_spa: {
    label: 'Resort Spa / Spa de Hotel',
    icon: 'home-outline',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    categories: [
      { value: 'luxury', label: 'Spa de Lujo', icon: '👑' },
      { value: 'couples', label: 'Spa para Parejas', icon: '💑' },
      { value: 'packages', label: 'Paquetes Spa', icon: '🎁' },
      { value: 'pool', label: 'Spa con Piscina', icon: '🏊' },
    ]
  },
  alternative_therapy: {
    label: 'Terapias Alternativas',
    icon: 'leaf-outline',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    categories: [
      { value: 'acupuncture', label: 'Acupuntura', icon: '📍' },
      { value: 'reiki', label: 'Reiki', icon: '✋' },
      { value: 'ayurveda', label: 'Ayurveda', icon: '🌿' },
      { value: 'chiropractic', label: 'Quiropráctica', icon: '🦴' },
      { value: 'naturopathy', label: 'Naturopatía', icon: '🌱' },
    ]
  },
};

function EditBusiness() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { setSidebarVisible } = useSidebar();
  const { business, updateBusiness, loading, error, fetchBusiness } = useBusiness(id);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    businessType: 'hotel',
    hotelSubtype: '',
    hotelCategory: '',
    restaurantSubtype: '',
    restaurantCuisine: '',
    entertainmentSubtype: '',
    entertainmentCategory: '',
    spaSubtype: '',
    spaCategory: '',
    logo: '',
    coverImage: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: 'Perú',
      zipCode: '',
      latitude: null,
      longitude: null,
    },
    contactPhone: '',
    contactEmail: '',
    website: '',
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      youtube: '',
    },
    operatingHours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: true },
    },
    // Configuración específica para hoteles
    hotelSettings: {
      checkInTime: '14:00',
      checkOutTime: '12:00',
      hasWifi: true,
      hasParking: false,
      hasSwimmingPool: false,
      hasRestaurant: false,
      petsAllowed: false,
      breakfastIncluded: false,
      childrenAllowed: true,
    },
  });
  const [logoImages, setLogoImages] = useState([]);
  const [coverImages, setCoverImages] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const mapRef = useRef(null);

  // Disable sidebar on this page
  useEffect(() => {
    setSidebarVisible(false);
    return () => setSidebarVisible(false);
  }, [setSidebarVisible]);

  useEffect(() => {
    if (id) {
      loadBusiness();
    }
  }, [id]);

  const loadBusiness = async () => {
    await fetchBusiness(id);
  };

  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        slug: business.slug || '',
        description: business.description || '',
        businessType: business.businessType || 'hotel',
        hotelSubtype: business.hotelSubtype || '',
        hotelCategory: business.hotelCategory || '',
        restaurantSubtype: business.restaurantSubtype || '',
        restaurantCuisine: business.restaurantCuisine || '',
        logo: business.logo || '',
        coverImage: business.coverImage || '',
        address: business.address || {
          street: '',
          city: '',
          state: '',
          country: 'Perú',
          zipCode: '',
          latitude: null,
          longitude: null,
        },
        contactPhone: business.contactPhone || '',
        contactEmail: business.contactEmail || '',
        website: business.website || '',
        socialMedia: business.socialMedia || {
          facebook: '',
          instagram: '',
          tiktok: '',
          youtube: '',
        },
        operatingHours: business.operatingHours || {
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '09:00', close: '18:00', closed: false },
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: true },
        },
        hotelSettings: business.hotelSettings || {
          checkInTime: '14:00',
          checkOutTime: '12:00',
          hasWifi: true,
          hasParking: false,
          hasSwimmingPool: false,
          hasRestaurant: false,
          petsAllowed: false,
          breakfastIncluded: false,
          childrenAllowed: true,
        },
      });

      // Cargar imágenes actuales
      if (business.logo) {
        setLogoImages([business.logo]);
      }
      if (business.coverImage) {
        setCoverImages([business.coverImage]);
      }

      // Cargar posición del mapa
      if (business.address?.latitude && business.address?.longitude) {
        setMarkerPosition({
          lat: business.address.latitude,
          lng: business.address.longitude
        });
      }
    }
  }, [business]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === 'checkbox' ? checked : value;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: actualValue,
        },
      });
    } else if (name.startsWith('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [socialField]: actualValue,
        },
      });
    } else if (name.startsWith('hotelSettings.')) {
      const hotelField = name.split('.')[1];
      setFormData({
        ...formData,
        hotelSettings: {
          ...formData.hotelSettings,
          [hotelField]: actualValue,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLocationSelect = (latlng) => {
    setMarkerPosition(latlng);
    setFormData({
      ...formData,
      address: {
        ...formData.address,
        latitude: latlng.lat,
        longitude: latlng.lng,
      },
    });
  };

  const handleLogoChange = (images) => {
    setLogoImages(images);
    setFormData({
      ...formData,
      logo: images[0] || ''
    });
  };

  const handleCoverChange = (images) => {
    setCoverImages(images);
    setFormData({
      ...formData,
      coverImage: images[0] || ''
    });
  };

  const handleHoursChange = (day, field, value) => {
    setFormData({
      ...formData,
      operatingHours: {
        ...formData.operatingHours,
        [day]: {
          ...formData.operatingHours[day],
          [field]: value
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Validaciones
    if (!formData.name.trim()) {
      setSubmitError('El nombre del negocio es requerido');
      return;
    }

    if (!formData.address.city.trim()) {
      setSubmitError('La ciudad es requerida');
      return;
    }

    if (formData.businessType === 'hotel' && !formData.hotelSubtype) {
      setSubmitError('Debes seleccionar el tipo de alojamiento');
      return;
    }

    if (formData.businessType === 'hotel' && !formData.hotelCategory) {
      setSubmitError('Debes seleccionar la categoría del alojamiento');
      return;
    }

    const payload = { ...formData };
    if (!payload.website || payload.website.trim() === '') delete payload.website;
    if (!payload.contactEmail || payload.contactEmail.trim() === '') delete payload.contactEmail;

    const result = await updateBusiness(id, payload);

    if (result.success) {
      alert('Negocio actualizado exitosamente');
      navigate(`/business/${id}`);
    } else {
      const msg = result.error || result.raw?.message || 'Error al actualizar el negocio';
      setSubmitError(msg);
    }
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
      <BusinessLayout activeMenu="edit">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Editar Negocio</h1>
          <p className="text-gray-600 mt-2">
            Actualiza la información de tu negocio
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ion-icon name="information-circle-outline" className="text-2xl text-primary"></ion-icon>
                Información Básica
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del negocio *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL amigable) *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary bg-gray-50"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El slug no se puede cambiar después de crear el negocio
                  </p>
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ion-icon name="apps" className="text-xl text-primary"></ion-icon>
                    Tipo de negocio *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {businessTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => !type.comingSoon && setFormData({ ...formData, businessType: type.value, hotelSubtype: '', hotelCategory: '' })}
                        disabled={type.comingSoon}
                        className={`relative flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                          type.comingSoon
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                            : formData.businessType === type.value
                              ? `border-${type.color.replace('text-', '')} ${type.bgColor} shadow-md`
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {type.comingSoon && (
                          <div className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-1 rounded-full">
                            Próximamente
                          </div>
                        )}
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          type.comingSoon ? 'bg-gray-100' : formData.businessType === type.value ? type.bgColor : 'bg-gray-100'
                        }`}>
                          <ion-icon
                            name={type.icon}
                            className={`text-3xl ${
                              type.comingSoon ? 'text-gray-400' : formData.businessType === type.value ? type.color : 'text-gray-500'
                            }`}
                          ></ion-icon>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium block">{type.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hotel Subtype Selection */}
                {formData.businessType === 'hotel' && (
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ion-icon name="home" className="text-xl text-primary"></ion-icon>
                      Tipo de Alojamiento *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(hotelSubtypes).map(([key, subtype]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({ ...formData, hotelSubtype: key, hotelCategory: '' })}
                          className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                            formData.hotelSubtype === key
                              ? `${subtype.borderColor} ${subtype.bgColor} shadow-md`
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                            formData.hotelSubtype === key ? subtype.bgColor : 'bg-gray-100'
                          }`}>
                            <ion-icon
                              name={subtype.icon}
                              className={`text-3xl ${formData.hotelSubtype === key ? subtype.color : 'text-gray-400'}`}
                            ></ion-icon>
                          </div>
                          <div className="flex-1 text-left">
                            <span className="text-sm font-semibold text-gray-900 block">{subtype.label}</span>
                          </div>
                          {formData.hotelSubtype === key && (
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full ${subtype.bgColor} flex items-center justify-center`}>
                                <ion-icon name="checkmark-circle" className={`text-2xl ${subtype.color}`}></ion-icon>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hotel Category Selection */}
                {formData.hotelSubtype && hotelSubtypes[formData.hotelSubtype] && (
                  <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 animate-fadeIn">
                    <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ion-icon name="ribbon" className="text-xl text-primary"></ion-icon>
                      Categoría / Clasificación *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hotelSubtypes[formData.hotelSubtype].categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, hotelCategory: category.value })}
                          className={`relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all ${
                            formData.hotelCategory === category.value
                              ? `${hotelSubtypes[formData.hotelSubtype].borderColor} ${hotelSubtypes[formData.hotelSubtype].bgColor} shadow-md`
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <span className="text-base font-semibold text-gray-900">{category.label}</span>

                          {category.stars && (
                            <div className="flex gap-1">
                              {[...Array(category.stars)].map((_, i) => (
                                <ion-icon key={i} name="star" className="text-2xl text-yellow-500"></ion-icon>
                              ))}
                              {category.grand && (
                                <ion-icon name="medal" className="text-2xl text-amber-600 ml-1"></ion-icon>
                              )}
                            </div>
                          )}

                          {category.keys && (
                            <div className="flex gap-1">
                              {[...Array(category.keys)].map((_, i) => (
                                <ion-icon key={i} name="key" className="text-2xl text-amber-600"></ion-icon>
                              ))}
                            </div>
                          )}

                          {category.spikes && (
                            <div className="flex gap-1">
                              {[...Array(category.spikes)].map((_, i) => (
                                <ion-icon key={i} name="flower" className="text-2xl text-lime-600"></ion-icon>
                              ))}
                            </div>
                          )}

                          {category.backpacks && (
                            <div className="flex gap-1">
                              {[...Array(category.backpacks)].map((_, i) => (
                                <ion-icon key={i} name="backpack" className="text-2xl text-indigo-600"></ion-icon>
                              ))}
                            </div>
                          )}

                          {!category.stars && !category.keys && !category.spikes && !category.backpacks && (
                            <div className="text-sm text-gray-500">
                              {category.label}
                            </div>
                          )}

                          {formData.hotelCategory === category.value && (
                            <div className="absolute top-3 right-3">
                              <ion-icon
                                name="checkmark-circle"
                                className={`text-2xl ${hotelSubtypes[formData.hotelSubtype].color}`}
                              ></ion-icon>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                      <ion-icon name="information-circle" className="text-lg text-blue-500"></ion-icon>
                      Clasificación oficial de {hotelSubtypes[formData.hotelSubtype].label}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Detalles de Restaurante */}
            {formData.businessType === 'restaurant' && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="restaurant-outline" className="text-2xl text-primary"></ion-icon>
                  Detalles del Restaurante
                </h2>
                <div className="space-y-6">
                  {/* Tipo de Restaurante */}
                  <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                    <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ion-icon name="restaurant" className="text-xl text-primary"></ion-icon>
                      Tipo de Restaurante *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(restaurantSubtypes).map(([key, subtype]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              restaurantSubtype: key,
                              restaurantCuisine: '', // Reset cuisine when subtype changes
                            });
                          }}
                          className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 bg-white ${
                            formData.restaurantSubtype === key
                              ? `${subtype.borderColor} ring-2 ring-offset-2 ${subtype.color.replace('text-', 'ring-')}`
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                            formData.restaurantSubtype === key ? subtype.bgColor : 'bg-gray-100'
                          }`}>
                            <ion-icon
                              name={subtype.icon}
                              className={`text-3xl ${formData.restaurantSubtype === key ? subtype.color : 'text-gray-400'}`}
                            ></ion-icon>
                          </div>
                          <div className="flex-1 text-left">
                            <span className={`text-sm font-semibold block ${
                              formData.restaurantSubtype === key ? subtype.color : 'text-gray-900'
                            }`}>
                              {subtype.label}
                            </span>
                          </div>
                          {formData.restaurantSubtype === key && (
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full ${subtype.bgColor} flex items-center justify-center`}>
                                <ion-icon name="checkmark-circle" className={`text-2xl ${subtype.color}`}></ion-icon>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tipo de Cocina */}
                  {formData.restaurantSubtype && restaurantSubtypes[formData.restaurantSubtype] && (
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200 animate-fadeIn">
                      <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ion-icon name="pizza" className="text-xl text-primary"></ion-icon>
                        Tipo de Cocina / Gastronomía *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {restaurantSubtypes[formData.restaurantSubtype].cuisineTypes.map((cuisine) => (
                          <button
                            key={cuisine.value}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                restaurantCuisine: cuisine.value
                              });
                            }}
                            className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 bg-white min-h-[120px] justify-center ${
                              formData.restaurantCuisine === cuisine.value
                                ? `${restaurantSubtypes[formData.restaurantSubtype].borderColor} ring-2 ring-offset-2 ${restaurantSubtypes[formData.restaurantSubtype].color.replace('text-', 'ring-')}`
                                : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                            }`}
                          >
                            <div className="text-4xl">
                              {cuisine.icon}
                            </div>
                            <span className={`text-sm font-semibold text-center ${
                              formData.restaurantCuisine === cuisine.value
                                ? restaurantSubtypes[formData.restaurantSubtype].color
                                : 'text-gray-900'
                            }`}>
                              {cuisine.label}
                            </span>
                            {formData.restaurantCuisine === cuisine.value && (
                              <div className="absolute top-3 right-3">
                                <ion-icon
                                  name="checkmark-circle"
                                  className={`text-2xl ${restaurantSubtypes[formData.restaurantSubtype].color}`}
                                ></ion-icon>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                        <ion-icon name="information-circle" className="text-lg text-blue-500"></ion-icon>
                        Tipo de cocina que ofrece tu {restaurantSubtypes[formData.restaurantSubtype].label}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Detalles de Entretenimiento */}
            {formData.businessType === 'entertainment' && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="musical-notes-outline" className="text-2xl text-primary"></ion-icon>
                  Detalles del Entretenimiento
                </h2>
                <div className="space-y-6">
                  {/* Tipo de Entretenimiento */}
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ion-icon name="musical-notes" className="text-xl text-primary"></ion-icon>
                      Tipo de Entretenimiento *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(entertainmentSubtypes).map(([key, subtype]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              entertainmentSubtype: key,
                              entertainmentCategory: '', // Reset category when subtype changes
                            });
                          }}
                          className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 bg-white ${
                            formData.entertainmentSubtype === key
                              ? `${subtype.borderColor} ring-2 ring-offset-2 ${subtype.color.replace('text-', 'ring-')}`
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                            formData.entertainmentSubtype === key ? subtype.bgColor : 'bg-gray-100'
                          }`}>
                            <ion-icon
                              name={subtype.icon}
                              className={`text-3xl ${formData.entertainmentSubtype === key ? subtype.color : 'text-gray-400'}`}
                            ></ion-icon>
                          </div>
                          <div className="flex-1 text-left">
                            <span className={`text-sm font-semibold block ${
                              formData.entertainmentSubtype === key ? subtype.color : 'text-gray-900'
                            }`}>
                              {subtype.label}
                            </span>
                          </div>
                          {formData.entertainmentSubtype === key && (
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full ${subtype.bgColor} flex items-center justify-center`}>
                                <ion-icon name="checkmark-circle" className={`text-2xl ${subtype.color}`}></ion-icon>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categoría Específica */}
                  {formData.entertainmentSubtype && entertainmentSubtypes[formData.entertainmentSubtype] && (
                    <div className="bg-violet-50 p-6 rounded-xl border border-violet-200 animate-fadeIn">
                      <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ion-icon name="star" className="text-xl text-primary"></ion-icon>
                        Categoría Específica *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {entertainmentSubtypes[formData.entertainmentSubtype].categories.map((category) => (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                entertainmentCategory: category.value
                              });
                            }}
                            className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 bg-white min-h-[120px] justify-center ${
                              formData.entertainmentCategory === category.value
                                ? `${entertainmentSubtypes[formData.entertainmentSubtype].borderColor} ring-2 ring-offset-2 ${entertainmentSubtypes[formData.entertainmentSubtype].color.replace('text-', 'ring-')}`
                                : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                            }`}
                          >
                            <div className="text-4xl">
                              {category.icon}
                            </div>
                            <span className={`text-sm font-semibold text-center ${
                              formData.entertainmentCategory === category.value
                                ? entertainmentSubtypes[formData.entertainmentSubtype].color
                                : 'text-gray-900'
                            }`}>
                              {category.label}
                            </span>
                            {formData.entertainmentCategory === category.value && (
                              <div className="absolute top-3 right-3">
                                <ion-icon
                                  name="checkmark-circle"
                                  className={`text-2xl ${entertainmentSubtypes[formData.entertainmentSubtype].color}`}
                                ></ion-icon>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                        <ion-icon name="information-circle" className="text-lg text-blue-500"></ion-icon>
                        Categoría específica de tu {entertainmentSubtypes[formData.entertainmentSubtype].label}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Detalles de Spa */}
            {formData.businessType === 'spa' && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="sparkles-outline" className="text-2xl text-primary"></ion-icon>
                  Detalles del Spa y Bienestar
                </h2>
                <div className="space-y-6">
                  {/* Tipo de Spa */}
                  <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
                    <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ion-icon name="sparkles" className="text-xl text-primary"></ion-icon>
                      Tipo de Spa y Bienestar *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(spaSubtypes).map(([key, subtype]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              spaSubtype: key,
                              spaCategory: '', // Reset category when subtype changes
                            });
                          }}
                          className={`group relative flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 bg-white ${
                            formData.spaSubtype === key
                              ? `${subtype.borderColor} ring-2 ring-offset-2 ${subtype.color.replace('text-', 'ring-')}`
                              : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                            formData.spaSubtype === key ? subtype.bgColor : 'bg-gray-100'
                          }`}>
                            <ion-icon
                              name={subtype.icon}
                              className={`text-3xl ${formData.spaSubtype === key ? subtype.color : 'text-gray-400'}`}
                            ></ion-icon>
                          </div>
                          <div className="flex-1 text-left">
                            <span className={`text-sm font-semibold block ${
                              formData.spaSubtype === key ? subtype.color : 'text-gray-900'
                            }`}>
                              {subtype.label}
                            </span>
                          </div>
                          {formData.spaSubtype === key && (
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full ${subtype.bgColor} flex items-center justify-center`}>
                                <ion-icon name="checkmark-circle" className={`text-2xl ${subtype.color}`}></ion-icon>
                              </div>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Categoría Específica */}
                  {formData.spaSubtype && spaSubtypes[formData.spaSubtype] && (
                    <div className="bg-purple-50 p-6 rounded-xl border border-purple-200 animate-fadeIn">
                      <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ion-icon name="heart" className="text-xl text-primary"></ion-icon>
                        Servicios y Tratamientos *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {spaSubtypes[formData.spaSubtype].categories.map((category) => (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                spaCategory: category.value
                              });
                            }}
                            className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200 bg-white min-h-[120px] justify-center ${
                              formData.spaCategory === category.value
                                ? `${spaSubtypes[formData.spaSubtype].borderColor} ring-2 ring-offset-2 ${spaSubtypes[formData.spaSubtype].color.replace('text-', 'ring-')}`
                                : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                            }`}
                          >
                            <div className="text-4xl">
                              {category.icon}
                            </div>
                            <span className={`text-sm font-semibold text-center ${
                              formData.spaCategory === category.value
                                ? spaSubtypes[formData.spaSubtype].color
                                : 'text-gray-900'
                            }`}>
                              {category.label}
                            </span>
                            {formData.spaCategory === category.value && (
                              <div className="absolute top-3 right-3">
                                <ion-icon
                                  name="checkmark-circle"
                                  className={`text-2xl ${spaSubtypes[formData.spaSubtype].color}`}
                                ></ion-icon>
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                        <ion-icon name="information-circle" className="text-lg text-blue-500"></ion-icon>
                        Especialidad principal de tu {spaSubtypes[formData.spaSubtype].label}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Descripción General */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ion-icon name="document-text-outline" className="text-2xl text-primary"></ion-icon>
                Descripción
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                />
              </div>
            </section>

            {/* Imágenes */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ion-icon name="images-outline" className="text-2xl text-primary"></ion-icon>
                Imágenes
              </h2>
              <div className="space-y-6">
                <ImageUpload
                  label="Logo del negocio"
                  multiple={false}
                  currentImages={logoImages}
                  onImagesChange={handleLogoChange}
                  uploadType="business"
                />

                <ImageUpload
                  label="Imagen de portada"
                  multiple={false}
                  currentImages={coverImages}
                  onImagesChange={handleCoverChange}
                  uploadType="business"
                />
              </div>
            </section>

            {/* Ubicación */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ion-icon name="location-outline" className="text-2xl text-primary"></ion-icon>
                Ubicación
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Región/Estado
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="address.zipCode"
                      value={formData.address.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Mapa interactivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación en el mapa
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Haz clic en el mapa para marcar la ubicación exacta de tu negocio
                  </p>
                  <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                    <MapContainer
                      center={markerPosition || [formData.address.latitude || -12.0464, formData.address.longitude || -77.0428]}
                      zoom={15}
                      style={{ height: '100%', width: '100%' }}
                      ref={mapRef}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <MapClickHandler onLocationSelect={handleLocationSelect} />
                      <MapUpdater center={markerPosition || (formData.address.latitude && formData.address.longitude ? [formData.address.latitude, formData.address.longitude] : null)} />
                      {markerPosition && <Marker position={markerPosition} icon={customIcon} />}
                    </MapContainer>
                  </div>
                  {markerPosition && (
                    <p className="text-sm text-gray-600 mt-2">
                      Coordenadas: {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ion-icon name="call-outline" className="text-2xl text-primary"></ion-icon>
                Contacto
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sitio web
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Redes Sociales
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <ion-icon name="logo-facebook" className="text-2xl text-blue-600"></ion-icon>
                      <input
                        type="text"
                        name="socialMedia.facebook"
                        value={formData.socialMedia.facebook}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="facebook.com/minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <ion-icon name="logo-instagram" className="text-2xl text-pink-600"></ion-icon>
                      <input
                        type="text"
                        name="socialMedia.instagram"
                        value={formData.socialMedia.instagram}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="instagram.com/minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <ion-icon name="logo-tiktok" className="text-2xl text-gray-900"></ion-icon>
                      <input
                        type="text"
                        name="socialMedia.tiktok"
                        value={formData.socialMedia.tiktok}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="tiktok.com/@minegocio"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <ion-icon name="logo-youtube" className="text-2xl text-red-600"></ion-icon>
                      <input
                        type="text"
                        name="socialMedia.youtube"
                        value={formData.socialMedia.youtube}
                        onChange={handleChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        placeholder="youtube.com/@minegocio"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Horarios de Atención */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ion-icon name="time-outline" className="text-2xl text-primary"></ion-icon>
                Horarios de Atención
              </h2>
              <div className="space-y-3">
                {[
                  { key: 'monday', label: 'Lunes' },
                  { key: 'tuesday', label: 'Martes' },
                  { key: 'wednesday', label: 'Miércoles' },
                  { key: 'thursday', label: 'Jueves' },
                  { key: 'friday', label: 'Viernes' },
                  { key: 'saturday', label: 'Sábado' },
                  { key: 'sunday', label: 'Domingo' },
                ].map(day => (
                  <div key={day.key} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-28">
                      <span className="font-medium text-gray-900">{day.label}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!formData.operatingHours[day.key].closed}
                        onChange={(e) => handleHoursChange(day.key, 'closed', !e.target.checked)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600">Abierto</span>
                    </div>

                    {!formData.operatingHours[day.key].closed && (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">De:</label>
                          <input
                            type="time"
                            value={formData.operatingHours[day.key].open}
                            onChange={(e) => handleHoursChange(day.key, 'open', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          />
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600">Hasta:</label>
                          <input
                            type="time"
                            value={formData.operatingHours[day.key].close}
                            onChange={(e) => handleHoursChange(day.key, 'close', e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                          />
                        </div>
                      </div>
                    )}

                    {formData.operatingHours[day.key].closed && (
                      <div className="flex-1">
                        <span className="text-sm text-gray-500 italic">Cerrado</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                <ion-icon name="bulb-outline" className="text-base text-yellow-500"></ion-icon>
                Configura los horarios de atención de tu negocio para que tus clientes sepan cuándo pueden visitarte.
              </p>
            </section>

            {/* Configuración del Hotel - Solo para hoteles */}
            {formData.businessType === 'hotel' && (
              <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="bed-outline" className="text-2xl text-primary"></ion-icon>
                  Configuración del Hotel
                </h2>

                {/* Check-in / Check-out */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Check-in
                      </label>
                      <input
                        type="time"
                        name="hotelSettings.checkInTime"
                        value={formData.hotelSettings?.checkInTime || '14:00'}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora de Check-out
                      </label>
                      <input
                        type="time"
                        name="hotelSettings.checkOutTime"
                        value={formData.hotelSettings?.checkOutTime || '12:00'}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Servicios del Hotel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Servicios del hotel
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasWifi"
                          checked={formData.hotelSettings?.hasWifi || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="flex items-center gap-2">
                          <ion-icon name="wifi-outline" className="text-xl text-blue-600"></ion-icon>
                          WiFi
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasParking"
                          checked={formData.hotelSettings?.hasParking || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="flex items-center gap-2">
                          <ion-icon name="car-outline" className="text-xl text-gray-700"></ion-icon>
                          Estacionamiento
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasSwimmingPool"
                          checked={formData.hotelSettings?.hasSwimmingPool || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="flex items-center gap-2">
                          <ion-icon name="water-outline" className="text-xl text-blue-500"></ion-icon>
                          Piscina
                        </span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="hotelSettings.hasRestaurant"
                          checked={formData.hotelSettings?.hasRestaurant || false}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                        <span className="flex items-center gap-2">
                          <ion-icon name="restaurant-outline" className="text-xl text-orange-600"></ion-icon>
                          Restaurante
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Políticas */}
                  <div className="border-t pt-4 space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="hotelSettings.petsAllowed"
                        checked={formData.hotelSettings?.petsAllowed || false}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="font-medium flex items-center gap-2">
                        <ion-icon name="paw-outline" className="text-xl text-amber-700"></ion-icon>
                        ¿Se permiten mascotas?
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="hotelSettings.breakfastIncluded"
                        checked={formData.hotelSettings?.breakfastIncluded || false}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="font-medium flex items-center gap-2">
                        <ion-icon name="cafe-outline" className="text-xl text-amber-900"></ion-icon>
                        ¿Desayuno incluido?
                      </span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="hotelSettings.childrenAllowed"
                        checked={formData.hotelSettings?.childrenAllowed !== false}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                      <span className="font-medium flex items-center gap-2">
                        <ion-icon name="people-outline" className="text-xl text-purple-600"></ion-icon>
                        ¿Se permiten niños?
                      </span>
                    </label>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-3 flex items-center gap-2">
                  <ion-icon name="bulb-outline" className="text-base text-yellow-500"></ion-icon>
                  Esta configuración se aplicará a todas las habitaciones del hotel.
                </p>
              </section>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(`/business/${id}`)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </BusinessLayout>
  );
}

export default EditBusiness;
