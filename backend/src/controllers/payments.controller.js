import { Payment } from '../models/Payment.js';
import { Vehicle } from '../models/Vehicle.js';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

// Initialize Stripe with environment configuration
let stripe;
try {
    const stripeSecretKey = env.STRIPE_SECRET_KEY;
    if (stripeSecretKey && stripeSecretKey.startsWith('sk_')) {
        stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
        console.log("✅ Stripe initialized successfully.");
    } else {
        console.warn("⚠️ WARNING: STRIPE_SECRET_KEY is not properly configured. Stripe payments will not work.");
        stripe = null;
    }
} catch (error) {
    console.error("❌ ERROR: Failed to initialize Stripe:", error.message);
    stripe = null;
}

async function sendEmail(to, subject, html) {
  try {
    if (!env.EMAIL_USER || !env.EMAIL_PASS) return;
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
    });
    await transporter.sendMail({ from: env.EMAIL_USER, to, subject, html });
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
  
  console.log('Creating payment intent for vehicleId:', vehicleId);
  
  if (!stripe) {
    console.error('Stripe is not initialized');
    return res.status(500).json({ error: 'Stripe is not configured. Please check your environment variables.' });
  }

  const vehicle = await Vehicle.findById(vehicleId);
  if (!vehicle) {
    console.error('Vehicle not found:', vehicleId);
    return res.status(404).json({ error: 'Vehicle not found' });
  }

  console.log('Found vehicle:', vehicle.plate);

  // Calculate amount based on parking duration or use flat rate
  const amount = 50; // INR
  const currency = 'inr'; // Use INR consistently

  try {
    console.log('Creating Stripe payment intent...');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to paise (smallest currency unit)
      currency: currency,
      metadata: { 
        vehicleId: String(vehicle._id), 
        plate: vehicle.plate,
        userEmail: vehicle.userEmail || 'unknown'
      },
      automatic_payment_methods: { enabled: true },
      description: `Parking payment for vehicle ${vehicle.plate}`,
    });
    
    console.log('Payment intent created successfully:', paymentIntent.id);
    
    res.json({ 
      clientSecret: paymentIntent.client_secret, 
      paymentIntentId: paymentIntent.id, 
      amount, 
      currency: currency.toUpperCase() 
    });
  } catch (error) {
    console.error('Stripe payment intent creation failed:', error);
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

    // Record payment
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
      await sendEmail(
        v.userEmail,
        `Parking Payment Receipt - ${v.plate}`,
        `<h3>Payment Successful</h3>
         <p>Vehicle: <b>${v.plate}</b></p>
         <p>Amount: <b>₹ ${amount}</b></p>
         <p>Method: <b>Stripe</b></p>
         <p>Receipt: <b>${intent.id}</b></p>
         <p>Thank you for using our Smart Parking System.</p>`
      );
    }

    res.json({ vehicle: v, payment: p });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
