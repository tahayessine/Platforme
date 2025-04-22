const express = require('express');
const router = express.Router();
const { 
    createEnseignantWithUser, 
    getAllEnseignants, 
    getEnseignantById, 
    updateEnseignant, 
    deleteEnseignant 
} = require('../Controllers/EnseignantController');
const verifyToken = require('../Middlewares/Auth');

router.post('/create-with-user', verifyToken, createEnseignantWithUser);
router.get('/', verifyToken, getAllEnseignants);
router.get('/:id', verifyToken, getEnseignantById);
router.put('/:id', verifyToken, updateEnseignant);
router.delete('/:id', verifyToken, deleteEnseignant);

module.exports = router;