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
const getAllEleves = async (req, res) => {
    try {
        const eleves = await Eleve.find().populate('userId', 'email role');
        res.json({ 
            success: true, 
            eleves: eleves // Make sure we're sending the eleves array
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message,
            eleves: [] // Send empty array on error
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
        const updatedEleve = await Eleve.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedEleve) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, eleve: updatedEleve });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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