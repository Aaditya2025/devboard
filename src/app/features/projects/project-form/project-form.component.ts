import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-project-form',
  standalone: true,
  template: `<p>Create/edit project form lands here in Phase 5.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent {}
