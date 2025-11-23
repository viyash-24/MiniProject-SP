import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 page-fade-in">
      <div className="max-w-md w-full bg-slate-900/70 border border-slate-700 rounded-2xl shadow-2xl p-8 text-center text-slate-100 card-elevated">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-500/10 border border-red-500/40 mb-4">
          <span className="text-2xl font-semibold text-red-400">404</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Page not found</h1>
        <p className="text-sm sm:text-base text-slate-300 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium shadow-lg shadow-blue-500/30 hover:bg-primary-dark transition-colors btn-soft"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
