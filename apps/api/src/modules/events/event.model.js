import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  organizerId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'organizer_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Información básica
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    comment: 'URL amigable del evento'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'short_description',
    comment: 'Descripción corta para listados'
  },
  // Categorización
  category: {
    type: DataTypes.ENUM(
      'concert',           // Concierto
      'festival',          // Festival
      'conference',        // Conferencia
      'congress',          // Congreso
      'fair',              // Feria
      'exhibition',        // Exposición
      'workshop',          // Taller
      'seminar',           // Seminario
      'religious',         // Evento religioso
      'patronal_feast',    // Fiesta patronal
      'carnival',          // Carnaval
      'sports',            // Deportivo
      'cultural',          // Cultural
      'gastronomic',       // Gastronómico
      'theater',           // Teatro
      'dance',             // Danza
      'art',               // Arte
      'business',          // Empresarial
      'networking',        // Networking
      'charity',           // Benéfico
      'educational',       // Educativo
      'family',            // Familiar
      'nightlife',         // Vida nocturna
      'other'              // Otro
    ),
    allowNull: false
  },
  subcategory: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Subcategoría específica del evento'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Etiquetas adicionales para búsqueda'
  },
  // Fechas y horarios
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date',
    comment: 'Null si es evento de un solo día'
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'America/Lima'
  },
  // Recurrencia
  isRecurring: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_recurring',
    defaultValue: false
  },
  recurrencePattern: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'recurrence_pattern',
    comment: 'Patrón de recurrencia: daily, weekly, monthly, yearly'
  },
  // Ubicación
  locationType: {
    type: DataTypes.ENUM('physical', 'virtual', 'hybrid'),
    allowNull: false,
    field: 'location_type',
    defaultValue: 'physical'
  },
  // Ubicación física
  venueName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'venue_name',
    comment: 'Nombre del lugar/sede'
  },
  address: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  state: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Perú'
  },
  zipCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'zip_code'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  // Ubicación virtual
  virtualUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'virtual_url',
    comment: 'URL para eventos virtuales (Zoom, Meet, etc.)'
  },
  virtualPlatform: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'virtual_platform',
    comment: 'Plataforma virtual: zoom, meet, teams, etc.'
  },
  streamingUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'streaming_url',
    comment: 'URL de transmisión en vivo'
  },
  // Organización
  organizerName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'organizer_name',
    comment: 'Nombre público del organizador'
  },
  organizerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'organizer_email'
  },
  organizerPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'organizer_phone'
  },
  organizerWebsite: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'organizer_website'
  },
  // Capacidad y asistencia
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Capacidad total del evento'
  },
  currentAttendees: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'current_attendees',
    defaultValue: 0,
    comment: 'Número actual de inscritos/asistentes'
  },
  waitlistEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'waitlist_enabled',
    defaultValue: false,
    comment: 'Habilitar lista de espera cuando se llene'
  },
  // Entradas y precios
  isFree: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_free',
    defaultValue: false
  },
  requiresRegistration: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'requires_registration',
    defaultValue: true
  },
  registrationOpenDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'registration_open_date'
  },
  registrationCloseDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'registration_close_date'
  },
  // Edad
  minAge: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'min_age'
  },
  ageRestriction: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'age_restriction',
    comment: 'Descripción de restricción de edad'
  },
  // Características
  language: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'Español',
    comment: 'Idioma principal del evento'
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Idiomas disponibles'
  },
  accessibility: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Características de accesibilidad'
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Servicios disponibles: wifi, estacionamiento, comida, etc.'
  },
  // Código de vestimenta
  dressCode: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'dress_code'
  },
  // Programa/Agenda
  hasSchedule: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_schedule',
    defaultValue: false
  },
  schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Programa/agenda del evento'
  },
  // Speakers/Artistas
  hasSpeakers: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_speakers',
    defaultValue: false
  },
  speakers: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Lista de speakers, artistas, ponentes'
  },
  // Sponsors/Patrocinadores
  hasSponsors: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'has_sponsors',
    defaultValue: false
  },
  sponsors: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Patrocinadores del evento'
  },
  // Medios
  coverImage: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'cover_image',
    comment: 'Imagen principal del evento'
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'video_url',
    comment: 'Video promocional'
  },
  // Redes sociales
  socialMedia: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'social_media',
    defaultValue: {},
    comment: 'Enlaces a redes sociales del evento'
  },
  hashtags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Hashtags oficiales del evento'
  },
  // Política de cancelación
  cancellationPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_policy'
  },
  refundPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refund_policy'
  },
  // Estado
  status: {
    type: DataTypes.ENUM(
      'draft',           // Borrador
      'published',       // Publicado
      'cancelled',       // Cancelado
      'postponed',       // Pospuesto
      'completed',       // Completado
      'suspended'        // Suspendido
    ),
    allowNull: false,
    defaultValue: 'draft'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_active',
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_featured',
    defaultValue: false,
    comment: 'Evento destacado'
  },
  // Verificación
  isVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_verified',
    defaultValue: false,
    comment: 'Verificado por el sistema'
  },
  // Estadísticas
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'view_count',
    defaultValue: 0
  },
  shareCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'share_count',
    defaultValue: 0
  },
  // SEO
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'meta_description'
  },
  metaKeywords: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'meta_keywords'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at',
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at',
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'events',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['organizer_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['city']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['slug'],
      unique: true
    },
    {
      fields: ['latitude', 'longitude']
    }
  ]
});

export default Event;
