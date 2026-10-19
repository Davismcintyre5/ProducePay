import { format as formatFns, parseISO } from 'date-fns';

export function formatKes(amount) {
  const n = Number(amount || 0);
  return `KES ${n.toLocaleString('en-KE', { maximumFractionDigits: 2 })}`;
}

export function formatKg(weight) {
  const n = Number(weight || 0);
  return `${n.toLocaleString('en-KE', { maximumFractionDigits: 2 })} kg`;
}

export function formatDate(input) {
  if (!input) return '';
  try {
    const date = typeof input === 'string' ? parseISO(input) : new Date(input);
    return formatFns(date, 'dd MMM yyyy');
  } catch {
    return '';
  }
}

export function formatDateTime(input) {
  if (!input) return '';
  try {
    const date = typeof input === 'string' ? parseISO(input) : new Date(input);
    return formatFns(date, 'dd MMM yyyy HH:mm');
  } catch {
    return '';
  }
}

export function formatPhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('254')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return phone;
}