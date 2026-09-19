import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

export interface ProjectProgressDatum {
  projectId: string;
  projectName: string;
  progress: number;
}

@Component({
  selector: 'app-project-progress-list',
  standalone: true,
  imports: [EmptyStateComponent],
  templateUrl: './project-progress-list.component.html',
  styleUrl: './project-progress-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectProgressListComponent {
  @Input({ required: true }) projects: ProjectProgressDatum[] = [];
}
