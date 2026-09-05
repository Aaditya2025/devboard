import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `<p>Profile page lands here in Phase 9.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileComponent {}
