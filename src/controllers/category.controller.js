const Category = require('../models/category.model');

const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        const category = new Category({
            name,
            description
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: {
                category
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error creating category',
            error: error.message
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const categories = await Category.find()
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        const totalCategories = await Category.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                categories,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCategories / limit),
                    totalCategories,
                    limit
                }
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

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                category
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching category',
            error: error.message
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if name is being changed and if it already exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Update category fields
        if (name) category.name = name;
        if (description !== undefined) category.description = description;

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: {
                category
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating category',
            error: error.message
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Category ID is required'
            });
        }

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category is being used by any menu items
        const Menu = require('../models/menu.model');
        const menuItemsCount = await Menu.countDocuments({ category: id });
        if (menuItemsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It is being used by ${menuItemsCount} menu items`
            });
        }

        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error deleting category',
            error: error.message
        });
    }
};

const getCategoriesByType = async (req, res) => {
    try {
        const categories = await Category.find()
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            data: {
                categories
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

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    getCategoriesByType
};
