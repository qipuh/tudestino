import entertainmentService from './entertainment.service.js';

class EntertainmentController {
  // ESTABLECIMIENTOS
  async createEntertainment(req, res) {
    try {
      const entertainment = await entertainmentService.createEntertainment(
        req.body,
        req.user.id
      );
      res.status(201).json(entertainment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getEntertainment(req, res) {
    try {
      const entertainment = await entertainmentService.getEntertainmentById(
        req.params.id
      );

      if (!entertainment) {
        return res.status(404).json({ error: 'Entertainment venue not found' });
      }

      res.json(entertainment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateEntertainment(req, res) {
    try {
      const entertainment = await entertainmentService.updateEntertainment(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json(entertainment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteEntertainment(req, res) {
    try {
      const result = await entertainmentService.deleteEntertainment(
        req.params.id,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async searchEntertainment(req, res) {
    try {
      const filters = {
        city: req.query.city,
        type: req.query.type ? (req.query.type.includes(',') ? req.query.type.split(',') : req.query.type) : undefined,
        musicGenres: req.query.musicGenres ? JSON.parse(req.query.musicGenres) : undefined,
        priceRange: req.query.priceRange ? parseInt(req.query.priceRange) : undefined,
        minAge: req.query.minAge ? parseInt(req.query.minAge) : undefined,
        hasVipArea: req.query.hasVipArea === 'true',
        hasParking: req.query.hasParking === 'true',
        hasLiveMusic: req.query.hasLiveMusic === 'true',
        acceptsReservations: req.query.acceptsReservations === 'true',
        minRating: req.query.minRating ? parseFloat(req.query.minRating) : undefined,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const result = await entertainmentService.searchEntertainment(filters);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyEntertainment(req, res) {
    try {
      const entertainment = await entertainmentService.getEntertainmentByOwner(
        req.user.id
      );
      res.json(entertainment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // RESERVAS
  async createReservation(req, res) {
    try {
      const reservation = await entertainmentService.createReservation({
        ...req.body,
        userId: req.user.id
      });
      res.status(201).json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReservation(req, res) {
    try {
      const reservation = await entertainmentService.updateReservation(
        req.params.reservationId,
        req.body,
        req.user.id
      );
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReservationStatus(req, res) {
    try {
      const reservation = await entertainmentService.updateReservationByVenue(
        req.params.reservationId,
        req.body,
        req.params.entertainmentId
      );
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async cancelReservation(req, res) {
    try {
      const reservation = await entertainmentService.cancelReservation(
        req.params.reservationId,
        req.user.id,
        req.body.reason
      );
      res.json(reservation);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyReservations(req, res) {
    try {
      const reservations = await entertainmentService.getReservationsByUser(
        req.user.id,
        req.query.status
      );
      res.json(reservations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getVenueReservations(req, res) {
    try {
      const reservations = await entertainmentService.getReservationsByVenue(
        req.params.entertainmentId,
        req.query.date
      );
      res.json(reservations);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // IMÁGENES
  async addImage(req, res) {
    try {
      const image = await entertainmentService.addImage({
        ...req.body,
        entertainmentId: req.params.entertainmentId
      });
      res.status(201).json(image);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteImage(req, res) {
    try {
      const result = await entertainmentService.deleteImage(
        req.params.imageId,
        req.params.entertainmentId
      );
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async setMainImage(req, res) {
    try {
      const image = await entertainmentService.setMainImage(
        req.params.imageId,
        req.params.entertainmentId
      );
      res.json(image);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new EntertainmentController();
