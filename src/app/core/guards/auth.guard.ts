import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guards authenticated routes. Redirects to /login (preserving the attempted
 * URL as `returnUrl`) when the user isn't authenticated.
 *
 * Frontend-only check — real authorization is enforced by the backend once
 * it exists (Phase 11); this guard is purely for UI/UX.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
