import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Grid, Paper, Typography, Card, CardContent, 
  CardActions, Button, Box, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  ShoppingBag as ProductIcon,
  Category as CategoryIcon,
  People as UserIcon,
  ShoppingCart as OrderIcon,
  AttachMoney as RevenueIcon
} from '@mui/icons-material';
import { statsAPI, orderAPI, categoryAPI, productAPI } from '../services/api';

// Order status colors for consistency
const statusColors = {
  'pending': '#ff9800',   // warning
  'processing': '#2196f3', // info
  'shipped': '#1976d2',   // primary
  'delivered': '#4caf50', // success
  'cancelled': '#f44336'  // error
};

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const StatCard = ({ title, value, icon, color, isLoading, linkTo, subtitle }) => {
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
          <Typography variant="h5" component="div">
            {title}
          </Typography>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={30} />
          </Box>
        ) : (
          <>
            <Typography variant="h3" sx={{ fontWeight: 'bold', textAlign: 'center', my: 2 }}>
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
      <CardActions>
        <Button size="small" component={Link} to={linkTo}>
          View Details
        </Button>
      </CardActions>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    usersCount: 0,
    ordersCount: 0,
    revenue: 0,
    recentOrders: [],
    ordersByStatus: {}
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // States for chart data
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const dashboardStats = await statsAPI.getStats();
        setStats(dashboardStats);
        
        // Fetch monthly revenue for charts
        const monthlyRevenueRes = await orderAPI.getMonthlyRevenue();
        setSalesData(monthlyRevenueRes.data || []);
        
        // Get categories and products to create category chart data
        const [categoriesRes, productsRes] = await Promise.all([
          categoryAPI.getAll(),
          productAPI.getAll()
        ]);
        
        // Create category data for chart
        const categories = categoriesRes.data || [];
        const products = productsRes.data || [];
        
        const catData = categories.map(cat => ({
          name: cat.name,
          products: products.filter(p => p.category === cat._id).length
        })).filter(c => c.products > 0);
        
        setCategoryData(catData);
        
        // Transform order status data for pie chart
        const statusStats = dashboardStats.ordersByStatus || {};
        const statusData = Object.keys(statusStats).map(status => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: statusStats[status]
        }));
        
        setOrderStatusData(statusData);
        
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Generate some colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  
  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Products" 
            value={stats.productsCount} 
            icon={<ProductIcon />} 
            color="#1976d2" 
            isLoading={loading}
            linkTo="/products"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Categories" 
            value={stats.categoriesCount} 
            icon={<CategoryIcon />} 
            color="#2e7d32" 
            isLoading={loading}
            linkTo="/categories"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Users" 
            value={stats.usersCount} 
            icon={<UserIcon />} 
            color="#ed6c02" 
            isLoading={loading}
            linkTo="/users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Orders" 
            value={stats.ordersCount} 
            icon={<OrderIcon />} 
            color="#9c27b0" 
            isLoading={loading}
            linkTo="/orders"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Revenue" 
            value={formatCurrency(stats.revenue)} 
            icon={<RevenueIcon />} 
            color="#f44336" 
            isLoading={loading}
            linkTo="/orders"
            subtitle="Total revenue from all completed orders"
          />
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Chart */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 350 
            }}
          >
            <Typography variant="h6" gutterBottom>
              Monthly Revenue
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : salesData.length > 0 ? (
              <ResponsiveContainer>
                <LineChart
                  data={salesData}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="orders" name="Orders" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">No revenue data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Category Chart */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 350 
            }}
          >
            <Typography variant="h6" gutterBottom>
              Products by Category
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : categoryData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart
                  data={categoryData}
                  margin={{
                    top: 5, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="products" fill="#82ca9d" name="Product Count" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">No category data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Order Status Chart */}
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 350 
            }}
          >
            <Typography variant="h6" gutterBottom>
              Orders by Status
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : orderStatusData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value + ' orders'} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">No order status data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Orders */}
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column', 
              height: 350 
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : stats.recentOrders && stats.recentOrders.length > 0 ? (
              <TableContainer sx={{ maxHeight: 270 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentOrders.map((order) => (
                      <TableRow key={order._id} hover>
                        <TableCell>
                          <Link to={`/orders/${order._id}`} style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
                            {order.orderNumber || `ORD-${order._id.slice(-6)}`}
                          </Link>
                        </TableCell>
                        <TableCell>{order.customer?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'} 
                            size="small"
                            sx={{ 
                              backgroundColor: statusColors[order.status] || '#757575',
                              color: 'white'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography color="text.secondary">No recent orders available</Typography>
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button component={Link} to="/orders" size="small">
                View All Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
