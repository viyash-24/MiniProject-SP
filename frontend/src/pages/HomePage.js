import React from 'react';
import { Link } from 'react-router-dom';
import useStats from '../hooks/useStats';
import StatsCard from '../components/StatsCard';
import ParkingChargesDisplay from '../components/ParkingChargesDisplay';

const features = [
  { title: 'Live Availability', desc: 'See real-time free slots across nearby parking areas.' },
  { title: 'Secure Payments', desc: 'Pay online via UPI, cards, and wallets with instant receipts.' },
  { title: 'Admin Controls', desc: 'Manage vehicles, slots, and payments from a powerful dashboard.' },
];

const HomePage = () => {
  const { stats, loading, error } = useStats();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-blue-100" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900">
                Park smarter in busy cities
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Find nearby parking, view live slot availability, and pay seamlessly. All in one place.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/dashboard" className="px-6 py-3 rounded-md text-white bg-primary hover:bg-primary-dark font-medium text-center">
                  Find Parking
                </Link>
                <Link to="/register" className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-center">
                  Create Account
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalParkingAreas}
                  </div>
                  <div className="text-gray-500 text-sm">Parking Areas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.dailyActiveUsers}
                  </div>
                  <div className="text-gray-500 text-sm">Daily Active Users</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {loading ? '...' : stats.totalUsers}
                  </div>
                  <div className="text-gray-500 text-sm">Total Users</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img className="rounded-xl shadow-2xl w-full object-cover h-80" src="https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop" alt="Parking" />
              <div className="absolute -bottom-6 -left-6 bg-white/90 border shadow rounded-xl p-4 w-64 hidden sm:block">
                <div className="text-sm font-semibold text-gray-800">Live Slots</div>
                <div className="mt-2 flex justify-between text-sm">
                  <span className="text-gray-600">Downtown Garage</span>
                  <span className="font-semibold text-green-600">12 free</span>
                </div>
                <div className="mt-1 flex justify-between text-sm">
                  <span className="text-gray-600">Central Mall</span>
                  <span className="font-semibold text-green-600">8 free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Dashboard */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">System Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Parking Areas"
              value={stats.totalParkingAreas}
              loading={loading}
              color="blue"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />
            <StatsCard
              title="Daily Active Users"
              value={stats.dailyActiveUsers}
              loading={loading}
              color="green"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
            />
            <StatsCard
              title="Total Vehicles"
              value={stats.totalVehicles}
              loading={loading}
              color="purple"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
              }
            />
            <StatsCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toLocaleString()}`}
              loading={loading}
              color="orange"
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              }
            />
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">Failed to load statistics: {error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Parking Charges Section */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Parking Rates</h2>
          <ParkingChargesDisplay compact={true} />
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center">Everything you need to park with ease</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 border rounded-xl bg-white shadow-sm hover:shadow-md transition">
                <div className="h-10 w-10 rounded-md bg-blue-100 text-primary flex items-center justify-center font-bold">✓</div>
                <h3 className="mt-4 font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
