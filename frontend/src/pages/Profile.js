import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Grid,
  Chip,
  Container,
  Tab,
  Tabs,
  Backdrop,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import SaveIcon from "@mui/icons-material/Save";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolIcon from '@mui/icons-material/School';
import SubjectIcon from '@mui/icons-material/Subject';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from "@mui/icons-material/LocationOn";

// Tunisian cities array from Eleve model
const tunisianCities = [
  'Tunis', 'Sfax', 'Sousse', 'Kairouan', 'Bizerte', 
  'Gabès', 'Ariana', 'Gafsa', 'Monastir', 'Ben Arous',
  'Kasserine', 'Médenine', 'Nabeul', 'Tataouine', 'Béja',
  'Kef', 'Mahdia', 'Sidi Bouzid', 'Jendouba', 'Tozeur',
  'Manouba', 'Siliana', 'Zaghouan', 'Kebili'
];

const PageContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(6), // Slightly more vertical padding
  paddingBottom: theme.spacing(6),
  minHeight: "calc(100vh - 64px)", // Adjust if header height differs
  width: "calc(100% - 240px)", // Adjust if sidebar width differs
  maxWidth: "none !important",
  marginLeft: "240px",
  paddingLeft: theme.spacing(6), // More horizontal padding
  paddingRight: theme.spacing(6),
  display: "flex",
  flexDirection: "column",
  backgroundColor: '#f8f9fa', // Slightly adjusted neutral background
  '@media (max-width: 1200px)': { // Adjust breakpoint for sidebar collapse if needed
    width: '100%',
    marginLeft: 0,
    padding: theme.spacing(4),
  },
  '@media (max-width: 600px)': {
    padding: theme.spacing(3),
  }
}));

const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: 0,
  borderRadius: theme.shape.borderRadius * 4, // Slightly more rounded corners
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', // Even softer initial shadow
  overflow: 'hidden',
  background: '#ffffff',
  margin: 0,
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  transition: 'box-shadow 0.3s ease-in-out',
  '&:hover': {
     boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)', // Refined hover shadow
  }
}));

const ProfileHeader = styled(Box)(({ theme }) => ({
  background: '#ffffff',
  padding: theme.spacing(4, 5), // Keep padding consistent
  color: theme.palette.text.primary,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4), // Slightly increased gap
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 90, // Slightly smaller for a sleeker look
  height: 90,
  border: `4px solid ${theme.palette.background.paper}`, // Slightly thicker border
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)', // Adjusted shadow
  transition: 'all 0.3s ease',
  // Use a solid, professional color or a very subtle gradient if preferred
  background: theme.palette.primary.main,
  // background: `linear-gradient(145deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`, // Optional subtle gradient
  fontSize: '2.2rem', // Adjusted font size
  zIndex: 1,
  '&:hover': {
    transform: 'scale(1.04)', // Slightly adjusted hover scale
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: '#fcfdff', // Slightly adjusted tab background
  minHeight: 64, // Increased height for better spacing
  '& .MuiTab-root': {
    minHeight: 64,
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none',
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 4), // Increased horizontal padding
    transition: 'color 0.2s ease, background-color 0.2s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover, // Use theme hover color
      color: theme.palette.primary.main,
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      fontWeight: 600,
      backgroundColor: '#ffffff',
    },
    // Add icon styling directly here if needed
    '& .MuiTab-iconWrapper': {
        marginRight: theme.spacing(1), // Ensure space between icon and label
    }
  },
  '& .MuiTabs-indicator': {
    height: 2, // Standard indicator height
    backgroundColor: theme.palette.primary.main,
    borderTopLeftRadius: 0, // Remove radius for cleaner look
    borderTopRightRadius: 0,
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.shape.borderRadius * 2, // Consistent radius
    transition: 'all 0.25s ease-in-out',
    backgroundColor: theme.palette.grey[50],
    '& fieldset': {
      borderColor: theme.palette.grey[300],
      transition: 'border-color 0.25s ease-in-out', // Add transition to border
    },
    '&:hover': {
      backgroundColor: theme.palette.grey[100],
      '& fieldset': {
        borderColor: theme.palette.grey[400],
      }
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px', // Ensure border width doesn't change on focus
      }
    },
    // Style for adornments
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: theme.palette.text.secondary, // Consistent icon color
        fontSize: '1.25rem', // Standard icon size
    }
  },
  '& .MuiInputLabel-root': {
    fontSize: '1rem',
    fontWeight: 400,
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    }
  },
  // Adjust helper text style
  '& .MuiFormHelperText-root': {
      fontSize: '0.8rem',
      marginLeft: theme.spacing(0.5) // Slight indent
  }
}));

const SaveButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.25, 4), // Fine-tuned padding
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: `0 3px 8px ${theme.palette.primary.main}40`, // Adjusted shadow
  transition: 'all 0.25s ease',
  '&:hover': {
    background: theme.palette.primary.dark,
    transform: 'translateY(-1px)', // More subtle hover lift
    boxShadow: `0 5px 14px ${theme.palette.primary.main}59`, // Adjusted hover shadow
  },
  '&:active': {
    transform: 'translateY(0px)',
    boxShadow: `0 2px 6px ${theme.palette.primary.main}33`, // Active shadow
  },
  '&.Mui-disabled': {
      background: theme.palette.action.disabledBackground,
      boxShadow: 'none',
      color: theme.palette.action.disabled,
  }
}));

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && (
      <Box sx={{
        p: 5,
        animation: 'fadeIn 0.4s ease-out',
        '@keyframes fadeIn': {
          '0%': { opacity: 0, transform: 'translateY(8px)' }, // Slightly adjusted animation
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        backgroundColor: '#ffffff'
      }}>
        {children}
      </Box>
    )}
  </div>
);


const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    // Common fields from User model
    email: "",
    role: "",
    // Security fields
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    // Role-specific fields based on schemas
    nom: "",
    prenom: "",
    dateNaissance: "",
    classe: "",     // for Eleve
    ville: "",      // for Eleve
    matiere: "",    // for Enseignant
    fonction: "",   // for Admin
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch("http://localhost:5000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Échec de la récupération du profil");

      const data = await response.json();
      if (data.success) {
        const { user, profile } = data.data;
        setUserInfo(prev => ({
          ...prev,
          email: user.email,
          role: user.role,
          nom: profile?.nom || "",
          prenom: profile?.prenom || "",
          dateNaissance: profile?.dateNaissance ? new Date(profile.dateNaissance).toISOString().split('T')[0] : "",
          classe: profile?.classe || "",
          ville: profile?.ville || "",
          matiere: profile?.matiere || "",
          fonction: profile?.fonction || "",
        }));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      
      // Validate required fields based on role
      const requiredFields = {
        eleve: ['nom', 'prenom', 'email', 'ville'],
        enseignant: ['nom', 'prenom', 'email', 'matiere'],
        admin: ['nom', 'prenom', 'email', 'fonction']
      };

      const missingFields = requiredFields[userInfo.role]?.filter(
        field => !userInfo[field]
      );

      if (missingFields?.length) {
        toast.error(`Veuillez remplir tous les champs obligatoires: ${missingFields.join(', ')}`);
        return;
      }

      // Password validation
      if (userInfo.newPassword) {
        if (!userInfo.currentPassword) {
          toast.error("Le mot de passe actuel est requis pour changer le mot de passe");
          return;
        }
        if (userInfo.newPassword !== userInfo.confirmPassword) {
          toast.error("Les nouveaux mots de passe ne correspondent pas");
          return;
        }
      }

      const updateData = {
        email: userInfo.email,
        nom: userInfo.nom,
        prenom: userInfo.prenom,
        dateNaissance: userInfo.dateNaissance,
        currentPassword: userInfo.currentPassword,
        newPassword: userInfo.newPassword,
      };

      // Add role-specific data
      switch (userInfo.role) {
        case 'eleve':
          updateData.classe = userInfo.classe;
          updateData.ville = userInfo.ville;
          break;
        case 'enseignant':
          updateData.matiere = userInfo.matiere;
          break;
        case 'admin':
          updateData.fonction = userInfo.fonction;
          break;
      }

      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success("Profil mis à jour avec succès");
        // Reset password fields
        setUserInfo(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        throw new Error(data.message || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  if (loading) {
    return (
      <Backdrop open={true}>
        <CircularProgress />
      </Backdrop>
    );
  }

  // Update the return statement to use new styled components
  return (
    <PageContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <ProfileCard>
          <ProfileHeader>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <StyledAvatar>
                {userInfo.prenom?.[0]?.toUpperCase() || ''}
              </StyledAvatar>
              <Box sx={{ ml: 3, flex: 1 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    mb: 0.5
                  }}
                >
                  {`${userInfo.prenom} ${userInfo.nom}`}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <EmailIcon sx={{ fontSize: 18 }} />
                    {userInfo.email}
                  </Typography>
                  <Chip
                    label={userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1)}
                    size="small"
                    sx={{
                      backgroundColor: 'primary.main',
                      color: '#ffffff',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </ProfileHeader>

          <StyledTabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Informations Personnelles"
              sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}
            />
            <Tab 
              icon={<SecurityIcon />} 
              label="Sécurité"
              sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}
            />
          </StyledTabs>

          <form onSubmit={handleSubmit}>
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Email"
                    name="email"
                    value={userInfo.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Nom"
                    name="nom"
                    value={userInfo.nom}
                    onChange={handleChange}
                    error={!!errors.nom}
                    helperText={errors.nom}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Prénom"
                    name="prenom"
                    value={userInfo.prenom}
                    onChange={handleChange}
                    error={!!errors.prenom}
                    helperText={errors.prenom}
                    InputProps={{
                      startAdornment: <PersonIcon sx={{ mr: 1 }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de naissance"
                    name="dateNaissance"
                    value={userInfo.dateNaissance}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Role-specific fields */}
                {userInfo.role === 'eleve' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Classe"
                        name="classe"
                        value={userInfo.classe}
                        onChange={handleChange}
                        error={!!errors.classe}
                        helperText={errors.classe}
                        InputProps={{
                          startAdornment: <SchoolIcon sx={{ mr: 1 }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        select
                        fullWidth
                        label="Ville"
                        name="ville"
                        value={userInfo.ville}
                        onChange={handleChange}
                        error={!!errors.ville}
                        helperText={errors.ville}
                        SelectProps={{ // Use SelectProps for select-specific styling if needed
                            MenuProps: {
                                PaperProps: {
                                    sx: {
                                        maxHeight: 250, // Limit dropdown height
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', // Consistent shadow
                                        borderRadius: theme => theme.shape.borderRadius * 1.5,
                                    }
                                }
                            }
                        }}
                        InputProps={{ // Keep InputProps for the adornment
                          startAdornment: <LocationOnIcon sx={{ mr: 1 }} />,
                        }}
                      >
                        {tunisianCities.map((city) => (
                          <MenuItem key={city} value={city}>
                            {city}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </>
                )}

                {userInfo.role === 'enseignant' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Matière enseignée"
                      name="matiere"
                      value={userInfo.matiere}
                      onChange={handleChange}
                      error={!!errors.matiere}
                      helperText={errors.matiere}
                      InputProps={{
                        startAdornment: <SubjectIcon sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                )}

                {userInfo.role === 'admin' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      label="Fonction"
                      name="fonction"
                      value={userInfo.fonction}
                      onChange={handleChange}
                      error={!!errors.fonction}
                      helperText={errors.fonction}
                      InputProps={{
                        startAdornment: <WorkIcon sx={{ mr: 1 }} />,
                      }}
                    />
                  </Grid>
                )}
              </Grid>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showCurrentPassword ? "text" : "password"}
                    label="Mot de passe actuel"
                    name="currentPassword"
                    value={userInfo.currentPassword}
                    onChange={handleChange}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showNewPassword ? "text" : "password"}
                    label="Nouveau mot de passe"
                    name="newPassword"
                    value={userInfo.newPassword}
                    onChange={handleChange}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    label="Confirmer le nouveau mot de passe"
                    name="confirmPassword"
                    value={userInfo.confirmPassword}
                    onChange={handleChange}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1 }} />,
                      endAdornment: (
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </TabPanel>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </Button>
            </Box>
          </form>
        </ProfileCard>
      </motion.div>
    </PageContainer>
  );
};

export default Profile;