import Event from './event.model.js';
import EventTicket from './event-ticket.model.js';
import EventRegistration from './event-registration.model.js';
import EventImage from './event-image.model.js';
import { Op } from 'sequelize';

// Establecer relaciones entre modelos
Event.hasMany(EventTicket, { foreignKey: 'event_id', as: 'tickets' });
EventTicket.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

Event.hasMany(EventRegistration, { foreignKey: 'event_id', as: 'registrations' });
EventRegistration.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });
EventRegistration.belongsTo(EventTicket, { foreignKey: 'ticket_id', as: 'ticket' });

Event.hasMany(EventImage, { foreignKey: 'event_id', as: 'images' });
EventImage.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

class EventsService {
  // EVENTOS
  async createEvent(eventData, organizerId) {
    try {
      // Generar slug si no se proporciona
      if (!eventData.slug && eventData.title) {
        eventData.slug = this.generateSlug(eventData.title);
      }

      const event = await Event.create({
        ...eventData,
        organizerId
      });
      return event;
    } catch (error) {
      throw new Error(`Error creating event: ${error.message}`);
    }
  }

  async getEventById(id) {
    try {
      const event = await Event.findByPk(id, {
        include: [
          {
            model: EventTicket,
            as: 'tickets',
            where: { status: 'active' },
            required: false
          },
          {
            model: EventImage,
            as: 'images',
            order: [['displayOrder', 'ASC']]
          }
        ]
      });

      if (event) {
        // Incrementar contador de vistas
        await event.increment('viewCount');
      }

      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  async getEventBySlug(slug) {
    try {
      const event = await Event.findOne({
        where: { slug },
        include: [
          {
            model: EventTicket,
            as: 'tickets',
            where: { status: 'active' },
            required: false
          },
          {
            model: EventImage,
            as: 'images',
            order: [['displayOrder', 'ASC']]
          }
        ]
      });

      if (event) {
        await event.increment('viewCount');
      }

      return event;
    } catch (error) {
      throw new Error(`Error fetching event: ${error.message}`);
    }
  }

  async updateEvent(id, updateData, organizerId) {
    try {
      const event = await Event.findOne({
        where: { id, organizerId }
      });

      if (!event) {
        throw new Error('Event not found or unauthorized');
      }

      await event.update(updateData);
      return event;
    } catch (error) {
      throw new Error(`Error updating event: ${error.message}`);
    }
  }

  async deleteEvent(id, organizerId) {
    try {
      const event = await Event.findOne({
        where: { id, organizerId }
      });

      if (!event) {
        throw new Error('Event not found or unauthorized');
      }

      await event.destroy();
      return { message: 'Event deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting event: ${error.message}`);
    }
  }

  async searchEvents(filters = {}) {
    try {
      const {
        category,
        city,
        startDate,
        endDate,
        isFree,
        locationType,
        tags,
        minCapacity,
        organizerId,
        page = 1,
        limit = 20,
        sortBy = 'startDate',
        sortOrder = 'ASC'
      } = filters;

      const where = {
        status: 'published',
        isActive: true
      };

      if (category) {
        if (Array.isArray(category)) {
          where.category = { [Op.in]: category };
        } else {
          where.category = category;
        }
      }

      if (city) {
        where.city = { [Op.like]: `%${city}%` };
      }

      if (startDate) {
        where.startDate = { [Op.gte]: startDate };
      }

      if (endDate) {
        where[Op.or] = [
          { endDate: { [Op.lte]: endDate } },
          { endDate: null, startDate: { [Op.lte]: endDate } }
        ];
      }

      if (isFree !== undefined) {
        where.isFree = isFree;
      }

      if (locationType) {
        where.locationType = locationType;
      }

      if (tags && tags.length > 0) {
        where.tags = {
          [Op.contains]: tags
        };
      }

      if (minCapacity) {
        where.capacity = { [Op.gte]: minCapacity };
      }

      if (organizerId) {
        where.organizerId = organizerId;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Event.findAndCountAll({
        where,
        include: [
          {
            model: EventImage,
            as: 'images',
            where: { isCover: true },
            required: false
          },
          {
            model: EventTicket,
            as: 'tickets',
            attributes: ['id', 'name', 'price', 'isFree'],
            where: { status: 'active' },
            required: false
          }
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });

      return {
        events: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error searching events: ${error.message}`);
    }
  }

  async getUpcomingEvents(limit = 10) {
    try {
      const events = await Event.findAll({
        where: {
          status: 'published',
          isActive: true,
          startDate: { [Op.gte]: new Date() }
        },
        include: [
          {
            model: EventImage,
            as: 'images',
            where: { isCover: true },
            required: false
          }
        ],
        limit,
        order: [['startDate', 'ASC']]
      });

      return events;
    } catch (error) {
      throw new Error(`Error fetching upcoming events: ${error.message}`);
    }
  }

  async getFeaturedEvents(limit = 6) {
    try {
      const events = await Event.findAll({
        where: {
          status: 'published',
          isActive: true,
          isFeatured: true,
          startDate: { [Op.gte]: new Date() }
        },
        include: [
          {
            model: EventImage,
            as: 'images',
            where: { isCover: true },
            required: false
          }
        ],
        limit,
        order: [['startDate', 'ASC']]
      });

      return events;
    } catch (error) {
      throw new Error(`Error fetching featured events: ${error.message}`);
    }
  }

  async getEventsByOrganizer(organizerId) {
    try {
      const events = await Event.findAll({
        where: { organizerId },
        include: [
          {
            model: EventImage,
            as: 'images',
            where: { isCover: true },
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return events;
    } catch (error) {
      throw new Error(`Error fetching organizer events: ${error.message}`);
    }
  }

  // TICKETS
  async createTicket(ticketData) {
    try {
      const ticket = await EventTicket.create(ticketData);
      return ticket;
    } catch (error) {
      throw new Error(`Error creating ticket: ${error.message}`);
    }
  }

  async updateTicket(id, updateData, eventId) {
    try {
      const ticket = await EventTicket.findOne({
        where: { id, eventId }
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      await ticket.update(updateData);
      return ticket;
    } catch (error) {
      throw new Error(`Error updating ticket: ${error.message}`);
    }
  }

  async deleteTicket(id, eventId) {
    try {
      const ticket = await EventTicket.findOne({
        where: { id, eventId }
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      await ticket.destroy();
      return { message: 'Ticket deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting ticket: ${error.message}`);
    }
  }

  async getEventTickets(eventId) {
    try {
      const tickets = await EventTicket.findAll({
        where: { eventId },
        order: [['displayOrder', 'ASC'], ['price', 'ASC']]
      });
      return tickets;
    } catch (error) {
      throw new Error(`Error fetching tickets: ${error.message}`);
    }
  }

  // REGISTRACIONES
  async createRegistration(registrationData) {
    try {
      // Generar código de registro único
      const registrationCode = this.generateRegistrationCode();

      const registration = await EventRegistration.create({
        ...registrationData,
        registrationCode,
        status: 'registered'
      });

      // Actualizar contador de asistentes del evento
      const event = await Event.findByPk(registrationData.eventId);
      if (event) {
        await event.increment('currentAttendees', { by: registrationData.quantity || 1 });
      }

      // Actualizar cantidad vendida del ticket si aplica
      if (registrationData.ticketId) {
        const ticket = await EventTicket.findByPk(registrationData.ticketId);
        if (ticket) {
          await ticket.increment('soldQuantity', { by: registrationData.quantity || 1 });
        }
      }

      return registration;
    } catch (error) {
      throw new Error(`Error creating registration: ${error.message}`);
    }
  }

  async updateRegistration(id, updateData, userId) {
    try {
      const registration = await EventRegistration.findOne({
        where: { id, userId }
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      await registration.update(updateData);
      return registration;
    } catch (error) {
      throw new Error(`Error updating registration: ${error.message}`);
    }
  }

  async cancelRegistration(id, userId, reason) {
    try {
      const registration = await EventRegistration.findOne({
        where: { id, userId }
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      await registration.update({
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date()
      });

      // Decrementar contador de asistentes
      const event = await Event.findByPk(registration.eventId);
      if (event && event.currentAttendees > 0) {
        await event.decrement('currentAttendees', { by: registration.quantity || 1 });
      }

      return registration;
    } catch (error) {
      throw new Error(`Error cancelling registration: ${error.message}`);
    }
  }

  async getRegistrationsByUser(userId) {
    try {
      const registrations = await EventRegistration.findAll({
        where: { userId },
        include: [
          {
            model: Event,
            as: 'event',
            include: [
              {
                model: EventImage,
                as: 'images',
                where: { isCover: true },
                required: false
              }
            ]
          },
          {
            model: EventTicket,
            as: 'ticket'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return registrations;
    } catch (error) {
      throw new Error(`Error fetching user registrations: ${error.message}`);
    }
  }

  async getEventRegistrations(eventId) {
    try {
      const registrations = await EventRegistration.findAll({
        where: { eventId },
        include: [
          {
            model: EventTicket,
            as: 'ticket'
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return registrations;
    } catch (error) {
      throw new Error(`Error fetching event registrations: ${error.message}`);
    }
  }

  async checkInRegistration(registrationCode, checkedInBy) {
    try {
      const registration = await EventRegistration.findOne({
        where: { registrationCode }
      });

      if (!registration) {
        throw new Error('Registration not found');
      }

      if (registration.checkedIn) {
        throw new Error('Already checked in');
      }

      await registration.update({
        checkedIn: true,
        checkedInAt: new Date(),
        checkedInBy,
        status: 'attended'
      });

      return registration;
    } catch (error) {
      throw new Error(`Error checking in: ${error.message}`);
    }
  }

  // IMÁGENES
  async addImage(imageData) {
    try {
      const image = await EventImage.create(imageData);
      return image;
    } catch (error) {
      throw new Error(`Error adding image: ${error.message}`);
    }
  }

  async deleteImage(id, eventId) {
    try {
      const image = await EventImage.findOne({
        where: { id, eventId }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      await image.destroy();
      return { message: 'Image deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }
  }

  async setCoverImage(id, eventId) {
    try {
      // Desmarcar todas las imágenes de portada actuales
      await EventImage.update(
        { isCover: false },
        { where: { eventId } }
      );

      // Marcar la nueva imagen como portada
      const image = await EventImage.findOne({
        where: { id, eventId }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      await image.update({ isCover: true });
      return image;
    } catch (error) {
      throw new Error(`Error setting cover image: ${error.message}`);
    }
  }

  // UTILIDADES
  generateSlug(title) {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now();
  }

  generateRegistrationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default new EventsService();
