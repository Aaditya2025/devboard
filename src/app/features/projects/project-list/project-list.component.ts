import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-project-list',
  standalone: true,
  template: `<p>Project list lands here in Phase 5.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectListComponent {}
