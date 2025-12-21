import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import LoadingBar from './components/LoadingBar';
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
import ProtectedRoute from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

const NavigationHandler = () => {
  const location = useLocation();
  const { setLoading } = useLoading();
  React.useEffect(() => {
    
    setLoading(false);
   
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, setLoading]);
  return null;
};

function App() {
 
  // Redirect to admin dashboard if user is admin
  const AdminRedirect = ({ children }) => {
    const { isAdmin } = useAuth();
    if (isAdmin) return <Navigate to="/admin" replace />;
    return children;
  };

  return (
    <Router>
      <LoadingProvider>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:text-slate-100 transition-colors duration-300">
          <Toaster
            position="top-center"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
              className:
                'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50 border border-slate-200 dark:border-slate-700 rounded-xl shadow-elevated px-4 py-3 text-sm',
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#ecfdf3',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fef2f2',
                },
              },
            }}
          />
          <LoadingBar />
          <NavigationHandler />
          <Header />
          <main className="flex-grow">
            <AnimatedRoutes AdminRedirect={AdminRedirect} />
          </main>
          <Footer />
        </div>
      </LoadingProvider>
    </Router>
  );
}

const AnimatedRoutes = ({ AdminRedirect }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <AdminRedirect>
              <HomePage />
            </AdminRedirect>
          } />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={
            <AdminRedirect>
              <DashboardPage />
            </AdminRedirect>
          } />
          <Route path="/payment" element={
            <ProtectedRoute disallowAdmin>
              <PaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute disallowAdmin>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
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
          <Route path="/parking/:id" element={
            <ProtectedRoute disallowAdmin>
              <ParkingAreaDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<AboutUsPage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/faqs" element={<FAQsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

export default App;
