import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Admin from './pages/Admin/Admin';
import Manager from './pages/Hotel_manager/Manager';
import Staff from './pages/Staff/Staff';
import Customer from './pages/Guest/Guest';
import Unauthorized from './pages/Unauthorized';
import { useAuthStore } from './store';

export default function App() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  return (
    <div>
      <header style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Home</Link>
          <Link to="/admin">Admin</Link>
          <Link to="/manager">Manager</Link>
          <Link to="/staff">Staff</Link>
          <Link to="/customer">Customer</Link>
        </nav>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 12 }}>{user.name} ({user.role})</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to={user ? `/${user.role.toLowerCase()}` : '/login'} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute allow={["ADMIN"] as any} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER"] as any} />}>
          <Route path="/manager" element={<Manager />} />
        </Route>
        <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER", "STAFF"] as any} />}>
          <Route path="/staff" element={<Staff />} />
        </Route>
        <Route element={<ProtectedRoute allow={["ADMIN", "MANAGER", "STAFF", "CUSTOMER"] as any} />}>
          <Route path="/customer" element={<Customer />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
