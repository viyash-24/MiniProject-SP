import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ThemeProvider } from "./context/ThemeContext";
// TODO: Replace with your own Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RmDSjPrn4yDohxSkl5YV6mJzkaSPclh2x8CLIezDjDieRPyDAs65Le8T39u2EVIfzT9Ee3bCObxKfAcU7X4uJlg00Le36dWLJ');

// Render the application with AuthProvider, ThemeProvider, and Stripe Elements
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);