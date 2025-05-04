import { useEffect } from "react";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./components/Layout/MainLayout";
import { setupAnimations } from "./lib/init-animations";

// Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Browse from "./pages/Browse";
import ItemDetail from "./pages/ItemDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import Messages from "./pages/Messages";
import Payment from './pages/Payment';
import BookingReceipt from './pages/BookingReceipt';
import NotFound from "./pages/NotFound";

// Create a query client for React Query
const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize animations
    setupAnimations();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="browse" element={<Browse />} />
              <Route path="items/:id" element={<ItemDetail />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="profile" element={<Profile />} />
              {/* Protected Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="create-listing" element={<CreateListing />} />
              <Route path="messages" element={<Messages />} />
              <Route path="payment/:bookingId" element={<Payment />} />
              <Route path="booking-receipt/:bookingId" element={<BookingReceipt />} />
              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;