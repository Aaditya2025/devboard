import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormErrorComponent } from './form-error.component';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorComponent],
  template: `<app-form-error [control]="form.controls.confirm" label="Confirm" />`,
})
class HostComponent {
  form = new FormGroup({
    password: new FormControl('Password123!'),
    confirm: new FormControl(''),
  });
}

describe('FormErrorComponent', () => {
  it('shows a message set imperatively on the control via setErrors, without any event on the component itself', () => {
    const fixture = TestBed.configureTestingModule({ imports: [HostComponent] }).createComponent(
      HostComponent,
    );
    fixture.detectChanges();

    const confirmControl = fixture.componentInstance.form.controls.confirm;
    confirmControl.markAsTouched();
    // Simulates what passwordsMatchValidator does: set an error on a
    // *sibling* control from a group-level validator, with no DOM event
    // ever occurring inside FormErrorComponent's own template.
    confirmControl.setErrors({ passwordMismatch: true });

    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Passwords do not match.');
  });

  it('clears the message once the control errors are cleared', () => {
    const fixture = TestBed.configureTestingModule({ imports: [HostComponent] }).createComponent(
      HostComponent,
    );
    fixture.detectChanges();

    const confirmControl = fixture.componentInstance.form.controls.confirm;
    confirmControl.markAsTouched();
    confirmControl.setErrors({ passwordMismatch: true });
    fixture.detectChanges();

    confirmControl.setErrors(null);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('Passwords do not match.');
  });
});
