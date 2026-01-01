import Entertainment from './entertainment.model.js';
import EntertainmentReservation from './entertainment-reservation.model.js';
import EntertainmentImage from './entertainment-image.model.js';
import { Op } from 'sequelize';

// Establecer relaciones entre modelos
Entertainment.hasMany(EntertainmentReservation, { foreignKey: 'entertainment_id', as: 'reservations' });
EntertainmentReservation.belongsTo(Entertainment, { foreignKey: 'entertainment_id', as: 'entertainment' });

Entertainment.hasMany(EntertainmentImage, { foreignKey: 'entertainment_id', as: 'entertainmentImages' });
EntertainmentImage.belongsTo(Entertainment, { foreignKey: 'entertainment_id', as: 'entertainment' });

class EntertainmentService {
  // ESTABLECIMIENTOS
  async createEntertainment(entertainmentData, ownerId) {
    try {
      const entertainment = await Entertainment.create({
        ...entertainmentData,
        ownerId
      });
      return entertainment;
    } catch (error) {
      throw new Error(`Error creating entertainment venue: ${error.message}`);
    }
  }

  async getEntertainmentById(id) {
    try {
      const entertainment = await Entertainment.findByPk(id, {
        include: [
          {
            model: EntertainmentImage,
            as: 'entertainmentImages',
            order: [['displayOrder', 'ASC']]
          }
        ]
      });
      return entertainment;
    } catch (error) {
      throw new Error(`Error fetching entertainment venue: ${error.message}`);
    }
  }

  async updateEntertainment(id, updateData, ownerId) {
    try {
      const entertainment = await Entertainment.findOne({
        where: { id, ownerId }
      });

      if (!entertainment) {
        throw new Error('Entertainment venue not found or unauthorized');
      }

      await entertainment.update(updateData);
      return entertainment;
    } catch (error) {
      throw new Error(`Error updating entertainment venue: ${error.message}`);
    }
  }

  async deleteEntertainment(id, ownerId) {
    try {
      const entertainment = await Entertainment.findOne({
        where: { id, ownerId }
      });

      if (!entertainment) {
        throw new Error('Entertainment venue not found or unauthorized');
      }

      await entertainment.destroy();
      return { message: 'Entertainment venue deleted successfully' };
    } catch (error) {
      throw new Error(`Error deleting entertainment venue: ${error.message}`);
    }
  }

  async searchEntertainment(filters = {}) {
    try {
      const {
        city,
        type,
        musicGenres,
        priceRange,
        minAge,
        hasVipArea,
        hasParking,
        hasLiveMusic,
        acceptsReservations,
        minRating,
        page = 1,
        limit = 20,
        sortBy = 'averageRating',
        sortOrder = 'DESC'
      } = filters;

      const where = {
        status: 'published',
        isActive: true
      };

      if (city) {
        where.city = { [Op.like]: `%${city}%` };
      }

      if (type) {
        if (Array.isArray(type)) {
          where.type = { [Op.in]: type };
        } else {
          where.type = type;
        }
      }

      if (musicGenres && musicGenres.length > 0) {
        where.musicGenres = {
          [Op.contains]: musicGenres
        };
      }

      if (priceRange) {
        where.priceRange = priceRange;
      }

      if (minAge) {
        where.minAge = { [Op.lte]: minAge };
      }

      if (hasVipArea !== undefined) {
        where.hasVipArea = hasVipArea;
      }

      if (hasParking !== undefined) {
        where.hasParking = hasParking;
      }

      if (hasLiveMusic !== undefined) {
        where.hasLiveMusic = hasLiveMusic;
      }

      if (acceptsReservations !== undefined) {
        where.acceptsReservations = acceptsReservations;
      }

      if (minRating) {
        where.averageRating = { [Op.gte]: minRating };
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Entertainment.findAndCountAll({
        where,
        include: [
          {
            model: EntertainmentImage,
            as: 'entertainmentImages',
            where: { isMain: true },
            required: false
          }
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });

      return {
        entertainment: rows,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      throw new Error(`Error searching entertainment venues: ${error.message}`);
    }
  }

  async getEntertainmentByOwner(ownerId) {
    try {
      const entertainment = await Entertainment.findAll({
        where: { ownerId },
        include: [
          {
            model: EntertainmentImage,
            as: 'entertainmentImages',
            where: { isMain: true },
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      return entertainment;
    } catch (error) {
      throw new Error(`Error fetching owner entertainment venues: ${error.message}`);
    }
  }

  // RESERVAS
  async createReservation(reservationData) {
    try {
      // Generar código de confirmación único
      const confirmationCode = this.generateConfirmationCode();

      const reservation = await EntertainmentReservation.create({
        ...reservationData,
        confirmationCode,
        status: 'pending'
      });

      return reservation;
    } catch (error) {
      throw new Error(`Error creating reservation: ${error.message}`);
    }
  }

  async updateReservation(id, updateData, userId) {
    try {
      const reservation = await EntertainmentReservation.findOne({
        where: { id, userId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update(updateData);
      return reservation;
    } catch (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }
  }

  async updateReservationByVenue(id, updateData, entertainmentId) {
    try {
      const reservation = await EntertainmentReservation.findOne({
        where: { id, entertainmentId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update(updateData);
      return reservation;
    } catch (error) {
      throw new Error(`Error updating reservation: ${error.message}`);
    }
  }

  async cancelReservation(id, userId, reason) {
    try {
      const reservation = await EntertainmentReservation.findOne({
        where: { id, userId }
      });

      if (!reservation) {
        throw new Error('Reservation not found');
      }

      await reservation.update({
        status: 'cancelled',
        cancellationReason: reason,
        cancelledBy: 'customer',
        cancelledAt: new Date()
      });

      return reservation;
    } catch (error) {
      throw new Error(`Error cancelling reservation: ${error.message}`);
    }
  }

  async getReservationsByUser(userId, status = null) {
    try {
      const where = { userId };
      if (status) {
        where.status = status;
      }

      const reservations = await EntertainmentReservation.findAll({
        where,
        include: [
          {
            model: Entertainment,
            as: 'entertainment',
            include: [
              {
                model: EntertainmentImage,
                as: 'entertainmentImages',
                where: { isMain: true },
                required: false
              }
            ]
          }
        ],
        order: [['reservationDate', 'DESC'], ['reservationTime', 'DESC']]
      });

      return reservations;
    } catch (error) {
      throw new Error(`Error fetching user reservations: ${error.message}`);
    }
  }

  async getReservationsByVenue(entertainmentId, date = null) {
    try {
      const where = { entertainmentId };
      if (date) {
        where.reservationDate = date;
      }

      const reservations = await EntertainmentReservation.findAll({
        where,
        order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']]
      });

      return reservations;
    } catch (error) {
      throw new Error(`Error fetching venue reservations: ${error.message}`);
    }
  }

  // IMÁGENES
  async addImage(imageData) {
    try {
      const image = await EntertainmentImage.create(imageData);
      return image;
    } catch (error) {
      throw new Error(`Error adding image: ${error.message}`);
    }
  }

  async deleteImage(id, entertainmentId) {
    try {
      const image = await EntertainmentImage.findOne({
        where: { id, entertainmentId }
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

  async setMainImage(id, entertainmentId) {
    try {
      // Desmarcar todas las imágenes principales actuales
      await EntertainmentImage.update(
        { isMain: false },
        { where: { entertainmentId } }
      );

      // Marcar la nueva imagen como principal
      const image = await EntertainmentImage.findOne({
        where: { id, entertainmentId }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      await image.update({ isMain: true });
      return image;
    } catch (error) {
      throw new Error(`Error setting main image: ${error.message}`);
    }
  }

  // UTILIDADES
  generateConfirmationCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default new EntertainmentService();
