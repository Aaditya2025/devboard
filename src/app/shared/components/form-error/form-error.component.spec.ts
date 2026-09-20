import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormErrorComponent],
  template: `<app-form-error [control]="form.controls.email" label="Email" />`,
})
class RequiredFieldHostComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
  });
}

describe('FormErrorComponent', () => {
  it('shows a message from markAllAsTouched() alone, with no setErrors() call', () => {
    // Regression test: a pristine, untouched control that is already
    // invalid (Validators.required with an empty value) has its `errors`
    // populated from the start — only `touched` changes when the user hits
    // Submit. markAllAsTouched() flips that flag WITHOUT emitting through
    // statusChanges or valueChanges, so a component that only listened to
    // those two streams would never re-check itself and would silently
    // show nothing on first submit of an empty form.
    const fixture = TestBed.configureTestingModule({
      imports: [RequiredFieldHostComponent],
    }).createComponent(RequiredFieldHostComponent);
    fixture.detectChanges();

    let text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).not.toContain('is required');

    fixture.componentInstance.form.markAllAsTouched();
    fixture.detectChanges();

    text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Email is required.');
  });

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
