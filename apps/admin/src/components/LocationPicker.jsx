import { useEffect, useState } from 'react';
import locationsService from '../services/locationsService.js';

export default function LocationPicker({
  value = {},
  onChange = () => {},
  countryId: initialCountryId = null,
  label = 'Ubicación',
  required = false,
}) {
  const [countries, setCountries] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [countryId, setCountryId] = useState(initialCountryId || value.countryId || '');
  const [departmentId, setDepartmentId] = useState(value.departmentId || '');
  const [provinceId, setProvinceId] = useState(value.provinceId || '');
  const [districtId, setDistrictId] = useState(value.districtId || '');

  const [loading, setLoading] = useState({
    countries: false,
    departments: false,
    provinces: false,
    districts: false,
  });

  // Load countries on mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Load departments when country changes
  useEffect(() => {
    if (countryId) {
      loadDepartments(countryId);
      setDepartmentId('');
      setProvinceId('');
      setDistrictId('');
    } else {
      setDepartments([]);
    }
  }, [countryId]);

  // Load provinces when department changes
  useEffect(() => {
    if (departmentId) {
      loadProvinces(departmentId);
      setProvinceId('');
      setDistrictId('');
    } else {
      setProvinces([]);
    }
  }, [departmentId]);

  // Load districts when province changes
  useEffect(() => {
    if (provinceId) {
      loadDistricts(provinceId);
      setDistrictId('');
    } else {
      setDistricts([]);
    }
  }, [provinceId]);

  // Notify parent component when selection changes
  useEffect(() => {
    onChange({
      countryId,
      departmentId,
      provinceId,
      districtId,
    });
  }, [countryId, departmentId, provinceId, districtId]);

  const loadCountries = async () => {
    try {
      setLoading((prev) => ({ ...prev, countries: true }));
      const response = await locationsService.getCountries();
      setCountries(response.data || []);
    } catch (error) {
      console.error('Error loading countries:', error);
    } finally {
      setLoading((prev) => ({ ...prev, countries: false }));
    }
  };

  const loadDepartments = async (cId) => {
    try {
      setLoading((prev) => ({ ...prev, departments: true }));
      const response = await locationsService.getDepartments(cId);
      setDepartments(response.data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    } finally {
      setLoading((prev) => ({ ...prev, departments: false }));
    }
  };

  const loadProvinces = async (dId) => {
    try {
      setLoading((prev) => ({ ...prev, provinces: true }));
      const response = await locationsService.getProvinces(dId);
      setProvinces(response.data || []);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading((prev) => ({ ...prev, provinces: false }));
    }
  };

  const loadDistricts = async (pId) => {
    try {
      setLoading((prev) => ({ ...prev, districts: true }));
      const response = await locationsService.getDistricts(pId);
      setDistricts(response.data || []);
    } catch (error) {
      console.error('Error loading districts:', error);
    } finally {
      setLoading((prev) => ({ ...prev, districts: false }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-900">
        {label} {required && <span className="text-red-500">*</span>}
      </h3>

      {/* Country Select */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">País</label>
        <select
          value={countryId}
          onChange={(e) => setCountryId(e.target.value)}
          disabled={loading.countries}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">Selecciona un país</option>
          {countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.flag_emoji} {country.name}
            </option>
          ))}
        </select>
      </div>

      {/* Department Select */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Departamento</label>
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
          disabled={!countryId || loading.departments}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">Selecciona un departamento</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Province Select */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Provincia</label>
        <select
          value={provinceId}
          onChange={(e) => setProvinceId(e.target.value)}
          disabled={!departmentId || loading.provinces}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">Selecciona una provincia</option>
          {provinces.map((prov) => (
            <option key={prov.id} value={prov.id}>
              {prov.name}
            </option>
          ))}
        </select>
      </div>

      {/* District Select */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Distrito</label>
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          disabled={!provinceId || loading.districts}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">Selecciona un distrito</option>
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
