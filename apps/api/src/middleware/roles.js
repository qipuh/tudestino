/**
 * Middleware para verificar roles de usuario
 */

export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador.'
    });
  }

  next();
};

export const isAdminOrOwner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'No autenticado'
    });
  }

  const isOwner = req.params.userId === req.user.id || req.params.id === req.user.id;
  const isAdminUser = req.user.role === 'admin';

  if (!isOwner && !isAdminUser) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado'
    });
  }

  next();
};
