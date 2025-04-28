import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, Typography, Paper, CircularProgress, 
  Alert, Card, CardMedia, IconButton, Divider
} from '@mui/material';
import { 
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { categoryAPI } from '../../services/api';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fetch category data if in edit mode
  useEffect(() => {
    const fetchCategory = async () => {
      if (!isEditMode) return;
      
      try {
        setFetchingData(true);
        const response = await categoryAPI.getById(id);
        const category = response.data;
        
        setName(category.name);
        if (category.images && category.images.length > 0) {
          setImagePreview(category.images[0]);
        }
      } catch (err) {
        setError("Failed to load category data");
        console.error("Error fetching category:", err);
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchCategory();
  }, [id, isEditMode]);
  
  // Handle image selection
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };
  
  // Reset image selection
  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!name) {
        setError("Category name is required");
        setLoading(false);
        return;
      }
      
      // Create FormData object
      const formData = new FormData();
      formData.append('name', name);
      
      if (image) {
        formData.append('image', image);
      }
      
      // Make API call based on mode
      if (isEditMode) {
        await categoryAPI.update(id, formData);
        setSuccess("Category updated successfully!");
      } else {
        if (!image) {
          setError("Image is required for new categories");
          setLoading(false);
          return;
        }
        await categoryAPI.create(formData);
        setSuccess("Category created successfully!");
      }
      
      // Navigate back to categories list after short delay
      setTimeout(() => {
        navigate('/categories');
      }, 1500);
      
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} category: ${err.response?.data?.error || err.message}`);
      console.error("Error submitting category:", err);
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
          onClick={() => navigate('/categories')}
          sx={{ mr: 2 }}
          aria-label="back"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">
          {isEditMode ? 'Edit Category' : 'Add New Category'}
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
          <TextField
            fullWidth
            required
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
            disabled={loading}
          />
          
          <Divider sx={{ mb: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Category Image
          </Typography>
          
          {imagePreview ? (
            <Box sx={{ mb: 3, position: 'relative', width: 300 }}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={imagePreview}
                  alt="Category preview"
                  sx={{ objectFit: 'contain' }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    }
                  }}
                  onClick={handleRemoveImage}
                >
                  <DeleteIcon />
                </IconButton>
              </Card>
            </Box>
          ) : (
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                disabled={loading}
              >
                Upload Image
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {isEditMode ? 'Upload a new image to replace the existing one' : 'Please upload a category image'}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update Category' : 'Create Category')}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/categories')}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </div>
  );
};

export default CategoryForm;
