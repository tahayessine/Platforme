import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import './style.css';

function GererEnseignant() {
  const [enseignants, setEnseignants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEnseignant, setSelectedEnseignant] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: null,
    matiere: '',
    email: '',
    password: ''
  });

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Add this function here
  const handleEditClick = (enseignant) => {
    setSelectedEnseignant(enseignant);
    setFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      dateNaissance: new Date(enseignant.dateNaissance),
      matiere: enseignant.matiere,
      email: enseignant.email,
      password: '' // Password field is empty when editing
    });
    setOpenDialog(true);
  };

  // Fetch teachers
  // Wrap fetchEnseignants in useCallback
  const fetchEnseignants = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await axios.get(`${API_URL}/api/enseignants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        setEnseignants(response.data.enseignants);
      }
    } catch (error) {
      setError('Erreur lors du chargement des enseignants');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array since it doesn't depend on any props or state

  // Update useEffect
  useEffect(() => {
    fetchEnseignants();
  }, [fetchEnseignants]);

  // Handle form submission
  // Add these handler functions
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dateNaissance: date }));
  };

  // Update useEffect to include fetchEnseignants in dependencies
  useEffect(() => {
    fetchEnseignants();
  }, [fetchEnseignants]); // Add dependency

  // Add snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Add snackbar handler
  // Update handleSnackbar to use the defined state
  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Update handleSubmit to use snackbar
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (selectedEnseignant) {
        // Update existing teacher
        await axios.put(
          `${API_URL}/api/enseignants/${selectedEnseignant._id}`,
          {
            nom: formData.nom,
            prenom: formData.prenom,
            dateNaissance: formData.dateNaissance,
            matiere: formData.matiere,
            email: formData.email
          },
          { headers }
        );
        setSnackbar({
          open: true,
          message: 'Enseignant modifié avec succès',
          severity: 'success'
        });
      } else {
        // Create new teacher
        const userResponse = await axios.post(
          `${API_URL}/api/auth/register`,
          {
            name: `${formData.prenom} ${formData.nom}`,
            email: formData.email,
            password: formData.password,
            role: 'enseignant',
            isAdmin: true
          },
          { headers }
        );

        if (userResponse.data.success) {
          await axios.post(
            `${API_URL}/api/enseignants/create-with-user`,
            {
              nom: formData.nom,
              prenom: formData.prenom,
              dateNaissance: formData.dateNaissance,
              matiere: formData.matiere,
              email: formData.email,
              userId: userResponse.data.userId
            },
            { headers }
          );
        }
      }
      
      setOpenDialog(false);
      fetchEnseignants();
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

  // Update handleDelete to use snackbar
  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      await axios.delete(`${API_URL}/api/enseignants/${selectedEnseignant._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setOpenDeleteDialog(false);
      fetchEnseignants();
      handleSnackbar('Enseignant supprimé avec succès');
    } catch (error) {
      console.error(error);
      handleSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnseignants();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: 'calc(100% - 230px)',
        marginLeft: '230px',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        paddingTop: '80px',
        paddingBottom: '32px'
      }}
    >
      <Box
        sx={{
          width: '100%',
          padding: { xs: '16px', md: '24px 40px' },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          background: 'linear-gradient(135deg, #ffffff, #f1f5f9)',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
          boxShadow: '0 8px 32px rgba(148, 163, 184, 0.1)',
          borderRadius: '0 0 20px 20px',
          transition: 'all 0.3s ease'
        }}
      >
        <Typography 
          variant="h4"
          sx={{
            fontFamily: '"Poppins", sans-serif',
            fontWeight: 700,
            fontSize: { xs: '1.5rem', md: '2rem' },
            color: '#1e293b',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          Gestion des Enseignants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{
            background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: '#fff',
            fontWeight: 600,
            padding: '10px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.3s ease',
            textTransform: 'none',
            fontSize: '0.9rem',
            fontFamily: '"Inter", sans-serif',
            '&:hover': {
              background: 'linear-gradient(135deg, #4f46e5, #4338ca)',
              boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
              transform: 'translateY(-2px)'
            },
            '&:active': {
              transform: 'translateY(0)'
            }
          }}
        >
          Nouvel Enseignant
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell>Matière</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enseignants.map((enseignant) => (
                <TableRow key={enseignant._id}>
                  <TableCell>{enseignant.nom}</TableCell>
                  <TableCell>{enseignant.prenom}</TableCell>
                  <TableCell>{enseignant.matiere}</TableCell>
                  <TableCell>{enseignant.email}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEditClick(enseignant)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => {
                      setSelectedEnseignant(enseignant);
                      setOpenDeleteDialog(true);
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        setSelectedEnseignant(null);
        setFormData({
          nom: '',
          prenom: '',
          dateNaissance: null,
          matiere: '',
          email: '',
          password: ''
        });
      }}>
        <DialogTitle>
          {selectedEnseignant ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Prénom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              margin="normal"
              required
            />
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
              <DatePicker
                label="Date de naissance"
                value={formData.dateNaissance}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              />
            </LocalizationProvider>
            <TextField
              fullWidth
              label="Matière"
              name="matiere"
              value={formData.matiere}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              disabled={selectedEnseignant} // Disable email field when editing
            />
            {!selectedEnseignant && (
              <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Annuler</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer cet enseignant ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default GererEnseignant;