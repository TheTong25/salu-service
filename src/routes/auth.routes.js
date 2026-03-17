const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');

// Public routes (no authentication required)
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, authController.getProfile);
router.get('/users', authenticateToken, requireAdmin, authController.getAllUsers);
router.get('/users/:id', authenticateToken, authController.getUserById);
router.put('/users/:id', authenticateToken, authController.updateUser);
router.delete('/users/:id', authenticateToken, authController.deleteUser);

module.exports = router;
