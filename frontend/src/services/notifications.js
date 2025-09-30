// Stubbed notification service. Replace with EmailJS/Twilio or Firebase Cloud Functions.

export async function sendEmailReceipt({ to, amount, receiptId }) {
  if (!to) return;
  // TODO: integrate EmailJS or backend API here
  // Example with EmailJS (frontend):
  // await emailjs.send(serviceId, templateId, { to, amount, receiptId }, { publicKey });
  console.log('[notifications] email to:', to, 'amount:', amount, 'receipt:', receiptId);
}

export async function sendSmsReceipt({ to, amount, receiptId }) {
  if (!to) return;
  // TODO: call backend (Cloud Function) that uses Twilio to send SMS
  console.log('[notifications] sms to:', to, 'amount:', amount, 'receipt:', receiptId);
}
