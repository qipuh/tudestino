import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RouteMilestone from './route-milestone.model.js';
import Route from './route.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads');

const deleteUploadedFile = (relativeUrl) => {
  if (!relativeUrl) return;
  try {
    const filePath = path.join(uploadsDir, relativeUrl.replace(/^\/uploads\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error('No se pudo borrar el archivo', relativeUrl, error.message);
  }
};

// POST /api/routes/:routeId/milestones
export const createMilestone = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { lat, lng, comment, recordedAt } = req.body;

    const route = await Route.findByPk(routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    }
    if (route.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No puedes agregar hitos a la ruta de otro usuario' });
    }
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Falta la ubicación del hito' });
    }

    const photoUrl = req.file ? `/uploads/milestones/${req.file.filename}` : null;
    if (!photoUrl && !comment) {
      return res.status(400).json({ success: false, message: 'El hito necesita una foto o un comentario' });
    }

    const milestone = await RouteMilestone.create({
      routeId,
      userId: req.user.id,
      photoUrl,
      comment: comment || null,
      point: { lat: parseFloat(lat), lng: parseFloat(lng) },
      recordedAt: recordedAt || null,
    });

    res.status(201).json({ success: true, message: 'Hito guardado', data: milestone });
  } catch (error) {
    console.error('Error creating route milestone:', error);
    res.status(500).json({ success: false, message: 'Error al guardar el hito', error: error.message });
  }
};

// PUT /api/routes/:routeId/milestones/:milestoneId
export const updateMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;
    const { comment, removePhoto } = req.body;

    const milestone = await RouteMilestone.findByPk(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Hito no encontrado' });
    }
    if (milestone.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar este hito' });
    }

    const updateData = {
      comment: comment !== undefined ? (comment || null) : milestone.comment,
    };

    if (req.file) {
      deleteUploadedFile(milestone.photoUrl);
      updateData.photoUrl = `/uploads/milestones/${req.file.filename}`;
    } else if (removePhoto === 'true' || removePhoto === true) {
      deleteUploadedFile(milestone.photoUrl);
      updateData.photoUrl = null;
    }

    const finalPhotoUrl = updateData.photoUrl !== undefined ? updateData.photoUrl : milestone.photoUrl;
    if (!finalPhotoUrl && !updateData.comment) {
      return res.status(400).json({ success: false, message: 'El hito necesita una foto o un comentario' });
    }

    await milestone.update(updateData);
    res.json({ success: true, message: 'Hito actualizado', data: milestone });
  } catch (error) {
    console.error('Error updating route milestone:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar el hito', error: error.message });
  }
};

// GET /api/routes/:routeId/milestones
export const getMilestones = async (req, res) => {
  try {
    const milestones = await RouteMilestone.findAll({
      where: { routeId: req.params.routeId },
      order: [['recordedAt', 'ASC'], ['createdAt', 'ASC']],
    });
    res.json({ success: true, data: { milestones } });
  } catch (error) {
    console.error('Error getting route milestones:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/routes/:routeId/milestones/:milestoneId
export const deleteMilestone = async (req, res) => {
  try {
    const { milestoneId } = req.params;

    const milestone = await RouteMilestone.findByPk(milestoneId);
    if (!milestone) {
      return res.status(404).json({ success: false, message: 'Hito no encontrado' });
    }
    if (milestone.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar este hito' });
    }

    deleteUploadedFile(milestone.photoUrl);
    await milestone.destroy();
    res.json({ success: true, message: 'Hito eliminado' });
  } catch (error) {
    console.error('Error deleting route milestone:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
