import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface PasswordStrengthErrors {
  minLength?: true;
  requiresUppercase?: true;
  requiresLowercase?: true;
  requiresNumber?: true;
}

/**
 * Requires a minimum length plus at least one uppercase letter, one
 * lowercase letter, and one digit. Used on registration (and anywhere else
 * a new password is being set) so the rule lives in exactly one place.
 */
export function passwordStrengthValidator(minLength = 8): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) {
      return null; // let `required` own the empty case
    }

    const errors: PasswordStrengthErrors = {};
    if (value.length < minLength) {
      errors.minLength = true;
    }
    if (!/[A-Z]/.test(value)) {
      errors.requiresUppercase = true;
    }
    if (!/[a-z]/.test(value)) {
      errors.requiresLowercase = true;
    }
    if (!/[0-9]/.test(value)) {
      errors.requiresNumber = true;
    }

    return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
  };
}

/**
 * Cross-field validator for a FormGroup containing both a password and a
 * confirmation field. Sets `passwordMismatch` on the confirm control itself
 * (not just the group) so `app-form-error` can display it inline under that
 * field without any extra wiring.
 */
export function passwordsMatchValidator(
  passwordControlName = 'password',
  confirmControlName = 'confirmPassword',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordControlName);
    const confirm = group.get(confirmControlName);
    if (!password || !confirm) {
      return null;
    }

    const mismatch = !!confirm.value && confirm.value !== password.value;

    const existingErrors = confirm.errors;
    if (mismatch) {
      confirm.setErrors({ ...existingErrors, passwordMismatch: true });
    } else if (existingErrors) {
      const rest = { ...existingErrors };
      delete rest['passwordMismatch'];
      confirm.setErrors(Object.keys(rest).length > 0 ? rest : null);
    }

    return null;
  };
}
