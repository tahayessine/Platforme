const Enseignant = require('../Models/Enseignant');
const User = require('../Models/User');

const createEnseignantWithUser = async (req, res) => {
    try {
        const { nom, prenom, dateNaissance, matiere, email, userId } = req.body;

        const enseignant = new Enseignant({
            nom,
            prenom,
            dateNaissance,
            matiere,
            email,
            userId
        });

        await enseignant.save();

        res.status(201).json({
            success: true,
            message: 'Enseignant créé avec succès',
            enseignant
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getAllEnseignants = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { nom: { $regex: search, $options: 'i' } },
                    { prenom: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { matiere: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const enseignants = await Enseignant.find(query);
        res.json({
            success: true,
            enseignants
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const getEnseignantById = async (req, res) => {
    try {
        const enseignant = await Enseignant.findById(req.params.id);
        if (!enseignant) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }
        res.json({
            success: true,
            enseignant
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateEnseignant = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, dateNaissance, matiere, email } = req.body;

        // Find the teacher first to get userId
        const enseignant = await Enseignant.findById(id);
        if (!enseignant) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }

        // Update teacher
        const updatedEnseignant = await Enseignant.findByIdAndUpdate(
            id,
            { nom, prenom, dateNaissance, matiere, email },
            { new: true }
        );

        // Update corresponding user
        await User.findByIdAndUpdate(
            enseignant.userId,
            { 
                name: `${prenom} ${nom}`,
                email: email 
            }
        );

        res.json({
            success: true,
            message: 'Enseignant mis à jour avec succès',
            enseignant: updatedEnseignant
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de l\'enseignant',
            error: error.message
        });
    }
};

const deleteEnseignant = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher first to get userId
        const enseignant = await Enseignant.findById(id);
        if (!enseignant) {
            return res.status(404).json({
                success: false,
                message: 'Enseignant non trouvé'
            });
        }

        // Delete the teacher
        await Enseignant.findByIdAndDelete(id);
        
        // Delete the corresponding user
        await User.findByIdAndDelete(enseignant.userId);

        res.json({
            success: true,
            message: 'Enseignant supprimé avec succès'
        });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de l\'enseignant',
            error: error.message
        });
    }
};

module.exports = {
    createEnseignantWithUser,
    getAllEnseignants,
    getEnseignantById,
    updateEnseignant,
    deleteEnseignant
};