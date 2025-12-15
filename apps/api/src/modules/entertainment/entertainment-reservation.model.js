import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const EntertainmentReservation = sequelize.define('EntertainmentReservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  entertainmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'entertainment_id',
    references: {
      model: 'entertainment',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Información de la reserva
  reservationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'reservation_date'
  },
  reservationTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'reservation_time'
  },
  numberOfPeople: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'number_of_people',
    validate: {
      min: 1
    }
  },
  // Tipo de reserva
  reservationType: {
    type: DataTypes.ENUM('table', 'vip_area', 'booth', 'general'),
    allowNull: false,
    field: 'reservation_type',
    defaultValue: 'table'
  },
  // Información del cliente
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'customer_phone'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'customer_email'
  },
  // Preferencias y notas
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_requests',
    comment: 'Solicitudes especiales: cumpleaños, celebraciones, etc.'
  },
  areaPreference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'area_preference',
    comment: 'Preferencia de área: cerca del escenario, bar, pista de baile, etc.'
  },
  // Información de eventos especiales
  isEventReservation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_event_reservation',
    defaultValue: false,
    comment: 'Si es una reserva para un evento especial'
  },
  eventName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'event_name'
  },
  // Costos
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'deposit_amount',
    comment: 'Monto de depósito/anticipo si aplica'
  },
  depositPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'deposit_paid',
    defaultValue: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'total_amount'
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PEN'
  },
  // Estado de la reserva
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'arrived', 'completed', 'cancelled', 'no_show'),
    allowNull: false,
    defaultValue: 'pending'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  },
  cancelledBy: {
    type: DataTypes.ENUM('customer', 'venue', 'system'),
    allowNull: true,
    field: 'cancelled_by'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at'
  },
  // Confirmación
  confirmationCode: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'confirmation_code',
    unique: true
  },
  confirmedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'confirmed_at'
  },
  // Recordatorios
  reminderSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'reminder_sent',
    defaultValue: false
  },
  reminderSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reminder_sent_at'
  },
  // Notas del establecimiento
  venueNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'venue_notes',
    comment: 'Notas internas del establecimiento'
  },
  // Información de llegada
  arrivedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'arrived_at'
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
  tableName: 'entertainment_reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['entertainment_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['reservation_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['confirmation_code']
    },
    {
      fields: ['entertainment_id', 'reservation_date', 'reservation_time']
    }
  ]
});

export default EntertainmentReservation;
