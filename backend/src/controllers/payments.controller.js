import { Payment } from '../models/Payment.js';
import { Vehicle } from '../models/Vehicle.js';
import { ParkingCharge } from '../models/ParkingCharge.js';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { sendPaymentReceiptEmail } from '../utils/email.js';

// Initialize Stripe with environment configuration
let stripe;
try {
    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
        stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
        console.log(" Stripe initialized successfully.");
    } else {
        console.warn(" WARNING: STRIPE_SECRET_KEY is not properly configured. Stripe payments will not work.");
        stripe = null;
    }
} catch (error) {
    console.error(" ERROR: Failed to initialize Stripe:", error.message);
    stripe = null;
}

//send mail for user
async function sendEmail(details) {
  try {
    await sendPaymentReceiptEmail(details);
  } catch (err) {
    // swallow email errors to not break payment flow
    console.error('Email send failed:', err?.message || err);
  }
}

export async function listPayments(_req, res) {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json({ payments });
}

export async function createPaymentIntent(req, res) {
  const { vehicleId } = req.body;

  console.log(' Fast payment intent creation for vehicleId:', vehicleId);

  if (!stripe) {
    console.error(' Stripe not initialized');
    return res.status(500).json({ error: 'Payment system not configured' });
  }

  try {
    // Use test vehicle data if it's the test ID to skip database lookup
    let vehicleData;
    if (vehicleId === 'test') {
      vehicleData = {
        _id: 'test',
        plate: 'TEST-1234',
        vehicleType: 'Car',
        userEmail: 'test@example.com'
      };
    } else {
      // Fast vehicle lookup without population
      const vehicle = await Vehicle.findById(vehicleId).select('plate vehicleType userEmail userName userPhone').lean();
      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }
      vehicleData = vehicle;
    }

    console.log(' Vehicle found:', vehicleData.plate);

    // Resolve amount from active parking charge, with a safe default
    let amount = 50; // default fallback
    try {
      const charge = await ParkingCharge.findOne({
        vehicleType: vehicleData.vehicleType,
        isActive: true,
      }).lean();
      if (charge?.amount && charge.amount > 0) {
        amount = charge.amount;
      }
    } catch (err) {
      console.error(' Failed to load parking charge for vehicle type:', err?.message || err);
    }

    const currency = 'inr';

    // Create payment intent immediately without complex calculations
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise
      currency: currency,
      metadata: {
        vehicleId: String(vehicleData._id),
        plate: vehicleData.plate,
        userEmail: vehicleData.userEmail || 'unknown'
      },
      automatic_payment_methods: { enabled: true },
      description: `Parking payment for vehicle ${vehicleData.plate}`,
    });

    console.log(' Payment intent created instantly:', paymentIntent.id);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount,
      currency: currency.toUpperCase()
    });
  } catch (error) {
    console.error(' Fast payment intent creation failed:', error);
    res.status(500).json({ error: error.message });
  }
}

export async function confirmStripePayment(req, res) {
  const { paymentIntentId, vehicleId } = req.body;
  if (!paymentIntentId || !vehicleId) return res.status(400).json({ error: 'paymentIntentId and vehicleId are required' });

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!intent) return res.status(404).json({ error: 'PaymentIntent not found' });
    if (intent.status !== 'succeeded') return res.status(400).json({ error: `PaymentIntent not succeeded: ${intent.status}` });

    const v = await Vehicle.findById(vehicleId);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });

    // Mark vehicle paid
    v.paymentStatus = 'Paid';
    v.status = 'Paid';
    await v.save();

    // Record payment details
    const amount = (intent.amount_received ?? intent.amount) / 100;
    const p = await Payment.create({
      vehicleId: v._id,
      userId: v.userId || undefined,
      userEmail: v.userEmail || undefined,
      userName: v.userName || undefined,
      userPhone: v.userPhone || undefined,
      vehiclePlate: v.plate,
      vehicleType: v.vehicleType,
      amount,
      method: 'Stripe',
      status: 'Success',
      receiptId: intent.id,
      paymentDate: new Date(),
    });

    // Send receipt via email if available
    if (v.userEmail) {
      await sendEmail({
        to: v.userEmail,
        userName: v.userName,
        amount,
        transactionId: intent.id,
        paymentDate: p.paymentDate || p.createdAt,
        vehiclePlate: v.plate,
        vehicleType: v.vehicleType,
        slotNumber: v.slotNumber || null,
        parkingAreaName: null,
        method: 'Stripe',
      });
    }

    res.json({ vehicle: v, payment: p });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
