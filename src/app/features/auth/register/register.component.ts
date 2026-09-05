import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-register',
  standalone: true,
  template: `<p>Registration page — implemented in Phase 3 (Authentication).</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {}
