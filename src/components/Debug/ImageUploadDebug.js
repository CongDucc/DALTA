import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

/**
 * Debug component to show information about image uploads
 * Can be temporarily added to forms for troubleshooting
 */
const ImageUploadDebug = ({ images, imageFiles }) => {
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <Box sx={{ mt: 3 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">Debug Image Upload Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <Typography variant="subtitle2">Image Preview URLs ({images.length}):</Typography>
            <Box component="pre" sx={{ overflow: 'auto', maxHeight: 200, fontSize: '0.75rem' }}>
              {images.map((url, i) => `[${i}] ${url}\n`)}
            </Box>
            
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Image Files ({imageFiles.length}):</Typography>
            <Box component="pre" sx={{ overflow: 'auto', maxHeight: 200, fontSize: '0.75rem' }}>
              {imageFiles.map((file, i) => (
                `[${i}] ${file.name} (${file.type}, ${(file.size/1024).toFixed(2)} KB)\n`
              ))}
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ImageUploadDebug;
