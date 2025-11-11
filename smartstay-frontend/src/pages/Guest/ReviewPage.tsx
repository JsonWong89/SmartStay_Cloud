import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store';

const ReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { reservationId } = useParams<{ reservationId: string }>();
  const user = useAuthStore((state) => state.user);

  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [cleanliness, setCleanliness] = useState(0);
  const [service, setService] = useState(0);
  const [facilities, setFacilities] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);

  // Mock reservation data
  const reservation = {
    id: reservationId,
    hotelName: 'Grand Plaza Hotel',
    roomType: 'Deluxe Double',
    checkInDate: '2025-11-15',
    checkOutDate: '2025-11-18',
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!reviewText.trim()) {
      alert('Please write your review');
      return;
    }

    const reviewData = {
      reservationId,
      hotelName: reservation.hotelName,
      rating,
      reviewTitle,
      reviewText,
      ratings: {
        cleanliness,
        service,
        facilities,
        valueForMoney,
      },
      guestName: user?.fullName,
      date: new Date().toISOString(),
    };

    console.log('Review Submitted:', reviewData);

    alert('Thank you for your review! Your feedback helps us improve our service.');
    navigate('/guest/reservations');
  };

  const renderStars = (
    currentRating: number,
    setRatingFunc: (rating: number) => void,
    hovered: number = 0
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatingFunc(star)}
            onMouseEnter={() => star === hoveredRating || setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="text-3xl focus:outline-none transition-transform hover:scale-110"
          >
            {star <= (hovered || currentRating) ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  const renderSmallStars = (currentRating: number, setRatingFunc: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatingFunc(star)}
            className="text-xl focus:outline-none transition-transform hover:scale-110"
          >
            {star <= currentRating ? '⭐' : '☆'}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">⭐ Write a Review</h1>
              <p className="text-sm text-gray-600">Share your experience</p>
            </div>
            <button
              onClick={() => navigate('/guest/reservations')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmitReview} className="space-y-6">
          {/* Reservation Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Stay</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hotel</p>
                <p className="font-semibold">{reservation.hotelName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Room Type</p>
                <p className="font-semibold">{reservation.roomType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-in</p>
                <p className="font-semibold">{reservation.checkInDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Check-out</p>
                <p className="font-semibold">{reservation.checkOutDate}</p>
              </div>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Overall Rating <span className="text-red-500">*</span>
            </h2>
            <div className="flex flex-col items-center">
              {renderStars(rating, setRating, hoveredRating)}
              <p className="mt-2 text-gray-600">
                {rating === 0 && 'Click to rate'}
                {rating === 1 && 'Poor'}
                {rating === 2 && 'Fair'}
                {rating === 3 && 'Good'}
                {rating === 4 && 'Very Good'}
                {rating === 5 && 'Excellent'}
              </p>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Detailed Ratings</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Cleanliness</span>
                {renderSmallStars(cleanliness, setCleanliness)}
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Service</span>
                {renderSmallStars(service, setService)}
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Facilities</span>
                {renderSmallStars(facilities, setFacilities)}
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Value for Money</span>
                {renderSmallStars(valueForMoney, setValueForMoney)}
              </div>
            </div>
          </div>

          {/* Review Text */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Review</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Title (Optional)
              </label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                placeholder="Summarize your experience"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Experience <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                placeholder="Tell us about your stay... What did you like? What could be improved?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters ({reviewText.length}/50)
              </p>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Review Guidelines</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Be honest and constructive</li>
              <li>• Focus on your personal experience</li>
              <li>• Avoid inappropriate language</li>
              <li>• Don't include personal information</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition"
            >
              Submit Review
            </button>
            <button
              type="button"
              onClick={() => navigate('/guest/reservations')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-md transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewPage;
