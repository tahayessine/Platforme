const User = require('../Models/User');
const jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../Middlewares/AuthValidation');
const VerificationCode = require('../Models/VerificationCode');

// Enregistrer un utilisateur
const registerUser = async (req, res) => {
    try {
        const { error } = registerValidation(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        // Skip verification code check if request is from admin
        if (!req.body.isAdmin) {
            // Verify the code for non-admin registrations
            const verificationCode = await VerificationCode.findOne({ 
                email: req.body.email,
                code: req.body.code
            });

            if (!verificationCode || verificationCode.expiresAt < new Date()) {
                return res.status(400).json({
                    success: false,
                    message: 'Code de vérification invalide ou expiré'
                });
            }
        }

        // Check if user exists
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: 'Email déjà utilisé'
            });
        }

        // Create new user
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            role: req.body.role || 'eleve'
        });

        const savedUser = await user.save();

        // Create and return token
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET);
        
        res.status(201).json({
            success: true,
            message: 'Utilisateur créé avec succès',
            token,
            userId: savedUser._id
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Connecter un utilisateur
const loginUser = async (req, res) => {
    try {
        const { error } = loginValidation(req.body);
        if (error) {
            return res.status(400).json({ 
                success: false,
                message: error.details[0].message 
            });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }

        const validPassword = await user.comparePassword(req.body.password);
        if (!validPassword) {
            return res.status(401).json({ 
                success: false,
                message: 'Mot de passe incorrect' 
            });
        }

        // Generate token with user role
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            message: 'Connexion réussie',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erreur serveur',
            error: error.message 
        });
    }
};

module.exports = { registerUser, loginUser };
