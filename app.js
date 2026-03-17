const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const app = express();
const dotenv = require('dotenv');
dotenv.config({ quiet: true });
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: [
        process.env.FRONTEND_URL,
        process.env.ADMIN_URL
    ],
    credentials: true
}));
app.use(cookieParser());

// Auth routes
const authRoutes = require('./src/routes/auth.routes');
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Server is running!" });
});

module.exports = app;
