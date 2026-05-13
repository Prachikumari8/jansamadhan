import express from 'express';
import { signup, login, getMe, verifyOTP, googleLogin, getAllUsers } from '../controllers/authController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOTP);
router.post('/google-login', googleLogin);
router.get('/me', protect, getMe);
router.get('/users', protect, restrictTo('ADMIN'), getAllUsers);

export default router;
