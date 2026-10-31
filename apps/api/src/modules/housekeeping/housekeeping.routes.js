import express from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';
import {
  getTasks,
  createTask,
  assignTask,
  updateTaskStatus,
} from './housekeeping.controller.js';

const router = express.Router();

router.use(authenticate, authorize('host', 'business_owner', 'admin'));

router.get('/:propertyId/tasks', getTasks);
router.post('/:propertyId/tasks', createTask);

router.patch('/tasks/:id/assign', assignTask);
router.patch('/tasks/:id/status', updateTaskStatus);

export default router;
