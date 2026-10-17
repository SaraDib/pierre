import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#11100f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#c5a059',
        fontFamily: "'Manrope', sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(197, 160, 89, 0.2)',
            borderTopColor: '#c5a059',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '12px' }}>
            Vérification de l'accès...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
