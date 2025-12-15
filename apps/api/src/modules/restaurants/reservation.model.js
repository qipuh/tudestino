import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  restaurantId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'restaurant_id',
    references: {
      model: 'restaurants',
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
    comment: 'Solicitudes especiales: cumpleaños, dieta, ubicación mesa, etc.'
  },
  tablePreference: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'table_preference',
    comment: 'Preferencia de mesa: ventana, terraza, interior, etc.'
  },
  // Estado de la reserva
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'),
    allowNull: false,
    defaultValue: 'pending'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  },
  cancelledBy: {
    type: DataTypes.ENUM('customer', 'restaurant', 'system'),
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
  // Notas del restaurante
  restaurantNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'restaurant_notes',
    comment: 'Notas internas del restaurante'
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
  tableName: 'restaurant_reservations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['restaurant_id']
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
      fields: ['restaurant_id', 'reservation_date', 'reservation_time']
    }
  ]
});

export default Reservation;
