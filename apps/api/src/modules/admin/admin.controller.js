import adminService from './admin.service.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

/**
 * Get dashboard statistics
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await adminService.getStats();

  res.json({
    success: true,
    data: stats
  });
});

/**
 * Get recent users
 */
export const getRecentUsers = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const users = await adminService.getRecentUsers(limit);

  res.json({
    success: true,
    data: { users }
  });
});

/**
 * Get all users with pagination
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, role } = req.query;

  const result = await adminService.getAllUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
    search,
    role
  });

  res.json({
    success: true,
    data: result
  });
});

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  const user = await adminService.updateUserStatus(userId, isActive);

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
});

/**
 * Delete user
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const result = await adminService.deleteUser(userId);

  res.json({
    success: true,
    message: result.message
  });
});

/**
 * Get WhatsApp API configuration
 */
export const getWhatsAppConfig = asyncHandler(async (req, res) => {
  const token = await adminService.getWhatsAppConfig();

  res.json({
    success: true,
    token: token || ''
  });
});

/**
 * Set WhatsApp API configuration
 */
export const setWhatsAppConfig = asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token || !token.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El token es requerido'
    });
  }

  await adminService.setWhatsAppConfig(token.trim());

  res.json({
    success: true,
    message: 'Configuración de WhatsApp guardada correctamente'
  });
});
