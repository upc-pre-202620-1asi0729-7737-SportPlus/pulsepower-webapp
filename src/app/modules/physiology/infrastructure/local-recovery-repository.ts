import { Injector, inject } from '@angular/core';
import { PhysiologicalRepository } from '../application/ports/physiological-repository';
import { RecoverySimulationStore } from '../application/recovery-simulation.store';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { classifyQuestion, guideAnswer } from '../domain/model/recovery-guide';
import { physiologicalOverview } from './physiological-assembler';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { Clock } from '../../../shared/application/clock';
import { I18n } from '../../../shared/application/i18n';
interface DeviceState {
  status: 'Connected' | 'Disconnected' | 'Pending';
  battery: number;
  warned: boolean;
  lastSyncedAt: string | null;
}
/**
 * Calculates recovery, alerts, recommendations and recovery-guide answers from the
 * records saved in this browser. It stands in for the backend until the Web Services
 * expose these features; subclasses only decide where wearable measurements come from.
 */
export abstract class LocalRecoveryRepository extends PhysiologicalRepository {
  protected readonly clock = inject(Clock);
  protected readonly simulation = inject(RecoverySimulationStore);
  protected readonly storage = inject(BrowserStorage);
  private readonly injector = inject(Injector);
  protected abstract readonly provider: string;
  protected abstract readonly basis: string;
  protected abstract measurements(timestamp: string): Promise<PhysiologicalOverviewDto['records']>;
  protected suggestion(score: number | null): string {
    return score === null
      ? 'No recovery data for today.'
      : score < 40
        ? 'Demo suggestion: rest or reschedule.'
        : score < 70
          ? 'Demo suggestion: reduce intensity.'
          : 'Demo suggestion: follow your plan.';
  }
  override async deviceScenario(
    outcome: 'success' | 'denied' | 'error' | 'disconnected',
    battery: number,
  ): Promise<PhysiologicalOverview> {
    if (!Number.isFinite(battery) || battery < 0 || battery > 100)
      throw Error('Battery must be between 0 and 100.');
    const old = this.storage.read<{ warned: boolean }>(
      'demo-device',
      (v) => v as { warned: boolean },
      () => ({ warned: false }),
    );
    this.storage.write('demo-device', {
      status:
        outcome === 'success' ? 'Connected' : outcome === 'error' ? 'Pending' : 'Disconnected',
      battery,
      warned: battery > 15 ? false : old.warned,
      lastSyncedAt: outcome === 'success' ? this.clock.now().toISOString() : null,
    });
    return this.load();
  }
  async load(): Promise<PhysiologicalOverview> {
    await this.simulation.load();
    const timestamp = this.clock.now().toISOString(),
      last = this.simulation.last(),
      score = last?.score ?? null;
    const device = this.storage.read<DeviceState>(
      'demo-device',
      (v) => v as DeviceState,
      () => ({ status: 'Connected', battery: 80, warned: false, lastSyncedAt: timestamp }),
    );
    const alerts = this.storage.read<PhysiologicalOverviewDto['alerts']>(
      'guidance-alerts',
      (v) => v as PhysiologicalOverviewDto['alerts'],
      () => [],
    );
    const add = (type: string, title: string, message: string) => {
      const id = type + '-' + this.clock.today();
      const row = { id, title, message, issued_at: timestamp, reviewed_at: null };
      const old = alerts.findIndex((a) => a.id === id);
      if (old < 0) alerts.unshift(row);
      else alerts[old] = { ...row, issued_at: alerts[old]!.issued_at };
    };
    if (score !== null && score < 40 && (last?.effort ?? 0) >= 7)
      add(
        'load',
        'Simulated training alert',
        'Recovery below 40 and perceived effort at least 7. Demonstration thresholds only.',
      );
    if (this.simulation.sleepAlert())
      add('sleep', 'Simulated sleep alert', 'Three consecutive nights below your sleep target.');
    if (device.status === 'Connected' && device.battery < 15 && !device.warned) {
      alerts.unshift({
        id: 'battery-' + this.clock.id(),
        title: 'Simulated low battery alert',
        message: 'Wearable battery below 15%.',
        issued_at: timestamp,
        reviewed_at: null,
      });
      this.storage.write('demo-device', { ...device, warned: true });
    }
    this.storage.write('guidance-alerts', alerts);
    const enough = this.simulation.days() >= 3;
    return physiologicalOverview({
      integration_available: true,
      connection: {
        id: 'demo-device',
        provider: this.provider,
        status: device.status,
        last_synced_at: device.lastSyncedAt,
      },
      records: await this.measurements(timestamp),
      recovery:
        score === null
          ? null
          : {
              id: 'demo-recovery',
              level: score,
              calculated_at: timestamp,
              explanation: 'Recovery simulation',
            },
      recommendations: [
        {
          id: 'demo-recommendation',
          title: this.suggestion(score),
          explanation:
            this.basis +
            ' · ' +
            (enough
              ? ''
              : 'Preliminary recommendation. Missing days:' + ' · ' + (3 - this.simulation.days())),
          suggested_action:
            (last?.planned
              ? 'A workout is planned today. Review its intensity in Planning.' + ' · '
              : '') + this.simulation.goal(),
        },
        {
          id: 'sleep-recommendation',
          title: 'Sleep routine',
          explanation:
            this.simulation.days() < 5
              ? 'Missing days:' + ' · ' + (5 - this.simulation.days())
              : this.simulation.sleepAlert()
                ? 'Review your bedtime to meet your saved sleep target.'
                : 'Review your last five nights against your sleep target.',
          suggested_action: 'Your sleep target' + ' · ' + this.simulation.targetHours() + ' h',
        },
      ],
      alerts,
    });
  }
  async synchronize(): Promise<PhysiologicalOverview> {
    return this.deviceScenario(
      'success',
      this.storage.read<{ battery: number }>(
        'demo-device',
        (v) => v as { battery: number },
        () => ({ battery: 80 }),
      ).battery,
    );
  }
  async ask(
    conversation: AssistantConversation | null,
    message: string,
  ): Promise<AssistantConversation> {
    const overview = await this.load();
    const i18n = this.injector.get(I18n);
    const answer = guideAnswer(classifyQuestion(message), {
      rows: this.simulation.rows(),
      targetHours: this.simulation.targetHours(),
      alerts: overview.alerts.filter((alert) => alert.reviewedAt === null),
    });
    const createdAt = this.clock.now().toISOString();
    return {
      id: conversation?.id ?? this.clock.id(),
      messages: [
        ...(conversation?.messages ?? []),
        { id: this.clock.id(), role: 'user', content: message, createdAt },
        {
          id: this.clock.id(),
          role: 'assistant',
          content: answer.map((sentence) => i18n.format(sentence.key, sentence.values)).join(' '),
          createdAt,
        },
      ],
    };
  }
}
