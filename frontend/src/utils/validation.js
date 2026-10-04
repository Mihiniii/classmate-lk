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

// Aluth password ekakata one rules (register page eke checklist eka mekenma hadanne).
// Backend eke RegisterRequest eke @Pattern ekath ekka galapenna one.
export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "An uppercase letter (A-Z)", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter (a-z)", test: (v) => /[a-z]/.test(v) },
  { label: "A number (0-9)", test: (v) => /\d/.test(v) },
  { label: "A special character (!@#$...)", test: (v) => /[^A-Za-z0-9\s]/.test(v) },
];

export function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length > 72) return "Password must be at most 72 characters";
  if (/\s/.test(value)) return "Password cannot contain spaces";
  if (!PASSWORD_RULES.every((rule) => rule.test(value))) return "Password does not meet all the rules below";
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

// Class notes: PDF witharai, 10 MB wenakan (backend eke NoteService ekath ekka galapenna one)
export const MAX_NOTE_SIZE = 10 * 1024 * 1024;

export function validatePdf(file) {
  if (!file) return "Choose a PDF file to upload";
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "Only PDF files can be uploaded";
  }
  if (file.size === 0) return "This file is empty";
  if (file.size > MAX_NOTE_SIZE) return "File is too large (max 10 MB)";
  return "";
}

// { name: "", email: "Email is required" } -> { email: "Email is required" }
export function onlyErrors(errors) {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
