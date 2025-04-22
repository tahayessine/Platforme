const Eleve = require('../Models/Eleve');
const User = require('../Models/User');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

// Create student with user account
const createEleveWithUser = async (req, res) => {
    try {
        const { nom, prenom, dateNaissance, classe, email, password, ville } = req.body;

        // Validate required fields
        if (!nom || !prenom || !email || !password || !ville) {
            return res.status(400).json({
                success: false,
                message: 'Tous les champs sont requis'
            });
        }

        // First, create the user
        const user = new User({
            name: `${prenom} ${nom}`,
            email,
            password,
            role: 'eleve'
        });

        const savedUser = await user.save();

        // Then create the student profile
        const eleve = new Eleve({
            nom,
            prenom,
            dateNaissance,
            classe: classe || 'Non assignée',
            email,
            ville,
            userId: savedUser._id
        });

        const savedEleve = await eleve.save();

        res.status(201).json({
            success: true,
            message: 'Élève créé avec succès',
            eleve: savedEleve
        });

    } catch (error) {
        // If there's an error, handle user cleanup if needed
        console.error('Error creating student:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Erreur lors de la création de l\'élève'
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