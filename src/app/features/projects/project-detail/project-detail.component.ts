import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  template: `<p>Project details (overview, issues, members, sprints, activity) land here in Phase 5.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailComponent {}
