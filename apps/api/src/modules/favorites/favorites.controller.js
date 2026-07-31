import Favorite from './favorite.model.js';
import { Property } from '../properties/hotel-property.model.js';

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const existing = await Favorite.findOne({ where: { userId, propertyId } });

    if (existing) {
      await existing.destroy();
      return res.json({ success: true, isFavorite: false });
    }

    await Favorite.create({ userId, propertyId });
    res.json({ success: true, isFavorite: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFavoriteStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const existing = await Favorite.findOne({ where: { userId, propertyId } });
    res.json({ success: true, isFavorite: !!existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    const properties = await Promise.all(
      favorites.map((fav) =>
        Property.findByPk(fav.propertyId, {
          include: [{ association: 'rooms' }],
        })
      )
    );

    res.json({
      success: true,
      data: properties.filter(Boolean),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
