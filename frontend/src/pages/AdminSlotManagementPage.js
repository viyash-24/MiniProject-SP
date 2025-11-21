import React, { useState } from 'react';
import useSlotManagement from '../hooks/useSlotManagement';
import SelectSlotPopup from '../components/SelectSlotPopup';

const AdminSlotManagementPage = () => {
  const {
    parkingAreas,
    currentVehicles,
    loading,
    error,
    getAvailableSlots,
    registerUserAndAssignSlot,
    exitUserAndFreeSlot,
    initializeParkingAreaSlots,
    recalculateSlotCounts
  } = useSlotManagement();

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [selectedParkingArea, setSelectedParkingArea] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [registerForm, setRegisterForm] = useState({
    plate: '',
    userEmail: '',
    userName: '',
    userPhone: '',
    vehicleType: 'Car',
    parkingAreaId: '',
    slotNumber: '',
    createdBy: 'admin'
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showSlotPopup, setShowSlotPopup] = useState(false);

  const handleParkingAreaChange = async (parkingAreaId) => {
    if (!parkingAreaId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const data = await getAvailableSlots(parkingAreaId);
      setAvailableSlots(data.availableSlots);
      setRegisterForm(prev => ({ ...prev, parkingAreaId, slotNumber: '' }));
    } catch (err) {
      console.error('Error fetching available slots:', err);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    try {
      await registerUserAndAssignSlot(registerForm);
      setRegisterForm({
        plate: '',
        userEmail: '',
        userName: '',
        userPhone: '',
        vehicleType: 'Car',
        parkingAreaId: '',
        slotNumber: '',
        createdBy: 'admin'
      });
      setShowRegisterForm(false);
      setSelectedParkingArea('');
      setAvailableSlots([]);
    } catch (err) {
      setRegisterError(err.message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleExitVehicle = async (vehicleId) => {
    if (window.confirm('Are you sure you want to exit this vehicle?')) {
      try {
        await exitUserAndFreeSlot(vehicleId, new Date());
      } catch (err) {
        console.error('Error exiting vehicle:', err);
        alert('Failed to exit vehicle: ' + err.message);
      }
    }
  };

  const handleInitializeSlots = async (parkingAreaId) => {
    if (window.confirm('This will initialize all slots for this parking area. Continue?')) {
      try {
        await initializeParkingAreaSlots(parkingAreaId);
        alert('Slots initialized successfully!');
      } catch (err) {
        console.error('Error initializing slots:', err);
        alert('Failed to initialize slots: ' + err.message);
      }
    }
  };

  const handleRecalculateSlots = async (parkingAreaId) => {
    if (window.confirm('This will recalculate slot counts based on current vehicles. Continue?')) {
      try {
        await recalculateSlotCounts(parkingAreaId);
        alert('Slot counts recalculated successfully!');
      } catch (err) {
        console.error('Error recalculating slots:', err);
        alert('Failed to recalculate slots: ' + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Slot Management</h1>
        <p className="mt-2 text-gray-600">Manage parking slots and vehicle assignments</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Parking Areas Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Parking Areas Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingAreas.map((area) => (
            <div key={area._id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleInitializeSlots(area._id)}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Initialize
                  </button>
                  <button
                    onClick={() => handleRecalculateSlots(area._id)}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  >
                    Recalculate
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Slots:</span>
                  <span className="font-semibold">{area.totalSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-semibold text-green-600">{area.availableSlots}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Occupied:</span>
                  <span className="font-semibold text-red-600">{area.occupiedSlots}</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(area.occupiedSlots / area.totalSlots) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Register New User */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Register New User & Vehicle</h2>
          <button
            onClick={() => setShowRegisterForm(!showRegisterForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {showRegisterForm ? 'Cancel' : 'Register New User'}
          </button>
        </div>

        {showRegisterForm && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Plate Number
                  </label>
                  <input
                    type="text"
                    value={registerForm.plate}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, plate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Email
                  </label>
                  <input
                    type="email"
                    value={registerForm.userEmail}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, userEmail: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    value={registerForm.userName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, userName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Phone
                  </label>
                  <input
                    type="tel"
                    value={registerForm.userPhone}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, userPhone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={registerForm.vehicleType}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, vehicleType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Scooter">Scooter</option>
                    <option value="van">Van</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parking Area
                  </label>
                  <select
                    value={registerForm.parkingAreaId}
                    onChange={(e) => {
                      setRegisterForm(prev => ({ ...prev, parkingAreaId: e.target.value }));
                      handleParkingAreaChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Parking Area</option>
                    {parkingAreas.map((area) => (
                      <option key={area._id} value={area._id}>
                        {area.name} ({area.availableSlots} slots available)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slot Number
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      readOnly
                      value={registerForm.slotNumber ? `Slot ${registerForm.slotNumber}` : 'No slot selected'}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSlotPopup(true)}
                      disabled={!registerForm.parkingAreaId}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Select Slot
                    </button>
                  </div>
                  <select
                    value={registerForm.slotNumber}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, slotNumber: parseInt(e.target.value) }))}
                    className="hidden"
                    required
                    disabled={!registerForm.parkingAreaId}
                  >
                    <option value="">Select Slot</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.slotNumber} value={slot.slotNumber}>
                        Slot {slot.slotNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {registerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{registerError}</p>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {registerLoading ? 'Registering...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Current Vehicles */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Vehicles in Parking</h2>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parking Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entry Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentVehicles.map((vehicle) => (
                  <tr key={vehicle._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                        <div className="text-sm text-gray-500">{vehicle.vehicleType}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{vehicle.userName}</div>
                        <div className="text-sm text-gray-500">{vehicle.userEmail}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehicle.parkingAreaId?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        Slot {vehicle.slotNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        vehicle.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vehicle.entryTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleExitVehicle(vehicle._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Exit Vehicle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <SelectSlotPopup
        isOpen={showSlotPopup}
        slots={availableSlots}
        onClose={() => setShowSlotPopup(false)}
        onSelect={(slotNumber) => {
          setRegisterForm(prev => ({ ...prev, slotNumber }));
          setShowSlotPopup(false);
        }}
      />
    </div>
  );
};

export default AdminSlotManagementPage;
