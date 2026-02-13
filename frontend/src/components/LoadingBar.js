import React from 'react';
import { useLoading } from '../context/LoadingContext';

const LoadingBar = () => {
  const { loading } = useLoading();
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div
        className={`h-1 bg-blue-500 transition-all duration-300 ease-out origin-left ${loading ? 'w-full' : 'w-0'}`}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};

export default LoadingBar;
