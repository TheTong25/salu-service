const Menu = require('../models/menu.model');

const createMenu = async (req, res) => {
    try {
        const { 
            name, category, description, price, discount, isAvailable,
            size, temperature, caffeineLevel, sugarLevel, isAlcoholic, preparationTime, ingredients
        } = req.body;

        // Handle uploaded files
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        }

        if (!name || !category || !description || !price) {
            return res.status(400).json({
                success: false,
                message: 'Name, category, description, and price are required'
            });
        }

        const menu = new Menu({
            name,
            category,
            description,
            price,
            discount: discount || 0,
            images,
            isAvailable: isAvailable !== undefined ? isAvailable : true,
            size: size || ['medium'],
            temperature: temperature || 'hot',
            caffeineLevel: caffeineLevel || 'medium',
            sugarLevel: sugarLevel || 'medium',
            isAlcoholic: isAlcoholic || false,
            preparationTime: preparationTime || 5,
            ingredients: ingredients ? ingredients.split(',').map(item => item.trim()) : []
        });

        await menu.save();

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: {
                menu
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating menu item',
            error: error.message
        });
    }
};

const getAllMenus = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const { category, minPrice, maxPrice, isAvailable, temperature, caffeineLevel, sugarLevel, isAlcoholic } = req.query;

        let filter = {};
        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = minPrice;
            if (maxPrice) filter.price.$lte = maxPrice;
        }
        if (isAvailable !== undefined) filter.isAvailable = isAvailable === 'true';
        if (temperature) filter.temperature = temperature;
        if (caffeineLevel) filter.caffeineLevel = caffeineLevel;
        if (sugarLevel) filter.sugarLevel = sugarLevel;
        if (isAlcoholic !== undefined) filter.isAlcoholic = isAlcoholic === 'true';

        const menus = await Menu.find(filter)
            .populate('category', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMenus = await Menu.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                menus,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalMenus / limit),
                    totalMenus,
                    limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching menus',
            error: error.message
        });
    }
};

const getMenuById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Menu ID is required'
            });
        }

        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                menu
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching menu item',
            error: error.message
        });
    }
};

const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            name, category, description, price, discount, isAvailable,
            size, temperature, caffeineLevel, sugarLevel, isAlcoholic, preparationTime, ingredients
        } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Menu ID is required'
            });
        }

        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        // Handle uploaded files
        let images = menu.images; // Keep existing images by default
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        }

        // Check if name is being changed and if it already exists
        if (name && name !== menu.name) {
            const existingMenu = await Menu.findOne({ name });
            if (existingMenu) {
                return res.status(400).json({
                    success: false,
                    message: 'Menu item with this name already exists'
                });
            }
        }

        // Update menu fields
        if (name) menu.name = name;
        if (category) menu.category = category;
        if (description) menu.description = description;
        if (price !== undefined) menu.price = price;
        if (discount !== undefined) menu.discount = discount;
        if (images !== undefined) menu.images = images;
        if (isAvailable !== undefined) menu.isAvailable = isAvailable;
        if (size !== undefined) menu.size = size;
        if (temperature !== undefined) menu.temperature = temperature;
        if (caffeineLevel !== undefined) menu.caffeineLevel = caffeineLevel;
        if (sugarLevel !== undefined) menu.sugarLevel = sugarLevel;
        if (isAlcoholic !== undefined) menu.isAlcoholic = isAlcoholic;
        if (preparationTime !== undefined) menu.preparationTime = preparationTime;
        if (ingredients !== undefined) menu.ingredients = ingredients ? ingredients.split(',').map(item => item.trim()) : menu.ingredients;

        await menu.save();

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
            data: {
                menu
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating menu item',
            error: error.message
        });
    }
};

const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Menu ID is required'
            });
        }

        const menu = await Menu.findById(id);
        if (!menu) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        await Menu.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error deleting menu item',
            error: error.message
        });
    }
};

const getMenuCategories = async (req, res) => {
    try {
        const categories = await Menu.distinct('category');
        const itemTypes = await Menu.distinct('itemType');
        res.status(200).json({
            success: true,
            data: {
                categories,
                itemTypes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching categories',
            error: error.message
        });
    }
};

const searchMenus = async (req, res) => {
    try {
        const { q, category, minPrice, maxPrice, temperature, caffeineLevel, sugarLevel, isAlcoholic } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};

        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { ingredients: { $in: [new RegExp(q, 'i')] } }
            ];
        }

        if (category) filter.category = category;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (temperature) filter.temperature = temperature;
        if (caffeineLevel) filter.caffeineLevel = caffeineLevel;
        if (sugarLevel) filter.sugarLevel = sugarLevel;
        if (isAlcoholic !== undefined) filter.isAlcoholic = isAlcoholic === 'true';

        const menus = await Menu.find(filter)
            .populate('category', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMenus = await Menu.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                menus,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalMenus / limit),
                    totalMenus,
                    limit
                },
                searchQuery: { q, category, minPrice, maxPrice, temperature, caffeineLevel, sugarLevel, isAlcoholic }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error searching menus',
            error: error.message
        });
    }
};

const getMenusByType = async (req, res) => {
    try {
        const { temperature } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        let filter = {};
        if (temperature && ['hot', 'cold', 'both'].includes(temperature)) {
            filter.temperature = temperature;
        }

        const menus = await Menu.find(filter)
            .populate('category', 'name description')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMenus = await Menu.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                menus,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalMenus / limit),
                    totalMenus,
                    limit
                },
                filter: { temperature }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching menus by type',
            error: error.message
        });
    }
};

module.exports = {
    createMenu,
    getAllMenus,
    getMenuById,
    updateMenu,
    deleteMenu,
    getMenuCategories,
    searchMenus,
    getMenusByType
};
