import express from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.middleware.js';
import { uploadMilestonePhoto } from '../../middleware/upload.js';
import * as milestoneController from './route-milestone.controller.js';

// mergeParams: true - se monta anidado bajo /api/routes/:routeId/milestones,
// necesita leer routeId del router padre.
const router = express.Router({ mergeParams: true });

router.post('/', authenticate, uploadMilestonePhoto.single('photo'), milestoneController.createMilestone);
router.get('/', optionalAuthenticate, milestoneController.getMilestones);
router.put('/:milestoneId', authenticate, uploadMilestonePhoto.single('photo'), milestoneController.updateMilestone);
router.delete('/:milestoneId', authenticate, milestoneController.deleteMilestone);

export default router;
