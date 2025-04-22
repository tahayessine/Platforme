const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Administrateur = require('./Administrateur');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'eleve', 'enseignant'],
        default: 'eleve'
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Add post-save middleware
userSchema.post('save', async function(doc) {
    try {
        if (doc.role === 'admin') {
            // Check if administrator already exists
            const existingAdmin = await Administrateur.findOne({ userId: doc._id });
            
            if (!existingAdmin) {
                // Create new administrator entry
                const administrateur = new Administrateur({
                    nom: doc.name.split(' ')[1] || '',  // Assuming name format is "prénom nom"
                    prenom: doc.name.split(' ')[0] || '',
                    email: doc.email,
                    fonction: 'Administrateur',
                    userId: doc._id
                });
                await administrateur.save();
            }
        }
    } catch (error) {
        console.error('Error creating administrator:', error);
    }
});

module.exports = mongoose.model('User', userSchema);
