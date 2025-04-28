import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, Box, Typography, Paper, Grid, Card, CardContent, 
  CardMedia, CardActions, IconButton, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  TextField, InputAdornment, Alert
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { categoryAPI } from '../../services/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryAPI.getAll();
        setCategories(response.data);
      } catch (err) {
        setError("Failed to load categories");
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Filter categories by search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Delete category functions
  const openDeleteDialog = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };
  
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
  };
  
  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      await categoryAPI.delete(categoryToDelete._id);
      setCategories(categories.filter(c => c._id !== categoryToDelete._id));
      closeDeleteDialog();
    } catch (err) {
      setError("Failed to delete category");
      console.error("Error deleting category:", err);
    }
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Categories</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          to="/categories/new"
        >
          Add Category
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search categories..."
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        <Grid container spacing={3}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <Grid item xs={12} sm={6} md={4} key={category._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={category.images?.[0] || 'https://via.placeholder.com/300x140?text=No+Image'}
                    alt={category.name}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {category.name}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <IconButton 
                      component={Link} 
                      to={`/categories/edit/${category._id}`}
                      aria-label="edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      onClick={() => openDeleteDialog(category)}
                      aria-label="delete"
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>No categories found</Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the category "{categoryToDelete?.name}"? 
            This may affect products associated with this category.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Categories;
