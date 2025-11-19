import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiPost } from '../../config/api';

type FormState = {
  fullName: string;
  email: string;
  password: string;
  status: string;
};

const CreateManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    status: 'Active',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Basic validation
    if (!form.fullName.trim()) {
      setMessage('Full name is required');
      setMessageType('error');
      return;
    }
    const emailRegex = /\S+@\S+\.[A-Za-z]{2,}/;
    if (!emailRegex.test(form.email)) {
      setMessage('Please enter a valid email address');
      setMessageType('error');
      return;
    }
    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        passwordHash: form.password, // backend currently expects passwordHash field
        role: 'Manager',
        status: form.status,
      };

      const res = await apiPost(API_ENDPOINTS.USERS.BASE, payload);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to create manager');
      }

      setMessage('Manager created successfully');
      setMessageType('success');
      setTimeout(() => navigate('/admin/manage-managers'), 900);
    } catch (e: any) {
      console.error('Create manager failed', e);
      setMessage(e?.message || 'Unable to create manager');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Add New Manager</h1>
          <p>Create a new manager account</p>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12 }}>
            <h2 style={{ marginRight: 'auto' }}>Manager Details</h2>
            <Link to="/admin/manage-managers" className="btn-secondary">Back to list</Link>
          </div>
          <div className="card-body">
            {message && (
              <div className={`alert ${messageType === 'error' ? 'error' : 'success'}`} role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={form.fullName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Jane Doe"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="jane@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <input
                  id="status"
                  name="status"
                  type="text"
                  value={form.status}
                  onChange={handleChange}
                  className="input"
                  placeholder="Active"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Manager'}
                </button>
                <Link to="/admin/manage-managers" className="btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateManagerPage;
