import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';
import BusinessService from '../src/modules/businesses/business-service.model.js';

const hotelRoomsData = [
  { hotelName: "Gran Kuntur Wasi Hotel Casa y Campo", rooms: [{ name: "Habitación Doble Estándar", description: "Cómoda habitación con cama doble, baño privado con ducha y agua caliente. Incluye acceso a vistas a la montaña y balcón.", capacity: 2, pricePerNightUsd: "100-150", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "minibar", "caja fuerte", "terraza", "hervidor", "escritorio"] }, { name: "Suite Familiar", description: "Amplia suite con múltiples espacios para familias. Cuenta con todas las comodidades de lujo del hotel.", capacity: 4, pricePerNightUsd: "150-200", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "minibar", "caja fuerte", "terraza", "escritorio", "sala de estar"] }] },
  { hotelName: "Costa del Sol Wyndham Cajamarca", rooms: [{ name: "Habitación Estándar", description: "Habitación cómoda con decoración cálida, baño privado y acceso a todas las comodidades del hotel.", capacity: 2, pricePerNightUsd: "59-89", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "desayuno buffet incluido"] }, { name: "Habitación Deluxe", description: "Habitación más espaciosa con mejores vistas del centro histórico de Cajamarca.", capacity: 2, pricePerNightUsd: "89-130", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "desayuno buffet", "minibar", "escritorio"] }] },
  { hotelName: "Hotel & Spa Laguna Seca", rooms: [{ name: "Habitación con Acceso a Aguas Termales", description: "Habitación con mini piscina privada alimentada por aguas termales geotérmicas. Baño privado y aire acondicionado.", capacity: 2, pricePerNightUsd: "80-120", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "minibar", "mini-piscina con aguas termales", "terraza/jardín"] }, { name: "Habitación Ejecutiva", description: "Habitación elegante con cama King-size y baño grande. Acceso a las tres grandes piscinas termales públicas.", capacity: 2, pricePerNightUsd: "100-140", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "minibar", "acceso piscina termal", "vista jardín"] }] },
  { hotelName: "Casa Hacienda Hotel Boutique", rooms: [{ name: "Habitación Doble Boutique", description: "Habitación elegante en estilo colonial con cama doble, baño privado y escritorio de trabajo.", capacity: 2, pricePerNightUsd: "70-110", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "escritorio", "balcón", "servicio de limpieza diaria", "free toiletries"] }, { name: "Suite Familiar", description: "Suite espaciosa con múltiples camas y baño privado. Ideal para familias.", capacity: 4, pricePerNightUsd: "110-160", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "balcón", "sala de estar", "escritorio", "free toiletries"] }] },
  { hotelName: "Posada del Puruay", rooms: [{ name: "Habitación con Balcón", description: "Habitación cómoda con balcón con vistas al jardín, baño privado, minibar y escritorio.", capacity: 2, pricePerNightUsd: "60-100", amenities: ["wifi gratis", "TV", "baño privado", "minibar", "kitchenette", "escritorio", "balcón", "vistas al jardín"] }, { name: "Habitación Especiosa con 3 Camas", description: "Habitación muy amplia con múltiples camas y espacio adicional. Perfecta para familias.", capacity: 3, pricePerNightUsd: "80-120", amenities: ["wifi gratis", "TV", "baño privado", "minibar", "kitchenette", "balcón", "terraza con vistas"] }] },
  { hotelName: "Gran Hotel Continental", rooms: [{ name: "Habitación Deluxe", description: "Habitación elegante con vistas al centro de Cajamarca, baño privado y todas las comodidades.", capacity: 2, pricePerNightUsd: "75-110", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "escritorio", "minibar", "vista ciudad"] }] },
  { hotelName: "La Ensenada Hotel Cajamarca", rooms: [{ name: "Habitación Doble Estándar", description: "Habitación confortable con cama doble y baño privado completo.", capacity: 2, pricePerNightUsd: "50-80", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "escritorio"] }] },
  { hotelName: "Hacienda Hotel San Antonio", rooms: [{ name: "Habitación Rústica de Lujo", description: "Habitación con estilo hacienda, cama king-size y baño privado con jacuzzi.", capacity: 2, pricePerNightUsd: "90-140", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "jacuzzi", "vista campo"] }] },
  { hotelName: "Hotel Campestre Hacienda Yanamarca", rooms: [{ name: "Habitación Campestre", description: "Habitación con acceso a la naturaleza, baño privado y vistas al campo.", capacity: 2, pricePerNightUsd: "70-100", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "vista campestre"] }] },
  { hotelName: "Qasamarca Hotel Boutique", rooms: [{ name: "Habitación Boutique Premium", description: "Habitación de lujo con diseño moderno, cama king-size y baño privado.", capacity: 2, pricePerNightUsd: "85-130", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "minibar", "escritorio", "balcón privado"] }] },
  { hotelName: "Hotel Continental", rooms: [{ name: "Habitación Estándar", description: "Habitación cómoda con cama doble, baño privado y escritorio.", capacity: 2, pricePerNightUsd: "55-85", amenities: ["wifi", "TV", "baño privado", "aire acondicionado"] }] },
  { hotelName: "Hotel Tartar", rooms: [{ name: "Habitación Doble", description: "Habitación acogedora con vistas al centro histórico de Cajamarca.", capacity: 2, pricePerNightUsd: "65-95", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "balcón"] }] },
  { hotelName: "Serra Nova", rooms: [{ name: "Habitación Compartida", description: "Habitación moderna en estilo hostal, perfecta para mochileros.", capacity: 4, pricePerNightUsd: "20-40", amenities: ["wifi gratis", "baño compartido", "lockers seguros"] }] },
  { hotelName: "El Cumbe Inn", rooms: [{ name: "Habitación de Hostal", description: "Habitación acogedora con baño privado en el corazón de Cajamarca.", capacity: 2, pricePerNightUsd: "30-50", amenities: ["wifi gratis", "baño privado", "tv cable"] }] },
  { hotelName: "Hotel Sol de Belén", rooms: [{ name: "Habitación con Vista a la Catedral", description: "Habitación ubicada frente a la Catedral de Cajamarca con baño privado.", capacity: 2, pricePerNightUsd: "60-90", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "vista catedral"] }] },
  { hotelName: "Hotel Aural", rooms: [{ name: "Habitación Estándar", description: "Habitación limpia y cómoda con baño privado.", capacity: 2, pricePerNightUsd: "50-75", amenities: ["wifi", "TV", "baño privado", "aire acondicionado"] }] },
  { hotelName: "Hotel Cajamarca", rooms: [{ name: "Habitación Doble", description: "Habitación tradicional con cama doble y baño privado.", capacity: 2, pricePerNightUsd: "55-80", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado"] }] },
  { hotelName: "Casona del Inca", rooms: [{ name: "Habitación Colonial", description: "Habitación en estilo colonial con baño privado y acceso a patio histórico.", capacity: 2, pricePerNightUsd: "70-110", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "balcón"] }] },
  { hotelName: "Yuraq Hotel", rooms: [{ name: "Habitación Económica", description: "Habitación básica pero limpia con baño privado.", capacity: 2, pricePerNightUsd: "40-60", amenities: ["wifi", "TV", "baño privado"] }] },
  { hotelName: "Qhapac Nan Hotel", rooms: [{ name: "Habitación Estándar", description: "Habitación confortable con decoración andina y baño privado.", capacity: 2, pricePerNightUsd: "45-70", amenities: ["wifi", "TV", "baño privado", "aire acondicionado"] }] },
  { hotelName: "Las Americas Hotel", rooms: [{ name: "Habitación Doble", description: "Habitación acogedora con cama doble y baño privado completo.", capacity: 2, pricePerNightUsd: "55-80", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado", "escritorio"] }] },
  { hotelName: "El Portal del Marqués", rooms: [{ name: "Habitación Histórica", description: "Habitación en un edificio histórico con baño privado y ambientación colonial.", capacity: 2, pricePerNightUsd: "65-100", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "balcón"] }] },
  { hotelName: "Valle del Inca", rooms: [{ name: "Habitación con Vista al Valle", description: "Habitación con vistas panorámicas al valle de Cajamarca.", capacity: 2, pricePerNightUsd: "75-110", amenities: ["wifi", "TV", "baño privado", "aire acondicionado", "vista valle"] }] },
  { hotelName: "Hotel Casablanca", rooms: [{ name: "Habitación Confortable", description: "Habitación limpia y confortable con baño privado.", capacity: 2, pricePerNightUsd: "50-75", amenities: ["wifi gratis", "TV", "baño privado", "aire acondicionado"] }] },
  { hotelName: "Hospedaje Encantada", rooms: [{ name: "Habitación Doble", description: "Habitación acogedora con baño privado en hospedaje familiar.", capacity: 2, pricePerNightUsd: "35-55", amenities: ["wifi", "TV", "baño privado"] }] },
  { hotelName: "Hostal Gladiolos", rooms: [{ name: "Cama en Dormitorio", description: "Cama en dormitorio compartido con baño común.", capacity: 1, pricePerNightUsd: "15-25", amenities: ["wifi gratis", "baño compartido", "lockers"] }] },
  { hotelName: "Hotel El Ingenio", rooms: [{ name: "Habitación Rustica", description: "Habitación con estilo rústico y baño privado.", capacity: 2, pricePerNightUsd: "50-75", amenities: ["wifi", "TV", "baño privado"] }] },
  { hotelName: "Hostal Los Jazmines", rooms: [{ name: "Habitación Compartida", description: "Habitación para mochileros con baño privado.", capacity: 3, pricePerNightUsd: "20-35", amenities: ["wifi gratis", "baño privado", "lockers"] }] },
  { hotelName: "Hostal Monumental", rooms: [{ name: "Cama en Dormitorio Doble", description: "Cama en dormitorio compartido frente a la Plaza de Armas.", capacity: 1, pricePerNightUsd: "18-28", amenities: ["wifi gratis", "baño compartido", "vista plaza"] }] },
  { hotelName: "La Chinita Hospedaje", rooms: [{ name: "Habitación Triple", description: "Habitación familiar con 3 camas y baño privado.", capacity: 3, pricePerNightUsd: "45-65", amenities: ["wifi", "TV", "baño privado"] }] },
  { hotelName: "El Cabildo Hostal", rooms: [{ name: "Dormitorio Compartido", description: "Dormitorio compartido económico con baño común.", capacity: 4, pricePerNightUsd: "12-20", amenities: ["wifi gratis", "baño compartido", "cocina compartida"] }] },
  { hotelName: "Chakra Runa Backpackers", rooms: [{ name: "Cama en Dormitorio", description: "Cama en dormitorio compartido con wifi gratis.", capacity: 1, pricePerNightUsd: "15-25", amenities: ["wifi gratis", "baño compartido", "cocina", "área común"] }] },
  { hotelName: "Sauna Spa Yaku Hostal", rooms: [{ name: "Habitación Privada", description: "Habitación privada con acceso a sauna y jacuzzi.", capacity: 2, pricePerNightUsd: "40-60", amenities: ["wifi", "baño privado", "acceso sauna", "jacuzzi"] }] },
  { hotelName: "Hostal Kristal", rooms: [{ name: "Habitación Doble Económica", description: "Habitación doble básica con baño privado.", capacity: 2, pricePerNightUsd: "30-50", amenities: ["wifi gratis", "TV", "baño privado"] }] },
  { hotelName: "Casa Mirita", rooms: [{ name: "Habitación Acogedora", description: "Habitación pequeña pero acogedora con baño privado.", capacity: 2, pricePerNightUsd: "35-55", amenities: ["wifi", "TV", "baño privado"] }] }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada');

    let created = 0;
    let errors = 0;

    for (const hotelData of hotelRoomsData) {
      try {
        const business = await Business.findOne({ where: { name: hotelData.hotelName } });
        if (!business) {
          console.log(`~ Hotel no encontrado: ${hotelData.hotelName}`);
          errors++;
          continue;
        }

        for (const room of hotelData.rooms) {
          const priceStr = room.pricePerNightUsd.split('-')[0].trim();
          const price = parseFloat(priceStr);

          const [service, isNew] = await BusinessService.findOrCreate({
            where: {
              businessId: business.id,
              name: room.name
            },
            defaults: {
              businessId: business.id,
              serviceType: 'property',
              name: room.name,
              description: room.description,
              price: isNaN(price) ? null : price,
              status: 'active',
              isActive: true,
              settings: {
                capacity: room.capacity,
                amenities: room.amenities,
                priceRange: room.pricePerNightUsd
              }
            }
          });

          if (isNew) {
            console.log(`✓ Habitación creada: ${hotelData.hotelName} - ${room.name}`);
            created++;
          }
        }
      } catch (err) {
        console.error(`✗ Error en ${hotelData.hotelName}: ${err.message}`);
        errors++;
      }
    }

    console.log(`\n✓ Seeder completado. ${created} habitaciones creadas, ${errors} errores.`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seed();
