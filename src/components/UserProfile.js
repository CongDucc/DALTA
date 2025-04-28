import React from 'react';
import { 
  Box, Typography, Avatar, Paper, Divider, 
  List, ListItem, ListItemIcon, ListItemText,
  Chip
} from '@mui/material';
import { 
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  CalendarToday as CalendarIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';

const UserProfile = ({ user }) => {
  if (!user) return null;
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user.firstName && !user.lastName) return 'U';
    
    return `${user.firstName ? user.firstName[0] : ''}${user.lastName ? user.lastName[0] : ''}`;
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Avatar
          sx={{ 
            width: 80, 
            height: 80, 
            bgcolor: user.isAdmin ? 'primary.main' : 'secondary.main',
            fontSize: '1.5rem',
            mr: 3
          }}
        >
          {getUserInitials()}
        </Avatar>
        <Box>
          <Typography variant="h5">
            {user.firstName} {user.lastName}
          </Typography>
          
          {user.isAdmin && (
            <Chip 
              icon={<AdminIcon fontSize="small" />}
              label="Administrator" 
              color="primary" 
              size="small"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <List dense>
        <ListItem>
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Email" 
            secondary={user.email || 'N/A'}
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <PhoneIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Phone" 
            secondary={user.mobileNo || 'N/A'}
          />
        </ListItem>
        
        {user.userAddressInfo && user.userAddressInfo.length > 0 && (
          <ListItem>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Address" 
              secondary={
                <>
                  <Typography variant="body2">
                    {user.userAddressInfo[0].deliveryInfo}
                  </Typography>
                  <Typography variant="body2">
                    {user.userAddressInfo[0].city}, {user.userAddressInfo[0].region}
                  </Typography>
                </>
              }
            />
          </ListItem>
        )}
        
        <ListItem>
          <ListItemIcon>
            <CalendarIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Joined" 
            secondary={formatDate(user.createdAt)}
          />
        </ListItem>
      </List>
    </Paper>
  );
};

export default UserProfile;
