import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiPut } from '../../config/api';

type FormState = {
  fullName: string;
  email: string;
  gender: string;
  role: string;
  hotelId: string;
};

type Hotel = {
  hotelID: number;
  hotelName: string;
};

const EditManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    gender: '',
    role: 'Manager',
    hotelId: '',
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');

  useEffect(() => {
    const fetchHotels = async () => {
      setLoadingHotels(true);
      try {
        const res = await apiGet(API_ENDPOINTS.HOTELS.BASE);
        if (!res.ok) {
          throw new Error('Failed to fetch hotels');
        }
        const data = await res.json();
        const hotelList: Hotel[] = data.map((h: any) => ({
          hotelID: h.hotelID ?? h.HotelID,
          hotelName: h.hotelName ?? h.HotelName ?? '',
        }));
        setHotels(hotelList);
      } catch (e: any) {
        console.error('Failed to load hotels', e);
      } finally {
        setLoadingHotels(false);
      }
    };

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
        
        // Normalize case-insensitive properties
        const hotelIdValue = data.hotelId ?? data.HotelId ?? data.HotelID ?? data.hotelID;
        
        console.log('Fetched manager data:', data);
        console.log('Extracted hotelId:', hotelIdValue);
        
        setForm({
          fullName: data.fullName ?? data.FullName ?? '',
          email: data.email ?? data.Email ?? '',
          gender: data.gender ?? data.Gender ?? '',
          role: data.role ?? data.Role ?? 'Manager',
          hotelId: hotelIdValue ? hotelIdValue.toString() : '',
        });
      } catch (e: any) {
        console.error('Fetch manager failed', e);
        setMessage(e?.message || 'Unable to load manager data');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
    fetchManager();
  }, [id]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    if (!form.gender) {
      setMessage('Gender is required');
      setMessageType('error');
      return;
    }
    if (form.hotelId && isNaN(Number(form.hotelId))) {
      setMessage('Hotel ID must be a number');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        FullName: form.fullName,
        Email: form.email,
        Gender: form.gender,
        Role: form.role,
        Password: 'KEEP_CURRENT_PASSWORD',
      };
      
      if (form.hotelId) {
        payload.HotelId = Number(form.hotelId);
      } else {
        payload.HotelId = null;
      }

      const res = await apiPut(API_ENDPOINTS.USERS.BY_ID(id!), payload);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };
      
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update manager (HTTP ${res.status})`);
      }

      console.log('✅ Manager updated successfully');
      
      // Note: The relationship is managed through Users.HotelID only
      // The Hotels.ManagerID should be updated by the backend automatically
      // or through a separate backend process to maintain data consistency

      setMessage('Manager updated successfully');
      setMessageType('success');
      setTimeout(() => navigate('/admin/manage-managers'), 900);
    } catch (e: any) {
      console.error('Update manager failed', e);
      setMessage(e?.message || 'Unable to update manager');
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
          <h1>Edit Manager</h1>
          <p>Update manager account details</p>
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

            {loading ? (
              <p>Loading manager data...</p>
            ) : (
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
                  <label htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    <option value="">-- Select gender --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <input
                    id="role"
                    name="role"
                    type="text"
                    value={form.role}
                    onChange={handleChange}
                    className="input"
                    placeholder="Hotel Manager"
                    readOnly
                    style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hotelId">Hotel (optional)</label>
                  <select
                    id="hotelId"
                    name="hotelId"
                    value={form.hotelId}
                    onChange={handleChange}
                    className="input"
                    disabled={loadingHotels}
                  >
                    <option value="">-- Select a hotel --</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.hotelID} value={hotel.hotelID}>
                        {hotel.hotelName} (ID: {hotel.hotelID})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Manager'}
                  </button>
                  <Link to="/admin/manage-managers" className="btn-secondary">Cancel</Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditManagerPage;
