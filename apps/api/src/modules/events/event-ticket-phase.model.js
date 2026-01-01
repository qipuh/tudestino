import { DataTypes } from 'sequelize';
import sequelize from '../../config/database-mysql.js';

const EventTicketPhase = sequelize.define('EventTicketPhase', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  ticketId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    field: 'ticket_id',
    references: {
      model: 'event_tickets',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  // Información de la fase
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nombre de la fase (Ej: Early Bird, Fase 1, Última oportunidad)'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descripción opcional de la fase'
  },
  // Precio de esta fase
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: 'Precio de la entrada en esta fase'
  },
  // Disponibilidad
  quantityAvailable: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'quantity_available',
    comment: 'Cantidad de entradas disponibles en esta fase (NULL = ilimitado)'
  },
  soldQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'sold_quantity',
    defaultValue: 0,
    comment: 'Cantidad vendida en esta fase'
  },
  // Período de validez de la fase
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'start_date',
    comment: 'Fecha/hora de inicio de esta fase'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'end_date',
    comment: 'Fecha/hora de fin de esta fase'
  },
  // Orden de visualización
  displayOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'display_order',
    defaultValue: 0,
    comment: 'Orden en que se muestra la fase'
  },
  // Estado
  status: {
    type: DataTypes.ENUM('upcoming', 'active', 'ended', 'sold_out', 'inactive'),
    allowNull: false,
    defaultValue: 'upcoming',
    comment: 'Estado actual de la fase'
  },
  isVisible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_visible',
    defaultValue: true,
    comment: 'Si la fase es visible para los usuarios'
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
  tableName: 'event_ticket_phases',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['ticket_id']
    },
    {
      fields: ['start_date', 'end_date']
    },
    {
      fields: ['status']
    },
    {
      fields: ['display_order']
    }
  ]
});

// Métodos de instancia
EventTicketPhase.prototype.isCurrentlyActive = function() {
  const now = new Date();
  return this.status === 'active' &&
         this.startDate <= now &&
         this.endDate >= now;
};

EventTicketPhase.prototype.getAvailableQuantity = function() {
  if (this.quantityAvailable === null) return Infinity;
  return Math.max(0, this.quantityAvailable - this.soldQuantity);
};

EventTicketPhase.prototype.isSoldOut = function() {
  if (this.quantityAvailable === null) return false;
  return this.soldQuantity >= this.quantityAvailable;
};

// Método estático para actualizar estados automáticamente
EventTicketPhase.updatePhaseStatuses = async function() {
  const now = new Date();

  // Marcar fases como 'active' si están en su período
  await EventTicketPhase.update(
    { status: 'active' },
    {
      where: {
        status: 'upcoming',
        startDate: { [sequelize.Sequelize.Op.lte]: now },
        endDate: { [sequelize.Sequelize.Op.gte]: now }
      }
    }
  );

  // Marcar fases como 'ended' si pasó su período
  await EventTicketPhase.update(
    { status: 'ended' },
    {
      where: {
        status: ['upcoming', 'active'],
        endDate: { [sequelize.Sequelize.Op.lt]: now }
      }
    }
  );

  // Marcar fases como 'sold_out' si se agotaron
  const phases = await EventTicketPhase.findAll({
    where: {
      status: ['upcoming', 'active'],
      quantityAvailable: { [sequelize.Sequelize.Op.ne]: null }
    }
  });

  for (const phase of phases) {
    if (phase.isSoldOut()) {
      await phase.update({ status: 'sold_out' });
    }
  }
};

export default EventTicketPhase;
