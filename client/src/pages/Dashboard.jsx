import { useState, useEffect } from "react";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  Check,
  X,
  Star,
  Plus,
  ShoppingBag,
  Package,
  MessageSquare,
  User,
  Loader2,
  Calendar,
  X as CloseIcon,
  Edit,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "../lib/utils";
import { toast } from "sonner";
import EditItemModal from "./EditItemModal";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600">
            Something went wrong
          </h3>
          <p className="text-gray-600">
            An error occurred while rendering this section. Please try again.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Dashboard = () => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [myListings, setMyListings] = useState([]);
  const [myRentals, setMyRentals] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [item, setItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Popup states
  const [showBookingsPopup, setShowBookingsPopup] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchListings(),
          fetchRentals(),
          fetchBookingRequests(),
          fetchUnreadMessageCount(),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const fetchListings = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/items/user/listings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      setMyListings(data);
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  };

  const fetchRentals = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/bookings/my-rentals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch rentals");

      const data = await response.json();
      const validRentals = data.filter((rental) => rental.item != null);
      setMyRentals(validRentals);
    } catch (error) {
      console.error("Error fetching rentals:", error);
      throw error;
    }
  };

  const fetchBookingRequests = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/bookings/my-listings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch booking requests");

      const data = await response.json();
      const validBookings = data.filter((booking) => booking.item != null);
      setBookingRequests(validBookings);
    } catch (error) {
      console.error("Error fetching booking requests:", error);
      throw error;
    }
  };

  const fetchUnreadMessageCount = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/messages/unread-count",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch unread message count");

      const data = await response.json();
      setUnreadMessageCount(data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread message count:", error);
      throw error;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setUpdatingStatus(true);

      const response = await fetch(
        `http://localhost:4000/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) throw new Error("Failed to update booking status");

      await fetchBookingRequests();
      toast.success(
        `Booking ${status === "approved" ? "approved" : "rejected"}`
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
      toast.error("Failed to update booking status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleRefund = async (bookingId, amount, reason, isFullRefund) => {
    try {
      setUpdatingStatus(true);

      const response = await fetch(
        `http://localhost:4000/api/payments/refund`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId,
            amount: isFullRefund ? undefined : parseFloat(amount),
            reason,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to process refund");

      const data = await response.json();
      await fetchBookingRequests();
      toast.success(`Refund of ${formatCurrency(data.refundAmount)} processed successfully`);
      setRefundAmount("");
      setRefundReason("");
      setShowBookingsPopup(false);
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Failed to process refund");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEditItem = (listing) => {
    setItem(listing);
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
    if (
      !window.confirm(
        "Are you sure you want to delete this item? This action cannot be undone."
      )
    ) {
      return;
    }
  };

  const handleViewBookings = (item) => {
    setCurrentItem(item);
    setShowBookingsPopup(true);
  };

  const handleViewDetails = (booking) => {
    setCurrentBooking(booking);
    setShowDetailsPopup(true);
  };

  const getStats = () => {
    return {
      activeRentals: myRentals.filter(
        (rental) =>
          rental.status === "approved" || rental.status === "in-progress"
      ).length,
      pendingRequests: myRentals.filter((rental) => rental.status === "pending")
        .length,
      activeListings: myListings.filter((listing) => listing.isAvailable)
        .length,
      totalBookings: bookingRequests.length,
      pendingBookings: bookingRequests.filter(
        (booking) => booking.status === "pending"
      ).length,
      unreadMessages: unreadMessageCount,
    };
  };

  const stats = getStats();

  const getPendingRequests = () => {
    return bookingRequests.filter((booking) => booking.status === "pending");
  };

  const getActiveRentals = () => {
    return myRentals.filter(
      (rental) =>
        rental.status === "approved" || rental.status === "in-progress"
    );
  };

  const getItemBookings = (itemId) => {
    return bookingRequests.filter((booking) => booking.item._id === itemId);
  };

  if (loading) {
    return (
      <div className="container-custom py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-custom">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Dashboard
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back,{" "}
              <span className="font-semibold text-primary">{user?.name}</span>!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/create-listing"
              className="btn bg-primary text-white hover:bg-primary-dark transition-all duration-300 rounded-full px-6 py-2 flex items-center shadow-md"
            >
              <Plus className="h-5 w-5 mr-2" /> List New Item
            </Link>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-10">
          <div className="border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px p-4">
              {["overview", "my-rentals", "my-listings", "booking-requests"].map(
                (tab) => (
                  <li key={tab} className="mr-2">
                    <button
                      className={`inline-block px-6 py-3 rounded-t-lg font-medium text-sm transition-all duration-300 ${
                        activeTab === tab
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")}
                    </button>
                  </li>
                )
              )}
            </ul>
          </div>

          <div className="p-8">
            {activeTab === "overview" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Activity Overview
                </h2>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-4">
                      <ShoppingBag className="h-8 w-8 text-primary mr-3" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Your Rentals
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Rentals:</span>
                        <span className="font-semibold text-gray-800">
                          {stats.activeRentals}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pending Requests:</span>
                        <span className="font-semibold text-gray-800">
                          {stats.pendingRequests}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-4">
                      <Package className="h-8 w-8 text-primary mr-3" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Your Listings
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Active Listings:</span>
                        <span className="font-semibold text-gray-800">
                          {stats.activeListings}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Bookings:</span>
                        <span className="font-semibold text-gray-800">
                          {stats.totalBookings}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Pending Requests:</span>
                        <span className="font-semibold text-gray-800">
                          {stats.pendingBookings}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100">
                    <div className="flex items-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary mr-3" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        Messages
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Unread Messages:</span>
                        <span className="font-semibold text-gray-800">
                          {stats.unreadMessages}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pending Requests and Active Rentals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">
                        Pending Requests
                      </h3>
                      {getPendingRequests().length > 0 && (
                        <button
                          onClick={() => setActiveTab("booking-requests")}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          View All
                        </button>
                      )}
                    </div>

                    {getPendingRequests().length > 0 ? (
                      <div className="space-y-6">
                        {getPendingRequests()
                          .slice(0, 3)
                          .map((booking) =>
                            booking.item ? (
                              <div
                                key={booking._id}
                                className="bg-white rounded-xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <Link
                                    to={`/items/${booking.item._id}`}
                                    className="font-semibold text-lg text-gray-800 hover:text-primary transition-colors"
                                  >
                                    {booking.item.title}
                                  </Link>
                                  <span className="badge bg-blue-100 text-blue-800 border-none font-medium">
                                    {formatCurrency(booking.totalPrice)}
                                  </span>
                                </div>
                                <div className="flex items-center text-sm text-gray-600 mb-4">
                                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                                  {formatDate(booking.startDate)} -{" "}
                                  {formatDate(booking.endDate)}
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center text-sm">
                                    <span className="text-gray-600 mr-2">
                                      From:
                                    </span>
                                    {booking.renter.profileImage ? (
                                      <img
                                        src={booking.renter.profileImage}
                                        alt={booking.renter.name}
                                        className="h-6 w-6 rounded-full mr-2"
                                      />
                                    ) : (
                                      <User className="h-5 w-5 mr-2 text-gray-500" />
                                    )}
                                    <span className="font-medium text-gray-800">
                                      {booking.renter.name}
                                    </span>
                                  </div>
                                  <div className="flex space-x-3">
                                    <button
                                      onClick={() =>
                                        updateBookingStatus(
                                          booking._id,
                                          "rejected"
                                        )
                                      }
                                      className="btn bg-red-500 text-white hover:bg-red-600 rounded-full px-4 py-1 flex items-center transition-all duration-300"
                                      disabled={updatingStatus}
                                    >
                                      <X className="h-5 w-5 mr-1" /> Reject
                                    </button>
                                    <button
                                      onClick={() =>
                                        updateBookingStatus(
                                          booking._id,
                                          "approved"
                                        )
                                      }
                                      className="btn bg-green-500 text-white hover:bg-green-600 rounded-full px-4 py-1 flex items-center transition-all duration-300"
                                      disabled={updatingStatus}
                                    >
                                      <Check className="h-5 w-5 mr-1" /> Approve
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : null
                          )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-md">
                        <p className="text-gray-600 text-lg">
                          No pending requests
                        </p>
                      </div>
                    )}
                  </div>

                  <ErrorBoundary>
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Active Rentals
                        </h3>
                        {getActiveRentals().length > 0 && (
                          <button
                            onClick={() => setActiveTab("my-rentals")}
                            className="text-primary text-sm font-medium hover:underline"
                          >
                            View All
                          </button>
                        )}
                      </div>

                      {getActiveRentals().length > 0 ? (
                        <div className="space-y-6">
                          {getActiveRentals()
                            .slice(0, 3)
                            .map((rental) =>
                              rental.item ? (
                                <div
                                  key={rental._id}
                                  className="bg-white rounded-xl p-6 border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <Link
                                      to={`/items/${rental.item._id}`}
                                      className="font-semibold text-lg text-gray-800 hover:text-primary transition-colors"
                                    >
                                      {rental.item.title}
                                    </Link>
                                    <span className="badge bg-blue-100 text-blue-800 border-none font-medium">
                                      {formatCurrency(rental.totalPrice)}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 mb-4">
                                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                                    {formatDate(rental.startDate)} -{" "}
                                    {formatDate(rental.endDate)}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center text-sm">
                                      <span className="text-gray-600 mr-2">
                                        From:
                                      </span>
                                      {rental.owner.profileImage ? (
                                        <img
                                          src={rental.owner.profileImage}
                                          alt={rental.owner.name}
                                          className="h-6 w-6 rounded-full mr-2"
                                        />
                                      ) : (
                                        <User className="h-5 w-5 mr-2 text-gray-500" />
                                      )}
                                      <span className="font-medium text-gray-800">
                                        {rental.owner.name}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleViewDetails(rental)}
                                      className="text-primary text-sm font-medium hover:underline"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              ) : null
                            )}
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-md">
                          <p className="text-gray-600 text-lg">
                            No active rentals
                          </p>
                        </div>
                      )}
                    </div>
                  </ErrorBoundary>
                </div>
              </>
            )}

            {activeTab === "my-rentals" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  My Rentals
                </h2>

                {myRentals.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {myRentals.map((rental) => (
                      <div
                        key={rental._id}
                        className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-1/3 aspect-w-4 aspect-h-3 bg-gray-100">
                            {rental.item.images &&
                            rental.item.images.length > 0 ? (
                              <img
                                src={rental.item.images[0]}
                                alt={rental.item.title}
                                className="object-cover h-full w-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="p-6 sm:w-2/3">
                            <div className="flex justify-between items-start mb-3">
                              <Link
                                to={`/items/${rental.item._id}`}
                                className="font-semibold text-lg text-gray-800 hover:text-primary transition-colors"
                              >
                                {rental.item.title}
                              </Link>
                              <RentalStatusBadge status={rental.status} />
                            </div>

                            <div className="text-gray-600 mb-4">
                              <div className="flex items-center mb-2">
                                <Calendar className="h-5 w-5 mr-2 text-primary" />
                                <span className="text-sm">
                                  {formatDate(rental.startDate)} -{" "}
                                  {formatDate(rental.endDate)}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <User className="h-5 w-5 mr-2 text-primary" />
                                <span className="text-sm">
                                  Owner: {rental.owner.name}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="font-semibold text-primary text-lg">
                                {formatCurrency(rental.totalPrice)}
                              </div>
                              <div className="flex space-x-3">
                                <Link
                                  to={`/messages?recipientId=${rental.owner._id}&itemId=${rental.item._id}&bookingId=${rental._id}`}
                                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-4 py-1 flex items-center transition-all duration-300"
                                >
                                  <MessageSquare className="h-5 w-5 mr-2" />{" "}
                                  Contact
                                </Link>
                                <button
                                  onClick={() => handleViewDetails(rental)}
                                  className="btn bg-primary text-white hover:bg-primary-dark rounded-full px-4 py-1 flex items-center transition-all duration-300"
                                >
                                  Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      No rentals yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start browsing items and make your first rental!
                    </p>
                    <Link
                      to="/browse"
                      className="btn bg-primary text-white hover:bg-primary-dark rounded-full px-6 py-2 transition-all duration-300"
                    >
                      Browse Items
                    </Link>
                  </div>
                )}
              </>
            )}

            {activeTab === "my-listings" && (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-gray-800">
                    My Listings
                  </h2>
                  <Link
                    to="/create-listing"
                    className="btn bg-primary text-white hover:bg-primary-dark rounded-full px-4 py-2 flex items-center transition-all duration-300"
                  >
                    <Plus className="h-5 w-5 mr-2" /> Add New Listing
                  </Link>
                </div>

                {myListings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((listing) => (
                      <div
                        key={listing._id}
                        className="bg-white rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <div className="aspect-w-3 aspect-h-2 bg-gray-100 relative">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                          {!listing.isAvailable && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold">
                              Not Available
                            </div>
                          )}
                        </div>
                        <div className="p-6">
                          <Link
                            to={`/items/${listing._id}`}
                            className="font-semibold text-lg text-gray-800 hover:text-primary transition-colors mb-2 block"
                          >
                            {listing.title}
                          </Link>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {listing.description}
                          </p>
                          <div className="flex justify-between items-center mb-4">
                            <div className="font-semibold text-primary text-lg">
                              {formatCurrency(listing.pricePerDay)}
                              <span className="text-gray-600 text-sm font-normal">
                                /day
                              </span>
                            </div>
                            {listing.averageRating > 0 && (
                              <div className="flex items-center">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium text-gray-800">
                                  {listing.averageRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleEditItem(listing)}
                              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-4 py-2 flex-1 flex items-center justify-center transition-all duration-300"
                            >
                              <Edit className="h-5 w-5 mr-2" /> Edit
                            </button>
                            <button
                              onClick={() => handleViewBookings(listing)}
                              className="btn bg-primary text-white hover:bg-primary-dark rounded-full px-4 py-2 flex-1 flex items-center justify-center transition-all duration-300"
                            >
                              <Eye className="h-5 w-5 mr-2" /> Bookings
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      No listings yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start earning by listing your items for rent!
                    </p>
                    <Link
                      to="/create-listing"
                      className="btn bg-primary text-white hover:bg-primary-dark rounded-full px-6 py-2 transition-all duration-300"
                    >
                      Create Listing
                    </Link>
                  </div>
                )}
              </>
            )}

            {activeTab === "booking-requests" && (
              <>
                <h2 className="text-2xl font-semibold text-gray-800 mb-8">
                  Booking Requests
                </h2>

                {bookingRequests.length > 0 ? (
                  <div className="space-y-8">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Pending Requests
                      </h3>
                      {bookingRequests.filter((req) => req.status === "pending")
                        .length > 0 ? (
                        <div className="space-y-6">
                          {bookingRequests
                            .filter((req) => req.status === "pending")
                            .map((booking) =>
                              booking.item ? (
                                <div
                                  key={booking._id}
                                  className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300"
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                                    <div>
                                      <Link
                                        to={`/items/${booking.item._id}`}
                                        className="font-semibold text-lg text-gray-800 hover:text-primary transition-colors"
                                      >
                                        {booking.item.title}
                                      </Link>
                                      <div className="flex items-center text-sm text-gray-600 mt-2">
                                        <Calendar className="h-5 w-5 mr-2 text-primary" />
                                        {formatDate(booking.startDate)} -{" "}
                                        {formatDate(booking.endDate)} (
                                        {booking.totalDays} days)
                                      </div>
                                    </div>
                                    <div className="mt-3 sm:mt-0 text-primary font-semibold text-lg">
                                      {formatCurrency(booking.totalPrice)}
                                    </div>
                                  </div>

                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                                    <div className="flex items-center mb-3 sm:mb-0">
                                      {booking.renter.profileImage ? (
                                        <img
                                          src={booking.renter.profileImage}
                                          alt={booking.renter.name}
                                          className="h-8 w-8 rounded-full mr-3"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                                          {booking.renter.name.charAt(0)}
                                        </div>
                                      )}
                                      <div>
                                        <span className="text-sm font-medium text-gray-800">
                                          From: {booking.renter.name}
                                        </span>
                                        <Link
                                          to={`/messages?recipientId=${booking.renter._id}&itemId=${booking.item._id}&bookingId=${booking._id}`}
                                          className="text-sm text-primary hover:underline ml-3"
                                        >
                                          Message
                                        </Link>
                                      </div>
                                    </div>

                                    <div className="flex space-x-3">
                                      <button
                                        onClick={() =>
                                          updateBookingStatus(
                                            booking._id,
                                            "rejected"
                                          )
                                        }
                                        className="btn bg-red-500 text-white hover:bg-red-600 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                                        disabled={updatingStatus}
                                      >
                                        <X className="h-5 w-5 mr-2" /> Reject
                                      </button>
                                      <button
                                        onClick={() =>
                                          updateBookingStatus(
                                            booking._id,
                                            "approved"
                                          )
                                        }
                                        className="btn bg-green-500 text-white hover:bg-green-600 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                                        disabled={updatingStatus}
                                      >
                                        <Check className="h-5 w-5 mr-2" />{" "}
                                        Approve
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : null
                            )}
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center py-4 text-lg">
                          No pending requests
                        </p>
                      )}
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold text-gray-800 mb-4">
                        Past Requests
                      </h3>
                      {bookingRequests.filter((req) => req.status !== "pending")
                        .length > 0 ? (
                        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
                          <table className="table w-full">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="text-left p-4">Item</th>
                                <th className="text-left p-4">Dates</th>
                                <th className="text-left p-4">Renter</th>
                                <th className="text-left p-4">Amount</th>
                                <th className="text-left p-4">Status</th>
                                <th className="text-left p-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {bookingRequests
                                .filter((req) => req.status !== "pending")
                                .map((booking) =>
                                  booking.item ? (
                                    <tr
                                      key={booking._id}
                                      className="border-t border-gray-100 hover:bg-gray-50 transition-all duration-300"
                                    >
                                      <td className="p-4">
                                        <Link
                                          to={`/items/${booking.item._id}`}
                                          className="text-gray-800 hover:text-primary transition-colors"
                                        >
                                          {booking.item.title}
                                        </Link>
                                      </td>
                                      <td className="p-4 text-sm text-gray-600">
                                        {formatDate(booking.startDate)} -{" "}
                                        {formatDate(booking.endDate)}
                                      </td>
                                      <td className="p-4 text-gray-800">
                                        {booking.renter.name}
                                      </td>
                                      <td className="p-4 text-gray-800">
                                        {formatCurrency(booking.totalPrice)}
                                      </td>
                                      <td className="p-4">
                                        <RentalStatusBadge
                                          status={booking.status}
                                        />
                                      </td>
                                      <td className="p-4">
                                        <Link
                                          to={`/messages?recipientId=${booking.renter._id}&itemId=${booking.item._id}&bookingId=${booking._id}`}
                                          className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-4 py-1 flex items-center transition-all duration-300"
                                        >
                                          Message
                                        </Link>
                                      </td>
                                    </tr>
                                  ) : null
                                )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-md">
                          <p className="text-gray-600 text-lg">
                            No past requests
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">
                      No booking requests
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You haven't received any booking requests for your
                      listings yet.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* View Bookings Popup */}
        {showBookingsPopup && currentItem && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Bookings for {currentItem.title}
                </h3>
                <button
                  onClick={() => setShowBookingsPopup(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              {getItemBookings(currentItem._id).length > 0 ? (
                <div className="space-y-6">
                  {getItemBookings(currentItem._id).map((booking) =>
                    booking.item ? (
                      <div
                        key={booking._id}
                        className="border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center">
                            {booking.renter.profileImage ? (
                              <img
                                src={booking.renter.profileImage}
                                alt={booking.renter.name}
                                className="h-10 w-10 rounded-full mr-4"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-4">
                                {booking.renter.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-800">
                                {booking.renter.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {formatDate(booking.startDate)} -{" "}
                                {formatDate(booking.endDate)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RentalStatusBadge status={booking.status} />
                            <PaymentStatusBadge status={booking.paymentStatus} />
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                          <div className="font-semibold text-primary text-lg">
                            {formatCurrency(booking.totalPrice)}
                          </div>
                          <div className="flex space-x-3 flex-wrap gap-2">
                            <Link
                              to={`/messages?recipientId=${booking.renter._id}&itemId=${booking.item._id}&bookingId=${booking._id}`}
                              className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                            >
                              Message
                            </Link>
                            {booking.status === "pending" && (
                              <>
                                <button
                                  onClick={() => {
                                    updateBookingStatus(
                                      booking._id,
                                      "rejected"
                                    );
                                    setShowBookingsPopup(false);
                                  }}
                                  className="btn bg-red-500 text-white hover:bg-red-600 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                                  disabled={updatingStatus}
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => {
                                    updateBookingStatus(
                                      booking._id,
                                      "approved"
                                    );
                                    setShowBookingsPopup(false);
                                  }}
                                  className="btn bg-green-500 text-white hover:bg-green-600 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                                  disabled={updatingStatus}
                                >
                                  Approve
                                </button>
                              </>
                            )}
                            {booking.paymentStatus === "paid" && (
                              <>
                                <button
                                  onClick={() =>
                                    handleRefund(booking._id, booking.totalPrice, "Full refund", true)
                                  }
                                  className="btn bg-orange-500 text-white hover:bg-orange-600 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                                  disabled={updatingStatus}
                                >
                                  Full Refund
                                </button>
                                <button
                                  onClick={() => {
                                    setRefundAmount("");
                                    setRefundReason("");
                                  }}
                                  className="btn bg-orange-300 text-white hover:bg-orange-400 rounded-full px-4 py-2 flex items-center transition-all duration-300"
                                  disabled={updatingStatus}
                                >
                                  Partial Refund
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {booking.paymentStatus === "paid" && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">
                              Partial Refund
                            </h4>
                            <div className="space-y-3">
                              <input
                                type="number"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                                placeholder={`Max ${formatCurrency(booking.totalPrice)}`}
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                                max={booking.totalPrice}
                                min="0"
                                step="0.01"
                              />
                              <textarea
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                placeholder="Reason for refund"
                                className="w-full rounded-lg border-gray-300 focus:ring-primary focus:border-primary"
                                rows="3"
                              />
                              <button
                                onClick={() =>
                                  handleRefund(booking._id, refundAmount, refundReason, false)
                                }
                                className="btn bg-orange-500 text-white hover:bg-orange-600 rounded-full px-4 py-2 w-full flex items-center justify-center transition-all duration-300"
                                disabled={
                                  updatingStatus ||
                                  !refundAmount ||
                                  !refundReason ||
                                  parseFloat(refundAmount) > booking.totalPrice ||
                                  parseFloat(refundAmount) <= 0
                                }
                              >
                                Process Partial Refund
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null
                  )}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4 text-lg">
                  No bookings for this item yet
                </p>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowBookingsPopup(false)}
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-6 py-2 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Booking Details Popup */}
        {showDetailsPopup && currentBooking && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl transform transition-all duration-300 scale-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-800">
                  Booking Details
                </h3>
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <CloseIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                  {currentBooking.item.images &&
                  currentBooking.item.images.length > 0 ? (
                    <img
                      src={currentBooking.item.images[0]}
                      alt={currentBooking.item.title}
                      className="h-14 w-14 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="h-14 w-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                      No Img
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-lg text-gray-800">
                      <Link
                        to={`/items/${currentBooking.item._id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {currentBooking.item.title}
                      </Link>
                    </h4>
                    <div className="flex items-center space-x-2">
                      <RentalStatusBadge status={currentBooking.status} />
                      <PaymentStatusBadge status={currentBooking.paymentStatus} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Dates</div>
                    <div className="text-gray-800">
                      {formatDate(currentBooking.startDate)} -{" "}
                      {formatDate(currentBooking.endDate)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="text-gray-800">
                      {currentBooking.totalDays} days
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Price per day</div>
                    <div className="text-gray-800">
                      {formatCurrency(currentBooking.item.pricePerDay)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Total Price</div>
                    <div className="font-semibold text-primary text-lg">
                      {formatCurrency(currentBooking.totalPrice)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Owner</div>
                  <div className="flex items-center">
                    {currentBooking.owner.profileImage ? (
                      <img
                        src={currentBooking.owner.profileImage}
                        alt={currentBooking.owner.name}
                        className="h-10 w-10 rounded-full mr-3"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                        {currentBooking.owner.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-gray-800 font-medium">
                      {currentBooking.owner.name}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to={`/messages?recipientId=${currentBooking.owner._id}&itemId=${currentBooking.item._id}&bookingId=${currentBooking._id}`}
                    className="btn bg-primary text-white hover:bg-primary-dark rounded-full w-full py-2 flex items-center justify-center transition-all duration-300"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" /> Message Owner
                  </Link>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  className="btn bg-gray-100 text-gray-800 hover:bg-gray-200 rounded-full px-6 py-2 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
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

// Helper component for rendering status badges
const RentalStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    "in-progress": "bg-blue-100 text-blue-800",
    completed: "bg-purple-100 text-purple-800",
    default: "bg-gray-100 text-gray-800",
  };

  const statusStyle = styles[status] || styles.default;

  return (
    <span
      className={`badge ${statusStyle} border-none font-medium px-3 py-1 flex items-center`}
    >
      {status === "pending" && <Clock className="h-4 w-4 mr-1" />}
      {status === "approved" && <Check className="h-4 w-4 mr-1" />}
      {status === "rejected" && <X className="h-4 w-4 mr-1" />}
      {status === "in-progress" && <Clock className="h-4 w-4 mr-1" />}
      {status === "completed" && <Check className="h-4 w-4 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Helper component for rendering payment status badges
const PaymentStatusBadge = ({ status }) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    partially_refunded: "bg-orange-100 text-orange-800",
    refunded: "bg-red-100 text-red-800",
    failed: "bg-gray-100 text-gray-800",
    default: "bg-gray-100 text-gray-800",
  };

  const statusStyle = styles[status] || styles.default;

  return (
    <span
      className={`badge ${statusStyle} border-none font-medium px-3 py-1 flex items-center`}
    >
      {status === "pending" && <Clock className="h-4 w-4 mr-1" />}
      {status === "paid" && <Check className="h-4 w-4 mr-1" />}
      {status === "partially_refunded" && <X className="h-4 w-4 mr-1" />}
      {status === "refunded" && <X className="h-4 w-4 mr-1" />}
      {status === "failed" && <X className="h-4 w-4 mr-1" />}
      {status
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")}
    </span>
  );
};

export default Dashboard;