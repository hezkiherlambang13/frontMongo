import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Container, Typography, Box } from '@mui/material';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChoosePackage = () => {
    if (!user) {
      navigate('/login');
    } else {
      if (user.role === 'customer') navigate('/customer');
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'manager') navigate('/manager');
    }
  };

  return (
    <Container sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h3" gutterBottom>Welcome to Photo Studio</Typography>
      <Typography variant="h6" gutterBottom>Professional photo shoots for every occasion</Typography>
      <Box mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
          sx={{ mr: 2 }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleChoosePackage}
        >
          Choose Package
        </Button>
      </Box>
    </Container>
  );
};

export default LandingPage;