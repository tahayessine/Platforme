import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Signup.css';
import { FaFacebookF, FaTwitter, FaGoogle, FaInstagram } from 'react-icons/fa';
import axios from 'axios';

const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
  'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
  'Kef', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Tozeur',
  'Manouba', 'Siliana', 'Zaghouan', 'Kebili'
];

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: '',
        code: '',
        ville: '' // Add ville field
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false); // État pour savoir si le code a été envoyé
    const [isCodeVerified, setIsCodeVerified] = useState(false); // État pour savoir si le code a été vérifié

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((prev) => ({ ...prev, [name]: value }));
    };

    // Fonction pour envoyer le code de vérification
    const handleSendCode = async () => {
        const { email } = signupInfo;

        if (!email) {
            toast.error('Veuillez entrer votre email.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Veuillez entrer un email valide.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/send-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                toast.error(result.message || 'Erreur lors de l’envoi du code.');
                setIsLoading(false);
                return;
            }

            if (result.success) {
                toast.success('Code de vérification envoyé à votre email.');
                setIsCodeSent(true);
            } else {
                toast.error(result.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Erreur lors de l’envoi du code :', error);
            toast.error('Impossible de se connecter au serveur. Réessayez plus tard.');
        } finally {
            setIsLoading(false);
        }
    };

    // Fonction pour vérifier le code
    const handleVerifyCode = async () => {
        const { email, code } = signupInfo;
    
        if (!code) {
            toast.error('Veuillez entrer le code de vérification.');
            return;
        }
    
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });
    
            const result = await response.json();
    
            if (!response.ok) {
                toast.error(result.message || 'Code de vérification invalide.');
                setIsLoading(false);
                return;
            }
    
            if (result.success) {
                toast.success('Code vérifié avec succès !');
                setIsCodeVerified(true);
            } else {
                toast.error(result.message || 'Une erreur est survenue.');
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du code :', error);
            toast.error('Impossible de se connecter au serveur. Réessayez plus tard.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate all required fields
        if (!signupInfo.name || !signupInfo.email || !signupInfo.password || !signupInfo.ville) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }
    
        if (!isCodeVerified) {
            toast.error('Veuillez vérifier votre code email');
            return;
        }
    
        setIsLoading(true);
        try {
            // First register the user
            const registerResponse = await axios.post('http://localhost:5000/api/auth/register', {
                name: signupInfo.name,
                email: signupInfo.email,
                password: signupInfo.password,
                code: signupInfo.code,
                role: 'eleve'
            });
    
            if (registerResponse.data.success) {
                // Then create the student profile
                const nameParts = signupInfo.name.split(' ');
                const eleveData = {
                    nom: nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0],
                    prenom: nameParts[0],
                    email: signupInfo.email,
                    ville: signupInfo.ville,
                    userId: registerResponse.data.user.id
                };
    
                try {
                    const eleveResponse = await axios.post('http://localhost:5000/api/eleves/create-with-user', eleveData);
    
                    if (eleveResponse.data.success) {
                        toast.success('Inscription réussie !');
                        setTimeout(() => {
                            navigate('/login');
                        }, 2000);
                    }
                } catch (eleveError) {
                    // If student profile creation fails, delete the user account
                    await axios.delete(`http://localhost:5000/api/auth/user/${registerResponse.data.user.id}`);
                    throw new Error(eleveError.response?.data?.message || 'Erreur lors de la création du profil élève');
                }
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription');
        } finally {
            setIsLoading(false);
        }
    };

    // Add this in your JSX form before the password field
    return (
        <div className="container">
            <div className="left-section">
                <h2 className="title">Rejoignez une Élégance Sans Pareille</h2>
                <p className="description">
                    Créez votre compte et plongez dans une expérience éducative de luxe.
                </p>
                <Link to="/login" className="login-btn-alt">🔑 Se Connecter</Link>
                <div className="dynamic-illustration"></div>
            </div>
            <div className="right-section">
                <form onSubmit={handleSubmit} className="signup-form">
                    <h1 className="signup-title">Inscription</h1>
                    <div className="input-group">
                        <label htmlFor="name">Nom</label>
                        <input
                            onChange={handleChange}
                            type="text"
                            name="name"
                            autoFocus
                            placeholder="Entrez votre nom..."
                            value={signupInfo.name}
                            className="input-field"
                            aria-label="Nom"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                onChange={handleChange}
                                type="email"
                                name="email"
                                placeholder="Entrez votre email..."
                                value={signupInfo.email}
                                className="input-field"
                                aria-label="Email"
                                disabled={isLoading || isCodeSent}
                                style={{ flex: 1 }}
                            />
                            {!isCodeSent && (
                                <button
                                    type="button"
                                    onClick={handleSendCode}
                                    className="signup-btn"
                                    disabled={isLoading}
                                    style={{ marginLeft: '10px' }}
                                >
                                    {isLoading ? 'Envoi...' : 'Envoyer le code'}
                                </button>
                            )}
                        </div>
                    </div>
                    {isCodeSent && !isCodeVerified && (
                        <div className="input-group">
                            <label htmlFor="code">Code de vérification</label>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <input
                                    onChange={handleChange}
                                    type="text"
                                    name="code"
                                    placeholder="Entrez le code reçu..."
                                    value={signupInfo.code}
                                    className="input-field"
                                    aria-label="Code de vérification"
                                    disabled={isLoading}
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={handleVerifyCode}
                                    className="signup-btn"
                                    disabled={isLoading}
                                    style={{ marginLeft: '10px' }}
                                >
                                    {isLoading ? 'Vérification...' : 'Vérifier'}
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="input-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            placeholder="Entrez votre mot de passe..."
                            value={signupInfo.password}
                            className="input-field"
                            aria-label="Mot de passe"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="ville">Ville</label>
                        <select
                            name="ville"
                            value={signupInfo.ville}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value="">Sélectionnez votre ville</option>
                            {tunisianCities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="signup-btn" disabled={isLoading || !isCodeVerified}>
                        {isLoading ? 'Inscription...' : 'S’inscrire'}
                    </button>
                    <span className="login-link">
                        Déjà un compte ? <Link to="/login">Connexion</Link>
                    </span>
                    <div className="social-login">
                        <p className="social-text">Ou inscrivez-vous avec</p>
                        <div className="social-icons">
                            <FaFacebookF className="social-icon" />
                            <FaTwitter className="social-icon" />
                            <FaGoogle className="social-icon" />
                            <FaInstagram className="social-icon" />
                        </div>
                    </div>
                </form>
            </div>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
            />
        </div>
    );
}

export default Signup;