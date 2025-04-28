import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, Typography, Paper, CircularProgress, 
  Alert, Grid, FormControlLabel, Switch, IconButton,
  Divider
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { userAPI } from '../../services/api';

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNo: '',
    password: '',
    confirmPassword: '',
    isAdmin: true
  });
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fetch user data if in edit mode
  useEffect(() => {
    const fetchUser = async () => {
      if (!isEditMode) return;
      
      try {
        setFetchingData(true);
        const response = await userAPI.getById(id);
        const user = response.data;
        
        setFormData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          mobileNo: user.mobileNo || '',
          password: '',  // Don't pre-fill password fields for security
          confirmPassword: '',
          isAdmin: user.isAdmin || false
        });
      } catch (err) {
        setError("Failed to load user data");
        console.error("Error fetching user:", err);
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchUser();
  }, [id, isEditMode]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle switch toggle for isAdmin
  const handleSwitchChange = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({
      ...prev,
      isAdmin: checked
    }));
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.mobileNo) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      
      // Validate phone format (simple validation)
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(formData.mobileNo.replace(/\D/g, ''))) {
        setError("Please enter a valid phone number");
        setLoading(false);
        return;
      }
      
      // For new users and password changes, validate password
      if (!isEditMode || (formData.password && formData.confirmPassword)) {
        if (!formData.password) {
          setError("Password is required");
          setLoading(false);
          return;
        }
        
        if (formData.password.length < 6) {
          setError("Password must be at least 6 characters long");
          setLoading(false);
          return;
        }
        
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }
      }
      
      // Make API call based on mode
      if (isEditMode) {
        await userAPI.update(id, formData);
        setSuccess("User updated successfully!");
      } else {
        // For creating a new admin user
        await userAPI.createAdmin(formData);
        setSuccess("Admin user created successfully!");
      }
      
      // Navigate back to users list after short delay
      setTimeout(() => {
        navigate('/users');
      }, 1500);
      
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} user: ${err.response?.data?.message || err.message}`);
      console.error("Error submitting user:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <div>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => navigate('/users')}
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'Edit User' : 'Add Admin User'}
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Phone Number"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" sx={{ mb: 2 }}>
                {isEditMode ? 'Change Password (leave blank to keep current)' : 'Set Password'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isEditMode ? "New Password (optional)" : "Password"}
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required={!isEditMode}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={isEditMode ? "Confirm New Password" : "Confirm Password"}
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required={!isEditMode}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAdmin}
                    onChange={handleSwitchChange}
                    name="isAdmin"
                    disabled={loading}
                  />
                }
                label="Administrator Privileges"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update User' : 'Create Admin User')}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </div>
  );
};

export default UserForm;
