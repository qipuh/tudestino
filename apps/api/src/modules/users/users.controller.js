import { usersService } from './users.service.js';
import User from './user.model-mysql.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await usersService.getProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await usersService.updateProfile(req.user.id, req.body);

    // Excluir password de la respuesta
    const userData = user.toJSON();
    delete userData.password;

    res.status(200).json({
      success: true,
      user: userData,
      data: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await usersService.getUserById(req.params.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const setFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ success: false, message: 'fcmToken requerido' });
    }
    await User.update({ fcmToken }, { where: { id: req.user.id } });
    res.status(200).json({ success: true, message: 'Token registrado' });
  } catch (error) {
    next(error);
  }
};

export const clearFcmToken = async (req, res, next) => {
  try {
    await User.update({ fcmToken: null }, { where: { id: req.user.id } });
    res.status(200).json({ success: true, message: 'Token eliminado' });
  } catch (error) {
    next(error);
  }
};

export const getBookingHistory = async (req, res, next) => {
  try {
    const bookings = await usersService.getBookingHistory(req.user.id);
    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatarImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen',
      });
    }

    // Construir la URL del avatar
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Actualizar el usuario con el nuevo avatar
    await User.update(
      { avatar: avatarUrl },
      { where: { id: req.user.id } }
    );

    res.status(200).json({
      success: true,
      message: 'Avatar actualizado correctamente',
      data: {
        avatar: avatarUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
