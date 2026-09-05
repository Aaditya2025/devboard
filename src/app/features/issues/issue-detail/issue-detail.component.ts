import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-issue-detail',
  standalone: true,
  template: `<p>Issue details, comments and activity land here in Phase 6.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueDetailComponent {}
