import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { FaStar } from "react-icons/fa";

interface Hotel {
  hotelID: number;
  hotelName: string;
  address: string;
  city: string;
  imageUrl: string;
  phoneNumber: string;
  email: string;
  rating: number;
  createdAt: string;
  description: string;
}

export default function HotelInfo() {
  const user = useAuthStore((s) => s.user);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHotel = async () => {
    try {
      const res = await axios.get<Hotel>(
        `https://localhost:7168/api/hotels/${user?.hotelId}`
      );
      setHotel(res.data);
    } catch (err) {
      console.error("HOTEL FETCH ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.hotelId) fetchHotel();
  }, [user?.hotelId]);

  if (loading) return <p>Loading hotel info...</p>;
  if (!hotel) return <p>Hotel not found.</p>;

  // Format created date
  const created = new Date(hotel.createdAt).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="hotel-info-container">
      {/* IMAGE */}
      <div className="hotel-image-wrapper">
        <img src={hotel.imageUrl} className="hotel-image" alt="Hotel" />
      </div>

      {/* CONTENT */}
      <div className="hotel-content">
        <h1 className="hotel-title">{hotel.hotelName}</h1>
        <h3 className="hotel-city">{hotel.city}</h3>

        {/* ⭐ STAR RATING */}
        <div className="hotel-rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar key={i} size={28} color={i <= hotel.rating ? "#FFD700" : "#ccc"} />
          ))}
        </div>

        {/* GLASS CARD */}
        <div className="hotel-card">
          <p><strong>Description:</strong> {hotel.description}</p>
          <p><strong>Address:</strong> {hotel.address}</p>
          <p><strong>Phone:</strong> {hotel.phoneNumber}</p>
          <p><strong>Email:</strong> {hotel.email}</p>
          <p><strong>Created At:</strong> {created}</p>
        </div>
      </div>
    </div>
  );
}
