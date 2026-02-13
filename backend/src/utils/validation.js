export function isValidEmail(email) {
  const value = String(email || '').trim();
  // Simple, practical email check (not RFC-perfect)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function normalizePhone(phone) {
  const raw = String(phone || '').trim();
  if (!raw) return '';
  // Keep leading +, strip other non-digits
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/\D/g, '');
  return (hasPlus ? '+' : '') + digits;
}

export function isValidPhone(phone) {
  const normalized = normalizePhone(phone);
  if (!normalized) return true; // treat empty as valid (optional field)
  const digits = normalized.startsWith('+') ? normalized.slice(1) : normalized;
  // E.164-ish length (very common practical constraint)
  return /^\d{7,15}$/.test(digits);
}

export function normalizePlate(plate) {
  return String(plate || '').trim().toUpperCase();
}

export function isValidPlate(plate) {
  const value = normalizePlate(plate);
  if (!value) return false;
  // Allow letters/numbers and '-' with a sane length
  return /^[A-Z0-9-]{4,15}$/.test(value);
}
