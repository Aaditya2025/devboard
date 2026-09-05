import { CanActivateFn } from '@angular/router';

/**
 * Guards authenticated routes.
 *
 * Placeholder for Phase 1 (Foundation) — always allows navigation.
 * Phase 3 (Authentication) will replace the body with a real check against
 * AuthService's authentication state, redirecting to /login when unauthenticated.
 */
export const authGuard: CanActivateFn = () => {
  return true;
};
