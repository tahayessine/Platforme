const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { updateProfile, getProfile, uploadProfilePhoto } = require('../Controllers/ProfileController');
const verifyToken = require('../Middlewares/Auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
        }
    }
});

router.get('/', verifyToken, getProfile);
router.put('/update', verifyToken, updateProfile);
router.post('/upload-photo', verifyToken, upload.single('profileImage'), uploadProfilePhoto);

module.exports = router;