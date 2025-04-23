const User = require('../Models/User');
const Eleve = require('../Models/Eleve');
const Enseignant = require('../Models/Enseignant');
const Administrateur = require('../Models/Administrateur');
const bcrypt = require('bcrypt');

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { 
            name, 
            email, 
            currentPassword, 
            newPassword, 
            phone,
            location,
            classe,
            dateNaissance,
            matiere,
            fonction,
            nom,
            prenom
        } = req.body;

        // Find user and associated profile
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // If changing password, verify current password
        if (newPassword) {
            const isValidPassword = await user.comparePassword(currentPassword);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Le mot de passe actuel est incorrect'
                });
            }
            user.password = newPassword;
        }

        // Update user basic info
        if (name) user.name = name;
        if (email) user.email = email;
        
        // Find and update role-specific profile
        let profile;
        
        switch (user.role) {
            case 'eleve':
                profile = await Eleve.findOne({ userId: user._id });
                if (profile) {
                    if (nom) profile.nom = nom;
                    if (prenom) profile.prenom = prenom;
                    if (classe) profile.classe = classe;
                    if (dateNaissance) profile.dateNaissance = dateNaissance;
                    if (location) profile.ville = location;
                    if (email) profile.email = email;
                    await profile.save();
                }
                break;

            case 'enseignant':
                profile = await Enseignant.findOne({ userId: user._id });
                if (profile) {
                    if (nom) profile.nom = nom;
                    if (prenom) profile.prenom = prenom;
                    if (matiere) profile.matiere = matiere;
                    if (dateNaissance) profile.dateNaissance = dateNaissance;
                    if (email) profile.email = email;
                    await profile.save();
                }
                break;

            case 'admin':
                profile = await Administrateur.findOne({ userId: user._id });
                if (profile) {
                    if (nom) profile.nom = nom;
                    if (prenom) profile.prenom = prenom;
                    if (fonction) profile.fonction = fonction;
                    if (dateNaissance) profile.dateNaissance = dateNaissance;
                    if (email) profile.email = email;
                    await profile.save();
                }
                break;
        }

        // Save user changes
        await user.save();

        res.json({
            success: true,
            message: 'Profil mis à jour avec succès',
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                profile
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la mise à jour du profil'
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        
        let profileData = null;
        switch (user.role) {
            case 'eleve':
                profileData = await Eleve.findOne({ userId: userId });
                break;
            case 'enseignant':
                profileData = await Enseignant.findOne({ userId: userId });
                break;
            case 'admin':
                profileData = await Administrateur.findOne({ userId: userId });
                break;
        }

        res.json({
            success: true,
            data: {
                user,
                profile: profileData
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Add this new function to handle profile image uploads
const uploadProfilePhoto = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update user's profile image URL
        user.profileImage = `/uploads/profile/${req.file.filename}`;
        await user.save();

        res.json({
            success: true,
            message: 'Profile photo updated successfully',
            imageUrl: user.profileImage
        });

    } catch (error) {
        console.error('Profile photo upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error uploading profile photo'
        });
    }
};

// Add to exports
module.exports = {
    updateProfile,
    getProfile,
    uploadProfilePhoto
};