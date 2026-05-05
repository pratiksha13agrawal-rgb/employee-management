import { AbstractControl, ValidationErrors } from '@angular/forms';

// ✅ Validator 1 — Password Match
// Checks if password and confirmPassword are same
export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {

  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (password !== confirmPassword) {
    control.get('confirmPassword')?.setErrors({ mismatch: true });
  }
  return null;
}

// ✅ Validator 2 — No Number Validator
// Input mein numbers allowed nahi hain
// Numbers are not allowed in input (e.g. username, name)
export function noNumberValidator(
  control: AbstractControl
): ValidationErrors | null {

  const value = control.value;
  const hasNumber = /[0-9]/.test(value);

  if (hasNumber) {
    return { noNumber: true };  // Error return karo
  }
  return null;  // No error
}