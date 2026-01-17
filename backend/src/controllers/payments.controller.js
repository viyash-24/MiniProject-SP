import { Payment } from '../models/Payment.js';
import { Vehicle } from '../models/Vehicle.js';
import { ParkingCharge } from '../models/ParkingCharge.js';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { sendPaymentReceiptEmail } from '../utils/email.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

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
    console.error('Email send failed:', err?.message || err);
  }
}

export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { vehicleId } = req.body;

  console.log(' Fast payment intent creation for vehicleId:', vehicleId);

  if (!stripe) {
    console.error(' Stripe not initialized');
    throw new AppError(503, 'Payment system not configured', 'PAYMENTS_UNAVAILABLE');
  }
  if (!vehicleId) {
    throw new AppError(400, 'vehicleId is required', 'MISSING_FIELDS', { required: ['vehicleId'] });
  }

  let vehicleData;
  if (vehicleId === 'test') {
    vehicleData = {
      _id: 'test',
      plate: 'TEST-1234',
      vehicleType: 'Car',
      userEmail: 'test@example.com'
    };
  } else {
    const vehicle = await Vehicle.findById(vehicleId)
      .select('plate vehicleType userEmail userName userPhone')
      .lean();

    if (!vehicle) {
      throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');
    }
    vehicleData = vehicle;
  }

  console.log(' Vehicle found:', vehicleData.plate);

    // -----------------------------
    // FIXED CHARGE RESOLVER
    // -----------------------------
    let amount = null;

    if (vehicleData.vehicleType) {
      const targetType = String(vehicleData.vehicleType).trim().toLowerCase();

      const charge = await ParkingCharge.findOne({
        vehicleType: new RegExp(`^${targetType}$`, 'i'),
        isActive: true
      }).lean();

      if (!charge) {
        throw new AppError(
          400,
          `No parking charge defined for vehicle type: ${vehicleData.vehicleType}. Admin must set a price.`,
          'PARKING_CHARGE_NOT_FOUND'
        );
      }

      amount = Number(charge.amount);
    }

    if (!amount || amount <= 0) {
      throw new AppError(
        400,
        `Invalid parking charge amount for ${vehicleData.vehicleType}. Admin must set a valid price.`,
        'INVALID_PARKING_CHARGE'
      );
    }


    const currency = 'lkr';

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
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
});

export const confirmStripePayment = asyncHandler(async (req, res) => {
  const { paymentIntentId, vehicleId } = req.body;
  if (!stripe) throw new AppError(503, 'Payment system not configured', 'PAYMENTS_UNAVAILABLE');
  if (!paymentIntentId || !vehicleId) {
    throw new AppError(400, 'paymentIntentId and vehicleId are required', 'MISSING_FIELDS', {
      required: ['paymentIntentId', 'vehicleId']
    });
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (!intent) throw new AppError(404, 'PaymentIntent not found', 'PAYMENT_INTENT_NOT_FOUND');
  if (intent.status !== 'succeeded') {
    throw new AppError(400, `PaymentIntent not succeeded: ${intent.status}`, 'PAYMENT_NOT_SUCCEEDED', { status: intent.status });
  }

  const v = await Vehicle.findById(vehicleId);
  if (!v) throw new AppError(404, 'Vehicle not found', 'VEHICLE_NOT_FOUND');

  v.paymentStatus = 'Paid';
  v.status = 'Paid';
  await v.save();

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
});

export const listPayments = asyncHandler(async (_req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json({ payments });
});
