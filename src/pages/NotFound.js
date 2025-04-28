import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          py: 5, 
          px: 8, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          maxWidth: 500
        }}
      >
        <ErrorOutlineIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h4" gutterBottom>
          404 - Page Not Found
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 4 }}>
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </Typography>
        
        <Button component={Link} to="/" variant="contained" color="primary">
          Return to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
