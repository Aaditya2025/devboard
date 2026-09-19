import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { Activity } from '../../../core/models';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [RelativeTimePipe],
  templateUrl: './activity-timeline.component.html',
  styleUrl: './activity-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityTimelineComponent {
  @Input({ required: true }) activities: Activity[] = [];
}
