import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import type { Role } from '../types';

const roles: Role[] = ['ADMIN', 'MANAGER', 'STAFF', 'CUSTOMER'];

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('CUSTOMER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim(), role);
    // Route by role
    switch (role) {
      case 'ADMIN':
        navigate('/admin');
        break;
      case 'MANAGER':
        navigate('/manager');
        break;
      case 'STAFF':
        navigate('/staff');
        break;
      default:
        navigate('/customer');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>SmartStay Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>
            Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as Role)} style={{ width: '100%', padding: 8, marginTop: 4 }}>
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" style={{ padding: '8px 16px' }}>
          Continue
        </button>
      </form>
    </div>
  );
}
