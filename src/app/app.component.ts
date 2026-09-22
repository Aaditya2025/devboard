import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Injected here (rather than only where Settings is used) purely to force
  // eager instantiation — SettingsService's constructor applies the saved
  // dark-mode preference immediately, before first paint, not only once
  // someone happens to visit /settings.
  private readonly settingsService = inject(SettingsService);
}
