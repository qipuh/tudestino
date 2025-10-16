import api from './api';

// Get all properties with optional filters
export const getProperties = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/properties?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

// Get properties by host ID
export const getHostProperties = async (hostId) => {
  try {
    const response = await api.get(`/properties?hostId=${hostId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching host properties:', error);
    throw error;
  }
};

// Get a single property by ID
export const getPropertyById = async (propertyId) => {
  try {
    const response = await api.get(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

// Create a new property
export const createProperty = async (propertyData) => {
  try {
    const response = await api.post('/properties', propertyData);
    return response.data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

// Update a property
export const updateProperty = async (propertyId, propertyData) => {
  try {
    const response = await api.put(`/properties/${propertyId}`, propertyData);
    return response.data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

// Delete a property
export const deleteProperty = async (propertyId) => {
  try {
    const response = await api.delete(`/properties/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};
