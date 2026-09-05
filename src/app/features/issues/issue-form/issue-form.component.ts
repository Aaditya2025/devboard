import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  template: `<p>Create/edit issue form lands here in Phase 6.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueFormComponent {}
