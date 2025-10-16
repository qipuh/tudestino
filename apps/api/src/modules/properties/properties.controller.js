import { propertiesService } from './properties.service.js';

export const createProperty = async (req, res, next) => {
  try {
    const property = await propertiesService.createProperty(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const getProperties = async (req, res, next) => {
  try {
    const properties = await propertiesService.getProperties(req.query);
    res.status(200).json({
      success: true,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};

export const getPropertyById = async (req, res, next) => {
  try {
    const property = await propertiesService.getPropertyById(req.params.id);
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProperty = async (req, res, next) => {
  try {
    const property = await propertiesService.updateProperty(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProperty = async (req, res, next) => {
  try {
    await propertiesService.deleteProperty(req.params.id, req.user.id);
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadImages = async (req, res, next) => {
  try {
    // TODO: Implementar upload de imágenes
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
    });
  } catch (error) {
    next(error);
  }
};
