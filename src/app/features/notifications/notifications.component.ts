import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `<p>Notification center lands here in Phase 8.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsComponent {}
