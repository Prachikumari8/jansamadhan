import express from 'express';
import multer from 'multer';
import * as reportController from '../controllers/reportController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';
import { validateReport, validateStatusUpdate } from '../middlewares/reportValidation.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// All routes are protected
router.use(protect);

router.post('/', upload.single('image'), validateReport, reportController.createReport);
router.get('/my-reports', reportController.getMyReports);
router.get('/:id', reportController.getReport);

// Staff and Admin only routes
router.get('/', restrictTo('STAFF', 'ADMIN'), reportController.getAllReports);
router.patch('/:id/status', restrictTo('STAFF', 'ADMIN'), validateStatusUpdate, reportController.updateStatus);
router.patch('/:id/assign', restrictTo('ADMIN'), reportController.assignStaff);

export default router;
