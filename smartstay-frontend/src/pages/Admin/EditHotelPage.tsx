import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiPut } from '../../config/api';

type FormState = {
  hotelName: string;
  address: string;
  city: string;
  managerID: string;
};

type Manager = {
  userID: number;
  fullName: string;
  email: string;
};

const EditHotelPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormState>({
    hotelName: '',
    address: '',
    city: '',
    managerID: '',
  });
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch hotel details
        const hotelRes = await apiGet(API_ENDPOINTS.HOTELS.BY_ID(id!));
        if (hotelRes.ok) {
          const hotel = await hotelRes.json();
          setForm({
            hotelName: hotel.hotelName ?? hotel.HotelName ?? '',
            address: hotel.address ?? hotel.Address ?? '',
            city: hotel.city ?? hotel.City ?? '',
            managerID: (hotel.managerID ?? hotel.ManagerID ?? '').toString(),
          });
        } else {
          setMessage('Hotel not found');
          setMessageType('error');
        }

        // Fetch managers
        setLoadingManagers(true);
        const managersRes = await apiGet(API_ENDPOINTS.USERS.BASE);
        if (managersRes.ok) {
          const data = await managersRes.json();
          const hotelManagers = data
            .filter((u: any) => (u.role || u.Role) === 'Hotel Manager')
            .map((u: any) => ({
              userID: u.userID ?? u.UserID,
              fullName: u.fullName ?? u.FullName,
              email: u.email ?? u.Email,
            }));
          setManagers(hotelManagers);
        }
      } catch (e: any) {
        console.error('Failed to fetch data', e);
        setMessage('Failed to load hotel details');
        setMessageType('error');
      } finally {
        setLoading(false);
        setLoadingManagers(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    if (!form.hotelName.trim()) {
      setMessage('Hotel name is required');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        hotelName: form.hotelName.trim(),
        address: form.address.trim() || null,
        city: form.city.trim() || null,
        managerID: form.managerID || null,
      };

      const res = await apiPut(API_ENDPOINTS.HOTELS.BY_ID(id!), payload);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };
        
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update hotel (HTTP ${res.status})`);
      }

      setMessage('Hotel updated successfully');
      setMessageType('success');
      setTimeout(() => navigate('/admin/hotels'), 900);
    } catch (e: any) {
      console.error('Update hotel failed', e);
      setMessage(e?.message || 'Unable to update hotel');
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <NavigationBar />
        <div className="page-content">
          <p>Loading hotel details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Edit Hotel</h1>
          <p>Update hotel information</p>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12 }}>
            <h2 style={{ marginRight: 'auto' }}>Hotel Details</h2>
            <Link to="/admin/hotels" className="btn-secondary">Back to list</Link>
          </div>
          <div className="card-body">
            {message && (
              <div className={`alert ${messageType === 'error' ? 'error' : 'success'}`} role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-group">
                <label htmlFor="hotelName">Hotel Name *</label>
                <input
                  id="hotelName"
                  name="hotelName"
                  type="text"
                  value={form.hotelName}
                  onChange={handleChange}
                  className="input"
                  placeholder="Grand Plaza Hotel"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="city">City</label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={handleChange}
                  className="input"
                  placeholder="New York"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="address">Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="123 Main Street, Suite 100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="managerID">Hotel Manager (optional)</label>
                <select
                  id="managerID"
                  name="managerID"
                  value={form.managerID}
                  onChange={handleChange}
                  className="input"
                  disabled={loadingManagers}
                >
                  <option value="">-- Select Hotel Manager --</option>
                  {managers.map((m) => (
                    <option key={m.userID} value={m.userID}>
                      {m.fullName} ({m.email})
                    </option>
                  ))}
                </select>
                <small style={{ display: 'block', marginTop: '4px', color: '#6b7280', fontSize: '12px' }}>
                  {loadingManagers ? 'Loading managers...' : `${managers.length} hotel manager(s) available`}
                </small>
              </div>

              <div className="form-actions" style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Update Hotel'}
                </button>
                <Link to="/admin/hotels" className="btn-secondary">Cancel</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditHotelPage;
