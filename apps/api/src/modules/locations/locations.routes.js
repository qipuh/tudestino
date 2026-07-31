import express from 'express';
import {
  getCountries,
  getDepartments,
  getProvinces,
  getDistricts,
  searchDistricts,
  getDistrictById,
} from './locations.controller.js';

const router = express.Router();

router.get('/countries', getCountries);
router.get('/countries/:countryId/departments', getDepartments);
router.get('/departments/:departmentId/provinces', getProvinces);
router.get('/provinces/:provinceId/districts', getDistricts);
router.get('/search', searchDistricts);
router.get('/districts/:districtId', getDistrictById);

export default router;
