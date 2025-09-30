import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/CheckoutForm';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RmDSjPrn4yDohxSkl5YV6mJzkaSPclh2x8CLIezDjDieRPyDAs65Le8T39u2EVIfzT9Ee3bCObxKfAcU7X4uJlg00Le36dWLJ');

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
  const [testConnection, setTestConnection] = useState(null); // null = not tested, true = working, false = failed
  const [initialLoad, setInitialLoad] = useState(true); // Loading state for initial vehicle fetch
  const [loadingProgress, setLoadingProgress] = useState(0); // Loading progress for payment setup
  const [stripeTest, setStripeTest] = useState(null); // null = not tested, true = working, false = failed

  // Test Stripe loading
  const testStripeLoading = async () => {
    try {
      console.log('🧪 Testing Stripe.js loading...');
      const response = await fetch(`${API_URL}/payments/test-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (response.ok && data.clientSecret) {
        console.log('✅ Stripe test clientSecret received:', data.clientSecret.substring(0, 20) + '...');
        setStripeTest(true);
        toast.success('✅ Stripe.js is working correctly!');
      } else {
        setStripeTest(false);
        toast.error(`❌ Stripe test failed: ${data.error}`);
      }
    } catch (err) {
      console.error('❌ Stripe test failed:', err);
      setStripeTest(false);
      toast.error('❌ Stripe test failed');
    }
  };

  // Inline registration state (when user has no vehicles)
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('Car');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🔗 Testing backend connection...');
      const response = await fetch(`${API_URL}/payments/test-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      console.log('🔗 Backend connection test result:', { status: response.status, data });
      setTestConnection(response.ok);
      if (response.ok) {
        toast.success('✅ Backend connection working!');
      } else {
        toast.error(`❌ Backend error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Backend connection failed:', err);
      setTestConnection(false);
      toast.error('❌ Cannot connect to backend');
    }
  };

  // Fetch user's registered vehicles and parking charges
  React.useEffect(() => {
    const fetchVehiclesAndCharges = async () => {
      try {
        console.log('🔍 Fetching vehicles and charges for user:', user?.email);
        const [vehiclesRes, chargesRes] = await Promise.all([
          fetch(`${API_URL}/vehicles/my`, {
            headers: {
              'Content-Type': 'application/json',
              'x-user-email': user?.email || '',
            },
          }),
          fetch(`${API_URL}/parking-charges/active`)
        ]);
        console.log('📡 Vehicles response status:', vehiclesRes.status);
        console.log('📡 Charges response status:', chargesRes.status);

        const vehiclesData = await vehiclesRes.json();
        const chargesData = await chargesRes.json();
        console.log('🚗 Vehicles data:', vehiclesData);
        console.log('💰 Charges data:', chargesData);

        if (vehiclesRes.ok) setVehicles(vehiclesData.vehicles || []);
        if (chargesRes.ok) setParkingCharges(chargesData.charges || []);
      } catch (err) {
        console.error('❌ Failed to load vehicles or charges:', err);
        toast.error('Failed to load vehicles or charges');
      } finally {
        setInitialLoad(false); // End initial load
      }
    };
    if (user?.email) {
      console.log('✅ User authenticated:', user.email);
      fetchVehiclesAndCharges();
    } else {
      console.log('❌ No user email available');
    }
  }, [user?.email, API_URL]);

  // Update applicable charge when vehicle changes
  React.useEffect(() => {
    if (selectedVehicle && parkingCharges.length > 0) {
      const charge = parkingCharges.find(c => c.vehicleType === selectedVehicle.vehicleType && c.isActive);
      setApplicableCharge(charge || null);
    } else {
      setApplicableCharge(null);
    }
  }, [selectedVehicle, parkingCharges]);

  const selectVehicle = (vehicleId) => {
    const vehicle = vehicles.find(v => v._id === vehicleId);
    setSelectedVehicle(vehicle || null);
    setApplicableCharge(null);
    setClientSecret(''); // Reset payment intent on new selection
    setError(''); // Clear any errors
    setLoadingProgress(0); // Reset progress
    toast.success(`Selected vehicle: ${vehicle?.plate || vehicleId}`);
  };

  // Register a new vehicle inline and select it
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
      setVehicles(prev => [created, ...prev]);
      setSelectedVehicle(created);
      setNewPlate(''); setNewType('Car'); setNewName(''); setNewPhone('');
      toast.success('Vehicle registered');
    } catch (err) {
      setError(err.message || 'Failed to register vehicle');
    } finally {
      setLoading(false);
    }
  };

  // Helper function for retry delays
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Create payment intent for embedded Stripe Elements
  const createPaymentIntent = async () => {
    if (!selectedVehicle || !applicableCharge) {
      setError('Please select a vehicle and ensure a charge is available');
      return;
    }
    setLoading(true);
    setError('');
    setLoadingProgress(20);

    const maxRetries = 2;
    let retryCount = 0;

    const executePaymentIntent = async () => {
      const timeoutId = setTimeout(() => {
        console.error('❌ Payment intent creation timed out after 5 seconds');
        setError('Payment setup timed out. Please try again.');
      }, 5000);

      try {
        console.log('💳 Creating payment intent...');
        console.log('🚗 Selected vehicle:', selectedVehicle);
        console.log('💰 Applicable charge:', applicableCharge);
        console.log('👤 User email:', user?.email);

        const response = await fetch(`${API_URL}/payments/create-payment-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': user?.email || '',
          },
          body: JSON.stringify({ vehicleId: selectedVehicle._id, amount: applicableCharge?.amount }),
        });

        setLoadingProgress(60);

        const data = await response.json();
        console.log('📡 Payment intent response:', { status: response.status, data });

        clearTimeout(timeoutId);
        setLoadingProgress(100);

        if (response.ok && data.clientSecret) {
          setClientSecret(data.clientSecret);
          setPaymentIntentId(data.paymentIntentId || '');
          console.log('✅ Payment intent created successfully:', data.paymentIntentId);
          setTimeout(() => setLoadingProgress(0), 500);
        } else {
          throw new Error(data.error || 'Failed to create payment intent');
        }
      } catch (err) {
        clearTimeout(timeoutId);
        setLoadingProgress(0);
        console.error('❌ Error creating payment intent:', err);
        setError(err.message || 'Failed to create payment intent');
      } finally {
        setLoading(false);
      }
    };

    while (retryCount < maxRetries) {
      try {
        await executePaymentIntent();
        return; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`🔄 Retrying payment intent creation (attempt ${retryCount + 1})`);
          setLoadingProgress(10); // Reset progress for retry
          await delay(1000 * retryCount);
        } else {
          setError(`Payment setup failed after ${maxRetries} attempts. Please try again.`);
        }
      }
    }
  };

  // Auto-create PaymentIntent when vehicle and charge are ready
  React.useEffect(() => {
    if (selectedVehicle && applicableCharge && !clientSecret) {
      createPaymentIntent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, applicableCharge, clientSecret]);

  // Handle successful payment
  const onSuccessfulPayment = async (vehicle, method, intentId) => {
    console.log('Payment successful!', { vehicle, method, intentId });

    try {
      const response = await fetch(`${API_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
        body: JSON.stringify({
          paymentIntentId: intentId,
          vehicleId: vehicle._id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Payment completed successfully!');
        // Don't reset selectedVehicle here to keep the payment page state
      } else {
        throw new Error(data.error || 'Failed to confirm payment');
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      toast.error(err.message || 'Failed to confirm payment');
    }
  };


  if (error && !clientSecret) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
        <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => {
              setError('');
            }}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Block access if not logged in
  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Module</h2>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-yellow-800">You must be logged in to access the payment module.</p>
        </div>
      </div>
    );
  }

  // Show loading state on initial fetch
  if (initialLoad) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your vehicles...</p>
      </div>
    );
  }

  // If user has no vehicles after loading, show registration form inline
  if (vehicles.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Register Your Vehicle</h2>
        <p className="text-gray-600 mb-4">You have no registered vehicles. Please add one to proceed with payment.</p>
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={registerVehicle} className="space-y-4 bg-white border rounded-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
            <input
              type="text"
              value={newPlate}
              onChange={e => setNewPlate(e.target.value.toUpperCase())}
              placeholder="e.g., TN-09-AB-1234"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
            <select
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option>Car</option>
              <option>Bike</option>
              <option>Truck</option>
              <option>Scooter</option>
              <option>Bicycle</option>
              <option>Other</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name (optional)</label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input
                type="tel"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? 'Registering...' : 'Register Vehicle & Proceed'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3">After registering, your vehicle will be selected automatically so you can complete the payment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900">Payment Dashboard</h1>
      <p className="text-gray-600 mt-1">Make a secure payment for your parked vehicle.</p>

      {selectedVehicle ? (
        // --- PAYMENT SECTION ---
        <div className="mt-6 bg-white border rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">{clientSecret ? 'Complete Payment' : 'Preparing Payment'}</h2>
            <button
              onClick={() => {
                setClientSecret('');
                setSelectedVehicle(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Change Vehicle
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Payment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Vehicle:</span>
                <span className="ml-2 font-medium">{selectedVehicle.plate}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium">{selectedVehicle.vehicleType}</span>
              </div>
              <div>
                <span className="text-gray-500">Owner:</span>
                <span className="ml-2 font-medium">{selectedVehicle.userName || selectedVehicle.userEmail}</span>
              </div>
              <div>
                <span className="text-gray-500">Amount:</span>
                <span className="ml-2 font-medium">₹{applicableCharge?.amount || 0}</span>
              </div>
            </div>
          </div>

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
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                <div
                  className="absolute top-0 left-0 rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"
                  style={{
                    transform: `rotate(${loadingProgress * 3.6}deg)`,
                    transition: 'transform 0.1s ease-out'
                  }}
                ></div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${loadingProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">{loadingProgress}% Complete</p>
              </div>

              <p className="text-gray-600 mb-4">
                {loadingProgress < 30 ? 'Connecting to payment system...' :
                 loadingProgress < 60 ? 'Setting up secure payment...' :
                 loadingProgress < 100 ? 'Almost ready...' :
                 'Payment form loading...'}
              </p>

              <button
                onClick={() => {
                  setClientSecret('');
                  setSelectedVehicle(null);
                  setError('');
                  setLoadingProgress(0);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Cancel & Select Different Vehicle
              </button>
            </div>
          )}
        </div>
      ) : (
        // --- VEHICLE SELECTION --- 
        <div className="mt-6 bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Vehicle</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="vehicleDropdown" className="block text-sm font-medium text-gray-700 mb-2">
                Registered Vehicle Number
              </label>
              <select
                id="vehicleDropdown"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedVehicle?._id || ''}
                onChange={e => selectVehicle(e.target.value)}
              >
                <option value="">Select your vehicle</option>
                {vehicles.map(v => (
                  <option key={v._id} value={v._id}>
                    {v.plate} ({v.vehicleType})
                  </option>
                ))}
              </select>
            </div>

            {selectedVehicle && applicableCharge && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-blue-700 font-medium">Parking Charge for <b>{selectedVehicle.vehicleType}</b>:</div>
                  <div className="text-lg font-bold text-blue-900">₹{applicableCharge.amount} <span className="text-xs font-normal">({applicableCharge.duration})</span></div>
                  {applicableCharge.description && <div className="text-xs text-gray-500">{applicableCharge.description}</div>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;