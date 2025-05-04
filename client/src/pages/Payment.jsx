import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, Shield, CheckCircle, 
  AlertCircle, Loader2, Calendar, Package 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate } from '../lib/utils';
import { toast } from 'sonner';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Form state for credit card
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to access payment page');
      navigate('/login', { state: { from: `/payment/${bookingId}` } });
      return;
    }
    
    const fetchPaymentDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/payments/${bookingId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment details');
        }
        
        const data = await response.json();
        setPaymentDetails(data);
      } catch (error) {
        console.error('Error fetching payment details:', error);
        setError(error.message || 'Failed to load payment details');
        toast.error('Error loading payment details');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [bookingId, navigate, isAuthenticated]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!cardNumber || !cardName || !expiryDate || !cvv) {
      toast.error('Please fill in all payment fields');
      return;
    }
    
    try {
      setProcessing(true);
      
      const paymentData = {
        bookingId,
        paymentMethod,
      };
      
      // Process payment
      const paymentResponse = await fetch('http://localhost:4000/api/payments/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(paymentData),
      });
      
      const paymentDataResponse = await paymentResponse.json();
      
      if (!paymentResponse.ok) {
        throw new Error(paymentDataResponse.message || 'Payment processing failed');
      }

      // Update booking payment status to 'paid'
      const paymentStatusResponse = await fetch(`http://localhost:4000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ paymentStatus: 'paid', paymentId: paymentDataResponse.paymentId }),
      });

      if (!paymentStatusResponse.ok) {
        throw new Error('Failed to update payment status');
      }

      // Update booking status to 'in-progress'
      const statusResponse = await fetch(`http://localhost:4000/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: 'approved' }),
      });



      setPaymentSuccess(true);
      toast.success('Payment processed successfully!');
      
      // Wait a moment before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    // Format card number with spaces every 4 digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted.substring(0, 19)); // Limit to 16 digits + 3 spaces
  };

  if (loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className="container-custom py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Payment Information Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'We could not find the payment information you were looking for.'}
          </p>
          <Link to="/dashboard" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Rentals
          </Link>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your payment has been processed successfully. You will be redirected to your rentals page.
          </p>
          <Link to="/my-rentals" className="btn btn-primary">
            View My Rentals
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

        <h1 className="text-2xl font-bold mb-6">Complete Payment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Payment form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
              
              <form onSubmit={handlePaymentSubmit}>
                <div className="space-y-6">
                  {/* Payment method selection */}
                  <div className="flex flex-col space-y-3">
                    <label className="flex items-center p-4 border rounded-md cursor-pointer bg-gray-50">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="h-4 w-4 text-primary"
                      />
                      <span className="ml-2 flex items-center">
                        <CreditCard className="h-5 w-5 text-gray-500 mr-2" />
                        <span>Credit or Debit Card</span>
                      </span>
                    </label>
                  </div>

                  {/* Credit card form */}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                      <div>
                        <label htmlFor="cardNumber" className="label mb-1">Card Number</label>
                        <input
                          type="text"
                          id="cardNumber"
                          className="input w-full"
                          placeholder="1234 5678 9012 3456"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength="19"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardName" className="label mb-1">Name on Card</label>
                        <input
                          type="text"
                          id="cardName"
                          className="input w-full"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="label mb-1">Expiry Date</label>
                          <input
                            type="text"
                            id="expiryDate"
                            className="input w-full"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value.substring(0, 5))}
                            maxLength="5"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="label mb-1">Security Code (CVV)</label>
                          <input
                            type="text"
                            id="cvv"
                            className="input w-full"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                            maxLength="3"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2 text-gray-500" />
                      <p>Your payment information is secure and encrypted</p>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn btn-primary w-full"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Pay ${formatCurrency(paymentDetails.costs.total)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right column - Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              
              <div className="flex items-center mb-4">
                {paymentDetails.item.image ? (
                  <img
                    src={paymentDetails.item.image}
                    alt={paymentDetails.item.title}
                    className="h-16 w-16 object-cover rounded-md mr-3"
                  />
                ) : (
                  <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center mr-3">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{paymentDetails.item.title}</p>
                  <p className="text-sm text-gray-600">Booking #{bookingId.substring(0, 8)}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                  <div className="text-sm">
                    <span className="text-gray-600">Rental Period: </span>
                    <span className="font-medium">
                      {formatDate(paymentDetails.rental.startDate)} - {formatDate(paymentDetails.rental.endDate)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 ml-6 mb-2">
                  Duration: <span className="font-medium">{paymentDetails.rental.totalDays} days</span>
                </p>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rental Fee:</span>
                  <span>{formatCurrency(paymentDetails.costs.rentalFee)}</span>
                </div>
                
                {paymentDetails.costs.deposit > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Security Deposit:</span>
                    <span>{formatCurrency(paymentDetails.costs.deposit)}</span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(paymentDetails.costs.total)}</span>
                  </div>
                </div>
              </div>
              
              {paymentDetails.costs.deposit > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-0.5 text-amber-500" />
                    <p>
                      The security deposit of {formatCurrency(paymentDetails.costs.deposit)} will be refunded after 
                      the item is returned in its original condition.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;