import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import useStats from '../hooks/useStats';
import ParkingChargesDisplay from '../components/ParkingChargesDisplay';

const features = [
  { title: 'Live Availability', desc: 'See real-time free slots across nearby parking areas.' },
  { title: 'Secure Payments', desc: 'Pay online via UPI, cards, and wallets with instant receipts.' },
  { title: 'Admin Controls', desc: 'Manage vehicles, slots, and payments from a powerful dashboard.' },
];

const HomePage = () => {
  const { stats, loading, error } = useStats();
  const heroMetrics = [
    { label: 'Parking Areas', value: stats.totalParkingAreas },
    { label: 'Daily Active Users', value: stats.dailyActiveUsers },
    { label: 'Total Users', value: stats.totalUsers },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 page-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-slate-50">
                Park smarter in busy cities
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-slate-300">
                Find nearby parking, view live slot availability, and pay seamlessly. All in one place.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg">
                  <Link to="/dashboard">Find Parking</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>

              <div className="mt-8 flex flex-col gap-2">
                {error && (
                  <span className="text-sm text-red-500">
                    Unable to load live stats right now.
                  </span>
                )}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {heroMetrics.map(({ label, value }) => (
                    <div
                      key={label}
                      className="flex-1 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900/80"
                    >
                      <p className="text-sm text-gray-500 dark:text-slate-400">{label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">
                        {loading ? '—' : value?.toLocaleString?.() ?? value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 via-transparent to-indigo-500/20 blur-3xl -z-10" />
              <img
                className="rounded-2xl shadow-2xl w-full object-cover h-80 border border-white/60 dark:border-slate-700/60 soft-zoom float-slow"
                src="https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1600&auto=format&fit=crop"
                alt="Parking"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Parking Charges */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div>
            <p className="text-sm uppercase tracking-widest text-primary">Transparent pricing</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 dark:text-slate-50">Current Parking Charges</h2>
            <p className="mt-2 text-gray-600 dark:text-slate-400">
              Rates auto-update whenever the admin adds or edits vehicle charges.
            </p>
          </div>
          <ParkingChargesDisplay compact showHeading={false} />
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-gray-50 dark:bg-slate-950/80 page-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-50 text-center">Everything you need to park with ease</h2>
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="p-6 border border-gray-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 shadow-sm hover:shadow-lg transition-shadow card-elevated">
                <div className="h-10 w-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold shadow-sm">✓</div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-slate-50">{f.title}</h3>
                <p className="mt-1 text-gray-600 dark:text-slate-300 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
