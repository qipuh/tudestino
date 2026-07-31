import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Route from './route.model.js';
import RouteMilestone from './route-milestone.model.js';
import { Like } from '../social/social.model.sequelize.js';
import User from '../users/user.model-mysql.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '../../../uploads');

// Borra un archivo subido a partir de la URL relativa guardada en DB
// (ej. "/uploads/routes/route-123.jpg") - best-effort, nunca tira si el
// archivo ya no existe.
const deleteUploadedFile = (relativeUrl) => {
  if (!relativeUrl) return;
  try {
    const filePath = path.join(uploadsDir, relativeUrl.replace(/^\/uploads\//, ''));
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (error) {
    console.error('No se pudo borrar el archivo', relativeUrl, error.message);
  }
};

const PUBLIC_ATTRIBUTES = [
  'id', 'userId', 'title', 'description', 'activityType', 'coverImage',
  'startPoint', 'endPoint', 'distanceKm', 'durationSeconds', 'elevationGainM',
  'avgSpeedKmh', 'city', 'startedAt', 'likesCount', 'commentsCount', 'createdAt',
];

const attachIsLiked = async (routes, userId) => {
  if (!userId || routes.length === 0) return routes;

  const routeIds = routes.map(r => r.id);
  const userLikes = await Like.findAll({
    where: { userId, contentType: 'route', contentId: routeIds },
  });
  const likedIds = new Set(userLikes.map(l => l.contentId));

  return routes.map(route => {
    const plain = route.toJSON ? route.toJSON() : route;
    return { ...plain, isLiked: likedIds.has(plain.id) };
  });
};

// POST /api/routes
export const createRoute = async (req, res) => {
  try {
    const {
      title, description, activityType, city, startedAt,
      distanceKm, durationSeconds, elevationGainM, avgSpeedKmh,
    } = req.body;

    let trackPoints;
    try {
      trackPoints = typeof req.body.trackPoints === 'string'
        ? JSON.parse(req.body.trackPoints)
        : req.body.trackPoints;
    } catch (e) {
      return res.status(400).json({ success: false, message: 'trackPoints inválido, debe ser un JSON válido' });
    }

    if (!Array.isArray(trackPoints) || trackPoints.length < 2) {
      return res.status(400).json({ success: false, message: 'trackPoints debe tener al menos 2 puntos' });
    }

    // Nunca confiar en start/end enviados por el cliente: se calculan del track real
    const startPoint = { lat: trackPoints[0].lat, lng: trackPoints[0].lng };
    const endPoint = { lat: trackPoints[trackPoints.length - 1].lat, lng: trackPoints[trackPoints.length - 1].lng };

    const coverImage = req.file ? `/uploads/routes/${req.file.filename}` : null;

    const route = await Route.create({
      userId: req.user.id,
      title,
      description: description || null,
      activityType,
      coverImage,
      trackPoints,
      startPoint,
      endPoint,
      distanceKm: distanceKm || null,
      durationSeconds: durationSeconds || null,
      elevationGainM: elevationGainM || null,
      avgSpeedKmh: avgSpeedKmh || null,
      city: city || null,
      startedAt: startedAt || null,
    });

    const routeWithUser = await Route.findByPk(route.id, {
      attributes: [...PUBLIC_ATTRIBUTES, 'trackPoints'],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'username'] }],
    });

    res.status(201).json({ success: true, message: 'Ruta creada', data: routeWithUser });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ success: false, message: 'Error al crear la ruta', error: error.message });
  }
};

// PUT /api/routes/:routeId
export const updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const { title, description, city } = req.body;

    const route = await Route.findByPk(routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    }
    if (route.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para editar esta ruta' });
    }

    const updateData = {
      title: title !== undefined ? title : route.title,
      description: description !== undefined ? description : route.description,
      city: city !== undefined ? city : route.city,
    };

    if (req.file) {
      deleteUploadedFile(route.coverImage);
      updateData.coverImage = `/uploads/routes/${req.file.filename}`;
    }

    await route.update(updateData);

    const routeWithUser = await Route.findByPk(route.id, {
      attributes: [...PUBLIC_ATTRIBUTES, 'trackPoints'],
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'username'] }],
    });

    res.json({ success: true, message: 'Ruta actualizada', data: routeWithUser });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar la ruta', error: error.message });
  }
};

// GET /api/routes/feed
export const getRoutesFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { activityType } = req.query;

    const whereClause = { isActive: true };
    if (activityType) whereClause.activityType = activityType;

    const { rows, count } = await Route.findAndCountAll({
      where: whereClause,
      attributes: PUBLIC_ATTRIBUTES, // sin trackPoints completo: el feed no necesita el track entero
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    const routesWithLikeStatus = await attachIsLiked(rows, req.user?.id);

    res.json({
      success: true,
      data: {
        routes: routesWithLikeStatus,
        pagination: { page, limit, total: count, hasMore: page * limit < count },
      },
    });
  } catch (error) {
    console.error('Error getting routes feed:', error);
    res.status(500).json({ success: false, message: 'Error al obtener el feed de rutas', error: error.message });
  }
};

// GET /api/routes/:routeId
export const getRouteById = async (req, res) => {
  try {
    const { routeId } = req.params;

    const route = await Route.findOne({
      where: { id: routeId, isActive: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'username'] },
        { model: RouteMilestone, as: 'milestones' },
      ],
      order: [[{ model: RouteMilestone, as: 'milestones' }, 'recordedAt', 'ASC']],
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    }

    const [routeWithLikeStatus] = await attachIsLiked([route], req.user?.id);

    res.json({ success: true, data: routeWithLikeStatus });
  } catch (error) {
    console.error('Error getting route:', error);
    res.status(500).json({ success: false, message: 'Error al obtener la ruta', error: error.message });
  }
};

// GET /api/routes/users/:userId
export const getUserRoutes = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const { rows, count } = await Route.findAndCountAll({
      where: { userId, isActive: true },
      attributes: PUBLIC_ATTRIBUTES,
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit,
      offset: (page - 1) * limit,
    });

    const routesWithLikeStatus = await attachIsLiked(rows, req.user?.id);

    res.json({
      success: true,
      data: {
        routes: routesWithLikeStatus,
        pagination: { page, limit, total: count, hasMore: page * limit < count },
      },
    });
  } catch (error) {
    console.error('Error getting user routes:', error);
    res.status(500).json({ success: false, message: 'Error al obtener las rutas del usuario', error: error.message });
  }
};

// DELETE /api/routes/:routeId
export const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;

    const route = await Route.findByPk(routeId);
    if (!route) {
      return res.status(404).json({ success: false, message: 'Ruta no encontrada' });
    }

    if (route.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para eliminar esta ruta' });
    }

    await route.update({ isActive: false });
    // La ruta queda inaccesible (isActive:true en todas las queries), así
    // que la portada ya no hace falta en disco.
    deleteUploadedFile(route.coverImage);

    res.json({ success: true, message: 'Ruta eliminada' });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar la ruta', error: error.message });
  }
};
