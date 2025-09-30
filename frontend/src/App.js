import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ParkingAreasPage from './pages/ParkingAreasPage';
import ParkingAreaDetailsPage from './pages/ParkingAreaDetailsPage';
import AdminSlotManagementPage from './pages/AdminSlotManagementPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './routes/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Toaster position="top-center" reverseOrder={false} />
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/payment" element={
              <ProtectedRoute>
                <PaymentPage />
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
              <ProtectedRoute>
                <ParkingAreaDetailsPage />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;