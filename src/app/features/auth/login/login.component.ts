import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  template: `<p>Login page — implemented in Phase 3 (Authentication).</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {}
