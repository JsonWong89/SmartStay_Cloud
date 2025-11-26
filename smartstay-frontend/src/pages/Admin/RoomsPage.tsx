import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet, apiDelete } from '../../config/api';

type Room = {
  roomID: number;
  hotelID: number;
  roomNumber: string;
  roomType: string;
  pricePerNight: number;
  status: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Hotel = {
  hotelID: number;
  hotelName: string;
};

const RoomsPage: React.FC = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [selectedHotel, setSelectedHotel] = useState<string>('');

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await apiGet(API_ENDPOINTS.HOTELS.BASE);
        if (res.ok) {
          const data = await res.json();
          const hotelList: Hotel[] = data.map((h: any) => ({
            hotelID: h.hotelID ?? h.HotelID,
            hotelName: h.hotelName ?? h.HotelName ?? '',
          }));
          setHotels(hotelList);
        }
      } catch (e) {
        console.error('Failed to load hotels', e);
      }
    };

    const fetchRooms = async () => {
      setLoading(true);
      setError('');
      
      try {
        const res = await apiGet(API_ENDPOINTS.ROOMS.BASE);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch rooms (HTTP ${res.status})`);
        }

        const data = await res.json();
        
        if (!Array.isArray(data)) {
          throw new Error(`Expected array but got: ${typeof data}`);
        }
        
        const roomsList: Room[] = data.map((r: any) => ({
          roomID: r.roomID ?? r.RoomID,
          hotelID: r.hotelID ?? r.HotelID,
          roomNumber: r.roomNumber ?? r.RoomNumber ?? '',
          roomType: r.roomType ?? r.RoomType ?? '',
          pricePerNight: r.pricePerNight ?? r.PricePerNight ?? 0,
          status: r.status ?? r.Status ?? '',
          description: r.description ?? r.Description,
          imageUrl: r.imageUrl ?? r.ImageUrl,
          createdAt: r.createdAt ?? r.CreatedAt,
          updatedAt: r.updatedAt ?? r.UpdatedAt,
        }));
        
        setRooms(roomsList);
      } catch (e: any) {
        console.error('Fetch rooms failed', e);
        setError(e?.message || 'Unable to fetch rooms');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHotels();
    fetchRooms();
  }, []);

  const getHotelName = (hotelID: number): string => {
    const hotel = hotels.find(h => h.hotelID === hotelID);
    return hotel?.hotelName || 'Unknown Hotel';
  };

  const handleDelete = async (roomID: number, roomNumber: string) => {
    if (!confirm(`Are you sure you want to delete Room ${roomNumber}?`)) {
      return;
    }

    try {
      const res = await apiDelete(API_ENDPOINTS.ROOMS.BY_ID(roomID.toString()));
      if (!res.ok) {
        throw new Error(`Failed to delete room (HTTP ${res.status})`);
      }
      
      setRooms(rooms.filter(r => r.roomID !== roomID));
      alert('Room deleted successfully');
    } catch (e: any) {
      console.error('Delete room failed', e);
      alert(e?.message || 'Failed to delete room');
    }
  };

  const filteredRooms = useMemo(() => {
    let filtered = rooms;
    
    if (selectedHotel) {
      filtered = filtered.filter(r => r.hotelID === Number(selectedHotel));
    }
    
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (r) => 
          r.roomNumber?.toLowerCase().includes(q) || 
          r.roomType?.toLowerCase().includes(q) ||
          r.status?.toLowerCase().includes(q)
      );
    }
    
    // Sort by hotel name, then room number
    return filtered.sort((a, b) => {
      const hotelA = getHotelName(a.hotelID);
      const hotelB = getHotelName(b.hotelID);
      if (hotelA !== hotelB) {
        return hotelA.localeCompare(hotelB);
      }
      return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
    });
  }, [rooms, query, selectedHotel, hotels]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'occupied':
        return { bg: '#fee2e2', color: '#991b1b' };
      case 'maintenance':
        return { bg: '#fef3c7', color: '#92400e' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <h1>Room Types & Pricing</h1>
          <p>Manage hotel rooms, types, and pricing</p>
        </div>

        <div className="content-card">
          <div className="card-header" style={{ gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ marginRight: 'auto' }}>
              <h2 style={{ margin: 0, marginBottom: '4px' }}>Rooms Management</h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#57e645ff' }}>
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
                {query && ` matching "${query}"`}
                {selectedHotel && ` in ${hotels.find(h => h.hotelID === Number(selectedHotel))?.hotelName || 'selected hotel'}`}
                {!query && !selectedHotel && ' total'}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={selectedHotel}
                onChange={(e) => setSelectedHotel(e.target.value)}
                className="input"
                style={{ 
                  minWidth: 180,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              >
                <option value="">🏨 All Hotels</option>
                {hotels.map((hotel) => (
                  <option key={hotel.hotelID} value={hotel.hotelID}>
                    {hotel.hotelName}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="🔍 Search rooms..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input"
                style={{ 
                  minWidth: 200,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px'
                }}
              />

              <Link 
                to="/admin/rooms/new" 
                className="btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px'
                }}
              >
                ➕ Add New Room
              </Link>
            </div>
          </div>

          <div className="card-body">
            {loading && <p>Loading rooms...</p>}
            {error && (
              <div className="alert error" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {filteredRooms.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 24px',
                    color: '#6b7280'
                  }}>
                    <div style={{
                      fontSize: '64px',
                      marginBottom: '20px',
                      opacity: 0.6
                    }}>🏨</div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#111827', fontWeight: 600 }}>
                      No rooms found
                    </h3>
                    <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>
                      {query || selectedHotel ? 'Try adjusting your filters or search criteria' : 'Get started by adding your first room to the system'}
                    </p>
                    {!query && !selectedHotel && (
                      <Link 
                        to="/admin/rooms/new" 
                        className="btn-primary"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        ➕ Add Your First Room
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', paddingLeft: '20px', width: '180px' }}>Room</th>
                          <th style={{ textAlign: 'left', width: '200px' }}>Type</th>
                          <th style={{ textAlign: 'right', width: '140px' }}>Price/Night</th>
                          <th style={{ textAlign: 'center', width: '130px' }}>Status</th>
                          <th style={{ textAlign: 'left' }}>Description</th>
                          <th style={{ textAlign: 'center', width: '180px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          let currentHotelID: number | null = null;
                          let rowIndex = 0;
                          
                          return filteredRooms.map((room) => {
                            const statusColors = getStatusColor(room.status);
                            const isNewHotel = room.hotelID !== currentHotelID;
                            currentHotelID = room.hotelID;
                            
                            if (!isNewHotel) rowIndex++;
                            else rowIndex = 0;
                            
                            return (
                              <React.Fragment key={room.roomID}>
                                {isNewHotel && (
                                  <tr style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white'
                                  }}>
                                    <td colSpan={6} style={{
                                      padding: '12px 20px',
                                      fontWeight: 700,
                                      fontSize: '14px',
                                      letterSpacing: '0.5px',
                                      textTransform: 'uppercase',
                                      color: 'white'
                                    }}>
                                      🏨 {getHotelName(room.hotelID)} <span style={{ fontWeight: 400, opacity: 0.9, fontSize: '12px', marginLeft: '8px', color: 'white' }}>(Hotel ID: {room.hotelID})</span>
                                    </td>
                                  </tr>
                                )}
                                <tr style={{
                                  background: rowIndex % 2 === 0 ? '#ffffff' : '#f9fafb',
                                  borderLeft: '4px solid #764ba2'
                                }}>
                                  <td style={{ paddingLeft: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '6px',
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        flexShrink: 0,
                                        fontFamily: 'monospace'
                                      }}>
                                        {room.roomNumber}
                                      </div>
                                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                        ID: {room.roomID}
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                                      {room.roomType}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                                    <div style={{
                                      display: 'inline-block',
                                      padding: '4px 12px',
                                      borderRadius: '6px',
                                      background: '#dcfce7',
                                      color: '#059669',
                                      fontSize: '14px',
                                      fontWeight: 700
                                    }}>
                                      ${room.pricePerNight.toFixed(2)}
                                    </div>
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '5px 12px',
                                      borderRadius: '16px',
                                      background: statusColors.bg,
                                      color: statusColors.color,
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.5px'
                                    }}>
                                      {room.status}
                                    </span>
                                  </td>
                                  <td style={{ 
                                    textAlign: 'left', 
                                    color: '#6b7280',
                                    fontSize: '13px',
                                    maxWidth: '280px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {room.description ? (
                                      <span title={room.description}>
                                        {room.description}
                                      </span>
                                    ) : (
                                      <span style={{ color: '#d1d5db' }}>—</span>
                                    )}
                                  </td>
                                  <td style={{ textAlign: 'center' }}>
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                      <Link
                                        to={`/admin/rooms/edit/${room.roomID}`}
                                        className="btn-secondary"
                                        style={{
                                          padding: '5px 10px',
                                          fontSize: '12px',
                                          textDecoration: 'none',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}
                                      >
                                        ✏️ Edit
                                      </Link>
                                      <button
                                        onClick={() => handleDelete(room.roomID, room.roomNumber)}
                                        className="btn-secondary"
                                        style={{
                                          padding: '5px 10px',
                                          fontSize: '12px',
                                          background: '#fee2e2',
                                          color: '#dc2626',
                                          border: '1px solid #fecaca',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '3px'
                                        }}
                                      >
                                        🗑️ Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              </React.Fragment>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
