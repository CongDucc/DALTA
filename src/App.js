import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import AuthContext from './context/AuthContext';

// Layouts
import Layout from './components/Layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Products from './pages/Products/Products';
import ProductForm from './pages/Products/ProductForm';
import Categories from './pages/Categories/Categories';
import CategoryForm from './pages/Categories/CategoryForm';
import Users from './pages/Users/Users';
import UserForm from './pages/Users/UserForm';
import Orders from './pages/Orders/Orders';
import OrderDetails from './pages/Orders/OrderDetails';
import NotFound from './pages/NotFound';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          
          <Route path="products">
            <Route index element={<Products />} />
            <Route path="new" element={<ProductForm />} />
            <Route path="edit/:id" element={<ProductForm />} />
          </Route>
          
          <Route path="categories">
            <Route index element={<Categories />} />
            <Route path="new" element={<CategoryForm />} />
            <Route path="edit/:id" element={<CategoryForm />} />
          </Route>
          
          <Route path="users">
            <Route index element={<Users />} />
            <Route path="new" element={<UserForm />} />
            <Route path="edit/:id" element={<UserForm />} />
          </Route>
          
          <Route path="orders">
            <Route index element={<Orders />} />
            <Route path=":id" element={<OrderDetails />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
