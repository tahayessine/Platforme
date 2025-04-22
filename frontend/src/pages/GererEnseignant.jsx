import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleEditClick = (enseignant) => {
    setSelectedEnseignant(enseignant);
    setFormData({
      nom: enseignant.nom,
      prenom: enseignant.prenom,
      dateNaissance: new Date(enseignant.dateNaissance),
      matiere: enseignant.matiere,
      email: enseignant.email,
      password: ''
    });
    setOpenDialog(true);
  };

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
  }, [API_URL]);

  useEffect(() => {
    fetchEnseignants();
  }, [fetchEnseignants]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, dateNaissance: date }));
  };

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      if (selectedEnseignant) {
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
        handleSnackbar('Enseignant modifié avec succès');
      } else {
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
          handleSnackbar('Enseignant ajouté avec succès');
        }
      }
      
      setOpenDialog(false);
      fetchEnseignants();
    } catch (error) {
      console.error('Error submitting form:', error);
      handleSnackbar(error.response?.data?.message || 'Erreur lors de l\'opération', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredEnseignants = useMemo(() => {
    if (!searchQuery) return enseignants;
    const lowerQuery = searchQuery.toLowerCase();
    return enseignants.filter(enseignant =>
      enseignant.nom.toLowerCase().includes(lowerQuery) ||
      enseignant.prenom.toLowerCase().includes(lowerQuery) ||
      enseignant.matiere.toLowerCase().includes(lowerQuery) ||
      enseignant.email.toLowerCase().includes(lowerQuery)
    );
  }, [enseignants, searchQuery]);

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
          Gestion des Enseignants
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
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
          Ajouter un Enseignant
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
          placeholder="Rechercher un enseignant..."
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
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Matière</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEnseignants.map((enseignant) => (
                <TableRow 
                  key={enseignant._id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: '#f1f5f9',
                      transition: 'background-color 0.3s ease'
                    }
                  }}
                >
                  <TableCell sx={{ color: '#334155' }}>{enseignant.nom}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{enseignant.prenom}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{enseignant.matiere}</TableCell>
                  <TableCell sx={{ color: '#334155' }}>{enseignant.email}</TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleEditClick(enseignant)}
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
                      onClick={() => {
                        setSelectedEnseignant(enseignant);
                        setOpenDeleteDialog(true);
                      }}
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

      {!loading && !error && filteredEnseignants.length === 0 && (
        <Box sx={{ 
          textAlign: 'center', 
          py: 4,
          color: '#6b7280'
        }}>
          Aucun enseignant trouvé pour cette recherche
        </Box>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => {
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
        }}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            padding: '16px'
          }
        }}
      >
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
              disabled={selectedEnseignant}
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