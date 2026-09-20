import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** 2-6 uppercase letters, e.g. "DEV", "BILL" — matches the MOCK_PROJECTS convention. */
const PROJECT_KEY_PATTERN = /^[A-Z]{2,6}$/;

export function projectKeyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (!value) {
      return null; // let `required` own the empty case
    }
    return PROJECT_KEY_PATTERN.test(value) ? null : { projectKeyFormat: true };
  };
}

/**
 * Cross-field validator for a FormGroup with startDate/endDate controls.
 * Sets `dateRange` on the endDate control itself so `app-form-error` can
 * show it inline under that field, mirroring passwordsMatchValidator's
 * approach for the same reason (a group-level-only error has nowhere
 * natural to render).
 */
export function dateRangeValidator(
  startControlName = 'startDate',
  endControlName = 'endDate',
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const start = group.get(startControlName);
    const end = group.get(endControlName);
    if (!start || !end || !start.value || !end.value) {
      return null;
    }

    const invalid = new Date(end.value).getTime() < new Date(start.value).getTime();

    const existingErrors = end.errors;
    if (invalid) {
      end.setErrors({ ...existingErrors, dateRange: true });
    } else if (existingErrors) {
      const rest = { ...existingErrors };
      delete rest['dateRange'];
      end.setErrors(Object.keys(rest).length > 0 ? rest : null);
    }

    return null;
  };
}
