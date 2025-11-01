import React from 'react';

const SlotStatusCard = ({ parkingArea, onInitializeSlots }) => {
  const occupancyPercentage = parkingArea.totalSlots > 0 
    ? (parkingArea.occupiedSlots / parkingArea.totalSlots) * 100 
    : 0;

  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getBarColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{parkingArea.name}</h3>
          <p className="text-sm text-gray-500">{parkingArea.address}</p>
        </div>
        <button
          onClick={() => onInitializeSlots(parkingArea._id)}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Initialize Slots
        </button>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Slots:</span>
          <span className="font-semibold text-gray-900">{parkingArea.totalSlots}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Available:</span>
          <span className={`font-semibold ${getStatusColor(100 - occupancyPercentage)}`}>
            {parkingArea.availableSlots}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Occupied:</span>
          <span className={`font-semibold ${getStatusColor(occupancyPercentage)}`}>
            {parkingArea.occupiedSlots}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Occupancy:</span>
          <span className={`font-semibold ${getStatusColor(occupancyPercentage)}`}>
            {occupancyPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getBarColor(occupancyPercentage)}`}
            style={{ width: `${occupancyPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between text-xs">
        <span className="text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          occupancyPercentage >= 90 
            ? 'bg-red-100 text-red-800' 
            : occupancyPercentage >= 70 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {occupancyPercentage >= 90 ? 'Full' : occupancyPercentage >= 70 ? 'Busy' : 'Available'}
        </span>
      </div>
    </div>
  );
};

export default SlotStatusCard;
