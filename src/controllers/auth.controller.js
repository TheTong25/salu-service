const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive
                },
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
            error: error.message
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find({ isActive: true })
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalUsers = await User.countDocuments({ isActive: true });

        res.status(200).json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                })),
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalUsers,
                    limit
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching users',
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error fetching user',
            error: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, isActive } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Only admins can change roles and deactivate users
        if (req.user.role !== 'admin') {
            if (role || isActive !== undefined) {
                return res.status(403).json({
                    success: false,
                    message: 'Only admins can change role or active status'
                });
            }
            
            // Users can only update their own profile (name and email)
            if (req.user.id !== id) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only update your own profile'
                });
            }
        }

        // Prevent non-admins from changing to admin role
        if (role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can assign admin role'
            });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role !== undefined && req.user.role === 'admin') user.role = role;
        if (isActive !== undefined && req.user.role === 'admin') user.isActive = isActive;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isActive: user.isActive,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error updating user',
            error: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        if (req.user.id === id) {
            return res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.role === 'admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete admin accounts'
            });
        }

        await User.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error deleting user',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    getProfile,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};