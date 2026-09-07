import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Component } from '@angular/core';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({ standalone: true, template: 'dashboard' })
class DashboardStubComponent {}

describe('LoginComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([
          { path: 'login', component: LoginComponent },
          { path: 'dashboard', component: DashboardStubComponent },
        ]),
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('marks the form invalid when fields are empty', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);
    expect(login.form.invalid).toBe(true);
  });

  it('requires a validly formatted email', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);
    login.form.controls.email.setValue('not-an-email');
    expect(login.form.controls.email.hasError('email')).toBe(true);
  });

  it('navigates to /dashboard on successful login', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);

    login.form.setValue({
      email: 'admin@devboard.dev',
      password: 'Password123!',
      rememberMe: true,
    });
    login.submit();

    await new Promise((resolve) => setTimeout(resolve, 600));
    harness.detectChanges();

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/dashboard');
  });

  it('shows an error message on failed login without navigating', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);

    login.form.setValue({
      email: 'admin@devboard.dev',
      password: 'wrong-password',
      rememberMe: true,
    });
    login.submit();

    await new Promise((resolve) => setTimeout(resolve, 600));
    harness.detectChanges();

    expect(login.errorMessage()).toContain('Invalid email or password');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login');
  });

  it('toggles password field visibility', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);
    expect(login.hidePassword()).toBe(true);
    login.togglePasswordVisibility();
    expect(login.hidePassword()).toBe(false);
  });

  it('does not call login when the form is invalid', async () => {
    const harness = await RouterTestingHarness.create();
    const login = await harness.navigateByUrl('/login', LoginComponent);
    const authService = TestBed.inject(AuthService);
    spyOn(authService, 'login').and.callThrough();

    login.submit();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
