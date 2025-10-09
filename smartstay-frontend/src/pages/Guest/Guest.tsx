import React from 'react';
import { useAuthStore } from '../../store';
import { Link } from 'react-router-dom';

export default function GuestPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <div style={{ padding: 24 }}>
      <h2>Customer Dashboard</h2>
      <p>Welcome, {user?.name}.</p>
      <nav style={{ display: 'flex', gap: 12 }}>
        <Link to="/admin">Admin</Link>
        <Link to="/manager">Manager</Link>
        <Link to="/staff">Staff</Link>
      </nav>
      <button onClick={logout} style={{ marginTop: 12 }}>Logout</button>
    </div>
  );
}
