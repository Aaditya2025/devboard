import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IssuePriority } from '../../../core/enums';

const PRIORITY_LABELS: Record<IssuePriority, string> = {
  [IssuePriority.Low]: 'Low',
  [IssuePriority.Medium]: 'Medium',
  [IssuePriority.High]: 'High',
  [IssuePriority.Critical]: 'Critical',
};

// Icons carry priority meaning too, not just color — so it isn't communicated by color alone.
const PRIORITY_ICONS: Record<IssuePriority, string> = {
  [IssuePriority.Low]: 'keyboard_arrow_down',
  [IssuePriority.Medium]: 'remove',
  [IssuePriority.High]: 'keyboard_arrow_up',
  [IssuePriority.Critical]: 'keyboard_double_arrow_up',
};

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [NgClass, MatIconModule],
  templateUrl: './priority-badge.component.html',
  styleUrl: './priority-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityBadgeComponent {
  private readonly prioritySignal = signal<IssuePriority>(IssuePriority.Low);

  @Input({ required: true })
  set priority(value: IssuePriority) {
    this.prioritySignal.set(value);
  }
  get priority(): IssuePriority {
    return this.prioritySignal();
  }

  readonly label = computed(() => PRIORITY_LABELS[this.prioritySignal()]);
  readonly icon = computed(() => PRIORITY_ICONS[this.prioritySignal()]);
  readonly cssClass = computed(() => `priority-badge--${this.prioritySignal().toLowerCase()}`);
}
