import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contex/AuthContext';
import { Button, Container, Typography } from '@mui/material';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>📸 Photo Studio</Link>
      </Typography>
      {user ? (
        <Button color="secondary" onClick={handleLogout}>Logout</Button>
      ) : (
        <Button color="primary" component={Link} to="/login">Login</Button>
      )}
    </Container>
  );
};

export default Navbar;