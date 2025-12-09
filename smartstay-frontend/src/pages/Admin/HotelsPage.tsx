import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiDelete } from '../../config/api';

type Hotel = {
  hotelID: number;
  hotelName: string;
  address?: string;
  city?: string;
  description?: string;
  imageUrl?: string;
  phoneNumber?: string;
  email?: string;
  managerID?: number;
  createdAt?: string;
};

const HotelsPage: React.FC = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  const fetchHotels = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiGet(API_ENDPOINTS.HOTELS.BASE);
      
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Backend returned non-JSON response');
      }

      const data = await res.json();
      
      if (!Array.isArray(data)) {
        throw new Error(`Expected array but got: ${typeof data}`);
      }
      
      const normalized: Hotel[] = data.map((h: any) => ({
        hotelID: h.hotelID ?? h.HotelID,
        hotelName: h.hotelName ?? h.HotelName ?? '',
        address: h.address ?? h.Address,
        city: h.city ?? h.City,
        description: h.description ?? h.Description,
        imageUrl: h.imageUrl ?? h.ImageUrl,
        phoneNumber: h.phoneNumber ?? h.PhoneNumber,
        email: h.email ?? h.Email,
        managerID: h.managerID ?? h.ManagerID,
        createdAt: h.createdAt ?? h.CreatedAt,
      }));
      
      setHotels(normalized);
    } catch (e: any) {
      console.error('Failed to fetch hotels', e);
      setError(e?.message || 'Unable to fetch hotels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    if (!query.trim()) return hotels;
    const q = query.toLowerCase();
    return hotels.filter(
      (h) => h.hotelName?.toLowerCase().includes(q) || 
             h.city?.toLowerCase().includes(q) ||
             h.address?.toLowerCase().includes(q)
    );
  }, [hotels, query]);

  const handleDelete = async (hotelID: number, hotelName: string) => {
    if (!confirm(`Are you sure you want to delete "${hotelName}"?`)) {
      return;
    }

    try {
      const res = await apiDelete(API_ENDPOINTS.HOTELS.BY_ID(hotelID.toString()));
      if (!res.ok) {
        throw new Error('Failed to delete hotel');
      }
      fetchHotels();
    } catch (e: any) {
      alert(`Error: ${e?.message || 'Failed to delete hotel'}`);
    }
  };

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Manage Hotels</h1>
          <p>View, search, add, and remove hotels</p>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ marginRight: 'auto' }}>Hotels</h2>
            <input
              type="text"
              placeholder="Search by name, city, or address..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input"
              style={{ minWidth: 280 }}
            />
          </div>

          <div className="card-body">
            {loading && <p>Loading hotels...</p>}
            {error && (
              <div className="alert error" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredHotels.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '48px 24px',
                    color: '#6b7280'
                  }}>
                    <div style={{
                      fontSize: '48px',
                      marginBottom: '16px',
                      opacity: 0.5
                    }}>🏨</div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#374151' }}>
                      No hotels found
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {query ? 'Try adjusting your search' : 'Get started by adding your first hotel'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', paddingLeft: '20px' }}>Hotel</th>
                          <th style={{ textAlign: 'left' }}>Location</th>
                          <th>Manager ID</th>
                          <th>Created</th>
                          <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredHotels.map((h, idx) => (
                          <tr key={h.hotelID} style={{
                            background: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                          }}>
                            <td style={{ paddingLeft: '20px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  borderRadius: '8px',
                                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 600,
                                  fontSize: '18px',
                                  flexShrink: 0
                                }}>
                                  🏨
                                </div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#111827' }}>
                                    {h.hotelName}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                    ID: {h.hotelID}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ color: '#374151' }}>
                                {h.city || '-'}
                              </div>
                              {h.address && (
                                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                                  {h.address}
                                </div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', color: '#6b7280' }}>
                              {h.managerID ? (
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  background: '#f3f4f6',
                                  fontFamily: 'monospace',
                                  fontSize: '13px'
                                }}>
                                  #{h.managerID}
                                </span>
                              ) : (
                                <span style={{ color: '#d1d5db' }}>—</span>
                              )}
                            </td>
                            <td style={{ color: '#6b7280', fontSize: '14px' }}>
                              {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              }) : '-'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <Link
                                  to={`/admin/hotels/edit/${h.hotelID}`}
                                  className="btn-secondary"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    textDecoration: 'none'
                                  }}
                                >
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(h.hotelID, h.hotelName)}
                                  className="btn-secondary"
                                  style={{
                                    padding: '6px 12px',
                                    fontSize: '13px',
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca'
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
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
            <Link to="/admin/hotels/new" className="btn-primary">Add New Hotel</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelsPage;
