import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <h2 className="text-3xl font-bold mb-4">Page Not Found</h2>
      <p className="text-lg mb-8">The page you are looking for does not exist.</p>
      <Link to="/" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
