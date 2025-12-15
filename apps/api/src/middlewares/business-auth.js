import Business from '../modules/businesses/business.model.js';
import BusinessService from '../modules/businesses/business-service.model.js';

/**
 * Middleware para verificar que el usuario es dueño de un negocio
 */
export const isBusinessOwner = async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.id;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        message: 'ID del negocio no proporcionado'
      });
    }

    const business = await Business.findOne({
      where: { id: businessId, ownerId: userId }
    });

    if (!business) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este negocio'
      });
    }

    // Agregar el negocio al request para uso posterior
    req.business = business;
    next();
  } catch (error) {
    console.error('Error en isBusinessOwner middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};

/**
 * Middleware para verificar que el usuario puede gestionar un servicio
 */
export const canManageService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const userId = req.user.id;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'ID del servicio no proporcionado'
      });
    }

    const service = await BusinessService.findOne({
      where: { id: serviceId },
      include: [
        {
          model: Business,
          as: 'business',
          where: { ownerId: userId }
        }
      ]
    });

    if (!service) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para gestionar este servicio'
      });
    }

    // Agregar el servicio al request para uso posterior
    req.service = service;
    next();
  } catch (error) {
    console.error('Error en canManageService middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar permisos'
    });
  }
};

/**
 * Middleware para verificar que el usuario tiene rol business_owner o admin
 */
export const requireBusinessOwnerRole = (req, res, next) => {
  try {
    const userRole = req.user.role;

    if (userRole !== 'business_owner' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Solo los usuarios con rol business_owner pueden acceder a este recurso'
      });
    }

    next();
  } catch (error) {
    console.error('Error en requireBusinessOwnerRole middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar rol'
    });
  }
};

/**
 * Middleware para verificar que un negocio está activo y verificado
 */
export const requireActiveVerifiedBusiness = async (req, res, next) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Negocio no encontrado'
      });
    }

    if (!business.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Este negocio está inactivo'
      });
    }

    if (business.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Este negocio no está verificado o activo'
      });
    }

    req.business = business;
    next();
  } catch (error) {
    console.error('Error en requireActiveVerifiedBusiness middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al verificar estado del negocio'
    });
  }
};

export default {
  isBusinessOwner,
  canManageService,
  requireBusinessOwnerRole,
  requireActiveVerifiedBusiness
};
