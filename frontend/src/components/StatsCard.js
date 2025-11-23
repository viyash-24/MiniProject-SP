import React from 'react';

const StatsCard = ({ title, value, icon, color = 'blue', loading = false }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-300',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition-shadow card-elevated">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{title}</p>
          {loading ? (
            <div className="h-6 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mt-1"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
