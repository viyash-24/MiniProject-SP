import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ vehicle, paymentIntentId, onSuccessfulPayment }) => {
  const stripe = useStripe();
  const elements = useElements();

  // Added state for showing messages
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Handle submit action when user clicks "Pay Now"
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage('Stripe is not loaded. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: { return_url: window.location.href },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message);
        console.error('Payment failed:', error);
      } 
      else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setIsComplete(true);

        // Added comment for clarity
        // Calling parent function to update backend/payment history
        await onSuccessfulPayment(vehicle, 'Stripe', paymentIntentId);
      } 
      else {
        setErrorMessage('Payment was not completed. Please try again.');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Success UI message
  if (isComplete) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Your payment has been processed successfully.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* NEW small addition: display selected vehicle */}
      <div className="bg-white p-3 border rounded">
        <p className="text-sm text-gray-700">
          <strong>Vehicle:</strong> {vehicle?.name || 'Not specified'}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
            <p className="mt-2 text-sm text-blue-700">
              Your payment information is encrypted and secure. We use Stripe for processing payments.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Details</h4>
          {/* Stripe UI */}
          <PaymentElement options={{ layout: 'tabs' }} />
        </div>

        <button
          disabled={isProcessing || !stripe || !elements}
          className="w-full px-4 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span>{isProcessing ? 'Processing Payment...' : 'Pay Now'}</span>
        </button>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Payment Error</h3>
                <p className="mt-2 text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default CheckoutForm;
