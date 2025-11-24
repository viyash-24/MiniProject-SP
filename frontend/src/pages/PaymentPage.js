import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
    'pk_test_51RmDSjPrn4yDohxSkl5YV6mJzkaSPclh2x8CLIezDjDieRPyDAs65Le8T39u2EVIfzT9Ee3bCObxKfAcU7X4uJlg00Le36dWLJ'
);

const PaymentPage = () => {
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [parkingCharges, setParkingCharges] = useState([]);
  const [applicableCharge, setApplicableCharge] = useState(null);
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Inline registration state
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('Car');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch vehicles and charges
  useEffect(() => {
    const fetchVehiclesAndCharges = async () => {
      try {
        const [vehiclesRes, chargesRes] = await Promise.all([
          fetch(`${API_URL}/vehicles/my`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user?.email || '',
            },
          }),
          fetch(`${API_URL}/parking-charges/active`),
        ]);

        const vehiclesData = await vehiclesRes.json();
        const chargesData = await chargesRes.json();

        if (vehiclesRes.ok) setVehicles(vehiclesData.vehicles || []);
        if (chargesRes.ok) setParkingCharges(chargesData.charges || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load vehicles or charges');
      }
    };

    if (user?.email) fetchVehiclesAndCharges();
  }, [user?.email]);

  // Update applicable charge when vehicle changes
  useEffect(() => {
    if (selectedVehicle && parkingCharges.length > 0) {
      const charge = parkingCharges.find(
        (c) => c.vehicleType === selectedVehicle.vehicleType && c.isActive
      );
      setApplicableCharge(charge || null);
    } else {
      setApplicableCharge(null);
    }
  }, [selectedVehicle, parkingCharges]);

  const selectVehicle = (vehicleId) => {
    const vehicle = vehicles.find((v) => v._id === vehicleId);
    setSelectedVehicle(vehicle || null);
    setApplicableCharge(null);
    setClientSecret('');
    setError('');
    setLoadingProgress(0);
    toast.success(`Selected vehicle: ${vehicle?.plate || vehicleId}`);
  };

  const registerVehicle = async (e) => {
    e.preventDefault();
    setError('');
    if (!newPlate.trim()) {
      setError('Please enter a valid vehicle number');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/vehicles/my`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({
          plate: newPlate.trim(),
          vehicleType: newType,
          userName: newName || undefined,
          userPhone: newPhone || undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to register vehicle');

      const created = data.vehicle;
      setVehicles((prev) => [created, ...prev]);
      setSelectedVehicle(created);
      setNewPlate('');
      setNewType('Car');
      setNewName('');
      setNewPhone('');
      toast.success('Vehicle registered');
    } catch (err) {
      setError(err.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const createPaymentIntent = async () => {
    if (!selectedVehicle || !applicableCharge) {
      setError('Please select a vehicle and ensure a charge is available');
      return;
    }
    setLoading(true);
    setError('');
    setLoadingProgress(20);

    try {
      const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({ vehicleId: selectedVehicle._id, amount: applicableCharge?.amount }),
      });

      const data = await response.json();
      if (response.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId || '');
        setLoadingProgress(100);
        setTimeout(() => setLoadingProgress(0), 500);
      } else {
        throw new Error(data.error || 'Failed to create payment intent');
      }
    } catch (err) {
      setError(err.message || 'Failed to create payment intent');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedVehicle && applicableCharge && !clientSecret) {
      createPaymentIntent();
    }
  }, [selectedVehicle, applicableCharge, clientSecret]);

  const onSuccessfulPayment = async (vehicle, method, intentId) => {
    try {
      const response = await fetch(`${API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({ paymentIntentId: intentId, vehicleId: vehicle._id }),
      });
      const data = await response.json();
      if (response.ok) toast.success('Payment confirmed!');
      else toast.error(data.error || 'Payment confirmation failed');
    } catch (err) {
      console.error(err);
      toast.error('Payment confirmation failed');
    }
  };

  if (error && !clientSecret && !loading && vehicles.length > 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 rounded-2xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Payment Dashboard</h1>
        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 shadow-sm dark:bg-red-950/40 dark:border-red-900/70">
          <h3 className="text-sm font-semibold text-red-800 dark:text-red-200">Error</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200/80">{error}</p>
          <button
            onClick={() => setError('')}
            className="mt-3 px-4 py-2 rounded-md bg-red-600 text-white font-medium shadow-sm hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-50">Payment Dashboard</h1>
      <p className="text-gray-600 dark:text-slate-400 mt-1">Make a secure payment for your parked vehicle.</p>

      {selectedVehicle ? (
        <div className="mt-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          {/* Payment details and checkout form */}
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                vehicle={selectedVehicle}
                paymentIntentId={paymentIntentId}
                onSuccessfulPayment={onSuccessfulPayment}
              />
            </Elements>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-slate-400">Preparing payment...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50 mb-4">Select Your Vehicle</h2>
          <select
            value={selectedVehicle?._id || ''}
            onChange={(e) => selectVehicle(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          >
            <option value="">Select your vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id}>
                {v.plate} ({v.vehicleType})
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
