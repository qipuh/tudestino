import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError('Invalid or expired token', 401));
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized access', 403));
    }
    next();
  };
};

// Middleware para autenticación opcional
export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }
    // Si no hay token, simplemente continuar sin establecer req.user
    next();
  } catch (error) {
    // Si hay un token pero es inválido, simplemente continuar sin autenticar
    next();
  }
};
