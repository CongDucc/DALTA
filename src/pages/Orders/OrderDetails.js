import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Divider, Grid, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, IconButton
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { orderAPI } from '../../services/api';

// Order status colors
const statusColors = {
  'pending': 'warning',
  'processing': 'info',
  'shipped': 'primary',
  'delivered': 'success',
  'cancelled': 'error'
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [statusValue, setStatusValue] = useState('');
  
  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getById(id);
        const orderData = response.data;
        setOrder(orderData);
        setStatusValue(orderData.status || 'pending');
      } catch (err) {
        setError("Failed to load order details");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id]);
  
  // Handle status change
  const handleStatusChange = (event) => {
    setStatusValue(event.target.value);
  };
  
  // Update order status
  const updateStatus = async () => {
    try {
      setUpdating(true);
      await orderAPI.updateStatus(id, statusValue);
      setOrder({ ...order, status: statusValue });
      // Show success message or notification
      setTimeout(() => setUpdating(false), 1000);
    } catch (err) {
      setError("Failed to update order status");
      console.error("Error updating status:", err);
      setUpdating(false);
    }
  };
  
  // Print invoice
  const printInvoice = () => {
    window.print();
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!order && !loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          Order not found or has been deleted.
        </Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/orders')}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }
  
  // Calculate subtotal
  const subtotal = order?.items?.reduce(
    (sum, item) => sum + (item.price * item.quantity), 
    0
  ) || 0;
  
  // Shipping cost and tax (mock values)
  const shipping = order?.shippingCost || 0;
  const tax = order?.tax || 0;
  
  // Total amount
  const total = order?.totalAmount || (subtotal + shipping + tax);
  
  return (
    <div>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            onClick={() => navigate('/orders')}
            sx={{ mr: 2 }}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            Order Details
          </Typography>
        </Box>
        
        <Button
          variant="outlined"
          startIcon={<PrintIcon />}
          onClick={printInvoice}
        >
          Print Invoice
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
          <Box>
            <Typography variant="h5" gutterBottom>
              Order #{order?.orderNumber || `ORD-${id.slice(-6)}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Placed on {formatDate(order?.createdAt)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Pending'} 
              color={statusColors[order?.status] || 'default'} 
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Update Status</InputLabel>
              <Select
                value={statusValue}
                label="Update Status"
                onChange={handleStatusChange}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="processing">Processing</MenuItem>
                <MenuItem value="shipped">Shipped</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              onClick={updateStatus}
              disabled={updating || statusValue === order?.status}
              size="small"
            >
              {updating ? <CircularProgress size={24} /> : 'Update'}
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Typography>
              <strong>Name:</strong> {order?.customer?.name || 'N/A'}
            </Typography>
            <Typography>
              <strong>Email:</strong> {order?.customer?.email || 'N/A'}
            </Typography>
            <Typography>
              <strong>Phone:</strong> {order?.customer?.phone || 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <Typography>
              {order?.shippingAddress?.street || 'N/A'}
            </Typography>
            <Typography>
              {order?.shippingAddress?.city || ''}{order?.shippingAddress?.city ? ', ' : ''}
              {order?.shippingAddress?.state || ''} {order?.shippingAddress?.zip || ''}
            </Typography>
            <Typography>
              {order?.shippingAddress?.country || ''}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Price</TableCell>
                <TableCell align="center">Quantity</TableCell>
                <TableCell align="right">Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order?.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {item.image && (
                        <Box 
                          component="img" 
                          src={item.image} 
                          alt={item.name} 
                          sx={{ width: 50, height: 50, objectFit: 'cover', mr: 2 }} 
                        />
                      )}
                      <div>
                        <Typography variant="body1">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.sku || item.productId || 'N/A'}
                        </Typography>
                      </div>
                    </Box>
                  </TableCell>
                  <TableCell>${item.price?.toFixed(2)}</TableCell>
                  <TableCell align="center">{item.quantity}</TableCell>
                  <TableCell align="right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              
              {/* Order Summary */}
              <TableRow>
                <TableCell rowSpan={4} colSpan={2} />
                <TableCell>Subtotal</TableCell>
                <TableCell align="right">${subtotal.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Shipping</TableCell>
                <TableCell align="right">${shipping.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tax</TableCell>
                <TableCell align="right">${tax.toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>${total.toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
        
        {order?.notes && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" gutterBottom>
              Order Notes
            </Typography>
            <Typography variant="body2">
              {order.notes}
            </Typography>
          </>
        )}
      </Paper>
    </div>
  );
};

export default OrderDetails;
