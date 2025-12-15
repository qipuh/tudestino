import eventsService from './events.service.js';

class EventsController {
  // EVENTOS
  async createEvent(req, res) {
    try {
      const event = await eventsService.createEvent(
        req.body,
        req.user.id
      );
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEvent(req, res) {
    try {
      const event = req.params.slug
        ? await eventsService.getEventBySlug(req.params.slug)
        : await eventsService.getEventById(req.params.id);

      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }

      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEvent(req, res) {
    try {
      const event = await eventsService.updateEvent(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      const result = await eventsService.deleteEvent(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchEvents(req, res) {
    try {
      const filters = {
        category: req.query.category ? (req.query.category.includes(',') ? req.query.category.split(',') : req.query.category) : undefined,
        city: req.query.city,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        isFree: req.query.isFree === 'true',
        locationType: req.query.locationType,
        tags: req.query.tags ? JSON.parse(req.query.tags) : undefined,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        organizerId: req.query.organizerId ? parseInt(req.query.organizerId) : undefined,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await eventsService.searchEvents(filters);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUpcomingEvents(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const events = await eventsService.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getFeaturedEvents(req, res) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 6;
      const events = await eventsService.getFeaturedEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyEvents(req, res) {
    try {
      const events = await eventsService.getEventsByOrganizer(req.user.id);
      res.json(events);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // TICKETS
  async createTicket(req, res) {
    try {
      const ticket = await eventsService.createTicket({
        ...req.body,
        eventId: req.params.eventId
      });
      res.status(201).json(ticket);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateTicket(req, res) {
    try {
      const ticket = await eventsService.updateTicket(
        req.params.ticketId,
        req.body,
        req.params.eventId
      );
      res.json(ticket);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteTicket(req, res) {
    try {
      const result = await eventsService.deleteTicket(
        req.params.ticketId,
        req.params.eventId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEventTickets(req, res) {
    try {
      const tickets = await eventsService.getEventTickets(req.params.eventId);
      res.json(tickets);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // REGISTRACIONES
  async createRegistration(req, res) {
    try {
      const registration = await eventsService.createRegistration({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateRegistration(req, res) {
    try {
      const registration = await eventsService.updateRegistration(
        req.params.registrationId,
        req.body,
        req.user.id
      );
      res.json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelRegistration(req, res) {
    try {
      const registration = await eventsService.cancelRegistration(
        req.params.registrationId,
        req.user.id,
        req.body.reason
      );
      res.json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyRegistrations(req, res) {
    try {
      const registrations = await eventsService.getRegistrationsByUser(
        req.user.id
      );
      res.json(registrations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEventRegistrations(req, res) {
    try {
      const registrations = await eventsService.getEventRegistrations(
        req.params.eventId
      );
      res.json(registrations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async checkIn(req, res) {
    try {
      const registration = await eventsService.checkInRegistration(
        req.body.registrationCode,
        req.user.id
      );
      res.json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // IMÁGENES
  async addImage(req, res) {
    try {
      const image = await eventsService.addImage({
        ...req.body,
        eventId: req.params.eventId
      });
      res.status(201).json(image);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteImage(req, res) {
    try {
      const result = await eventsService.deleteImage(
        req.params.imageId,
        req.params.eventId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setCoverImage(req, res) {
    try {
      const image = await eventsService.setCoverImage(
        req.params.imageId,
        req.params.eventId
      );
      res.json(image);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new EventsController();
