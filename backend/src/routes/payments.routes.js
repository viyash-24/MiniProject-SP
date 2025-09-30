import { Router } from 'express';
import { listPayments, createPaymentIntent, confirmStripePayment } from '../controllers/payments.controller.js';
import { authRequired, requireAdmin } from '../middleware/auth.js';
import Stripe from 'stripe';
import { env } from '../config/env.js';

const r = Router();

r.get('/', authRequired, requireAdmin, listPayments);
r.post('/create-payment-intent', authRequired, createPaymentIntent);
r.post('/confirm', authRequired, confirmStripePayment);

// Stripe Checkout Session for users
r.post('/create-checkout-session', authRequired, async (req, res) => {
  try {
    const { vehicleId, amount } = req.body;
    if (!vehicleId || !amount) return res.status(400).json({ error: 'Missing vehicleId or amount' });

    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    const { Vehicle } = await import('../models/Vehicle.js');
    const v = await Vehicle.findById(vehicleId);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: v.userEmail,
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Parking for ${v.plate} (${v.vehicleType})`,
            description: `Parking charge for ${v.vehicleType}`
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      metadata: {
        vehicleId: v._id.toString(),
        plate: v.plate,
        vehicleType: v.vehicleType,
        userEmail: v.userEmail || '',
        userName: v.userName || '',
      },
      success_url: `${env.FRONTEND_URL || 'http://localhost:3000'}/payment?success=1`,
      cancel_url: `${env.FRONTEND_URL || 'http://localhost:3000'}/payment?canceled=1`,
    });
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test payment intent creation without auth (for debugging)
r.post('/test-payment-intent', async (req, res) => {
  try {
    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey || !stripeSecretKey.startsWith('sk_')) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 5000, // 50 INR in paise
      currency: 'inr',
      metadata: { test: 'true' },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      message: 'Test payment intent created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default r;
