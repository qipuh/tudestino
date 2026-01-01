import express from 'express';
import countriesController from './countries.controller.js';

const router = express.Router();

router.get('/', countriesController.getAll.bind(countriesController));
router.get('/detect-by-ip', countriesController.detectCountryByIP.bind(countriesController));
router.get('/:code', countriesController.getByCode.bind(countriesController));

export default router;
