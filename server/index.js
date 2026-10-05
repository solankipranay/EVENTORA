const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const authRoutes = require('./routes/auth.js');
const eventRoutes = require('./routes/events.js');
const bookingRoutes = require('./routes/bookings.js');

dotenv.config({ path: path.join(__dirname, '.env') });

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be configured before starting the server');
}

const app = express();
app.use(cors());
app.use(express.json());

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!mongoUri && process.env.NODE_ENV === 'production') {
    throw new Error('MONGODB_URI or MONGO_URI must be configured before starting the server in production');
}

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/events',eventRoutes);
app.use('/api/bookings',bookingRoutes);

const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientBuildPath));
app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});

const startServer = async () => {
    await mongoose.connect(mongoUri || 'mongodb://localhost:27017/eventora');
    console.log('Connected to MongoDB');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
});