// Single source of truth for the password rules your backend enforces
// (see App\Http\Requests\ChangePasswordRequest:
//   Password::min(8)->mixedCase()->numbers()->symbols()).
//
// Keeping this in one place means every form — Register, Change Password,
// and anywhere else a password gets created — shows the exact same live
// checklist instead of silently drifting out of sync with the API and
// confusing users with a "requirements met" UI that the server then rejects.

export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'case', label: 'Upper & lowercase letters', test: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { key: 'number', label: 'At least one number', test: (pw) => /\d/.test(pw) },
  { key: 'symbol', label: 'At least one symbol (e.g. ! ? # -)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function getPasswordChecks(password) {
  return PASSWORD_RULES.map((rule) => ({ key: rule.key, label: rule.label, pass: rule.test(password) }));
}

export function isPasswordPolicyMet(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}