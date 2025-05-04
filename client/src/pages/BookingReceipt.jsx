import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Calendar, Package 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';

const BookingReceipt = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to view booking receipt');
      navigate('/login', { state: { from: `/booking-receipt/${bookingId}` } });
      return;
    }
    
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/bookings/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await response.json();
        setBookingDetails(data);
      } catch (error) {
        console.error('Error fetching booking details:', error);
        setError(error.message || 'Failed to load booking details');
        toast.error('Error loading booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, navigate, isAuthenticated]);

  const handleProceedToPayment = () => {
    navigate(`/payment/${bookingId}`);
  };

  if (loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600">Loading booking receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="container-custom py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'We could not find the booking you were looking for.'}
          </p>
          <Link to="/my-rentals" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Rentals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/my-rentals" className="flex items-center text-sm text-gray-600 hover:text-primary">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to My Rentals
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">Booking Receipt</h1>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-500 mr-3" />
              <div>
                <h2 className="text-xl font-semibold">Booking Request Submitted</h2>
                <p className="text-gray-600">Booking #{bookingDetails._id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex items-center mb-4">
                {bookingDetails.item.images && bookingDetails.item.images.length > 0 ? (
                  <img
                    src={bookingDetails.item.images[0]}
                    alt={bookingDetails.item.title}
                    className="h-16 w-16 object-cover rounded-md mr-3"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{bookingDetails.item.title}</p>
                  <p className="text-sm text-gray-600">{bookingDetails.item.category}</p>
                </div>
              </div>

              <div className="flex items-center mb-2">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <div className="text-sm">
                  <span className="text-gray-600">Rental Period: </span>
                  <span className="font-medium">
                    {formatDate(bookingDetails.startDate)} - {formatDate(bookingDetails.endDate)}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 ml-6 mb-2">
                Duration: <span className="font-medium">{bookingDetails.totalDays} days</span>
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rental Fee:</span>
                <span>{formatCurrency(bookingDetails.totalPrice)}</span>
              </div>
              
              {bookingDetails.depositAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span>{formatCurrency(bookingDetails.depositAmount)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span className="text-primary">
                    {formatCurrency(bookingDetails.totalPrice + bookingDetails.depositAmount)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToPayment}
              className="btn btn-primary w-full"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReceipt;