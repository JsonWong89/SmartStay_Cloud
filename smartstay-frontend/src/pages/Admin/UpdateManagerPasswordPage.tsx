import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiPut } from '../../config/api';

type Manager = {
  userID: number;
  fullName: string;
  email: string;
  role: string;
};

const UpdateManagerPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [manager, setManager] = useState<Manager | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const fetchManager = async () => {
      if (!id) {
        setMessage('No manager ID provided');
        setMessageType('error');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await apiGet(API_ENDPOINTS.USERS.BY_ID(id));
        
        if (!res.ok) {
          throw new Error(`Failed to fetch manager (HTTP ${res.status})`);
        }

        const data = await res.json();
        
        setManager({
          userID: data.userID ?? data.UserID,
          fullName: data.fullName ?? data.FullName ?? '',
          email: data.email ?? data.Email ?? '',
          role: data.role ?? data.Role ?? '',
        });
      } catch (e: any) {
        console.error('Fetch manager failed', e);
        setMessage(e?.message || 'Unable to load manager data');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchManager();
  }, [id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Validation
    if (!password.trim()) {
      setMessage('Password is required');
      setMessageType('error');
      return;
    }
    if (password.trim().length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        FullName: manager?.fullName,
        Email: manager?.email,
        Gender: 'Male', // Placeholder, backend should ignore if not needed
        Role: manager?.role,
        Password: password.trim(),
      };

      const res = await apiPut(API_ENDPOINTS.USERS.BY_ID(id!), payload);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };
      
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update password (HTTP ${res.status})`);
      }

      console.log('✅ Password updated successfully');
      
      setMessage('Password updated successfully');
      setMessageType('success');
      setTimeout(() => navigate('/admin/manage-managers'), 1500);
    } catch (e: any) {
      console.error('Update password failed', e);
      setMessage(e?.message || 'Unable to update password');
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
          <h1>Update Manager Password</h1>
          <p>Change password for manager account</p>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12 }}>
            <h2 style={{ marginRight: 'auto' }}>Password Reset</h2>
            <Link to="/admin/manage-managers" className="btn-secondary">Back to list</Link>
          </div>
          <div className="card-body">
            {message && (
              <div className={`alert ${messageType === 'error' ? 'error' : 'success'}`} role="alert">
                {message}
              </div>
            )}

            {loading ? (
              <p>Loading manager data...</p>
            ) : !manager ? (
              <div className="alert error" role="alert">
                Manager not found
              </div>
            ) : (
              <>
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '20px'
                    }}>
                      {manager.fullName ? manager.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '18px', color: '#111827' }}>
                        {manager.fullName}
                      </div>
                      <div style={{ fontSize: '14px', color: '#6b7280' }}>
                        {manager.email}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    fontSize: '13px',
                    fontWeight: 500
                  }}>
                    {manager.role}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="form-grid">
                  <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                        className="input"
                        placeholder="Enter new password"
                        required
                        autoComplete="new-password"
                        style={{ paddingRight: '40px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '18px'
                        }}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                    <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
                      Password must be at least 6 characters long
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        className="input"
                        placeholder="Re-enter new password"
                        required
                        autoComplete="new-password"
                        style={{
                          paddingRight: '40px',
                          borderColor: confirmPassword && password ? 
                            (password === confirmPassword ? '#10b981' : '#ef4444') : '',
                          boxShadow: confirmPassword && password ?
                            (password === confirmPassword ? '0 0 0 3px rgba(16, 185, 129, 0.1)' : '0 0 0 3px rgba(239, 68, 68, 0.1)') : '',
                          transition: 'border-color 0.2s, box-shadow 0.2s'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6b7280',
                          fontSize: '18px'
                        }}
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                      {confirmPassword && password && (
                        <div
                          style={{
                            position: 'absolute',
                            right: '45px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            fontSize: '18px'
                          }}
                        >
                          {password === confirmPassword ? '✅' : '❌'}
                        </div>
                      )}
                    </div>
                    {confirmPassword && password && (
                      <small style={{
                        display: 'block',
                        marginTop: '4px',
                        fontSize: '12px',
                        color: password === confirmPassword ? '#10b981' : '#ef4444'
                      }}>
                        {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </small>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary" disabled={submitting}>
                      {submitting ? 'Updating...' : 'Update Password'}
                    </button>
                    <Link to="/admin/manage-managers" className="btn-secondary">Cancel</Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateManagerPasswordPage;
