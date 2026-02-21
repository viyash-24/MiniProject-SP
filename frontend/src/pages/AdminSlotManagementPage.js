import React, { useEffect, useMemo, useState } from 'react';
import useSlotManagement from '../hooks/useSlotManagement';
import SelectSlotPopup from '../components/SelectSlotPopup';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, RefreshCw, Plus, LogOut, Car, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

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
  const { user } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const authHeader = useMemo(() => ({
    'Content-Type': 'application/json',
    'x-admin-email': user?.email || ''
  }), [user?.email]);

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
  const [registerFieldErrors, setRegisterFieldErrors] = useState({});
  const [showSlotPopup, setShowSlotPopup] = useState(false);
  const [areaTypeMap, setAreaTypeMap] = useState({});

  // Validation helpers
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  const isValidPhone = (phone) => {
    const digits = String(phone || '').replace(/\D/g, '');
    return !digits || (digits.length >= 7 && digits.length <= 15);
  };
  const isValidPlate = (plate) => /^[A-Z0-9-]{4,15}$/i.test(String(plate || '').trim());

  // Fetch per-type slot counts for mapping-based filtering in modal
  useEffect(() => {
    let ignore = false;
    const fetchAreasWithCounts = async () => {
      try {
        const res = await fetch(`${API_URL}/parking-areas`, { headers: authHeader });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch areas');
        if (ignore) return;
        const map = {};
        (data.parkingAreas || []).forEach(a => {
          map[a._id] = {
            Car: Number(a.carSlots || 0),
            Bike: Number(a.bikeSlots || 0),
            Van: Number(a.vanSlots || 0),
            'Three-wheeler': Number(a.threeWheelerSlots || 0)
          };
        });
        setAreaTypeMap(map);
      } catch (e) {
        // non-fatal for UI; fallback will be server-side filtering or slot vehicleType
        console.warn('Could not fetch per-type slot counts:', e);
      }
    };
    if (user?.email) fetchAreasWithCounts();
    return () => { ignore = true; };
  }, [API_URL, authHeader, user?.email]);

  const handleParkingAreaChange = async (parkingAreaId) => {
    if (!parkingAreaId) {
      setAvailableSlots([]);
      return;
    }

    try {
      const data = await getAvailableSlots(parkingAreaId, registerForm.vehicleType);
      setAvailableSlots(data.availableSlots);
      setRegisterForm(prev => ({ ...prev, parkingAreaId, slotNumber: '' }));
    } catch (err) {
      console.error('Error fetching available slots:', err);
    }
  };
  
  const handleVehicleTypeChange = async (vehicleType) => {
    setRegisterForm(prev => ({ ...prev, vehicleType, slotNumber: '' }));
    if (selectedParkingArea) {
      try {
        const data = await getAvailableSlots(selectedParkingArea, vehicleType);
        setAvailableSlots(data.availableSlots);
      } catch (err) {
        console.error('Error fetching available slots:', err);
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validate all fields
    const errors = {};
    const trimmedPlate = String(registerForm.plate || '').trim().toUpperCase();
    const trimmedEmail = String(registerForm.userEmail || '').trim();
    const trimmedName = String(registerForm.userName || '').trim();
    const trimmedPhone = String(registerForm.userPhone || '').trim();
    
    if (!selectedParkingArea) errors.parkingArea = 'Please select a parking area';
    if (!registerForm.slotNumber) errors.slotNumber = 'Please select a slot';
    if (!trimmedPlate) errors.plate = 'Vehicle plate is required';
    else if (!isValidPlate(trimmedPlate)) errors.plate = 'Plate must be 4-15 characters (A-Z, 0-9, -)';
    if (!trimmedName) errors.userName = 'User name is required';
    if (!trimmedEmail) errors.userEmail = 'User email is required';
    else if (!isValidEmail(trimmedEmail)) errors.userEmail = 'Please enter a valid email address';
    if (trimmedPhone && !isValidPhone(trimmedPhone)) errors.userPhone = 'Please enter a valid phone number';
    
    setRegisterFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setRegisterLoading(true);

    try {
      await registerUserAndAssignSlot({
        ...registerForm,
        plate: trimmedPlate,
        userEmail: trimmedEmail,
        userName: trimmedName,
        userPhone: trimmedPhone
      });
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
      setRegisterFieldErrors({});
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
    try {
      await recalculateSlotCounts(parkingAreaId);
      alert('Slot counts recalculated successfully!');
    } catch (err) {
      console.error('Error recalculating slots:', err);
      alert('Failed to recalculate slots: ' + err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-background text-destructive">
      Error: {error}
    </div>
  );

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Slot Management</h1>
            <p className="text-muted-foreground">Monitor and manage parking slots in real-time.</p>
          </div>
          <Button onClick={() => setShowRegisterForm(!showRegisterForm)}>
            {showRegisterForm ? 'Cancel' : <><Plus className="mr-2 h-4 w-4" /> Register Vehicle</>}
          </Button>
        </div>

        {/* Register Form */}
        <AnimatePresence>
          {showRegisterForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm overflow-hidden"
            >
              <h2 className="text-xl font-bold mb-4">Register New Vehicle</h2>
              {registerError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {registerError}
                </div>
              )}
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <select
                      value={selectedParkingArea}
                      onChange={(e) => {
                        setSelectedParkingArea(e.target.value);
                        handleParkingAreaChange(e.target.value);
                        setRegisterFieldErrors(prev => ({ ...prev, parkingArea: undefined }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border bg-background ${
                        registerFieldErrors.parkingArea ? 'border-red-500' : 'border-input'
                      }`}
                    >
                      <option value="">Select Parking Area</option>
                      {parkingAreas.map(area => (
                        <option key={area._id} value={area._id}>{area.name}</option>
                      ))}
                    </select>
                    {registerFieldErrors.parkingArea && (
                      <p className="mt-1 text-sm text-red-600">{registerFieldErrors.parkingArea}</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex gap-2">
                      <input
                        value={registerForm.slotNumber}
                        readOnly
                        placeholder="Slot Number"
                        className={`flex-1 px-4 py-2 rounded-lg border bg-muted ${
                          registerFieldErrors.slotNumber ? 'border-red-500' : 'border-input'
                        }`}
                      />
                      <Button type="button" variant="outline" onClick={async () => { if (selectedParkingArea) { try { const data = await getAvailableSlots(selectedParkingArea, registerForm.vehicleType); setAvailableSlots(data.availableSlots); } catch(_){} } setShowSlotPopup(true); }} disabled={!selectedParkingArea}>
                        Select Slot
                      </Button>
                    </div>
                    {registerFieldErrors.slotNumber && (
                      <p className="mt-1 text-sm text-red-600">{registerFieldErrors.slotNumber}</p>
                    )}
                  </div>

                  <div>
                    <input
                      placeholder="Vehicle Plate"
                      value={registerForm.plate}
                      onChange={(e) => {
                        setRegisterForm({...registerForm, plate: e.target.value});
                        setRegisterFieldErrors(prev => ({ ...prev, plate: undefined }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border bg-background ${
                        registerFieldErrors.plate ? 'border-red-500' : 'border-input'
                      }`}
                    />
                    {registerFieldErrors.plate && (
                      <p className="mt-1 text-sm text-red-600">{registerFieldErrors.plate}</p>
                    )}
                  </div>
                  <select
                    value={registerForm.vehicleType}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background"
                  >
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Van">Van</option>
                    <option value="Three-wheeler">Three-wheeler</option>
                  </select>
                  <div>
                    <input
                      placeholder="User Name"
                      value={registerForm.userName}
                      onChange={(e) => {
                        setRegisterForm({...registerForm, userName: e.target.value});
                        setRegisterFieldErrors(prev => ({ ...prev, userName: undefined }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border bg-background ${
                        registerFieldErrors.userName ? 'border-red-500' : 'border-input'
                      }`}
                    />
                    {registerFieldErrors.userName && (
                      <p className="mt-1 text-sm text-red-600">{registerFieldErrors.userName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      placeholder="User Email"
                      type="email"
                      value={registerForm.userEmail}
                      onChange={(e) => {
                        setRegisterForm({...registerForm, userEmail: e.target.value});
                        setRegisterFieldErrors(prev => ({ ...prev, userEmail: undefined }));
                      }}
                      className={`w-full px-4 py-2 rounded-lg border bg-background ${
                        registerFieldErrors.userEmail ? 'border-red-500' : 'border-input'
                      }`}
                    />
                    {registerFieldErrors.userEmail && (
                      <p className="mt-1 text-sm text-red-600">{registerFieldErrors.userEmail}</p>
                    )}
                  </div>
                </div>
                <Button type="submit" disabled={registerLoading} className="w-full">
                  {registerLoading ? 'Registering...' : 'Register & Assign Slot'}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Parking Areas Grid */}
        <div className="grid gap-8">
          {parkingAreas.map(area => (
            <motion.div 
              key={area._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">{area.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    Available: {area.availableSlots} / {area.totalSlots}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleRecalculateSlots(area._id)}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Sync
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleInitializeSlots(area._id)}>
                    Initialize
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Active Vehicles</h3>
                {currentVehicles.filter(v => v.parkingAreaId?._id === area._id || v.parkingAreaId === area._id).length === 0 ? (
                  <p className="text-muted-foreground text-sm italic">No vehicles currently parked.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentVehicles
                      .filter(v => v.parkingAreaId?._id === area._id || v.parkingAreaId === area._id)
                      .map(vehicle => (
                        <div key={vehicle._id} className="bg-background border border-border p-4 rounded-lg flex justify-between items-center">
                          <div>
                            <div className="font-bold text-foreground">{vehicle.plate}</div>
                            <div className="text-xs text-muted-foreground">Slot {vehicle.slotNumber}  {vehicle.vehicleType}</div>
                          </div>
                          <Button size="sm" variant="destructive" onClick={() => handleExitVehicle(vehicle._id)}>
                            <LogOut className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    }
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      <SelectSlotPopup
        isOpen={showSlotPopup}
        slots={availableSlots}
        vehicleType={registerForm.vehicleType}
        typeDistribution={areaTypeMap[selectedParkingArea || registerForm.parkingAreaId]}
        slotNumberBase={(() => {
          const area = parkingAreas.find(a => a._id === (selectedParkingArea || registerForm.parkingAreaId));
          if (!area || !Array.isArray(area.slots) || area.slots.length === 0) return undefined;
          let min = Infinity;
          for (const s of area.slots) {
            if (typeof s.slotNumber === 'number' && s.slotNumber < min) min = s.slotNumber;
          }
          return Number.isFinite(min) ? min : undefined;
        })()}
        onClose={() => setShowSlotPopup(false)}
        onSelect={(slotNum) => {
          setRegisterForm(prev => ({ ...prev, slotNumber: slotNum }));
          setShowSlotPopup(false);
        }}
      />
    </div>
  );
};

export default AdminSlotManagementPage;
