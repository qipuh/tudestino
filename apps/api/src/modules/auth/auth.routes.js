import express from 'express';
import {
  register,
  login,
  logout,
  verifyEmail,
  resetPassword,
  sendEmailVerificationCode,
  verifyEmailCode,
  sendPhoneVerificationCode,
  verifyPhoneCode
} from './auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-email', verifyEmail);
router.post('/reset-password', resetPassword);

// Nuevas rutas de verificación
router.post('/send-email-code', sendEmailVerificationCode);
router.post('/verify-email-code', verifyEmailCode);
router.post('/send-phone-code', sendPhoneVerificationCode);
router.post('/verify-phone-code', verifyPhoneCode);

export default router;
