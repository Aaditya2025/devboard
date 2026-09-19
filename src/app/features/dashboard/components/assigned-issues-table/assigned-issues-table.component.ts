import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Issue } from '../../../../core/models';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../../shared/components/priority-badge/priority-badge.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-assigned-issues-table',
  standalone: true,
  imports: [RouterLink, StatusBadgeComponent, PriorityBadgeComponent, EmptyStateComponent],
  templateUrl: './assigned-issues-table.component.html',
  styleUrl: './assigned-issues-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignedIssuesTableComponent {
  @Input({ required: true }) issues: Issue[] = [];
}
