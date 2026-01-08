import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "../../store";
import { API_BASE_URL } from "../../config/api";
import { FaStar } from "react-icons/fa";
import "../../styles/hotelDetails.css";

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
  managerID: string;
}

interface Review {
  reviewID: number;
  guestName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  roomType: string;
}

export default function HotelInfo() {
  const user = useAuthStore((s) => s.user);

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [form, setForm] = useState({
    hotelName: "",
    description: "",
    phoneNumber: "",
    email: "",
  });


  // Fetch hotel
  const fetchHotel = async () => {
    try {
      const res = await axios.get<Hotel>(
        `${API_BASE_URL}/api/hotels/${user?.hotelId}`
      );

      setHotel(res.data);

      setForm({
        hotelName: res.data.hotelName,
        description: res.data.description,
        phoneNumber: res.data.phoneNumber,
        email: res.data.email,
      });
    } catch (err) {
      console.error("HOTEL FETCH ERROR:", err);
    }
    setLoading(false);
  };

  // Fetch reviews
  const fetchReviews = async () => {
    try {
      const res = await axios.get<Review[]>(
        `${API_BASE_URL}/api/reviews/hotel/${user?.hotelId}`
      );
      setReviews(res.data);
    } catch (err) {
      console.error("REVIEW FETCH ERROR:", err);
    }
    setLoadingReviews(false);
  };

  // Load data once hotelId is ready
  useEffect(() => {
    if (user?.hotelId) {
      fetchHotel();
      fetchReviews();
    }
  }, [user?.hotelId]);

  if (loading) return <p>Loading hotel info...</p>;
  if (!hotel) return <p>Hotel not found.</p>;

  // Format created date
  const created = new Date(hotel.createdAt).toLocaleDateString("en-MY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Change image preview
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });
  }

  const handleImageChange = async (e: any) => {
    const f = e.target.files[0];
    if (!f) return;

    setFile(f);

    // Preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(f);
  };



  // Save updates
  const handleSave = async () => {
    try {
      let finalImageUrl = hotel.imageUrl;

      if (file) {
        const formData = new FormData();
        formData.append('file', file); // API expects 'file'

        const uploadRes = await axios.post(`${API_BASE_URL}/api/Hotels/upload-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        finalImageUrl = (uploadRes.data as any).url;
        console.log("Hotel image uploaded to S3:", finalImageUrl);
      }

      const payload = {
        hotelName: form.hotelName,
        address: hotel.address,
        city: hotel.city,
        description: form.description,
        phoneNumber: form.phoneNumber,
        email: form.email,
        rating: hotel.rating,
        imageUrl: finalImageUrl,
        managerID: hotel.managerID,
      };

      await axios.put(
        `${API_BASE_URL}/api/hotels/${hotel.hotelID}`,
        payload
      );

      // Update sidebar hotel name
      useAuthStore.getState().setUser({
        ...user!,
        hotelName: form.hotelName,
      });

      alert("Hotel updated successfully!");
      setEditMode(false);
      setFile(null); // Clear file
      fetchHotel();
    } catch (err) {
      console.error("UPDATE HOTEL ERROR:", err);
      alert("Failed to update hotel.");
    }
  };

  return (
    <div className="hotel-page">

      {/* ========== IMAGE SECTION ========== */}
      <div className="hotel-image-container">
        <img
          src={previewImage || hotel.imageUrl}
          className="hotel-image-banner"
          alt="Hotel"
        />

        {editMode && (
          <label className="image-upload-btn">
            Change Image
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </label>
        )}
      </div>

      {/* ========== HOTEL INFO CARD ========== */}
      <div className="hotel-card-container">
        <div className="hotel-header">
          {editMode ? (
            <input
              className="hotel-title-input"
              value={form.hotelName}
              onChange={(e) => setForm({ ...form, hotelName: e.target.value })}
            />
          ) : (
            <h1 className="hotel-title">{hotel.hotelName}</h1>
          )}

          <button className="edit-btn" onClick={() => setEditMode(!editMode)}>
            {editMode ? "Cancel" : "Edit"}
          </button>
        </div>

        <h3 className="hotel-city">{hotel.city}</h3>

        {/* STAR RATING */}
        <div className="hotel-rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <FaStar key={i} size={26} color={i <= hotel.rating ? "#FFD700" : "#ccc"} />
          ))}
        </div>

        {/* INFO CARD */}
        <div className="hotel-info-card">
          <div className="info-row">
            <strong>Description:</strong>
            {editMode ? (
              <textarea
                className="input-field"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            ) : (
              <p>{hotel.description}</p>
            )}
          </div>

          <div className="info-row">
            <strong>Phone:</strong>
            {editMode ? (
              <input
                className="input-field"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm({ ...form, phoneNumber: e.target.value })
                }
              />
            ) : (
              <p>{hotel.phoneNumber}</p>
            )}
          </div>

          <div className="info-row">
            <strong>Email:</strong>
            {editMode ? (
              <input
                className="input-field"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            ) : (
              <p>{hotel.email}</p>
            )}
          </div>

          <div className="info-row">
            <strong>Address:</strong>
            <p>{hotel.address}</p>
          </div>

          <div className="info-row">
            <strong>Created At:</strong>
            <p>{created}</p>
          </div>
        </div>

        {editMode && (
          <button className="save-changes-btn" onClick={handleSave}>
            Save Changes
          </button>
        )}
      </div>

      {/* ========== REVIEWS SECTION ========== */}
      <div className="reviews-section">
        <h2 className="reviews-title">Guest Reviews</h2>

        {loadingReviews ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="no-review-msg">
            There are currently no reviews for this hotel.
          </p>
        ) : (
          <div className="reviews-list">
            {reviews.map((r) => (
              <div key={r.reviewID} className="review-card">
                <div className="review-header">
                  <h4>{r.guestName}</h4>

                  <div className="stars">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <FaStar key={i} size={18} color={i <= r.rating ? "#FFD700" : "#ccc"} />
                    ))}
                  </div>
                </div>

                <p className="review-comment">"{r.comment}"</p>

                <div className="review-footer">
                  <span>{r.roomType}</span>
                  <span>{new Date(r.reviewDate).toLocaleDateString("en-MY")}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
