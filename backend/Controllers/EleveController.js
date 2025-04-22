const Eleve = require('../Models/Eleve');
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Create student with user account
const createEleveWithUser = async (req, res) => {
    try {
        const {
            nom,
            prenom,
            email,
            userId
        } = req.body;

        // Validate essential fields
        if (!email || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Email et userId sont requis'
            });
        }

        // Check if student already exists
        const existingEleve = await Eleve.findOne({ 
            $or: [
                { userId: userId },
                { email: email }
            ]
        });

        if (existingEleve) {
            return res.status(400).json({
                success: false,
                message: 'Un profil élève existe déjà pour cet utilisateur ou cet email'
            });
        }

        // Create student record
        const eleve = new Eleve({
            nom: nom || '',
            prenom: prenom || '',
            dateNaissance: new Date(),
            classe: 'Non assignée',
            email: email,
            userId: userId
        });

        const savedEleve = await eleve.save();
        
        // Update user role
        await User.findByIdAndUpdate(userId, { role: 'eleve' });

        res.status(201).json({
            success: true,
            message: 'Profil élève créé avec succès',
            eleve: savedEleve
        });
    } catch (error) {
        console.error('Error creating student:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création du profil élève',
            error: error.message
        });
    }
};

// Get all students
// Update getAllEleves function
const getAllEleves = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { nom: { $regex: search, $options: 'i' } },
                    { prenom: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { classe: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const eleves = await Eleve.find(query).populate('userId', 'email role');
        res.json({ 
            success: true,
            eleves 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get student by ID
const getEleveById = async (req, res) => {
    try {
        const eleve = await Eleve.findById(req.params.id).populate('userId', 'email role');
        if (!eleve) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, eleve });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update student
const updateEleve = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, dateNaissance, classe, email } = req.body;

        // Update student
        const updatedEleve = await Eleve.findByIdAndUpdate(
            id,
            { nom, prenom, dateNaissance, classe, email },
            { new: true }
        );

        if (!updatedEleve) {
            return res.status(404).json({
                success: false,
                message: 'Élève non trouvé'
            });
        }

        // Update corresponding user
        await User.findByIdAndUpdate(
            updatedEleve.userId,
            { 
                name: `${prenom} ${nom}`,
                email: email 
            }
        );

        res.json({
            success: true,
            message: 'Élève mis à jour avec succès',
            eleve: updatedEleve
        });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'élève',
            error: error.message
        });
    }
};

// Delete student
const deleteEleve = async (req, res) => {
    try {
        const { id } = req.params;

        // First find the student to get their userId
        const eleve = await Eleve.findById(id);
        if (!eleve) {
            return res.status(404).json({
                success: false,
                message: 'Élève non trouvé'
            });
        }

        // Delete the student record
        await Eleve.findByIdAndDelete(id);
        
        // Also delete the associated user account
        if (eleve.userId) {
            await User.findByIdAndDelete(eleve.userId);
        }

        res.json({
            success: true,
            message: 'Élève supprimé avec succès'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createEleveWithUser,
    getAllEleves,
    getEleveById,
    updateEleve,
    deleteEleve
};