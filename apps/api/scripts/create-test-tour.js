import '../src/dotenv-config.js';
import { connectDB } from '../src/config/database-mysql.js';
import { setupAssociations } from '../src/config/associations.js';
import Business from '../src/modules/businesses/business.model.js';
import Tour from '../src/modules/tours/tour.model.js';

async function createTestTour() {
  try {
    setupAssociations();
    await connectDB();

    console.log('🔍 Buscando un negocio tipo tour...');

    // Buscar un negocio existente
    let business = await Business.findOne({
      where: { businessType: 'tour' }
    });

    if (!business) {
      console.log('No hay negocio tipo tour, buscando cualquier negocio...');
      business = await Business.findOne();
    }

    if (!business) {
      console.log('❌ No hay negocios en la base de datos');
      process.exit(1);
    }

    console.log(`✅ Usando negocio: ${business.name} (${business.id})`);

    // Crear tour de ejemplo
    const tourData = {
      businessId: business.id,
      name: 'Tour Místico Cusco - Machu Picchu 4D/3N',
      category: 'cultural',
      serviceType: 'group',
      mainDestination: 'Cusco, Perú',
      secondaryDestinations: ['Valle Sagrado', 'Ollantaytambo', 'Aguas Calientes', 'Machu Picchu'],
      duration: { days: 4, nights: 3 },
      season: 'all_year',
      coverImage: '/uploads/tours/cusco-machu-picchu-cover.jpg',
      gallery: [
        '/uploads/tours/cusco-1.jpg',
        '/uploads/tours/machu-picchu-1.jpg',
        '/uploads/tours/valle-sagrado-1.jpg'
      ],
      description: 'Descubre la magia del Imperio Inca en este tour completo que incluye lo mejor de Cusco y la maravilla mundial de Machu Picchu. Visitarás sitios arqueológicos impresionantes, conocerás la cultura local y disfrutarás de paisajes inolvidables.',
      itinerary: [
        {
          day: 1,
          title: 'Llegada a Cusco - City Tour',
          description: 'Recojo del aeropuerto y traslado al hotel. Por la tarde realizaremos el City Tour visitando la Catedral, Qoricancha, Sacsayhuamán, Qenqo, Puca Pucara y Tambomachay.',
          activities: ['Traslado aeropuerto-hotel', 'City Tour Cusco', 'Visita a sitios arqueológicos']
        },
        {
          day: 2,
          title: 'Valle Sagrado de los Incas',
          description: 'Tour de día completo por el Valle Sagrado visitando Pisac, Ollantaytambo y Chinchero. Almuerzo buffet incluido.',
          activities: ['Mercado de Pisac', 'Fortaleza de Ollantaytambo', 'Centro textil de Chinchero']
        },
        {
          day: 3,
          title: 'Machu Picchu - La Ciudad Perdida',
          description: 'Viaje en tren a Aguas Calientes y ascenso a Machu Picchu. Tour guiado de 2.5 horas por la ciudadela. Tarde libre en Aguas Calientes.',
          activities: ['Viaje en tren', 'Tour guiado Machu Picchu', 'Tiempo libre']
        },
        {
          day: 4,
          title: 'Retorno a Cusco',
          description: 'Desayuno en el hotel y traslado a la estación de tren. Retorno a Cusco y traslado al aeropuerto.',
          activities: ['Traslado', 'Despedida']
        }
      ],
      pointsOfInterest: [
        'Machu Picchu',
        'Valle Sagrado',
        'Sacsayhuamán',
        'Ollantaytambo',
        'Pisac',
        'Qoricancha'
      ],
      includedActivities: [
        'City Tour Cusco',
        'Tour Valle Sagrado',
        'Visita guiada Machu Picchu'
      ],
      includedAccommodations: [
        { name: 'Hotel 3* en Cusco', category: '3 estrellas' },
        { name: 'Hotel en Aguas Calientes', category: '3 estrellas' }
      ],
      includedTransports: [
        'Traslados aeropuerto-hotel-aeropuerto',
        'Transporte turístico',
        'Tren Ollantaytambo-Aguas Calientes-Ollantaytambo',
        'Bus Aguas Calientes-Machu Picchu-Aguas Calientes'
      ],
      includes: {
        accommodation: true,
        meals: true,
        transport: true,
        guides: true,
        entrance: true,
        insurance: false,
        equipment: false
      },
      notIncludes: [
        'Vuelos a Cusco',
        'Alimentación no especificada',
        'Gastos personales',
        'Propinas'
      ],
      cancellationPolicy: 'Cancelación gratuita hasta 7 días antes del tour. Entre 7-3 días: 50% de penalidad. Menos de 3 días: 100% de penalidad.',
      specialRequirements: {
        vaccines: [],
        visa: false,
        physicalCondition: 'Media - Se requiere estar aclimatado a la altura',
        age: 'Todas las edades (menores acompañados)'
      },
      guideLanguages: ['es', 'en'],
      maxGroupSize: 16,
      basePricePerPerson: 589.00,
      currency: 'USD',
      priceInUSD: 589.00,
      supplements: {
        single: 120,
        highSeason: 80,
        extraNight: 45
      },
      discounts: {
        children: 15,
        groups: 10,
        seniors: 0
      },
      provider: 'TuDestino Tours',
      meetingPoint: {
        address: 'Plaza de Armas de Cusco',
        coordinates: { lat: -13.5164, lng: -71.9785 },
        instructions: 'Encuentro en la pileta central de la Plaza de Armas'
      },
      departureTime: '08:00:00',
      returnTime: '18:00:00',
      operationSeasons: [
        { start: '2024-01-01', end: '2024-12-31' }
      ],
      departureDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      minimumPassengers: 2,
      difficultyLevel: 'medium',
      targetAudience: ['families', 'couples', 'adventure'],
      status: 'active',
      internalNotes: 'Tour más vendido. Verificar disponibilidad de trenes con anticipación.',
      tags: ['cusco', 'machu-picchu', 'inca', 'cultura', 'historia', 'unesco']
    };

    const tour = await Tour.create(tourData);

    console.log('\n✅ Tour creado exitosamente!');
    console.log('📋 Detalles:');
    console.log(`   ID: ${tour.id}`);
    console.log(`   Código: ${tour.tourCode}`);
    console.log(`   Nombre: ${tour.name}`);
    console.log(`   Slug: ${tour.slug}`);
    console.log(`   Precio: $${tour.basePricePerPerson} USD`);
    console.log(`   Duración: ${tour.duration.days} días / ${tour.duration.nights} noches`);
    console.log(`   Estado: ${tour.status}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestTour();
