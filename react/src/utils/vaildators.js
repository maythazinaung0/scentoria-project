// Lightweight, dependency-free checks used for live form feedback.
// Kept separate from PasswordPolicy.js so each concern (name / email /
// password) has its own single source of truth.

export function isValidEmailFormat(email) {
  const trimmed = email.trim();
  // Pragmatic RFC-5322-lite check — good enough for client-side UX.
  // The backend's `email` validation rule is still the real source of truth.
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function isValidName(name) {
  const trimmed = name.trim();
  if (trimmed.length < 2) return false;
  // Letters (incl. accented), spaces, hyphens, apostrophes — blocks numbers/emoji/symbols.
  return /^[\p{L}][\p{L}\s'-]*$/u.test(trimmed);
}