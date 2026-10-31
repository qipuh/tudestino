import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  getRoomMap,
  getArrivals,
  getDepartures,
  checkIn,
  checkOut,
  changeRoom,
  setUnitStatus,
} from './front-desk.controller.js';

const router = express.Router();

router.use(authenticate, authorize('host', 'business_owner', 'admin'));

router.get('/:propertyId/room-map', getRoomMap);
router.get('/:propertyId/arrivals', getArrivals);
router.get('/:propertyId/departures', getDepartures);

router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/change-room', changeRoom);

router.patch('/room-units/:roomUnitId/status', setUnitStatus);

export default router;
