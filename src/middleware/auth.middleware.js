const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user not found'
            });
        }

        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error during authentication',
            error: error.message
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin
};
