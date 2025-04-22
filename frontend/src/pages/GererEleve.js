import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import './style.css';

function GererEleve() {
  const [eleves, setEleves] = useState([]);  // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: null,
    classe: '',
    email: '',
    password: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch all students
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  // Improved fetch function with better error handling
  const fetchEleves = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vous n\'êtes pas authentifié. Veuillez vous connecter.');
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`${API_URL}/api/eleves`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        setEleves(response.data.eleves || []); // Make sure to use the correct property name
      } else {
        setError('Format de réponse invalide');
        setEleves([]); // Set empty array on error
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des élèves');
      setEleves([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEleves();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dateNaissance: date }));
  };

  // Open dialog for adding new student
  const handleAddEleve = () => {
    setSelectedEleve(null);
    setFormData({
      nom: '',
      prenom: '',
      dateNaissance: null,
      classe: '',
      email: '',
      password: ''
    });
    setOpenDialog(true);
  };

  // Open dialog for editing student
  const handleEditEleve = (eleve) => {
    setSelectedEleve(eleve);
    setFormData({
      nom: eleve.nom,
      prenom: eleve.prenom,
      dateNaissance: new Date(eleve.dateNaissance),
      classe: eleve.classe,
      email: eleve.email,
      password: '' // Password field is empty when editing
    });
    setOpenDialog(true);
  };

  // Open dialog for deleting student
  const handleDeleteClick = (eleve) => {
    setSelectedEleve(eleve);
    setOpenDeleteDialog(true);
  };

  // Submit form for adding/editing student
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        if (selectedEleve) {
            await axios.put(
                `${API_URL}/api/eleves/${selectedEleve._id}`,
                {
                    nom: formData.nom,
                    prenom: formData.prenom,
                    dateNaissance: formData.dateNaissance,
                    classe: formData.classe,
                    email: formData.email
                },
                { headers }
            );
            setSnackbar({
                open: true,
                message: 'Élève modifié avec succès',
                severity: 'success'
            });
        } else {
            const userResponse = await axios.post(
                `${API_URL}/api/auth/register`,
                {
                    name: `${formData.prenom} ${formData.nom}`,
                    email: formData.email,
                    password: formData.password,
                    role: 'eleve',
                    isAdmin: true
                },
                { headers }
            );

            if (userResponse.data.success) {
                await axios.post(
                    `${API_URL}/api/eleves/create-with-user`,
                    {
                        nom: formData.nom,
                        prenom: formData.prenom,
                        dateNaissance: formData.dateNaissance,
                        classe: formData.classe,
                        email: formData.email,
                        userId: userResponse.data.userId
                    },
                    { headers }
                );
            }
        }
        
        setOpenDialog(false);
        fetchEleves();
    } catch (error) {
        console.error('Error submitting form:', error);
        setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Erreur lors de l\'opération',
            severity: 'error'
        });
    } finally {
        setLoading(false);
    }
};

  // Delete student
  const handleDeleteConfirm = async () => {
    try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setSnackbar({
                open: true,
                message: 'Session expirée, veuillez vous reconnecter',
                severity: 'error'
            });
            return;
        }

        const response = await axios.delete(`${API_URL}/api/eleves/${selectedEleve._id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.success) {
            setSnackbar({
                open: true,
                message: 'Élève supprimé avec succès',
                severity: 'success'
            });
            setOpenDeleteDialog(false);
            await fetchEleves(); // Refresh the list
        } else {
            throw new Error(response.data.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        setSnackbar({
            open: true,
            message: error.response?.data?.message || 'Erreur lors de la suppression',
            severity: 'error'
        });
    } finally {
        setLoading(false);
    }
};

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <div className="gerer-eleve-container">
      <div className="header-container">
        <div>
          <h1 className="header-title">Gestion des Élèves</h1>
          <p className="header-subtitle">
            Gérez les informations des élèves, ajoutez de nouveaux élèves ou modifiez les données existantes.
          </p>
        </div>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddEleve}
          className="new-student-button"
        >
          Nouvel Élève
        </Button>
      </div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography>Chargement...</Typography>
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box sx={{ p: 3 }}>
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Date de naissance</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Classe</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {eleves.map((eleve) => (
                  <TableRow key={eleve._id} hover>
                    <TableCell>{eleve.nom}</TableCell>
                    <TableCell>{eleve.prenom}</TableCell>
                    <TableCell>{new Date(eleve.dateNaissance).toLocaleDateString()}</TableCell>
                    <TableCell>{eleve.classe}</TableCell>
                    <TableCell>{eleve.email}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        onClick={() => handleEditEleve(eleve)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => handleDeleteClick(eleve)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedEleve ? 'Modifier un élève' : 'Ajouter un nouvel élève'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="nom"
            label="Nom"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nom}
            onChange={handleChange}
            sx={{ mb: 2, mt: 2 }}
          />
          <TextField
            margin="dense"
            name="prenom"
            label="Prénom"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.prenom}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DatePicker
              label="Date de naissance"
              value={formData.dateNaissance}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
              sx={{ width: '100%', mb: 2 }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            name="classe"
            label="Classe"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.classe}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          {!selectedEleve && (
            <>
              <TextField
                margin="dense"
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={formData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                name="password"
                label="Mot de passe"
                type="password"
                fullWidth
                variant="outlined"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedEleve ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'élève {selectedEleve?.prenom} {selectedEleve?.nom} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Annuler
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default GererEleve;