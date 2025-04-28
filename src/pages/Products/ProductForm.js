import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Button, TextField, Typography, FormControl, 
  InputLabel, Select, MenuItem, FormControlLabel, Switch,
  Paper, Grid, CircularProgress, Alert, IconButton
} from '@mui/material';
import { 
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { productAPI, categoryAPI } from '../../services/api';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    quantity: '0',
    inStock: true,
    isFeatured: false,
    category: '',
  });
  
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fetch categories and product data if in edit mode
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingData(true);
        
        // Fetch categories
        const categoriesRes = await categoryAPI.getAll();
        setCategories(categoriesRes.data);
        
        // If in edit mode, fetch product data
        if (isEditMode) {
          const productRes = await productAPI.getById(id);
          const product = productRes.data;
          
          setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price?.toString() || '',
            oldPrice: product.oldPrice?.toString() || '',
            quantity: product.quantity?.toString() || '0',
            inStock: product.inStock || false,
            isFeatured: product.isFeatured || false,
            category: product.category || '',
          });
          
          setImages(product.images || []);
        }
      } catch (err) {
        setError("Failed to load data");
        console.error("Error fetching data:", err);
      } finally {
        setFetchingData(false);
      }
    };
    
    fetchData();
  }, [id, isEditMode]);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle switch toggles
  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };
  
  // Improved image selection handling
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      console.log("Files selected:", filesArray);
      
      // Show selected file info
      filesArray.forEach(file => {
        console.log(`Selected file: ${file.name}, size: ${file.size}, type: ${file.type}`);
      });
      
      // Preview images
      const newImageURLs = filesArray.map(file => {
        const objectUrl = URL.createObjectURL(file);
        console.log(`Created object URL for ${file.name}:`, objectUrl);
        return objectUrl;
      });
      
      setImages(prevImages => [...prevImages, ...newImageURLs]);
      setImageFiles(prevFiles => [...prevFiles, ...filesArray]);
    }
  };
  
  // Remove image from preview
  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    if (index < imageFiles.length) {
      const newImageFiles = [...imageFiles];
      newImageFiles.splice(index, 1);
      setImageFiles(newImageFiles);
    }
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.price || !formData.category) {
        setError("Please fill all required fields");
        setLoading(false);
        return;
      }
      
      // Create FormData object for API call
      const productFormData = new FormData();
      
      // Log what's happening with images for debugging
      console.log("Image files to upload:", imageFiles);
      console.log("Existing images:", images.filter(img => !img.startsWith('blob:')));
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        productFormData.append(key, formData[key]);
      });
      
      // Add image files
      imageFiles.forEach(file => {
        productFormData.append('images', file);
      });
      
      // If editing, add existing images
      if (isEditMode) {
        // Only include existing images that haven't been removed
        const existingImages = images.filter(img => !img.startsWith('blob:'));
        
        // Use existingImages field for server-side images
        if (existingImages.length > 0) {
          productFormData.append('existingImages', JSON.stringify(existingImages));
        }
      }
      
      // For debugging, log FormData (can't directly log it, so we log entries)
      for (let pair of productFormData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
      }
      
      // Make API call
      if (isEditMode) {
        await productAPI.update(id, productFormData);
        setSuccess("Product updated successfully");
      } else {
        await productAPI.create(productFormData);
        setSuccess("Product created successfully");
        
        // Reset form in create mode
        setFormData({
          name: '',
          description: '',
          price: '',
          oldPrice: '',
          quantity: '0',
          inStock: true,
          isFeatured: false,
          category: '',
        });
        setImages([]);
        setImageFiles([]);
      }
      
      // Navigate to products list after short delay
      setTimeout(() => {
        navigate('/products');
      }, 1500);
      
    } catch (err) {
      setError(`Failed to ${isEditMode ? 'update' : 'create'} product: ${err.response?.data?.error || err.message}`);
      console.error("Error submitting product:", err);
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4">
          {isEditMode ? 'Edit Product' : 'Add New Product'}
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
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Category"
                  onChange={handleChange}
                  disabled={loading}
                >
                  {categories.map(category => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                disabled={loading}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="oldPrice"
                label="Old Price (optional)"
                type="number"
                value={formData.oldPrice}
                onChange={handleChange}
                disabled={loading}
                InputProps={{ startAdornment: '$' }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="quantity"
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.inStock}
                      onChange={handleSwitchChange}
                      name="inStock"
                      disabled={loading}
                    />
                  }
                  label="In Stock"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isFeatured}
                      onChange={handleSwitchChange}
                      name="isFeatured"
                      disabled={loading}
                    />
                  }
                  label="Featured"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Product Images
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                {images.map((img, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      position: 'relative',
                      width: 100,
                      height: 100,
                    }}
                  >
                    {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                    <img
                      src={img}
                      alt={`Product ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        console.error(`Failed to load image: ${img}`);
                        e.target.src = 'https://via.placeholder.com/100?text=Image+Error';
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                      onClick={() => removeImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                disabled={loading}
              >
                Upload Images
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update Product' : 'Create Product')}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={() => navigate('/products')}
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

export default ProductForm;