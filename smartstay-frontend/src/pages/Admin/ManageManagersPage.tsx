import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet } from '../../config/api';

type Manager = {
  userID: number;
  fullName: string;
  email: string;
  role: string;
  hotelID?: number;
  createdAt?: string;
};

const ManageManagersPage: React.FC = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const fetchManagers = async () => {
      setLoading(true);
      setError('');
      
      console.log('=== Starting fetchManagers ===');
      console.log('Endpoint:', API_ENDPOINTS.USERS.BASE);
      
      try {
        const res = await apiGet(API_ENDPOINTS.USERS.BASE);
        console.log('Response received:', {
          status: res.status,
          statusText: res.statusText,
          ok: res.ok,
          headers: Array.from(res.headers.entries())
        });
        
        if (!res.ok) {
          const contentType = res.headers.get('content-type') || '';
          let errorMsg = `Server returned ${res.status} ${res.statusText}`;
          try {
            const errorPayload = contentType.includes('application/json') 
              ? await res.json() 
              : await res.text();
            console.log('Error payload:', errorPayload);
            errorMsg = typeof errorPayload === 'string' 
              ? errorPayload.slice(0, 200) 
              : (errorPayload?.message || errorMsg);
          } catch (parseErr) {
            console.error('Failed to parse error response:', parseErr);
            errorMsg += ' (could not read error details)';
          }
          throw new Error(errorMsg);
        }

        const contentType = res.headers.get('content-type') || '';
        console.log('Content-Type:', contentType);
        
        if (!contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Non-JSON response body:', text.slice(0, 500));
          throw new Error(`Backend returned non-JSON (${contentType}). Check if GET /api/users endpoint exists.`);
        }

        const data = await res.json();
        console.log('Parsed JSON data:', data);
        console.log('Is array?', Array.isArray(data));
        
        if (!Array.isArray(data)) {
          throw new Error(`Expected array but got: ${typeof data}`);
        }
        
        // Filter users with "Hotel Manager" role
        const allUsers: Manager[] = data.map((m: any) => ({
          userID: m.userID ?? m.UserID,
          fullName: m.fullName ?? m.FullName ?? '',
          email: m.email ?? m.Email ?? '',
          role: m.role ?? m.Role ?? '',
          hotelID: m.hotelID ?? m.HotelID,
          createdAt: m.createdAt ?? m.CreatedAt,
        }));
        
        console.log('Normalized users:', allUsers);
        
        const hotelManagers = allUsers.filter((u) => u.role === 'Hotel Manager');
        
        console.log('Total users:', allUsers.length, 'Hotel Managers found:', hotelManagers.length);
        console.log('Hotel Managers:', hotelManagers);
        
        setManagers(hotelManagers);
      } catch (e: any) {
        console.error('=== FETCH ERROR ===');
        console.error('Error caught:', e);
        console.error('Error message:', e?.message);
        console.error('Error name:', e?.name);
        console.error('Error stack:', e?.stack);
        console.error('Error type:', typeof e);
        console.error('Error string:', String(e));
        
        let errorMsg = 'Unknown error occurred';
        
        if (e instanceof Error) {
          errorMsg = e.message;
        } else if (typeof e === 'string') {
          errorMsg = e;
        } else if (e?.message) {
          errorMsg = e.message;
        } else if (e?.toString && typeof e.toString === 'function') {
          errorMsg = e.toString();
        }
        
        // If still generic, provide helpful message
        if (!errorMsg || errorMsg === 'Unknown error occurred' || errorMsg === '[object Object]') {
          errorMsg = 'Network error: Cannot connect to backend at http://localhost:5163. Make sure your backend is running in Visual Studio.';
        }
        
        console.error('Final error message:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
        console.log('=== fetchManagers complete ===');
      }
    };
    fetchManagers();
  }, []);

  const filteredManagers = useMemo(() => {
    if (!query.trim()) return managers;
    const q = query.toLowerCase();
    return managers.filter(
      (m) => m.fullName?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
    );
  }, [managers, query]);

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
              <>
                {filteredManagers.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: '#6b7280'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>👥</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#374151' }}>
                      No managers found
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {query ? 'Try adjusting your search' : 'Get started by adding your first manager'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Manager</th>
                          <th style={{ textAlign: 'left' }}>Contact</th>
                          <th>User ID</th>
                          <th>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              background: '#f3f4f6',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>Role</span>
                          </th>
                          <th>Hotel ID</th>
                          <th>Joined</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredManagers.map((m, idx) => (
                          <tr key={m.userID} style={{
                            background: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                          }}>
                            <td style={{ paddingLeft: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '16px',
                                  flexShrink: 0
                                }}>
                                  {m.fullName ? m.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#111827' }}>
                                    {m.fullName || '-'}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    ID: {m.userID}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ color: '#374151' }}>{m.email || '-'}</div>
                            </td>
                            <td style={{ textAlign: 'center', color: '#6b7280', fontFamily: 'monospace' }}>
                              #{m.userID}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                fontSize: '13px',
                                fontWeight: 500
                              }}>
                                {m.role}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', color: '#6b7280' }}>
                              {m.hotelID ? (
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: '#f3f4f6',
                                  fontFamily: 'monospace',
                                  fontSize: '13px'
                                }}>
                                  {m.hotelID}
                                </span>
                              ) : (
                                <span style={{ color: '#d1d5db' }}>—</span>
                              )}
                            </td>
                            <td style={{ color: '#6b7280', fontSize: '14px' }}>
                              {m.createdAt ? new Date(m.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
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
