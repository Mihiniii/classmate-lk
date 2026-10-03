// Form validation: hama function ekakma error message eka denawa, hari nam "" denawa.
// Rules backend eke DTO walata galapenna one (RegisterRequest, ClassRequest, ...).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const MAX_AMOUNT = 1_000_000;

export function validateEmail(value, label = "Email") {
  const v = value.trim();
  if (!v) return `${label} is required`;
  if (v.length > 255) return `${label} is too long`;
  if (!EMAIL_PATTERN.test(v)) return "Enter a valid email address";
  return "";
}

export function validateText(value, label, { min = 1, max }) {
  const v = value.trim();
  if (!v) return `${label} is required`;
  if (v.length < min) return `${label} must be at least ${min} characters`;
  if (v.length > max) return `${label} must be at most ${max} characters`;
  return "";
}

export function validateName(value) {
  const error = validateText(value, "Name", { min: 2, max: 100 });
  if (error) return error;
  if (!/\p{L}/u.test(value)) return "Name must contain letters";
  return "";
}

export function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 6) return "Password must be at least 6 characters";
  if (value.length > 72) return "Password must be at most 72 characters";
  return "";
}

// Mudal: sampurna sankyawak (cents naha), 0 idan MAX_AMOUNT wenakan
export function validateAmount(value, label) {
  const v = String(value).trim();
  if (v === "") return `${label} is required`;
  if (!/^\d+$/.test(v)) return `${label} must be a whole number, 0 or more`;
  if (Number(v) > MAX_AMOUNT) return `${label} cannot be more than ${MAX_AMOUNT.toLocaleString()}`;
  return "";
}

// { name: "", email: "Email is required" } -> { email: "Email is required" }
export function onlyErrors(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
