import React, { useEffect, useMemo, useState } from 'react';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet } from '../../config/api';

type Booking = {
  bookingID: number;
  hotelID: number;
  roomID: number;
  guestID?: number;
  bookingStatus: string;
  checkInDate: string;
  checkOutDate: string;
  totalGuests: number;
  depositAmount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
};

type Hotel = {
  hotelID: number;
  hotelName: string;
};

type HotelReport = {
  hotelID: number;
  hotelName: string;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  checkedInBookings: number;
  checkedOutBookings: number;
  canceledBookings: number;
  avgBookingValue: number;
  totalNights: number;
  totalRooms: number;
  totalGuests: number;
};

const ReportsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch hotels
        const hotelsRes = await apiGet(API_ENDPOINTS.HOTELS.BASE);
        if (hotelsRes.ok) {
          const hotelsData = await hotelsRes.json();
          const hotelList: Hotel[] = hotelsData.map((h: any) => ({
            hotelID: h.hotelID ?? h.HotelID,
            hotelName: h.hotelName ?? h.HotelName ?? '',
          }));
          setHotels(hotelList);
        }

        // Fetch bookings
        const bookingsRes = await apiGet(API_ENDPOINTS.BOOKINGS.BASE);
        if (!bookingsRes.ok) {
          throw new Error(`Failed to fetch bookings (HTTP ${bookingsRes.status})`);
        }

        const bookingsData = await bookingsRes.json();
        
        if (!Array.isArray(bookingsData)) {
          throw new Error(`Expected array but got: ${typeof bookingsData}`);
        }
        
        const bookingsList: Booking[] = bookingsData.map((b: any) => ({
          bookingID: b.bookingID ?? b.BookingID ?? 0,
          hotelID: b.hotelID ?? b.HotelID ?? 0,
          roomID: b.roomID ?? b.RoomID ?? 0,
          guestID: b.guestID ?? b.GuestID,
          bookingStatus: b.bookingStatus ?? b.BookingStatus ?? 'Pending',
          checkInDate: b.checkInDate ?? b.CheckInDate ?? '',
          checkOutDate: b.checkOutDate ?? b.CheckOutDate ?? '',
          totalGuests: b.totalGuests ?? b.TotalGuests ?? 1,
          depositAmount: b.depositAmount ?? b.DepositAmount ?? 0,
          totalAmount: b.totalAmount ?? b.TotalAmount ?? 0,
          createdAt: b.createdAt ?? b.CreatedAt ?? '',
          updatedAt: b.updatedAt ?? b.UpdatedAt,
        }));
        
        setBookings(bookingsList);
      } catch (e: any) {
        console.error('Fetch data failed', e);
        setError(e?.message || 'Unable to fetch reports data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getHotelName = (hotelId: number): string => {
    const hotel = hotels.find(h => h.hotelID === hotelId);
    return hotel?.hotelName || 'Unknown Hotel';
  };

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    
    // Filter by hotel
    if (selectedHotel) {
      filtered = filtered.filter(b => b.hotelID === Number(selectedHotel));
    }
    
    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(b => {
        const createdDate = new Date(b.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return createdDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return createdDate >= monthAgo;
          case 'year':
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return createdDate >= yearAgo;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [bookings, selectedHotel, dateFilter]);

  const hotelReports = useMemo(() => {
    const reportsMap = new Map<number, HotelReport>();
    
    hotels.forEach(hotel => {
      const hotelBookings = filteredBookings.filter(b => b.hotelID === hotel.hotelID);
      
      const calculateNights = (checkIn: string, checkOut: string): number => {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      };
      
      const report: HotelReport = {
        hotelID: hotel.hotelID,
        hotelName: hotel.hotelName,
        totalBookings: hotelBookings.length,
        totalRevenue: hotelBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        pendingBookings: hotelBookings.filter(b => b.bookingStatus.toLowerCase() === 'pending').length,
        confirmedBookings: hotelBookings.filter(b => b.bookingStatus.toLowerCase() === 'confirmed').length,
        checkedInBookings: hotelBookings.filter(b => b.bookingStatus.toLowerCase() === 'checkedin').length,
        checkedOutBookings: hotelBookings.filter(b => b.bookingStatus.toLowerCase() === 'checkedout').length,
        canceledBookings: hotelBookings.filter(b => b.bookingStatus.toLowerCase() === 'canceled').length,
        avgBookingValue: hotelBookings.length > 0 
          ? hotelBookings.reduce((sum, b) => sum + b.totalAmount, 0) / hotelBookings.length 
          : 0,
        totalNights: hotelBookings.reduce((sum, b) => sum + calculateNights(b.checkInDate, b.checkOutDate), 0),
        totalRooms: hotelBookings.length, // Each booking is for rooms
        totalGuests: hotelBookings.reduce((sum, b) => sum + b.totalGuests, 0),
      };
      
      if (report.totalBookings > 0 || !selectedHotel) {
        reportsMap.set(hotel.hotelID, report);
      }
    });
    
    return Array.from(reportsMap.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [hotels, filteredBookings, selectedHotel]);

  const overallStats = useMemo(() => {
    return {
      totalBookings: filteredBookings.length,
      totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
      avgBookingValue: filteredBookings.length > 0 
        ? filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0) / filteredBookings.length 
        : 0,
      totalHotels: hotelReports.length,
    };
  }, [filteredBookings, hotelReports]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: '#fef3c7', color: '#92400e' };
      case 'confirmed':
        return { bg: '#dbeafe', color: '#1e40af' };
      case 'checkedin':
        return { bg: '#d1fae5', color: '#065f46' };
      case 'checkedout':
        return { bg: '#f3f4f6', color: '#374151' };
      case 'canceled':
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: '#f3f4f6', color: '#374151' };
    }
  };

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>📊</span>
            <div>
              <h1 style={{ margin: 0 }}>System Reports</h1>
              <p style={{ margin: '4px 0 0 0' }}>View booking statistics and revenue reports by hotel</p>
            </div>
          </div>
        </div>

        {/* Overall Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{overallStats.totalBookings}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Across {overallStats.totalHotels} hotel{overallStats.totalHotels !== 1 ? 's' : ''}</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>${overallStats.totalRevenue.toFixed(2)}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>All channels combined</div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            borderRadius: '12px',
            padding: '24px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Avg Booking Value</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>${overallStats.avgBookingValue.toFixed(2)}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Per reservation</div>
          </div>
        </div>

        {/* Filters */}
        <div className="content-card" style={{ marginBottom: '24px' }}>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  🏨 Filter by Hotel
                </label>
                <select
                  value={selectedHotel}
                  onChange={(e) => setSelectedHotel(e.target.value)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="">All Hotels</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.hotelID} value={hotel.hotelID}>
                      {hotel.hotelName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ flex: '1 1 250px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  📅 Date Range
                </label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="input"
                  style={{ width: '100%' }}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports by Hotel */}
        <div className="content-card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>Hotel Performance Reports</h2>
          </div>
          <div className="card-body">
            {loading && <p>Loading reports...</p>}
            {error && (
              <div className="alert error" role="alert">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {hotelReports.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '64px 24px',
                    color: '#6b7280'
                  }}>
                    <div style={{
                      fontSize: '64px',
                      marginBottom: '20px',
                      opacity: 0.6
                    }}>📊</div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#111827', fontWeight: 600 }}>
                      No reports available
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                      {selectedHotel ? 'No bookings found for the selected hotel and date range' : 'No bookings data available'}
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', paddingLeft: '20px', width: '250px' }}>Hotel</th>
                          <th style={{ textAlign: 'center', width: '120px' }}>Total Bookings</th>
                          <th style={{ textAlign: 'right', width: '140px' }}>Revenue</th>
                          <th style={{ textAlign: 'right', width: '120px' }}>Avg Value</th>
                          <th style={{ textAlign: 'center', width: '100px' }}>Pending</th>
                          <th style={{ textAlign: 'center', width: '100px' }}>Confirmed</th>
                          <th style={{ textAlign: 'center', width: '100px' }}>Checked In</th>
                          <th style={{ textAlign: 'center', width: '100px' }}>Completed</th>
                          <th style={{ textAlign: 'center', width: '100px' }}>Canceled</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hotelReports.map((report, idx) => (
                          <tr key={report.hotelID} style={{
                            background: idx % 2 === 0 ? '#ffffff' : '#f9fafb'
                          }}>
                            <td style={{ paddingLeft: '20px' }}>
                              <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>
                                {report.hotelName}
                              </div>
                              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                ID: {report.hotelID} • {report.totalNights} nights • {report.totalGuests} guests
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{
                                display: 'inline-block',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                background: '#ede9fe',
                                color: '#6b21a8',
                                fontSize: '14px',
                                fontWeight: 700
                              }}>
                                {report.totalBookings}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                              <div style={{ fontWeight: 700, color: '#059669', fontSize: '15px' }}>
                                ${report.totalRevenue.toFixed(2)}
                              </div>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                ${report.avgBookingValue.toFixed(2)}
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: '#fef3c7',
                                color: '#92400e',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                {report.pendingBookings}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: '#dbeafe',
                                color: '#1e40af',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                {report.confirmedBookings}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: '#d1fae5',
                                color: '#065f46',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                {report.checkedInBookings}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: '#f3f4f6',
                                color: '#374151',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                {report.checkedOutBookings}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                minWidth: '32px',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                background: '#fee2e2',
                                color: '#991b1b',
                                fontSize: '12px',
                                fontWeight: 600
                              }}>
                                {report.canceledBookings}
                              </span>
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
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
