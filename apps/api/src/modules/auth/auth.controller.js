import { authService } from './auth.service.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    // Implementar logout logic
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const result = await authService.verifyEmail(req.body.token);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Nuevos endpoints de verificación
export const sendEmailVerificationCode = async (req, res, next) => {
  try {
    const result = await authService.sendEmailVerificationCode(req.body.email);
    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const result = await authService.verifyEmailCode(email, code);
    res.status(200).json({
      success: true,
      message: 'Email verificado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const sendPhoneVerificationCode = async (req, res, next) => {
  try {
    const { userId, phone } = req.body;
    const result = await authService.sendPhoneVerificationCode(userId, phone);
    res.status(200).json({
      success: true,
      message: 'Código de verificación enviado',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPhoneCode = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const result = await authService.verifyPhoneCode(userId, code);
    res.status(200).json({
      success: true,
      message: 'Teléfono verificado exitosamente',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
