import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiPost, apiPut } from '../../config/api';

type FormState = {
  fullName: string;
  email: string;
  password: string;
  gender: string;
  hotelId: string;
};

type Hotel = {
  hotelID: number;
  hotelName: string;
};

const CreateManagerPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    password: '',
    gender: '',
    hotelId: '',
  });
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
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
    fetchHotels();
  }, []);

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
    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters');
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
        userID: '', // Backend will auto-generate this based on role
        fullName: form.fullName,
        email: form.email,
        passwordHash: form.password, // backend will hash it with BCrypt
        gender: form.gender,
        role: 'Manager', // Use 'Manager' instead of 'Hotel Manager' to match DB constraint
      };
      if (form.hotelId) payload.hotelId = Number(form.hotelId);

      const res = await apiPost(API_ENDPOINTS.USERS.BASE, payload);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };
      if (!res.ok) {
        throw new Error(data?.message || `Failed to create manager (HTTP ${res.status})`);
      }

      console.log('✅ Manager created successfully');
      
      // Note: The relationship is managed through Users.HotelID only
      // The Hotels.ManagerID should be updated by the backend automatically
      // or through a separate backend process to maintain data consistency

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
