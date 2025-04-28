import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Chip, IconButton, Tooltip,
  TextField, InputAdornment, CircularProgress, Alert,
  MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { 
  Search as SearchIcon,
  Visibility as ViewIcon,
  PrintOutlined as PrintIcon
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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderAPI.getAll();
        
        // If the API returns data, use it, otherwise use an empty array
        setOrders(response.data || []);
      } catch (err) {
        setError("Failed to load orders");
        console.error("Error fetching orders:", err);
        // Set orders to empty array to avoid errors
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Filter orders by search term and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.email && order.customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle status filter
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate total
  const getOrderTotal = (order) => {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Orders</Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search orders..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="shipped">Shipped</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length > 0 ? (
                filteredOrders
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Link to={`/orders/${order._id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                        {order.orderNumber || `ORD-${order._id.slice(-6)}`}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'} 
                        color={statusColors[order.status] || 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      ${order.totalAmount?.toFixed(2) || getOrderTotal(order)}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          component={Link}
                          to={`/orders/${order._id}`}
                          size="small"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Print Invoice">
                        <IconButton
                          size="small"
                          onClick={() => window.print()}
                        >
                          <PrintIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredOrders.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
};

export default Orders;
