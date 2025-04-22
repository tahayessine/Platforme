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
import CircularProgress from '@mui/material/CircularProgress';

function GererEleve() {
  // Add search state
  const [searchQuery, setSearchQuery] = useState('');
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

  // Add search handler
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Add filtered students logic
  const filteredEleves = eleves.filter(eleve => 
    eleve.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eleve.classe.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: 'calc(100% - 230px)',
        marginLeft: '230px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        paddingTop: '100px'
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: { xs: '20px', md: '32px' },
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          marginBottom: '32px'
        }}
      >
        <Typography 
          variant="h4"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            color: '#1e293b',
            marginBottom: '24px',
            textAlign: 'center'
          }}
        >
          Gestion des Élèves
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddEleve}
          sx={{
            background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
            color: '#fff',
            fontWeight: 600,
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.3s ease',
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': {
              background: 'linear-gradient(135deg, #3730a3, #312e81)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px rgba(79, 70, 229, 0.4)'
            }
          }}
        >
          Nouvel Élève
        </Button>
      </Box>

      <Box sx={{ 
        display: 'flex', 
        gap: 2, 
        mb: 3,
        mt: 2,
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher un élève..."
          value={searchQuery}
          onChange={handleSearch}
          sx={{
            maxWidth: '500px',
            backgroundColor: 'white',
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&:hover fieldset': {
                borderColor: '#4f46e5',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4f46e5',
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <Box sx={{ color: '#6b7280', mr: 1 }}>
                🔍
              </Box>
            )
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress sx={{ color: '#4f46e5' }} />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
          }}
        >
          {error}
        </Alert>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Nom</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Prénom</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Date de naissance</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Classe</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEleves.map((eleve) => (
                <TableRow 
                  key={eleve._id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f1f5f9',
                      transition: 'background-color 0.3s ease'
                    }
                  }}
                >
                  <TableCell sx={{ color: '#334155' }}>{eleve.nom}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{eleve.prenom}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{new Date(eleve.dateNaissance).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{eleve.classe}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{eleve.email}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEditEleve(eleve)}
                      sx={{ 
                        color: '#4f46e5',
                        '&:hover': { 
                          backgroundColor: 'rgba(79, 70, 229, 0.1)'
                        }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteClick(eleve)}
                      sx={{ 
                        color: '#ef4444',
                        '&:hover': { 
                          backgroundColor: 'rgba(239, 68, 68, 0.1)'
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add no results message */}
      {!loading && !error && filteredEleves.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: '#6b7280'
        }}>
          Aucun élève trouvé pour cette recherche
        </Box>
      )}

      {/* Update Dialog styles */}
      {/* Dialog components */}
            <Dialog 
              open={openDialog} 
              onClose={() => setOpenDialog(false)}
              maxWidth="sm"
              fullWidth
              PaperProps={{
                sx: {
                  borderRadius: '16px',
                  padding: '16px'
                }
              }}
            >
              <DialogTitle sx={{ 
                fontSize: '1.5rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                {selectedEleve ? 'Modifier un élève' : 'Ajouter un nouvel élève'}
              </DialogTitle>
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
                <Button 
                  onClick={() => setOpenDialog(false)}
                  sx={{ 
                    color: '#6b7280',
                    '&:hover': { backgroundColor: '#f1f5f9' }
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit}
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #4f46e5, #3730a3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3730a3, #312e81)',
                    }
                  }}
                >
                  {selectedEleve ? 'Modifier' : 'Ajouter'}
                </Button>
              </DialogActions>
            </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={openDeleteDialog} 
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
        <DialogTitle sx={{ color: '#1e293b', fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#334155' }}>
            Êtes-vous sûr de vouloir supprimer l'élève {selectedEleve?.prenom} {selectedEleve?.nom} ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f1f5f9' }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            sx={{
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626',
              }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: '100%',
            borderRadius: '12px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GererEleve;