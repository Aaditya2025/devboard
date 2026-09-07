import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

@Component({ standalone: true, template: 'protected' })
class ProtectedComponent {}

@Component({ standalone: true, template: 'login' })
class LoginStubComponent {}

describe('authGuard', () => {
  let authService: AuthService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'protected', component: ProtectedComponent, canActivate: [authGuard] },
          { path: 'login', component: LoginStubComponent },
        ]),
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('allows navigation when the user is authenticated', async () => {
    await authService
      .login({ email: 'admin@devboard.dev', password: 'Password123!', rememberMe: true })
      .toPromise();

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/protected');

    const router = TestBed.inject(Router);
    expect(router.url).toBe('/protected');
  });

  it('redirects to /login with a returnUrl when unauthenticated', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/protected');

    const router = TestBed.inject(Router);
    expect(router.url).toContain('/login');
    expect(router.url).toContain('returnUrl');
  });
});
