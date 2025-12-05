import React, { useEffect, useMemo, useState, useRef } from 'react';
import NavigationBar from '../../components/NavigationBar';
import '../../styles/AdminPages.css';
import { API_ENDPOINTS, apiGet } from '../../config/api';

// Chart & PDF
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedHotel, setSelectedHotel] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<HotelReport | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');

      try {
        // === Fetch Hotels ===
        const hotelsRes = await apiGet(API_ENDPOINTS.HOTELS.BASE);
        if (hotelsRes.ok) {
          const hotelsData = await hotelsRes.json();
          const hotelList: Hotel[] = (Array.isArray(hotelsData) ? hotelsData : []).map((h: any) => ({
            hotelID: h.hotelID ?? h.HotelID ?? h.id ?? h.Id ?? h.HotelId ?? 0,
            hotelName: h.hotelName ?? h.HotelName ?? h.name ?? h.Name ?? h.title ?? 'Unknown Hotel',
          })).filter(h => h.hotelID !== 0);
          setHotels(hotelList);
        }

        // === Fetch Bookings ===
        const bookingsRes = await apiGet(API_ENDPOINTS.BOOKINGS.BASE);
        if (!bookingsRes.ok) throw new Error(`Bookings failed: ${bookingsRes.status}`);
        const bookingsData = await bookingsRes.json();
        if (!Array.isArray(bookingsData)) throw new Error('Bookings is not array');

        const bookingsList: Booking[] = bookingsData.map((b: any) => {
          // Handle bookingStatus - could be string, enum number, or object
          let status = b.bookingStatus ?? b.BookingStatus ?? 'Pending';
          if (typeof status === 'string') {
            status = status.toLowerCase();
          } else if (typeof status === 'number') {
            // Map enum number to string (if backend uses numeric enum)
            const statusMap: { [key: number]: string } = {
              0: 'pending',
              1: 'confirmed', 
              2: 'checkedin',
              3: 'checkedout',
              4: 'canceled'
            };
            status = statusMap[status] ?? 'pending';
          } else {
            status = 'pending';
          }
          
          return {
            bookingID: b.bookingID ?? b.BookingID ?? 0,
            hotelID: b.hotelID ?? b.HotelID ?? b.hotelId ?? b.HotelId ?? b.id ?? 0,
            roomID: b.roomID ?? b.RoomID ?? 0,
            guestID: b.guestID ?? b.GuestID,
            bookingStatus: status,
            checkInDate: b.checkInDate ?? b.CheckInDate ?? '',
            checkOutDate: b.checkOutDate ?? b.CheckOutDate ?? '',
            totalGuests: b.totalGuests ?? b.TotalGuests ?? 1,
            depositAmount: b.depositAmount ?? b.DepositAmount ?? 0,
            totalAmount: b.totalAmount ?? b.TotalAmount ?? 0,
            createdAt: b.createdAt ?? b.CreatedAt ?? '',
            updatedAt: b.updatedAt ?? b.UpdatedAt,
          };
        });

        setBookings(bookingsList);
      } catch (e: any) {
        console.error('Fetch error:', e);
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper: Get hotel name with fallback
  const getHotelName = (hotelId: number): string => {
    const hotel = hotels.find(h => h.hotelID === hotelId);
    return hotel?.hotelName || `Hotel ID: ${hotelId}`;
  };

  // Filter bookings by hotel & date
  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    if (selectedHotel) {
      filtered = filtered.filter(b => b.hotelID === Number(selectedHotel));
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(b => {
        const createdDate = new Date(b.createdAt);
        switch (dateFilter) {
          case 'today': return createdDate >= today;
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return createdDate >= weekAgo;
          }
          case 'month': {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return createdDate >= monthAgo;
          }
          case 'year': {
            const yearAgo = new Date(today);
            yearAgo.setFullYear(yearAgo.getFullYear() - 1);
            return createdDate >= yearAgo;
          }
          default: return true;
        }
      });
    }
    return filtered;
  }, [bookings, selectedHotel, dateFilter]);

  const hotelReports = useMemo(() => {
    // Determine which hotels to include
    const hotelsToReport = selectedHotel
      ? hotels.filter(h => h.hotelID === Number(selectedHotel))  // Only selected hotel
      : hotels;                                                  // All hotels

    const reports: HotelReport[] = hotelsToReport.map(hotel => {
      // Use filteredBookings directly — it's already filtered by hotel (if selected) and date
      const hotelBookings = filteredBookings.filter(b => b.hotelID === hotel.hotelID);

      const totalBookings = hotelBookings.length;
      const totalRevenue = hotelBookings.reduce((sum, b) => sum + b.totalAmount, 0);

      const nights = (checkIn: string, checkOut: string) => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.abs(end.getTime() - start.getTime());
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
      };

      return {
        hotelID: hotel.hotelID,
        hotelName: hotel.hotelName,
        totalBookings,
        totalRevenue,
        pendingBookings: hotelBookings.filter(b => b.bookingStatus === 'pending').length,
        confirmedBookings: hotelBookings.filter(b => b.bookingStatus === 'confirmed').length,
        checkedInBookings: hotelBookings.filter(b => b.bookingStatus === 'checkedin').length,
        checkedOutBookings: hotelBookings.filter(b => b.bookingStatus === 'checkedout').length,
        canceledBookings: hotelBookings.filter(b => b.bookingStatus === 'canceled').length,
        avgBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        totalNights: hotelBookings.reduce((sum, b) => sum + nights(b.checkInDate, b.checkOutDate), 0),
        totalRooms: totalBookings,
        totalGuests: hotelBookings.reduce((sum, b) => sum + b.totalGuests, 0),
      };
    });

    return reports.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [hotels, filteredBookings, selectedHotel]);

  const overallStats = useMemo(() => ({
    totalBookings: filteredBookings.length,
    totalRevenue: filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    avgBookingValue: filteredBookings.length > 0
      ? filteredBookings.reduce((sum, b) => sum + b.totalAmount, 0) / filteredBookings.length
      : 0,
    totalHotels: hotelReports.length,
  }), [filteredBookings, hotelReports]);

  const openModal = (report: HotelReport) => {
    setSelectedReport(report);
    setModalOpen(true);
  };

  const exportPDF = async () => {
    if (!reportRef.current || !selectedReport) return;
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    pdf.save(`${selectedReport.hotelName}_Report.pdf`);
  };

  const pieData = selectedReport ? {
    labels: ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Canceled'],
    datasets: [{
      data: [
        selectedReport.pendingBookings,
        selectedReport.confirmedBookings,
        selectedReport.checkedInBookings,
        selectedReport.checkedOutBookings,
        selectedReport.canceledBookings,
      ],
      backgroundColor: ['#fef3c7', '#dbeafe', '#d1fae5', '#f3f4f6', '#fee2e2'],
    }],
  } : null;

  return (
    <div className="admin-page">
      <NavigationBar />
      <div className="page-content">

        {/* Centered Header */}
        <div className="page-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '38px', fontWeight: 600 }}>
            System Reports
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '16px' }}>
            View booking statistics and revenue reports by hotel
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>{overallStats.totalBookings}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Across {overallStats.totalHotels} hotel{overallStats.totalHotels !== 1 ? 's' : ''}</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
            <div style={{ fontSize: '32px', fontWeight: 700 }}>${overallStats.totalRevenue.toFixed(2)}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>All channels combined</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '24px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
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
                  Filter by Hotel
                </label>
                <select value={selectedHotel} onChange={(e) => setSelectedHotel(e.target.value)} className="input" style={{ width: '100%' }}>
                  <option value="">All Hotels</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.hotelID} value={hotel.hotelID}>
                      {hotel.hotelName}
                    </option>
                  ))}
                </select>
              </div>
              {/* <div style={{ flex: '1 1 250px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600, fontSize: '14px' }}>
                  Date Range
                </label>
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as any)} className="input" style={{ width: '100%' }}>
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="year">Last Year</option>
                </select>
              </div> */}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="content-card">
          <div className="card-header">
            <h2 style={{ margin: 0 }}>Hotel Performance Reports</h2>
          </div>
          <div className="card-body">
            {loading && <p>Loading data...</p>}
            {error && <div className="alert error">{error}</div>}

            {!loading && hotelReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', color: '#6b7280' }}>
                <div style={{ fontSize: '64px', marginBottom: '20px', opacity: 0.6 }}>Chart</div>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: '#111827', fontWeight: 600 }}>No reports available</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  {selectedHotel ? 'No bookings for selected hotel and date range' : 'No bookings data available'}
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
                      <th style={{ textAlign: 'center', width: '100px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotelReports.map((report, idx) => (
                      <tr key={report.hotelID} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ paddingLeft: '20px' }}>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '14px' }}>{report.hotelName}</div>
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
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>${report.avgBookingValue.toFixed(2)}</div>
                        </td>
                        {['pending', 'confirmed', 'checkedin', 'checkedout', 'canceled'].map(status => (
                          <td key={status} style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              minWidth: '32px',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              background: status === 'pending' ? '#fef3c7' :
                                       status === 'confirmed' ? '#dbeafe' :
                                       status === 'checkedin' ? '#d1fae5' :
                                       status === 'checkedout' ? '#f3f4f6' : '#fee2e2',
                              color: status === 'pending' ? '#92400e' :
                                     status === 'confirmed' ? '#1e40af' :
                                     status === 'checkedin' ? '#065f46' :
                                     status === 'checkedout' ? '#374151' : '#991b1b',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              {status === 'pending' ? report.pendingBookings :
                               status === 'confirmed' ? report.confirmedBookings :
                               status === 'checkedin' ? report.checkedInBookings :
                               status === 'checkedout' ? report.checkedOutBookings : report.canceledBookings}
                            </span>
                          </td>
                        ))}
                        <td style={{ textAlign: 'center' }}>
                          <button onClick={() => openModal(report)} style={{
                            padding: '6px 12px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedReport && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }} onClick={() => setModalOpen(false)}>
          <div ref={reportRef} onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '900px',
            maxHeight: '90vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '24px' }}>{selectedReport.hotelName} Report</h2>
              <div>
                <button onClick={exportPDF} style={{
                  marginRight: '10px', padding: '10px 16px', background: '#10b981',
                  color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer'
                }}>Export PDF</button>
                <button onClick={() => setModalOpen(false)} style={{
                  padding: '10px 16px', background: '#ef4444', color: 'white',
                  border: 'none', borderRadius: '8px', cursor: 'pointer'
                }}>Close</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>Booking Status Distribution</h3>
                {pieData && <Pie data={pieData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />}
              </div>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 16px 0' }}>Revenue Summary</h3>
                <div style={{ padding: '20px', textAlign: 'center', background: 'white', borderRadius: '8px' }}>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#059669' }}>
                    ${selectedReport.totalRevenue.toFixed(2)}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: '8px' }}>Total Revenue</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Detailed Summary</h3>
              <table style={{ width: '100%', fontSize: '14px' }}>
                <tbody>
                  <tr><td style={{ padding: '6px 0' }}><strong>Total Bookings</strong></td><td style={{ textAlign: 'right' }}>{selectedReport.totalBookings}</td></tr>
                  <tr><td style={{ padding: '6px 0' }}><strong>Total Revenue</strong></td><td style={{ textAlign: 'right' }}>${selectedReport.totalRevenue.toFixed(2)}</td></tr>
                  <tr><td style={{ padding: '6px 0' }}><strong>Avg Booking Value</strong></td><td style={{ textAlign: 'right' }}>${selectedReport.avgBookingValue.toFixed(2)}</td></tr>
                  <tr><td style={{ padding: '6px 0' }}><strong>Total Nights</strong></td><td style={{ textAlign: 'right' }}>{selectedReport.totalNights}</td></tr>
                  <tr><td style={{ padding: '6px 0' }}><strong>Total Guests</strong></td><td style={{ textAlign: 'right' }}>{selectedReport.totalGuests}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
