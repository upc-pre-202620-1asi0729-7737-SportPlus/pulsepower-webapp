import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n, LocalizedDate, Translate } from '../../../../../shared/application/i18n';
import { WearableSimulatorStore } from '../../../application/wearable-simulator.store';
import { PhysiologicalStore } from '../../../application/physiological.store';
import { DAY_SCENARIOS, SimulatedDay, sleepHours } from '../../../domain/model/wearable-simulation';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-device-simulator-page',
  imports: [MatButtonModule, RouterLink, Translate, LocalizedDate, PageHeading, Feedback, Icon],
  templateUrl: './device-simulator-page.html',
  styleUrl: './device-simulator-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeviceSimulatorPage {
  readonly store = inject(WearableSimulatorStore);
  readonly physiology = inject(PhysiologicalStore);
  private readonly i18n = inject(I18n);
  readonly scenarios = DAY_SCENARIOS;
  constructor() {
    void this.store.load();
    void this.physiology.load();
  }
  activeAlerts() {
    return this.physiology
      .alerts()
      .filter((alert) => alert.reviewedAt === null)
      .slice(0, 3);
  }
  readings(day: SimulatedDay): string {
    const t = (value: string | number) => this.i18n.text(value);
    return [
      day.night && `${t('simulator.reading.sleep')}: ${t(sleepHours(day.night))} h`,
      day.workout &&
        `${t(day.workout.activity)} ${day.workout.durationMinutes} min, ` +
          `${t('simulator.reading.effort')} ${day.workout.perceivedEffort}/10`,
      day.wellness && `${t('simulator.reading.stress')} ${day.wellness.stress}/10`,
    ]
      .filter(Boolean)
      .join(' · ');
  }
  guidance(level: number): string {
    return level < 40
      ? 'simulator.guidance.rest'
      : level < 70
        ? 'simulator.guidance.reduce'
        : 'simulator.guidance.follow';
  }
}
