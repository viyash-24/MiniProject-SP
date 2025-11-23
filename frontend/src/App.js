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

const NavigationHandler = () => {
  const location = useLocation();
  const { setLoading } = useLoading();
  React.useEffect(() => {
    // stop the loading indicator when route changes
    setLoading(false);
   
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname, setLoading]);
  return null;
};

function App() {
  // Wrapper that redirects admins away from user pages while leaving others unaffected
  const AdminRedirect = ({ children }) => {
    const { isAdmin } = useAuth();
    if (isAdmin) return <Navigate to="/admin" replace />;
    return children;
  };

  return (
    <Router>
      <LoadingProvider>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
          <Toaster position="top-center" reverseOrder={false} />
          <LoadingBar />
          <NavigationHandler />
          <Header />
          <main className="flex-grow">
            <Routes>
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
            <Route path="/admin/slot-management" element={
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
          </main>
          <Footer />
        </div>
      </LoadingProvider>
    </Router>
  );
}

export default App;