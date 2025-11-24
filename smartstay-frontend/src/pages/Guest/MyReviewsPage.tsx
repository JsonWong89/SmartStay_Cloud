import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { API_BASE_URL } from '../../config';

interface Review {
  reviewID: number;
  bookingID: number;
  guestID: number;
  guestName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  hotelName: string;
  roomType: string;
}

const MyReviewsPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/reviews/guest/${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.id]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-yellow-400 text-xl">
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const getRatingText = (rating: number) => {
    if (rating === 5) return 'Excellent';
    if (rating === 4) return 'Very Good';
    if (rating === 3) return 'Good';
    if (rating === 2) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">⭐ My Reviews</h1>
              <p className="text-sm text-gray-600">Your feedback and ratings</p>
            </div>
            <button
              onClick={() => navigate('/guest/dashboard')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-600">Loading your reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-gray-600 mb-4">You haven't written any reviews yet</p>
            <p className="text-gray-500 mb-6">
              Share your experiences to help other travelers and improve our services
            </p>
            <button
              onClick={() => navigate('/guest/reservations')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition"
            >
              View Your Reservations
            </button>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-3xl font-bold text-blue-600">{reviews.length}</p>
                <p className="text-gray-600">Total Reviews</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-3xl font-bold text-yellow-500">
                  {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                </p>
                <p className="text-gray-600">Average Rating</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {reviews.filter(r => r.rating >= 4).length}
                </p>
                <p className="text-gray-600">Positive Reviews</p>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.reviewID}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  <div className="p-6">
                    {/* Review Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{review.hotelName}</h3>
                        <p className="text-gray-600">{review.roomType}</p>
                      </div>
                      <div className="text-right">
                        {renderStars(review.rating)}
                        <p className="text-sm text-gray-600 mt-1">{getRatingText(review.rating)}</p>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-gray-800 whitespace-pre-line">{review.comment}</p>
                    </div>

                    {/* Review Footer */}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div>
                        <span>Review ID: #{review.reviewID}</span>
                        <span className="mx-2">•</span>
                        <span>Booking #{review.bookingID}</span>
                      </div>
                      <div>
                        {new Date(review.reviewDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/guest/reservations`)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Booking
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;
