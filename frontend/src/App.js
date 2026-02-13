// Import core React library
import React from 'react';

// Import routing tools from react-router-dom
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

// Import toast notification library
import { Toaster } from 'react-hot-toast';

// Import layout components
import Header from './components/Header';
import Footer from './components/Footer';

// Import loading context and loading bar
import { LoadingProvider, useLoading } from './context/LoadingContext';
import LoadingBar from './components/LoadingBar';

// Import page components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProfilePage from './pages/ProfilePage';
import ParkingAreasPage from './pages/ParkingAreasPage';
import ParkingAreaDetailsPage from './pages/ParkingAreaDetailsPage';
import AdminSlotManagementPage from './pages/AdminSlotManagementPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactUsPage from './pages/ContactUsPage';
import FAQsPage from './pages/FAQsPage';
import NotFoundPage from './pages/NotFoundPage';

// Import protected route component for authentication control
import ProtectedRoute from './routes/ProtectedRoute';

// Import authentication context
import { useAuth } from './context/AuthContext';

// Import animation tools
import { AnimatePresence, motion } from 'framer-motion';


/* =========================================
   NavigationHandler Component
   Handles page change events
========================================= */
const NavigationHandler = () => {
  const location = useLocation(); // Get current route location
  const { setLoading } = useLoading(); // Access loading state

  React.useEffect(() => {
    setLoading(false); // Stop loading when route changes

    // Scroll to top smoothly on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }, [location.pathname, setLoading]);

  return null;
};


/* =========================================
   Main App Component
========================================= */
function App() {

  // Redirect admin users automatically
  const AdminRedirect = ({ children }) => {
    const { isAdmin } = useAuth(); // Check if user is admin

    if (isAdmin) return <Navigate to="/admin" replace />; // Redirect to admin dashboard

    return children; // Otherwise show normal page
  };

  return (
    <Router>
      <LoadingProvider>
        {/* Main Layout Wrapper */}
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-300">

          {/* Toast Notifications Setup */}
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
              className:
                'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated px-4 py-3 text-sm',

              // Success toast styling
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ecfdf3',
                },
              },

              // Error toast styling
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
            }}
          />

          {/* Loading Progress Bar */}
          <LoadingBar />

          {/* Handles navigation events */}
          <NavigationHandler />

          {/* Website Header */}
          <Header />

          {/* Main Content Area */}
          <main className="flex-grow">
            <AnimatedRoutes AdminRedirect={AdminRedirect} />
          </main>

          {/* Website Footer */}
          <Footer />
        </div>
      </LoadingProvider>
    </Router>
  );
}


/* =========================================
   Animated Routes Component
   Adds page transition animations
========================================= */
const AnimatedRoutes = ({ AdminRedirect }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname} // Animate when route changes
        initial={{ opacity: 0, y: 8 }} // Start state
        animate={{ opacity: 1, y: 0 }} // Enter animation
        exit={{ opacity: 0, y: -8 }} // Exit animation
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={location} key={location.pathname}>

          {/* Home Route */}
          <Route path="/" element={
            <AdminRedirect>
              <HomePage />
            </AdminRedirect>
          } />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* User Dashboard */}
          <Route path="/dashboard" element={
            <AdminRedirect>
              <DashboardPage />
            </AdminRedirect>
          } />

          {/* Payment Page (only for normal users) */}
          <Route path="/payment" element={
            <ProtectedRoute disallowAdmin>
              <PaymentPage />
            </ProtectedRoute>
          } />

          {/* Profile Page (only for normal users) */}
          <Route path="/profile" element={
            <ProtectedRoute disallowAdmin>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />

          {/* Admin Parking Management */}
          <Route path="/admin/parking-areas" element={
            <ProtectedRoute requireAdmin>
              <ParkingAreasPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/parking-areas/:id" element={
            <ProtectedRoute requireAdmin>
              <ParkingAreaDetailsPage />
            </ProtectedRoute>
          } />

          <Route path="/admin/slots" element={
            <ProtectedRoute requireAdmin>
              <AdminSlotManagementPage />
            </ProtectedRoute>
          } />

          {/* User Parking Details */}
          <Route path="/parking/:id" element={
            <ProtectedRoute disallowAdmin>
              <ParkingAreaDetailsPage />
            </ProtectedRoute>
          } />

          {/* Public Pages */}
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/faqs" element={<FAQsPage />} />

          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default App;
