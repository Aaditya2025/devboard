import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-kanban',
  standalone: true,
  template: `<p>Kanban board — drag and drop columns land here in Phase 7.</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanComponent {}
