import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `<p>Dashboard — statistics, charts and activity land here in Phase 4.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
