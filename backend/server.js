require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRouter = require('./Routes/AuthRouter');
const routesEleve = require('./Routes/RoutesEleve');
const routesEnseignant = require('./Routes/RoutesEnseignant');
const routesAdministrateur = require('./Routes/RoutesAdministrateur');
const profileRoutes = require('./Routes/ProfileRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000 // Increase timeout to 15 seconds
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/eleves', routesEleve);
app.use('/api/enseignants', routesEnseignant);  // This line should be present
// Add this line with the other routes
app.use('/api/profile', profileRoutes);
app.use('/api/administrateurs', routesAdministrateur);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Handle specific types of errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            error: err.message
        });
    }

    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
        return res.status(500).json({
            success: false,
            message: 'Database error',
            error: err.message
        });
    }

    // Default error response
    res.status(500).json({
        success: false,
        message: 'Une erreur est survenue sur le serveur',
        error: err.message
    });
});

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));