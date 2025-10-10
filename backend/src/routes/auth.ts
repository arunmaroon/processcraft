import express from 'express';
import { login, logout, getProfile, refreshToken } from '../middleware/auth';

const router = express.Router();

// Admin login
router.post('/login', login);

// Admin logout
router.post('/logout', logout);

// Get user profile
router.get('/profile', getProfile);

// Refresh token
router.post('/refresh', refreshToken);

export default router;















