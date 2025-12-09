import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiPut } from '../../config/api';

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
  address?: string;
  city?: string;
  managerID?: string;
  createdAt?: string;
};

const EditRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
          address: h.address ?? h.Address ?? '',
          city: h.city ?? h.City ?? '',
          managerID: h.managerID ?? h.ManagerID,
          createdAt: h.createdAt ?? h.CreatedAt,
        }));
        setHotels(hotelList);
      } catch (e: any) {
        console.error('Failed to load hotels', e);
      } finally {
        setLoadingHotels(false);
      }
    };

    const fetchRoom = async () => {
      if (!id) {
        setMessage('No room ID provided');
        setMessageType('error');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await apiGet(API_ENDPOINTS.ROOMS.BY_ID(id));
        
        if (!res.ok) {
          throw new Error(`Failed to fetch room (HTTP ${res.status})`);
        }

        const data = await res.json();
        
        setForm({
          hotelId: (data.hotelId ?? data.HotelID ?? data.hotelID)?.toString() ?? '',
          roomNumber: data.roomNumber ?? data.RoomNumber ?? '',
          roomType: data.roomType ?? data.RoomType ?? '',
          pricePerNight: (data.pricePerNight ?? data.PricePerNight ?? 0).toString(),
          status: data.status ?? data.Status ?? 'Available',
          description: data.description ?? data.Description ?? '',
          imageUrl: data.imageUrl ?? data.ImageUrl ?? '',
        });
      } catch (e: any) {
        console.error('Fetch room failed', e);
        setMessage(e?.message || 'Unable to load room data');
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
    fetchRoom();
  }, [id]);

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
    
    // Check for duplicate room number in the same hotel (excluding current room)
    try {
      const checkRes = await apiGet(API_ENDPOINTS.ROOMS.BASE);
      if (checkRes.ok) {
        const rooms = await checkRes.json();
        const duplicate = rooms.find((r: any) => 
          (r.roomID ?? r.RoomID) !== Number(id) && // Exclude current room
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
      // Find the selected hotel object
      const selectedHotel = hotels.find(h => h.hotelID === Number(form.hotelId));
      
      const payload = {
        HotelID: Number(form.hotelId),
        Hotel: selectedHotel ? {
          HotelID: selectedHotel.hotelID,
          HotelName: selectedHotel.hotelName,
          Address: selectedHotel.address || "",
          City: selectedHotel.city || "",
          ManagerID: selectedHotel.managerID || null,
          CreatedAt: selectedHotel.createdAt || new Date().toISOString()
        } : null,
        RoomNumber: form.roomNumber,
        RoomType: form.roomType,
        PricePerNight: Number(form.pricePerNight),
        Status: form.status,
        Description: form.description || "",
        ImageUrl: form.imageUrl || "",
      };

      console.log("Updating room with payload:", payload);

      const res = await apiPut(API_ENDPOINTS.ROOMS.BY_ID(id!), payload);
      const contentType = res.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await res.json()
        : { message: await res.text() };
      
      if (!res.ok) {
        throw new Error(data?.message || `Failed to update room (HTTP ${res.status})`);
      }

      setMessage('Room updated successfully');
      setMessageType('success');
      setTimeout(() => navigate('/admin/rooms'), 900);
    } catch (e: any) {
      console.error('Update room failed', e);
      setMessage(e?.message || 'Unable to update room');
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
            <span style={{ fontSize: '32px' }}>✏️</span>
            <div>
              <h1 style={{ margin: 0 }}>Edit Room</h1>
              <p style={{ margin: '4px 0 0 0' }}>Update room details and pricing</p>
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

            {loading ? (
              <p>Loading room data...</p>
            ) : (
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
                    {submitting ? '⏳ Updating...' : '💾 Update Room'}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRoomPage;
