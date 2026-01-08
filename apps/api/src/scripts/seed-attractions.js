import sequelize from '../config/database-mysql.js';
import Attraction from '../modules/attractions/attraction.model.js';

const cajamarcaAttractions = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Cuarto del Rescate',
    description: 'Único vestigio arquitectónico inca en Cajamarca. Es el lugar donde el Inca Atahualpa fue retenido y donde prometió llenar de oro y plata dos veces de plata el cuarto hasta donde alcanzaba su mano en alto, a cambio de su libertad.',
    category: 'cultura',
    coverImage: null,
    videoUrl: '',
    latitude: -7.1617,
    longitude: -78.5147,
    address: 'Jr. Amalia Puga 750',
    city: 'Cajamarca',
    region: 'Cajamarca',
    country: 'Perú',
    hasDistanceMarkers: false,
    startPoint: null,
    endPoint: null,
    distance: null,
    whatToDo: 'Recorrer las habitaciones históricas, observar la marca en la pared que indica hasta dónde Atahualpa prometió llenar de tesoros, visitar el museo adjunto con objetos de la cultura Inca y colonial.',
    recommendations: 'Llegar temprano para evitar multitudes. Contratar un guía para conocer mejor la historia. Tomar muchas fotografías. El recorrido dura aproximadamente 30-45 minutos.',
    views: 0,
    isPublished: true,
    createdBy: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Complejo de Belén',
    description: 'Magnífico conjunto arquitectónico colonial construido en el siglo XVII. Destaca por su impresionante iglesia barroca con una cúpula bellamente decorada, el antiguo hospital de varones y mujeres, y el Instituto Nacional de Cultura.',
    category: 'cultura',
    coverImage: null,
    videoUrl: '',
    latitude: -7.1572,
    longitude: -78.5161,
    address: 'Jr. Belén s/n',
    city: 'Cajamarca',
    region: 'Cajamarca',
    country: 'Perú',
    hasDistanceMarkers: false,
    startPoint: null,
    endPoint: null,
    distance: null,
    whatToDo: 'Visitar la Iglesia de Belén con su impresionante cúpula, recorrer el Museo Arqueológico y Etnográfico, explorar el antiguo Hospital de Varones y Mujeres con sus amplios patios y habitaciones coloniales.',
    recommendations: 'Visitar entre las 9:00 AM y 5:00 PM. Llevar cámara fotográfica. Usar calzado cómodo. Tomar un tour guiado para aprender sobre la arquitectura barroca y la historia colonial. El recorrido completo puede tomar 2-3 horas.',
    views: 0,
    isPublished: true,
    createdBy: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'Cerro Santa Apolonia',
    description: 'Mirador natural ubicado en pleno centro de Cajamarca que ofrece vistas panorámicas de toda la ciudad. En la cima se encuentra el "Silla del Inca" o "Trono del Inca", un asiento tallado en roca de origen preinca.',
    category: 'naturaleza',
    coverImage: null,
    videoUrl: '',
    latitude: -7.1603,
    longitude: -78.5124,
    address: 'Jr. Dos de Mayo',
    city: 'Cajamarca',
    region: 'Cajamarca',
    country: 'Perú',
    hasDistanceMarkers: false,
    startPoint: null,
    endPoint: null,
    distance: null,
    whatToDo: 'Subir las escalinatas talladas en piedra, visitar la capilla en la cumbre, fotografiar la ciudad desde el mirador, sentarse en el "Trono del Inca", recorrer los jardines ornamentales y disfrutar del paisaje.',
    recommendations: 'Subir temprano en la mañana o al atardecer para mejores vistas y clima. Llevar agua y protector solar. Usar zapatos cómodos para subir las escaleras. La subida toma aproximadamente 15-20 minutos. Ideal para fotografía panorámica.',
    views: 0,
    isPublished: true,
    createdBy: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Baños del Inca',
    description: 'Complejos termales naturales con aguas que brotan a 72°C. Estas aguas termomedicinales fueron utilizadas por el Inca Atahualpa y hoy ofrecen propiedades terapéuticas para diversas afecciones. Incluye piscinas públicas, pozas privadas y servicios de spa.',
    category: 'naturaleza',
    coverImage: null,
    videoUrl: '',
    latitude: -7.1639,
    longitude: -78.4653,
    address: 'Av. Manco Cápac s/n',
    city: 'Baños del Inca',
    region: 'Cajamarca',
    country: 'Perú',
    hasDistanceMarkers: false,
    startPoint: null,
    endPoint: null,
    distance: null,
    whatToDo: 'Disfrutar de las aguas termales en pozas privadas o piscinas públicas, recibir tratamientos de spa y masajes, visitar el museo del sitio, caminar por los jardines, degustar la gastronomía local en los alrededores.',
    recommendations: 'Llegar temprano para evitar aglomeraciones. Llevar traje de baño y toalla. Las pozas privadas son más tranquilas que las piscinas públicas. El agua es muy caliente, entrar gradualmente. Duración recomendada: 2-3 horas. Combinar con visita a la Granja Porcón cercana.',
    views: 0,
    isPublished: true,
    createdBy: null,
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    title: 'Ventanillas de Cumbemayo',
    description: 'Impresionante conjunto arqueológico preinca ubicado a 3,500 msnm. Destaca el acueducto tallado en roca volcánica considerado uno de los más antiguos de América (aprox. 1,500 a.C.), formaciones rocosas conocidas como "Los Frailones" y petroglifos ancestrales.',
    category: 'cultura',
    coverImage: null,
    videoUrl: '',
    latitude: -7.2092,
    longitude: -78.5794,
    address: 'Carretera a Cumbemayo Km 20',
    city: 'Cajamarca',
    region: 'Cajamarca',
    country: 'Perú',
    hasDistanceMarkers: true,
    startPoint: JSON.stringify({
      lat: '-7.1617',
      lng: '-78.5147',
      name: 'Centro de Cajamarca'
    }),
    endPoint: JSON.stringify({
      lat: '-7.2092',
      lng: '-78.5794',
      name: 'Cumbemayo'
    }),
    distance: 20,
    whatToDo: 'Recorrer el acueducto preinca tallado en piedra, explorar las formaciones rocosas de "Los Frailones", observar los petroglifos antiguos, visitar el bosque de piedras, hacer trekking por los senderos naturales, tomar fotografías del paisaje andino.',
    recommendations: 'Contratar tour desde Cajamarca (20 km, 45 min en auto). Llevar ropa abrigadora, el clima es frío. Usar calzado de trekking. Llevar agua y snacks. Protector solar y gorro. La altitud puede causar soroche, aclimatarse primero. Mejor época: Mayo a Septiembre (temporada seca). Duración: medio día completo.',
    views: 0,
    isPublished: true,
    createdBy: null,
  },
];

async function seedAttractions() {
  try {
    console.log('🌱 Iniciando seed de atractivos turísticos de Cajamarca...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');

    // Sincronizar modelo (crear tabla si no existe)
    await Attraction.sync();
    console.log('✅ Tabla Attractions sincronizada');

    // Insertar atractivos
    for (const attraction of cajamarcaAttractions) {
      const [created, isNew] = await Attraction.findOrCreate({
        where: { id: attraction.id },
        defaults: attraction,
      });

      if (isNew) {
        console.log(`✅ Creado: ${attraction.title}`);
      } else {
        console.log(`ℹ️  Ya existe: ${attraction.title}`);
      }
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log(`📊 Total de atractivos: ${cajamarcaAttractions.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedAttractions();
