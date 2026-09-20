import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { ProjectStatus } from '../../../core/enums';

const LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.Planning]: 'Planning',
  [ProjectStatus.Active]: 'Active',
  [ProjectStatus.OnHold]: 'On Hold',
  [ProjectStatus.Completed]: 'Completed',
  [ProjectStatus.Archived]: 'Archived',
};

@Component({
  selector: 'app-project-status-badge',
  standalone: true,
  imports: [NgClass],
  templateUrl: './project-status-badge.component.html',
  styleUrl: './project-status-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectStatusBadgeComponent {
  private readonly statusSignal = signal<ProjectStatus>(ProjectStatus.Planning);

  @Input({ required: true })
  set status(value: ProjectStatus) {
    this.statusSignal.set(value);
  }
  get status(): ProjectStatus {
    return this.statusSignal();
  }

  readonly label = computed(() => LABELS[this.statusSignal()]);
  readonly cssClass = computed(
    () => `project-status-badge--${this.statusSignal().toLowerCase().replace(/_/g, '-')}`,
  );
}
