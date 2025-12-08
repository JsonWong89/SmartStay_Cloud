import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiPost } from '../../config/api';

type FormState = {
  hotelId: string;
  roomNumber: string;
  roomType: string;
  pricePerNight: string;
  status: string;
  description: string;
  imageUrl: string;
};

type Hotel = {
  hotelID: number;
  hotelName: string;
};

const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    hotelId: '',
    roomNumber: '',
    roomType: '',
    pricePerNight: '',
    status: 'Available',
    description: '',
    imageUrl: '',
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
        setMessage('Failed to load hotels');
        setMessageType('error');
      } finally {
        setLoadingHotels(false);
      }
    };
    fetchHotels();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Validation
    if (!form.hotelId) {
      setMessage('Please select a hotel');
      setMessageType('error');
      return;
    }
    if (!form.roomNumber.trim()) {
      setMessage('Room number is required');
      setMessageType('error');
      return;
    }
    if (!form.roomType.trim()) {
      setMessage('Room type is required');
      setMessageType('error');
      return;
    }
    if (!form.pricePerNight || Number(form.pricePerNight) <= 0) {
      setMessage('Please enter a valid price');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    
    // Check for duplicate room number in the same hotel
    try {
      const checkRes = await apiGet(API_ENDPOINTS.ROOMS.BASE);
      if (checkRes.ok) {
        const rooms = await checkRes.json();
        const duplicate = rooms.find((r: any) => 
          (r.hotelID ?? r.hotelId) === Number(form.hotelId) && 
          (r.roomNumber ?? r.RoomNumber) === form.roomNumber.trim()
        );
        
        if (duplicate) {
          setMessage(`Room number "${form.roomNumber}" already exists in this hotel. Please use a different room number.`);
          setMessageType('error');
          setSubmitting(false);
          return;
        }
      }
    } catch (e) {
      console.error('Failed to check for duplicates', e);
    }
    try {
      const payload = {
        HotelID: Number(form.hotelId),
        RoomNumber: form.roomNumber,
        RoomType: form.roomType,
        PricePerNight: Number(form.pricePerNight),
        Status: form.status,
        Description: form.description || "",
        ImageURL: form.imageUrl || ""
        // Don't send Hotel property at all
      };

      console.log("Creating room with payload:", payload);

      const res = await apiPost(API_ENDPOINTS.ROOMS.BASE, payload);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };
      
      if (!res.ok) {
        throw new Error(data?.message || `Failed to create room (HTTP ${res.status})`);
      }

      setMessage('Room created successfully');
      setMessageType('success');
      setTimeout(() => navigate('/admin/rooms'), 900);
    } catch (e: any) {
      console.error('Create room failed', e);
      setMessage(e?.message || 'Unable to create room');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>🛏️</span>
            <div>
              <h1 style={{ margin: 0 }}>Add New Room</h1>
              <p style={{ margin: '4px 0 0 0' }}>Create a new room with pricing details</p>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12 }}>
            <h2 style={{ marginRight: 'auto', margin: 0 }}>Room Details</h2>
            <Link 
              to="/admin/rooms" 
              className="btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              ← Back to list
            </Link>
          </div>
          <div className="card-body">
            {message && (
              <div className={`alert ${messageType === 'error' ? 'error' : 'success'}`} role="alert">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-grid">
              <div style={{ 
                gridColumn: '1 / -1', 
                padding: '12px 16px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                marginBottom: '8px'
              }}>
                📋 Basic Information
              </div>

              <div className="form-group">
                <label htmlFor="hotelId">Hotel *</label>
                <select
                  id="hotelId"
                  name="hotelId"
                  value={form.hotelId}
                  onChange={handleChange}
                  className="input"
                  disabled={loadingHotels}
                  required
                >
                  <option value="">-- Select a hotel --</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.hotelID} value={hotel.hotelID}>
                      {hotel.hotelName} (ID: {hotel.hotelID})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="roomNumber">Room Number *</label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  value={form.roomNumber}
                  onChange={handleChange}
                  className="input"
                  placeholder="101"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="roomType">Room Type *</label>
                <input
                  id="roomType"
                  name="roomType"
                  type="text"
                  value={form.roomType}
                  onChange={handleChange}
                  className="input"
                  placeholder="Deluxe, Suite, Standard, etc."
                  required
                />
              </div>

              <div style={{ 
                gridColumn: '1 / -1', 
                padding: '12px 16px', 
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: '8px'
              }}>
                💰 Pricing & Availability
              </div>

              <div className="form-group">
                <label htmlFor="pricePerNight">Price Per Night ($) *</label>
                <input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.pricePerNight}
                  onChange={handleChange}
                  className="input"
                  placeholder="99.99"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="Available">Available</option>
                  <option value="Occupied">Occupied</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ 
                gridColumn: '1 / -1', 
                padding: '12px 16px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                color: 'white',
                fontWeight: 600,
                marginTop: '16px',
                marginBottom: '8px'
              }}>
                🖼️ Additional Details
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">Image URL (optional)</label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://example.com/room-image.jpg"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="description">Description (optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="input"
                  rows={4}
                  placeholder="Room features and amenities..."
                />
              </div>

              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  {submitting ? '⏳ Creating...' : '✅ Create Room'}
                </button>
                <Link 
                  to="/admin/rooms" 
                  className="btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  ❌ Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPage;
