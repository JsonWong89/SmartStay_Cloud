import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet } from '../../config/api';

type User = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status?: string;
};

const ManageManagersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiGet(API_ENDPOINTS.USERS.BASE);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || 'Failed to load users');
        setUsers(Array.isArray(data) ? data : []);
      } catch (e: any) {
        console.error('Failed to fetch users', e);
        setError(e?.message || 'Unable to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const managers = useMemo(() => {
    const base = users.filter((u) => (u.role || '').toLowerCase() === 'manager');
    if (!query.trim()) return base;
    const q = query.toLowerCase();
    return base.filter(
      (u) => u.fullName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, query]);

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Manage Manager Accounts</h1>
          <p>View, search, and add manager users</p>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ marginRight: 'auto' }}>Manager Accounts</h2>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
              style={{ minWidth: 220 }}
            />
          </div>

          <div className="card-body">
            {loading && <p>Loading managers...</p>}
            {error && (
              <div className="alert error" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Full Name</th>
                      <th style={{ textAlign: 'left' }}>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '16px' }}>
                          No managers found.
                        </td>
                      </tr>
                    ) : (
                      managers.map((m) => (
                        <tr key={m.id}>
                          <td>{m.fullName}</td>
                          <td>{m.email}</td>
                          <td>{m.role}</td>
                          <td>{m.status || 'Active'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="card-footer">
            <Link to="/admin/manage-managers/new" className="btn-primary">Add New Manager</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageManagersPage;
