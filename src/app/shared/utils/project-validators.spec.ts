import { FormControl, FormGroup } from '@angular/forms';
import { dateRangeValidator, projectKeyValidator } from './project-validators';

describe('projectKeyValidator', () => {
  const validator = projectKeyValidator();

  it('allows a valid 2-6 uppercase letter key', () => {
    expect(validator(new FormControl('DEV'))).toBeNull();
    expect(validator(new FormControl('BILL'))).toBeNull();
  });

  it('rejects lowercase letters', () => {
    expect(validator(new FormControl('dev'))).toEqual({ projectKeyFormat: true });
  });

  it('rejects keys shorter than 2 or longer than 6 characters', () => {
    expect(validator(new FormControl('D'))).toEqual({ projectKeyFormat: true });
    expect(validator(new FormControl('TOOLONGKEY'))).toEqual({ projectKeyFormat: true });
  });

  it('rejects numbers or symbols', () => {
    expect(validator(new FormControl('DEV1'))).toEqual({ projectKeyFormat: true });
  });

  it('does not flag an empty value (leaves that to `required`)', () => {
    expect(validator(new FormControl(''))).toBeNull();
  });
});

describe('dateRangeValidator', () => {
  function buildGroup(startDate: string, endDate: string): FormGroup {
    return new FormGroup(
      {
        startDate: new FormControl(startDate),
        endDate: new FormControl(endDate),
      },
      { validators: [dateRangeValidator()] },
    );
  }

  it('sets no error when end is after start', () => {
    const group = buildGroup('2026-01-01', '2026-06-01');
    expect(group.get('endDate')?.errors).toBeNull();
  });

  it('sets dateRange on the end control when end is before start', () => {
    const group = buildGroup('2026-06-01', '2026-01-01');
    expect(group.get('endDate')?.errors).toEqual({ dateRange: true });
  });

  it('allows end date equal to start date', () => {
    const group = buildGroup('2026-01-01', '2026-01-01');
    expect(group.get('endDate')?.errors).toBeNull();
  });

  it('clears a previously-set dateRange error once corrected', () => {
    const group = buildGroup('2026-06-01', '2026-01-01');
    expect(group.get('endDate')?.errors).toEqual({ dateRange: true });

    group.get('endDate')?.setValue('2026-12-01');
    expect(group.get('endDate')?.errors).toBeNull();
  });

  it('preserves other errors already on the end control', () => {
    const group = buildGroup('2026-06-01', '2026-01-01');
    group.get('endDate')?.setErrors({ ...group.get('endDate')?.errors, required: true });
    group.get('startDate')?.setValue('2026-06-02'); // re-trigger group validator

    expect(group.get('endDate')?.errors).toEqual({ required: true, dateRange: true });
  });
});
