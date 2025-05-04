import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Shield,
  ArrowLeft,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share,
  Info,
  Loader2,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { formatCurrency, formatDate, calculateDuration } from "../lib/utils";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import EditItemModal from "./EditItemModal";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalDays, setTotalDays] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:4000/api/items/${id}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch item details");
        }

        const data = await response.json();
        setItem(data);
      } catch (error) {
        console.error("Error fetching item details:", error);
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;

      try {
        setLoadingReviews(true);
        const response = await fetch(`http://localhost:4000/api/reviews/item/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();
        setReviews(data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && item) {
      const days = calculateDuration(startDate, endDate);
      setTotalDays(days);

      let price = 0;
      if (days <= 7 && item.pricePerDay) {
        price = days * item.pricePerDay;
      } else if (days <= 30 && item.pricePerWeek) {
        const weeks = Math.ceil(days / 7);
        price = weeks * item.pricePerWeek;
      } else if (item.pricePerMonth) {
        const months = Math.ceil(days / 30);
        price = months * item.pricePerMonth;
      } else {
        price = days * item.pricePerDay;
      }

      setTotalPrice(price);
      setDepositAmount(item.deposit || 0);
    } else {
      setTotalDays(0);
      setTotalPrice(0);
      setDepositAmount(0);
    }
  }, [startDate, endDate, item]);

  const handlePrevImage = () => {
    if (!item?.images?.length) return;

    setCurrentImageIndex((prev) =>
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!item?.images?.length) return;

    setCurrentImageIndex((prev) =>
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to book this item");
      navigate("/login", { state: { from: `/items/${id}` } });
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Please select rental dates");
      return;
    }

    try {
      setSubmitting(true);

      const bookingData = {
        itemId: id,
        startDate,
        endDate,
        notes,
      };

      const response = await fetch("http://localhost:4000/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      if (!data._id) {
        throw new Error("Booking ID not returned");
      }

      toast.success("Booking request created! Redirecting to receipt...");
      navigate(`/booking-receipt/${data._id}`);
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error(error.message || "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactOwner = () => {
    if (!isAuthenticated) {
      toast.error("Please login to contact the owner");
      navigate("/login", { state: { from: `/items/${id}` } });
      return;
    }

    navigate(`/messages?recipientId=${item.owner._id}&itemId=${item._id}`);
  };

  const handleEditItem = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedItem) => {
    try {
      setItem(updatedItem);
      toast.success("Item updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error(error.message || "Failed to update item");
      throw error;
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await fetch(`http://localhost:4000/api/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete item");
      }

      toast.success("Item deleted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(error.message || "Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container-custom py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">Item Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "We could not find the item you were looking for."}
          </p>
          <Link to="/browse" className="btn btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user && item.owner && user._id === item.owner._id;

  return (
    <div className="bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-6">
          <Link
            to="/browse"
            className="flex items-center text-sm text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="relative aspect-w-16 aspect-h-9 bg-gray-100">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[currentImageIndex]}
                    alt={item.title}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image Available
                  </div>
                )}
                {item.images && item.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm rounded-full px-3 py-1">
                      {currentImageIndex + 1} / {item.images.length}
                    </div>
                  </>
                )}
              </div>

              {item.images && item.images.length > 1 && (
                <div className="flex overflow-x-auto p-2 gap-2">
                  {item.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 h-16 w-16 rounded-md overflow-hidden border-2 ${
                        currentImageIndex === index
                          ? "border-primary"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <div className="flex space-x-2">
                  {isOwner && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleEditItem}
                        className="p-2 rounded-full hover:bg-gray-100 text-primary"
                        title="Edit Item"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleDeleteItem}
                        className="p-2 rounded-full hover:bg-gray-100 text-red-500"
                        title="Delete Item"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Heart className="h-5 w-5 text-gray-500" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <Share className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {item.category && (
                  <span className="badge badge-outline">{item.category}</span>
                )}
                {item.condition && (
                  <span className="badge badge-primary">{item.condition}</span>
                )}
                {item.isAvailable === false && (
                  <span className="badge bg-destructive text-destructive-foreground">
                    Not Available
                  </span>
                )}
              </div>

              <div className="flex items-center mb-6">
                <div className="text-xl font-bold text-primary mr-4">
                  {formatCurrency(item.pricePerDay)}
                  <span className="text-gray-600 text-sm font-normal">
                    /day
                  </span>
                </div>

                {item.pricePerWeek && (
                  <div className="text-gray-600 mr-4">
                    {formatCurrency(item.pricePerWeek)}
                    <span className="text-xs">/week</span>
                  </div>
                )}

                {item.pricePerMonth && (
                  <div className="text-gray-600">
                    {formatCurrency(item.pricePerMonth)}
                    <span className="text-xs">/month</span>
                  </div>
                )}
              </div>

              {item.deposit > 0 && (
                <div className="flex items-center mb-6 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                  <Shield className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Security Deposit: {formatCurrency(item.deposit)}
                    </p>
                    <p className="text-xs">Refundable if returned as agreed</p>
                  </div>
                </div>
              )}

              {item.location && (
                <div className="flex items-start mb-6">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">
                      {item.location.city}, {item.location.country}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 my-6"></div>

              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 mb-6 whitespace-pre-line">
                {item.description}
              </p>

              {item.specifications &&
                Object.keys(item.specifications).length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mb-3">
                      Specifications
                    </h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-6">
                      {Object.entries(item.specifications).map(
                        ([key, value]) => (
                          <li key={key} className="flex items-start">
                            <Info className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                            <span className="text-gray-700">
                              <span className="font-medium">{key}:</span>{" "}
                              {value}
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </>
                )}

              {item.rentalTerms && (
                <>
                  <h3 className="text-lg font-semibold mb-3">Rental Terms</h3>
                  <div className="p-4 bg-gray-50 rounded-md text-gray-700 mb-6">
                    <p className="whitespace-pre-line">{item.rentalTerms}</p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">About the Owner</h3>
              <div className="flex items-center">
                {item.owner.profileImage ? (
                  <img
                    src={item.owner.profileImage}
                    alt={item.owner.name}
                    className="h-16 w-16 rounded-full object-cover mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-white mr-4">
                    <User className="h-8 w-8" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-lg">{item.owner.name}</p>
                  {item.owner.averageRating > 0 && (
                    <div className="flex items-center text-sm">
                      <Star className="h-4 w-4 fill-secondary text-secondary mr-1" />
                      <span className="font-medium">
                        {item.owner.averageRating.toFixed(1)}
                      </span>
                      <span className="text-gray-600 ml-1">
                        ({item.owner.totalReviews} reviews)
                      </span>
                    </div>
                  )}
                  {!isOwner && (
                    <button
                      onClick={handleContactOwner}
                      className="mt-2 flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" /> Contact Owner
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8 lg:mb-0">
              <h3 className="text-lg font-semibold mb-4">Reviews</h3>

              {loadingReviews ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review._id}
                      className="border-b border-gray-200 pb-6 last:border-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {review.reviewer.profileImage ? (
                            <img
                              src={review.reviewer.profileImage}
                              alt={review.reviewer.name}
                              className="h-10 w-10 rounded-full object-cover mr-3"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                              {review.reviewer.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {review.reviewer.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? "fill-secondary text-secondary"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600">No reviews yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Book This Item</h3>

              {!item.isAvailable && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-3 mb-4">
                  <p className="font-medium">
                    This item is currently unavailable
                  </p>
                  <p className="text-sm">
                    Please check back later or contact the owner for more
                    information.
                  </p>
                </div>
              )}

              {isOwner ? (
                <div className="text-center py-4">
                  <p className="mb-4 text-gray-600">This is your listing.</p>
                  <button
                    onClick={handleEditItem}
                    className="btn btn-primary w-full mb-2"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Listing
                  </button>
                  <button
                    onClick={handleDeleteItem}
                    className="btn btn-outline text-red-500 border-red-500 hover:bg-red-50 w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Listing
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitBooking}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="startDate" className="label mb-1">
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="startDate"
                          className="input pr-10 w-full"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          disabled={!item.isAvailable}
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="endDate" className="label mb-1">
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="endDate"
                          className="input pr-10 w-full"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          min={
                            startDate || new Date().toISOString().split("T")[0]
                          }
                          disabled={!startDate || !item.isAvailable}
                          required
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      </div>
                    </div>

                    {totalDays > 0 && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{totalDays} days</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">Rental fee:</span>
                          <span className="font-medium">
                            {formatCurrency(totalPrice)}
                          </span>
                        </div>
                        {depositAmount > 0 && (
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-600">
                              Security deposit:
                            </span>
                            <span className="font-medium">
                              {formatCurrency(depositAmount)}
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total:</span>
                          <span className="text-primary">
                            {formatCurrency(totalPrice + depositAmount)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="notes" className="label mb-1">
                        Notes for the owner (optional)
                      </label>
                      <textarea
                        id="notes"
                        rows="3"
                        className="input w-full"
                        placeholder="Any special requests or questions?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={!item.isAvailable}
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full"
                      disabled={
                        submitting ||
                        !item.isAvailable ||
                        !startDate ||
                        !endDate ||
                        totalDays <= 0
                      }
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Request to Book"
                      )}
                    </button>
                  </div>
                </form>
              )}

              {item.isAvailable && !isOwner && (
                <div className="mt-4 flex items-center justify-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    Average response time: <strong>within 24 hours</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditItemModal
          item={item}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ItemDetail;