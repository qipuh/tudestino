import Slider from './slider.model.js';
import { Op } from 'sequelize';

class SliderController {
  // GET /api/sliders - Obtener sliders activos (público)
  async getSliders(req, res) {
    try {
      const now = new Date();

      const sliders = await Slider.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { startDate: null },
            { startDate: { [Op.lte]: now } }
          ],
          [Op.or]: [
            { endDate: null },
            { endDate: { [Op.gte]: now } }
          ]
        },
        order: [['displayOrder', 'ASC']],
      });

      return res.status(200).json({
        success: true,
        data: sliders
      });
    } catch (error) {
      console.error('Error fetching sliders:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener sliders',
        error: error.message
      });
    }
  }

  // GET /api/sliders/all - Obtener todos los sliders (admin)
  async getAllSliders(req, res) {
    try {
      const sliders = await Slider.findAll({
        order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: sliders
      });
    } catch (error) {
      console.error('Error fetching all sliders:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener sliders',
        error: error.message
      });
    }
  }

  // GET /api/sliders/:id - Obtener un slider por ID
  async getSlider(req, res) {
    try {
      const { id } = req.params;

      const slider = await Slider.findByPk(id);

      if (!slider) {
        return res.status(404).json({
          success: false,
          message: 'Slider no encontrado'
        });
      }

      return res.status(200).json({
        success: true,
        data: slider
      });
    } catch (error) {
      console.error('Error fetching slider:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener slider',
        error: error.message
      });
    }
  }

  // POST /api/sliders - Crear nuevo slider
  async createSlider(req, res) {
    try {
      const { title, linkUrl, isActive, startDate, endDate, displayOrder } = req.body;

      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'El título es requerido'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'La imagen es requerida'
        });
      }

      const slider = await Slider.create({
        title,
        imageUrl: req.file.filename,
        linkUrl,
        isActive: isActive !== undefined ? isActive : true,
        startDate: startDate || null,
        endDate: endDate || null,
        displayOrder: displayOrder || 0
      });

      return res.status(201).json({
        success: true,
        message: 'Slider creado exitosamente',
        data: slider
      });
    } catch (error) {
      console.error('Error creating slider:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear slider',
        error: error.message
      });
    }
  }

  // PUT /api/sliders/:id - Actualizar slider
  async updateSlider(req, res) {
    try {
      const { id } = req.params;
      const { title, linkUrl, isActive, startDate, endDate, displayOrder } = req.body;

      const slider = await Slider.findByPk(id);

      if (!slider) {
        return res.status(404).json({
          success: false,
          message: 'Slider no encontrado'
        });
      }

      const updateData = {
        title: title || slider.title,
        linkUrl: linkUrl !== undefined ? linkUrl : slider.linkUrl,
        isActive: isActive !== undefined ? isActive : slider.isActive,
        startDate: startDate !== undefined ? startDate : slider.startDate,
        endDate: endDate !== undefined ? endDate : slider.endDate,
        displayOrder: displayOrder !== undefined ? displayOrder : slider.displayOrder
      };

      // Si hay nueva imagen, actualizar
      if (req.file) {
        updateData.imageUrl = req.file.filename;
      }

      await slider.update(updateData);

      return res.status(200).json({
        success: true,
        message: 'Slider actualizado exitosamente',
        data: slider
      });
    } catch (error) {
      console.error('Error updating slider:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar slider',
        error: error.message
      });
    }
  }

  // DELETE /api/sliders/:id - Eliminar slider
  async deleteSlider(req, res) {
    try {
      const { id } = req.params;

      const slider = await Slider.findByPk(id);

      if (!slider) {
        return res.status(404).json({
          success: false,
          message: 'Slider no encontrado'
        });
      }

      await slider.destroy();

      return res.status(200).json({
        success: true,
        message: 'Slider eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting slider:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar slider',
        error: error.message
      });
    }
  }

  // PUT /api/sliders/order - Actualizar orden de sliders
  async updateOrder(req, res) {
    try {
      const { order } = req.body; // Array de { id, displayOrder }

      if (!Array.isArray(order)) {
        return res.status(400).json({
          success: false,
          message: 'El formato de orden es inválido'
        });
      }

      // Actualizar cada slider
      await Promise.all(
        order.map(item =>
          Slider.update(
            { displayOrder: item.displayOrder },
            { where: { id: item.id } }
          )
        )
      );

      return res.status(200).json({
        success: true,
        message: 'Orden actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error updating order:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar orden',
        error: error.message
      });
    }
  }
}

export default new SliderController();
