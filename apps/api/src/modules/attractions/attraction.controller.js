import Attraction from './attraction.model.js';
import AttractionImage from './attraction-image.model.js';
import AttractionTag from './attraction-tag.model.js';
import { Op } from 'sequelize';

class AttractionController {
  /**
   * Calcular distancia usando fórmula de Haversine
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  // GET /api/attractions - Obtener atractivos publicados (público)
  async getAttractions(req, res) {
    try {
      const { category, city, search, limit = 20, offset = 0 } = req.query;

      const where = { isPublished: true };

      if (category) {
        where.category = category;
      }

      if (city) {
        where.city = { [Op.like]: `%${city}%` };
      }

      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const { rows: attractions, count } = await Attraction.findAndCountAll({
        where,
        include: [
          {
            model: AttractionImage,
            as: 'images',
            attributes: ['id', 'url', 'caption', 'type', 'displayOrder']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: {
          attractions,
          pagination: {
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching attractions:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener atractivos',
        error: error.message
      });
    }
  }

  // GET /api/attractions/all - Obtener todos los atractivos (admin)
  async getAllAttractions(req, res) {
    try {
      const attractions = await Attraction.findAll({
        include: [
          {
            model: AttractionImage,
            as: 'images',
            attributes: ['id', 'url', 'caption', 'type', 'displayOrder']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: attractions
      });
    } catch (error) {
      console.error('Error fetching all attractions:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener atractivos',
        error: error.message
      });
    }
  }

  // GET /api/attractions/:id - Obtener un atractivo por ID
  async getAttraction(req, res) {
    try {
      const { id } = req.params;

      const attraction = await Attraction.findByPk(id, {
        include: [
          {
            model: AttractionImage,
            as: 'images',
            attributes: ['id', 'url', 'caption', 'type', 'displayOrder'],
            order: [['displayOrder', 'ASC']]
          },
          {
            model: AttractionTag,
            as: 'tags',
            attributes: ['id', 'placeId', 'placeType']
          }
        ]
      });

      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Atractivo no encontrado'
        });
      }

      // Incrementar vistas
      await attraction.increment('views');

      return res.status(200).json({
        success: true,
        data: attraction
      });
    } catch (error) {
      console.error('Error fetching attraction:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener atractivo',
        error: error.message
      });
    }
  }

  // POST /api/attractions - Crear nuevo atractivo
  async createAttraction(req, res) {
    try {
      const {
        title,
        description,
        videoUrl,
        category,
        latitude,
        longitude,
        address,
        city,
        region,
        country,
        hasDistanceMarkers,
        startPoint,
        endPoint,
        whatToDo,
        recommendations,
        isPublished
      } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'El título es requerido'
        });
      }

      // Calcular distancia si hay marcadores
      let distance = null;
      if (hasDistanceMarkers && startPoint && endPoint) {
        try {
          const start = JSON.parse(startPoint);
          const end = JSON.parse(endPoint);
          distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
        } catch (e) {
          console.error('Error calculating distance:', e);
        }
      }

      const attraction = await Attraction.create({
        title,
        description,
        coverImage: req.file ? req.file.filename : null,
        videoUrl,
        category,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        address,
        city,
        region,
        country,
        hasDistanceMarkers: hasDistanceMarkers === 'true',
        startPoint: startPoint ? JSON.parse(startPoint) : null,
        endPoint: endPoint ? JSON.parse(endPoint) : null,
        distance,
        whatToDo,
        recommendations,
        isPublished: isPublished === 'true',
        publishedAt: isPublished === 'true' ? new Date() : null,
        createdBy: req.user?.id
      });

      return res.status(201).json({
        success: true,
        message: 'Atractivo creado exitosamente',
        data: attraction
      });
    } catch (error) {
      console.error('Error creating attraction:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear atractivo',
        error: error.message
      });
    }
  }

  // PUT /api/attractions/:id - Actualizar atractivo
  async updateAttraction(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        videoUrl,
        category,
        latitude,
        longitude,
        address,
        city,
        region,
        country,
        hasDistanceMarkers,
        startPoint,
        endPoint,
        whatToDo,
        recommendations,
        isPublished
      } = req.body;

      const attraction = await Attraction.findByPk(id);

      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Atractivo no encontrado'
        });
      }

      // Calcular distancia si hay marcadores
      let distance = attraction.distance;
      if (hasDistanceMarkers === 'true' && startPoint && endPoint) {
        try {
          const start = JSON.parse(startPoint);
          const end = JSON.parse(endPoint);
          distance = this.calculateDistance(start.lat, start.lng, end.lat, end.lng);
        } catch (e) {
          console.error('Error calculating distance:', e);
        }
      }

      const updateData = {
        title: title || attraction.title,
        description: description !== undefined ? description : attraction.description,
        videoUrl: videoUrl !== undefined ? videoUrl : attraction.videoUrl,
        category: category || attraction.category,
        latitude: latitude ? parseFloat(latitude) : attraction.latitude,
        longitude: longitude ? parseFloat(longitude) : attraction.longitude,
        address: address !== undefined ? address : attraction.address,
        city: city !== undefined ? city : attraction.city,
        region: region !== undefined ? region : attraction.region,
        country: country !== undefined ? country : attraction.country,
        hasDistanceMarkers: hasDistanceMarkers !== undefined ? hasDistanceMarkers === 'true' : attraction.hasDistanceMarkers,
        startPoint: startPoint ? JSON.parse(startPoint) : attraction.startPoint,
        endPoint: endPoint ? JSON.parse(endPoint) : attraction.endPoint,
        distance,
        whatToDo: whatToDo !== undefined ? whatToDo : attraction.whatToDo,
        recommendations: recommendations !== undefined ? recommendations : attraction.recommendations,
        isPublished: isPublished !== undefined ? isPublished === 'true' : attraction.isPublished,
        publishedAt: (isPublished === 'true' && !attraction.publishedAt) ? new Date() : attraction.publishedAt
      };

      if (req.file) {
        updateData.coverImage = req.file.filename;
      }

      await attraction.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Atractivo actualizado exitosamente',
        data: attraction
      });
    } catch (error) {
      console.error('Error updating attraction:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar atractivo',
        error: error.message
      });
    }
  }

  // DELETE /api/attractions/:id - Eliminar atractivo
  async deleteAttraction(req, res) {
    try {
      const { id } = req.params;

      const attraction = await Attraction.findByPk(id);

      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Atractivo no encontrado'
        });
      }

      // Eliminar imágenes asociadas
      await AttractionImage.destroy({ where: { attractionId: id } });

      // Eliminar tags asociados
      await AttractionTag.destroy({ where: { attractionId: id } });

      await attraction.destroy();

      return res.status(200).json({
        success: true,
        message: 'Atractivo eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting attraction:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar atractivo',
        error: error.message
      });
    }
  }

  // POST /api/attractions/:id/gallery - Subir imágenes a la galería
  async uploadGalleryImages(req, res) {
    try {
      const { id } = req.params;

      const attraction = await Attraction.findByPk(id);

      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Atractivo no encontrado'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se subieron imágenes'
        });
      }

      const images = await Promise.all(
        req.files.map((file, index) =>
          AttractionImage.create({
            attractionId: id,
            url: file.filename,
            type: 'gallery',
            displayOrder: index
          })
        )
      );

      return res.status(201).json({
        success: true,
        message: 'Imágenes subidas exitosamente',
        data: images
      });
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir imágenes',
        error: error.message
      });
    }
  }

  // DELETE /api/attractions/:id/gallery/:imageId - Eliminar imagen de galería
  async deleteGalleryImage(req, res) {
    try {
      const { imageId } = req.params;

      const image = await AttractionImage.findByPk(imageId);

      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      await image.destroy();

      return res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar imagen',
        error: error.message
      });
    }
  }

  // POST /api/attractions/:id/tags - Agregar tag
  async addTag(req, res) {
    try {
      const { id } = req.params;
      const { placeId, placeType } = req.body;

      if (!placeId || !placeType) {
        return res.status(400).json({
          success: false,
          message: 'placeId y placeType son requeridos'
        });
      }

      const attraction = await Attraction.findByPk(id);

      if (!attraction) {
        return res.status(404).json({
          success: false,
          message: 'Atractivo no encontrado'
        });
      }

      const tag = await AttractionTag.create({
        attractionId: id,
        placeId,
        placeType
      });

      return res.status(201).json({
        success: true,
        message: 'Tag agregado exitosamente',
        data: tag
      });
    } catch (error) {
      console.error('Error adding tag:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al agregar tag',
        error: error.message
      });
    }
  }

  // DELETE /api/attractions/:id/tags/:tagId - Eliminar tag
  async removeTag(req, res) {
    try {
      const { tagId } = req.params;

      const tag = await AttractionTag.findByPk(tagId);

      if (!tag) {
        return res.status(404).json({
          success: false,
          message: 'Tag no encontrado'
        });
      }

      await tag.destroy();

      return res.status(200).json({
        success: true,
        message: 'Tag eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error removing tag:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar tag',
        error: error.message
      });
    }
  }
}

export default new AttractionController();
