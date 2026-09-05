import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `<p>Settings page lands here in Phase 9.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
