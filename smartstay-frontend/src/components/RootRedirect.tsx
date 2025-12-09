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
      
      if (role === "admin") {
          console.log("Redirecting to /admin/dashboard");
          navigate("/admin/dashboard");
        } else if (role === "manager") {
          console.log("Redirecting to /manager");
          navigate("/manager");
        } else if (role === "guest") {
          navigate("/guest/dashboard");
        } else if (role === "receptionist") {
          navigate("/staff/dashboard");
      }
    } else {
      // Not authenticated, redirect to login
      navigate('/login', { replace: true });
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
