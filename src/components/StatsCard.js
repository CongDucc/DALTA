import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Card, CardContent, CardActions, 
  Typography, Box, Button, CircularProgress 
} from '@mui/material';

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  color, 
  isLoading, 
  linkTo, 
  subtitle,
  actionText = 'View Details'
}) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: '50%', 
            p: 1,
            mr: 2 
          }}>
            {React.cloneElement(icon, { sx: { color: color, fontSize: 40 } })}
          </Box>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <>
            <Typography variant="h4" sx={{ fontWeight: 'bold', textAlign: 'center', my: 2 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
      {linkTo && (
        <CardActions>
          <Button size="small" component={Link} to={linkTo}>
            {actionText}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default StatsCard;
