const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menu.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public routes (no authentication required)
router.get('/', menuController.getAllMenus);
router.get('/search', menuController.searchMenus);
router.get('/categories', menuController.getMenuCategories);
router.get('/type/:temperature', menuController.getMenusByType);
router.get('/:id', menuController.getMenuById);

// Protected routes (authentication required)
router.post('/', authenticateToken, requireAdmin, upload.array('images', 3), menuController.createMenu);
router.put('/:id', authenticateToken, requireAdmin, upload.array('images', 3), menuController.updateMenu);
router.delete('/:id', authenticateToken, requireAdmin, menuController.deleteMenu);

module.exports = router;
