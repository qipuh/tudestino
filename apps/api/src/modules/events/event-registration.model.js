import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const EventRegistration = sequelize.define('EventRegistration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'event_id',
    references: {
      model: 'events',
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
  ticketId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'ticket_id',
    references: {
      model: 'event_tickets',
      key: 'id'
    },
    comment: 'Null si el evento no requiere entrada específica'
  },
  // Información del asistente
  attendeeName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'attendee_name'
  },
  attendeeEmail: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'attendee_email'
  },
  attendeePhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'attendee_phone'
  },
  // Cantidad
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  // Información de pago
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    defaultValue: 0
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'PEN'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded', 'cancelled'),
    allowNull: false,
    field: 'payment_status',
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'transaction_id'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at'
  },
  // Código de entrada
  registrationCode: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'registration_code',
    unique: true,
    comment: 'Código único de registro/entrada'
  },
  qrCode: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'qr_code',
    comment: 'QR code en base64'
  },
  // Check-in
  checkedIn: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'checked_in',
    defaultValue: false
  },
  checkedInAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'checked_in_at'
  },
  checkedInBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'checked_in_by',
    comment: 'ID del usuario que hizo el check-in'
  },
  // Información adicional
  customFields: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'custom_fields',
    comment: 'Campos personalizados del formulario de registro'
  },
  specialRequests: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'special_requests'
  },
  dietaryRestrictions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'dietary_restrictions'
  },
  // Estado
  status: {
    type: DataTypes.ENUM('registered', 'confirmed', 'cancelled', 'waitlist', 'attended', 'no_show'),
    allowNull: false,
    defaultValue: 'registered'
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'cancellation_reason'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'cancelled_at'
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
  // Confirmación
  confirmationEmailSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'confirmation_email_sent',
    defaultValue: false
  },
  confirmationEmailSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'confirmation_email_sent_at'
  },
  // Notas
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Notas internas del organizador'
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
  tableName: 'event_registrations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['event_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['ticket_id']
    },
    {
      fields: ['registration_code'],
      unique: true
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['attendee_email']
    }
  ]
});

export default EventRegistration;
