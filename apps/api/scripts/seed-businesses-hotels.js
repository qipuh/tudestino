import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';

const ADMIN_ID = 'b39c964c-350e-4c61-8ebf-4504ad60f1ad';

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const hotels = [
  {
    name: "Gran Kuntur Wasi Hotel Casa y Campo",
    type: "hotel",
    category: "5-star",
    city: "Llacanora",
    latitude: -7.1667,
    longitude: -78.5500,
    phone: "+51 992 288 964",
    email: "reservas@kunturwasicasaycampo.com",
    description: "Primer hotel 5 estrellas certificado de Cajamarca, ubicado en zona rural con vistas a paisajes andinos. Ofrece experiencia de lujo en entorno natural con servicios boutique.",
    address: "Pasaje El Común S/N, Llacanora, Cajamarca 06300",
    website: "https://www.kwhoteles.com",
    amenities: "wifi,restaurant,bar,vistas panorámicas"
  },
  {
    name: "Costa del Sol Wyndham Cajamarca",
    type: "hotel",
    category: "4-star",
    city: "Cajamarca",
    latitude: -7.1587,
    longitude: -78.5036,
    phone: "+51 76-344040",
    email: "info@costadelsolperu.com",
    description: "Hotel de primera clase con estándares internacionales Wyndham. Ubicado en zona céntrica con fácil acceso a atracciones turísticas principales.",
    address: "Jr Cruz de Piedra 707, Del Batan, Cajamarca 06001",
    website: "https://www.costadelsolperu.com/en/hotels/costa-del-sol-wyndham-cajamarca-hotel/",
    amenities: "wifi,restaurant,bar,room service,aire acondicionado"
  },
  {
    name: "Hotel & Spa Laguna Seca",
    type: "hotel",
    category: "4-star",
    city: "Baños del Inca",
    latitude: -7.1680,
    longitude: -78.4820,
    phone: "+51 76-584300",
    email: "info@hotellagunasecacajamarca.com",
    description: "Hotel spa con piscina externa abierta todo el año, ubicado en zona de aguas termales. Ideal para relajación y bienestar con servicios completos de spa.",
    address: "Av Manco Capac 1098, Baños del Inca, Cajamarca",
    website: "https://hotellagunasecacajamarca.com-hotel.com/en/",
    amenities: "wifi,piscina,spa,sauna,jacuzzi,restaurant"
  },
  {
    name: "Casa Hacienda Hotel Boutique",
    type: "hotel",
    category: "4-star",
    city: "Baños del Inca",
    latitude: -7.1685,
    longitude: -78.4850,
    phone: "+51 76-367025",
    email: "info@casahaciendahotel.com",
    description: "Hotel boutique 4 estrellas ubicado en hacienda tradicional con restaurante 'El Potro'. Ofrece ambiente familiar con vistas a montañas.",
    address: "Jr Chachapoyas, Baños del Inca, Cajamarca",
    website: "https://casahaciendahotel.com/",
    amenities: "wifi,restaurant,bar,jardín,family rooms"
  },
  {
    name: "La Ensenada Hotel Cajamarca",
    type: "hotel",
    category: "4-star",
    city: "Cajamarca",
    latitude: -7.1750,
    longitude: -78.5100,
    phone: "+51 940 036 917",
    email: "reservas@laensenadahoteles.com",
    description: "Hotel de naturaleza ubicado en zona rural con vistas a campo. Ideal para descanso y conexión con entorno natural.",
    address: "Fundo Los Sauces Km.5, Carretera Baños del Inca, Cajamarca",
    website: "https://www.laensenadahoteles.com/laensenadahotelcajamarca/",
    amenities: "wifi,restaurant,bar,piscina,vistas naturales"
  },
  {
    name: "Gran Hotel Continental",
    type: "hotel",
    category: "4-star",
    city: "Cajamarca",
    latitude: -7.1575,
    longitude: -78.5020,
    phone: "+51 7636 3410",
    email: "info@granhotelcontinental.com",
    description: "Hotel de lujo ubicado en centro de Cajamarca. Servicio de calidad con amenidades modernas y ubicación estratégica.",
    address: "Jr. Amazonas 781, Cajamarca 06001",
    website: "https://granhotelcontinental.com-hotel.com/en/",
    amenities: "wifi,restaurant,bar,room service,shuttle aeropuerto"
  },
  {
    name: "Posada del Puruay",
    type: "hotel",
    category: "4-star",
    city: "Cajamarca",
    latitude: -7.1650,
    longitude: -78.5400,
    phone: "+51 76 367 028",
    email: "reservas@posadapuruay.com.pe",
    description: "Posada colonial ubicada en casa virreinal del siglo XVIII a orillas del río Puruay. Ambiente histórico con servicios modernos.",
    address: "Carretera a Porcón Km 4.5, Cajamarca",
    website: "https://posadapuruay.com.pe/",
    amenities: "wifi,restaurant,bar,ambiente colonial,vistas al río"
  },
  {
    name: "Hacienda Hotel San Antonio",
    type: "hotel",
    category: "4-star",
    city: "Baños del Inca",
    latitude: -7.1720,
    longitude: -78.4950,
    phone: "+51 955 481 993",
    email: "info@haciendahotelsan antonio.com",
    description: "Hacienda rural con ambiente familiar ubicada a 2 km de Plaza de Armas. Experiencia de estancia en granja con servicios de restaurante.",
    address: "Entrada por Puente Viaducto, Carr. Baños del Inca Km 5, Baños del Inca 06002",
    website: "https://hacienda-san-antonio-villa-cajamarca.hotelmix.es/",
    amenities: "wifi,restaurant,bar,jardín,juegos infantiles,piscina"
  },
  {
    name: "Hotel Campestre Hacienda Yanamarca",
    type: "hotel",
    category: "4-star",
    city: "Llacanora",
    latitude: -7.1500,
    longitude: -78.5550,
    phone: "+51 76 361812",
    email: "info@hacienday anamarca.com",
    description: "Hotel en granja tradicional cajamarquina rodeado de paisajes naturales. Experiencia campestre auténtica con turismo vivencial.",
    address: "Llacanora, Cajamarca (13 km del centro)",
    website: "https://www.agoda.com/hotel-campestre-hacienda-yanamarca/hotel/cajamarca-pe.html",
    amenities: "wifi,restaurant,bar,cabalgatas,senderismo,desayuno orgánico"
  },
  {
    name: "Qasamarca Hotel Boutique",
    type: "hotel",
    category: "4-star",
    city: "Cajamarca",
    latitude: -7.1590,
    longitude: -78.5040,
    phone: "+51 959 102 858",
    email: "info@qasamarcahotel.com",
    description: "Hotel boutique moderno ubicado en centro de Cajamarca. Diseño contemporáneo con servicios personalizados.",
    address: "San Salvador 599, Cajamarca 06001",
    website: "https://qasamarca-hotel-boutique-cajamarca.bookstaygo.com/",
    amenities: "wifi,restaurant,bar,room service,diseño moderno"
  },
  {
    name: "Hotel Continental",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1575,
    longitude: -78.5015,
    phone: "+51 976 635 551",
    email: "reservas@hotelcontinental.com.pe",
    description: "Hotel 3 estrellas ubicado a media cuadra de Plaza de Armas. Ubicación céntrica con acceso fácil a atracciones.",
    address: "Jr. Amazonas 760, Cajamarca 06001",
    website: "https://hotelcontinental.com.pe/",
    amenities: "wifi,restaurant,bar,aire acondicionado"
  },
  {
    name: "Hotel Tartar",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1620,
    longitude: -78.5200,
    phone: "+51 76 285014",
    email: "reservas@hoteltartar.pe",
    description: "Hotel colonial 3 estrellas con estilo tradicional cajamarquino. Ubicado en zona de acceso a Otuzco.",
    address: "Km. 3.5 Carretera Otuzco, Cajamarca 06000",
    website: "https://www.booking.com/hotel/pe/tartar-cajamarca1.html",
    amenities: "wifi,restaurant,bar,desayuno incluido,estilo colonial"
  },
  {
    name: "Serra Nova",
    type: "hotel",
    category: "3-star",
    city: "Baños del Inca",
    latitude: -7.1680,
    longitude: -78.4880,
    phone: "+51 986 068 818",
    email: "info@serranova.pe",
    description: "Hotel 3 estrellas ubicado en Baños del Inca cerca de aguas termales. Ambiente relajante ideal para descanso.",
    address: "Jr Los Sauces 163, Baños del Inca, Cajamarca",
    website: "https://serranova.pe/",
    amenities: "wifi,piscina,restaurant,bar,ambiente termal"
  },
  {
    name: "El Cumbe Inn",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1680,
    longitude: -78.4920,
    phone: "+51 947 228 880",
    email: "info@elcumbeinn.com",
    description: "Hostal boutique ubicado a 5 minutos del centro. Ambiente acogedor con restaurante propio.",
    address: "Pasaje Atahualpa 345, Barrio Cumbemayo, Cajamarca",
    website: "http://www.elcumbeinn.com/",
    amenities: "wifi,restaurant,terrace,recepción 24 horas"
  },
  {
    name: "Hotel Sol de Belén",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1580,
    longitude: -78.5045,
    phone: "+51 76 362196",
    email: "reservas@hotelsoldebelen.com",
    description: "Hotel 3 estrellas en el corazón de Cajamarca. Ubicación céntrica con acceso fácil a la Plaza de Armas.",
    address: "Jr. Belén 636, Cajamarca 06001",
    website: "https://soldebelencajamarca.pe-hotels.com/en/",
    amenities: "wifi,restaurant,fitness center,business center"
  },
  {
    name: "Hotel Aural",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1585,
    longitude: -78.5030,
    phone: "+51 984 284 373",
    email: "info@auralhotelcajamarca.com",
    description: "Hotel 3 estrellas ubicado en zona céntrica. Ofrece ambiente accesible con bar, restaurante y servicio 24 horas.",
    address: "Jr. Amalia Puga 1118, Cajamarca 06001",
    website: "https://auralhotelcajamarca.com/",
    amenities: "wifi,restaurant,bar,room service"
  },
  {
    name: "Hotel Cajamarca",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1595,
    longitude: -78.5035,
    phone: "+51 976 771 010",
    email: "info@hotelcajamarca.com.pe",
    description: "Hotel 3 estrellas a media cuadra de la Plaza de Armas. Ubicación privilegiada con comodidades modernas.",
    address: "Jr. Dos De Mayo 311, Cajamarca 06001",
    website: "http://www.hotelcajamarca.com.pe/",
    amenities: "wifi,restaurant,bar,desayuno incluido,room service"
  },
  {
    name: "Casona del Inca",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1595,
    longitude: -78.5040,
    phone: "+51 76 367524",
    email: "info@casonadelincaperu.com",
    description: "Hotel tradicional 3 estrellas ubicado en la Plaza de Armas. Ambiente histórico en edificio colonial.",
    address: "Jr. Dos de Mayo 460, Plaza de Armas, Cajamarca 06001",
    website: "https://www.casonadelincaperu.com",
    amenities: "wifi,restaurant,bar,ambiente colonial"
  },
  {
    name: "Yuraq Hotel",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1595,
    longitude: -78.5000,
    phone: "+51 76 361 067",
    email: "reservas@yuraqhotel.com",
    description: "Hotel 3 estrellas ubicado a 10 minutos de Baños del Inca. Ofrece desayuno diario y wifi gratuito.",
    address: "Avenida Atahualpa 661, Cajamarca 06000",
    website: "https://www.yuraqhotel.com/es-es",
    amenities: "wifi,restaurant,desayuno incluido"
  },
  {
    name: "Qhapac Nan Hotel",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1650,
    longitude: -78.5050,
    phone: "+51 76 343 408",
    email: "qhapacnam_srl@hotmail.com",
    description: "Hotel 3 estrellas ubicado a 7 minutos de Baños del Inca. Ofrece desayuno continental gratuito.",
    address: "Jr. Los Nogales 326, Villa Universitaria, Cajamarca",
    website: "https://www.qhapacnanhotel.com/",
    amenities: "wifi,restaurant,desayuno incluido,ambiente tranquilo"
  },
  {
    name: "Hotel Pilancones",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1580,
    longitude: -78.5020,
    phone: "+51 76 362 986",
    email: "informes@hotelpilanconescajamarca.com",
    description: "Hotel 3 estrellas con más de 20 años de servicio. Combina comodidades modernas con toque histórico.",
    address: "Jr. Angamos 739, Cajamarca 06001",
    website: "https://hotelpilanconescajamarca.com/",
    amenities: "wifi,restaurant,bar,air conditioning"
  },
  {
    name: "Las Americas Hotel",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1575,
    longitude: -78.5025,
    phone: "+51 76 368 863",
    email: "reservas@lasamericashotel.com.pe",
    description: "Hotel 3 estrellas con trayectoria desde 1996. Ubicado en zona céntrica con restaurante propio.",
    address: "Jr. Amazonas 622, Cajamarca 06001",
    website: "https://www.lasamericashotel.com.pe/",
    amenities: "wifi,restaurant,bar,room service"
  },
  {
    name: "El Portal del Marqués",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1592,
    longitude: -78.5038,
    phone: "+51 76 368 464",
    email: "info@portaldelmarques.com",
    description: "Hotel 3 estrellas ubicado cerca de Plaza de Armas. Ubicación céntrica con recepción 24 horas.",
    address: "Jr. del Comercio 644, Cajamarca 06001",
    website: "https://portaldelmarques.com/",
    amenities: "wifi,recepción 24 horas,ubicación céntrica"
  },
  {
    name: "Valle del Inca",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1580,
    longitude: -78.5020,
    phone: "+51 964 660 878",
    email: "valledelinca@gmail.com",
    description: "Hotel 3 estrellas con desayuno e internet wifi incluidos. Ubicado en barrio histórico.",
    address: "Jr. Amazonas 574, Barrio La Merced, Cajamarca",
    website: "https://valledelinca.com/",
    amenities: "wifi,restaurant,desayuno incluido,room service"
  },
  {
    name: "Hotel Casablanca",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1595,
    longitude: -78.5038,
    phone: "+51 76 362 141",
    email: "info@hotelcasablanca.com.pe",
    description: "Hotel 3 estrellas ubicado frente a la plaza principal. Ofrece habitaciones equipadas con frigorífico.",
    address: "Jr. Dos de Mayo 446, Cajamarca 06001",
    website: "https://www.booking.com/hotel/pe/casablanca-cajamarca.html",
    amenities: "wifi,desayuno incluido,garden,bebidas calientes gratuitas"
  },
  {
    name: "Hospedaje Encantada",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1590,
    longitude: -78.5035,
    phone: "+51 929 566 258",
    email: "info@hospedajeencantada.com",
    description: "Hotel 3 estrellas ubicado a 2.5 cuadras de Plaza de Armas. Recepción 24 horas con servicio de tours.",
    address: "Jr. San Martín 446, Cajamarca 06001",
    website: "https://www.booking.com/hotel/pe/hospedaje-la-encantada-cajamarca1.html",
    amenities: "wifi,recepción 24 horas,tour desk,ubicación céntrica"
  },
  {
    name: "Hostal Gladiolos",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1620,
    longitude: -78.5100,
    phone: "+51 976 228 270",
    email: "info@hostalgladiolos.com",
    description: "Hostal 3 estrellas ubicado a 8 cuadras de la plaza principal. Servicio de enlace con aeropuerto.",
    address: "Jr. Los Gladiolos 222, costado del paradero a Otuzco, Cajamarca",
    website: "https://www.booking.com/hotel/pe/hostal-gladiolos.html",
    amenities: "wifi,recepción 24 horas,shuttle aeropuerto,lavandería"
  },
  {
    name: "Hotel El Ingenio",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1630,
    longitude: -78.5040,
    phone: "+51 76 367 121",
    email: "info@hoteldelingenio.com",
    description: "Hotel 3 estrellas ubicado a 1.1 km de Plaza de Armas. Ambiente familiar con servicios cómodos.",
    address: "Jr. Los Cipreses 545-595, Cajamarca 06001",
    website: "https://www.booking.com/hotel/pe/casona-el-ingenio-cajamarca.html",
    amenities: "wifi,restaurant,bar,ubicación histórica"
  },
  {
    name: "Hostal Los Jazmines",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1575,
    longitude: -78.5010,
    phone: "+51 76 361 812",
    email: "info@losjazmines.pe",
    description: "Hostal acogedor ubicado en centro de Cajamarca. Ambiente familiar con acceso a principales atracciones.",
    address: "Jr. Amazonas 775, Cajamarca 06002",
    website: "https://www.losjazmines.pe/",
    amenities: "wifi,recepción 24 horas,ubicación céntrica"
  },
  {
    name: "Hostal Monumental",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1577,
    longitude: -78.5018,
    phone: "+51 76-285 233",
    email: "info@hmonumental.com",
    description: "Hostal ubicado a media cuadra de Plaza de Armas. Ubicación privilegiada con estacionamiento gratuito.",
    address: "Jr. Amazonas 655, Cajamarca 06002",
    website: "https://hmonumental.com/",
    amenities: "wifi,estacionamiento gratuito,recepción 24 horas"
  },
  {
    name: "La Chinita Hospedaje",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1590,
    longitude: -78.5032,
    phone: "+51 994 752 634",
    email: "info@lachinitahospedaje.com",
    description: "Hospedaje familiar ubicado en zona céntrica. Recepción 24 horas con ambiente acogedor.",
    address: "Jr. Ucayali 334, Cajamarca 06001",
    website: "https://www.booking.com/hotel/pe/la-chinita-hospedaje-cajamarca.html",
    amenities: "wifi,recepción 24 horas,ubicación céntrica"
  },
  {
    name: "El Cabildo Hostal",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1600,
    longitude: -78.5045,
    phone: "+51 76 367 025",
    email: "info@elcabildohostal.com",
    description: "Hostal de 28 habitaciones ubicado a una cuadra de la plaza. Servicio personalizado.",
    address: "Jr. Junín 1062, Cajamarca 06001",
    website: "https://www.booking.com/hotel/pe/hostal-el-cabildo-cajamarca.html",
    amenities: "wifi,recepción 24 horas,ambiente acogedor"
  },
  {
    name: "Chakra Runa Backpackers",
    type: "hotel",
    category: "2-star",
    city: "Cajamarca",
    latitude: -7.1610,
    longitude: -78.5085,
    phone: "+51 947 228 880",
    email: "info@chakraruna.com",
    description: "Hostel nuevo y acogedor especializado en mochileros. Ubicado en zona residencial con cocina compartida.",
    address: "Pasaje Cutervo 129, Urbanización Ramón Castilla, Cajamarca",
    website: "https://www.booking.com/hotel/pe/casa-chakra-x-6pax.html",
    amenities: "wifi,cocina compartida,recepción 24 horas"
  },
  {
    name: "Sauna Spa Yaku Hostal",
    type: "hotel",
    category: "2-star",
    city: "Cajamarca",
    latitude: -7.1585,
    longitude: -78.5050,
    phone: "+51 76 264 176",
    email: "saunaspayakuhostal1@gmail.com",
    description: "Hostal especializado en spa y sauna. Ubicado en centro con servicios de bienestar.",
    address: "Jr. Conquistadores 134, Cajamarca",
    website: "https://yaku-peru.com/",
    amenities: "wifi,sauna,spa,gym,recepción 24 horas"
  },
  {
    name: "Hostal Kristal",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1650,
    longitude: -78.5150,
    phone: "+51 944 241 013",
    email: "info@hostalkristal.com",
    description: "Hostal 3 estrellas ubicado a 6 km de Plaza de Armas. Ofrece ambiente cómodo y servicios esenciales.",
    address: "Avenida San Martín de Porres, Cajamarca 06000",
    website: "https://www.hostalkristal.com/",
    amenities: "wifi,recepción 24 horas,ambiente cómodo"
  },
  {
    name: "Casa Mirita",
    type: "hotel",
    category: "3-star",
    city: "Cajamarca",
    latitude: -7.1750,
    longitude: -78.4950,
    phone: "+51 76 361 812",
    email: "info@casamirita.com",
    description: "Casa de huéspedes ubicada a 15 minutos del centro. Ambiente familiar con desayuno continental.",
    address: "Sector Uchumayo, Cajamarca (15 min del centro)",
    website: "https://www.booking.com/hotel/pe/casa-mirita.html",
    amenities: "wifi,desayuno continental,cocina compartida,shuttle aeropuerto"
  }
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada');

    for (const data of hotels) {
      const slug = generateSlug(data.name);
      const businessData = {
        ...data,
        ownerId: ADMIN_ID,
        slug,
        businessType: 'hotel',
        hotelSubtype: 'hotel',
        hotelCategory: data.category
      };

      const [business, created] = await Business.findOrCreate({
        where: { slug },
        defaults: businessData
      });

      if (created) {
        console.log(`✓ Creado: ${business.name}`);
      } else {
        console.log(`~ Existía: ${business.name}`);
      }
    }

    console.log('\n✓ Seeder completado. 30 hoteles registrados.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seed();
