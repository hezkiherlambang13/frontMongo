import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

const NotFound = ({ message = '404 - Page Not Found' }) => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="not-found-icon">🔍</div>
        <h1>{message}</h1>
        <p>The page you're looking for doesn't exist or you don't have permission to access it.</p>
        <Link to="/login" className="btn-home">
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default NotFound;