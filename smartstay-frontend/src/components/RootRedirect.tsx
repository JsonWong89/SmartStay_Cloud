import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

const RootRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      const role = user.role.toLowerCase();
      
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'manager' || role === 'hotel manager') {
        navigate('/hotel-manager', { replace: true });
      } else if (role === 'staff' || role === 'receptionist') {
        navigate('/staff', { replace: true });
      } else if (role === 'guest') {
        navigate('/guest/dashboard', { replace: true });
      } else {
        // Default fallback to guest dashboard
        navigate('/guest/dashboard', { replace: true });
      }
    } else {
      // Not authenticated, show public guest dashboard
      navigate('/guest/dashboard', { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  // Show loading state while redirecting
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🏨
        </div>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>SmartStay</h2>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>Loading...</p>
      </div>
    </div>
  );
};

export default RootRedirect;
