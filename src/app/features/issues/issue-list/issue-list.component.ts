import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  template: `<p>Issue list (search, filter, sort, paginate) lands here in Phase 6.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueListComponent {}
