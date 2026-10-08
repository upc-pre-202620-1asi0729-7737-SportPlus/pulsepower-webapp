import { Injectable, inject } from '@angular/core';
import { PhysiologicalRepository } from '../application/ports/physiological-repository';
import { RecoverySimulationStore } from '../application/recovery-simulation.store';
import { AssistantConversation } from '../domain/model/assistant-conversation.entity';
import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { physiologicalOverview } from './physiological-assembler';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
import { BrowserStorage } from '../../../shared/infrastructure/browser-storage';
import { Clock } from '../../../shared/application/clock';
@Injectable()
export class DemoPhysiologicalRepository extends PhysiologicalRepository {
  private readonly clock = inject(Clock);
  private readonly simulation = inject(RecoverySimulationStore);
  private readonly storage = inject(BrowserStorage);
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
    const device = this.storage.read<{
      status: 'Connected' | 'Disconnected' | 'Pending';
      battery: number;
      warned: boolean;
      lastSyncedAt: string | null;
    }>(
      'demo-device',
      (v) =>
        v as {
          status: 'Connected' | 'Disconnected' | 'Pending';
          battery: number;
          warned: boolean;
          lastSyncedAt: string | null;
        },
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
    const action =
      score === null
        ? 'No recovery data for today.'
        : score < 40
          ? 'Demo suggestion: rest or reschedule.'
          : score < 70
            ? 'Demo suggestion: reduce intensity.'
            : 'Demo suggestion: follow your plan.';
    return physiologicalOverview({
      integration_available: true,
      connection: {
        id: 'demo-device',
        provider: 'AIoTI — DEMO',
        status: device.status,
        last_synced_at: device.lastSyncedAt,
      },
      records: [
        { id: 'demo-hrv', metric: 'HRV', value: 68, unit: 'ms', recorded_at: timestamp },
        {
          id: 'demo-resting-hr',
          metric: 'RESTING_HR',
          value: 56,
          unit: 'bpm',
          recorded_at: timestamp,
        },
      ],
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
          title: action,
          explanation:
            'Demonstration only: sleep hours, stress and perceived effort are used, not wearable measurements.' +
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
    await this.simulation.load();
    const createdAt = this.clock.now().toISOString();
    const values = this.simulation
      .rows()
      .slice(-7)
      .flatMap((r) => (r.score === null ? [] : [r.score]));
    const content =
      values.length < 7
        ? 'Missing days:' + ' · ' + (7 - values.length)
        : 'Simulated estimate for the next week if these habits continue:' +
          ' · ' +
          Math.round(values.reduce((a, b) => a + b, 0) / 7) +
          '% · ' +
          'This is an illustrative estimate, not a medical prediction.';
    return {
      id: conversation?.id ?? this.clock.id(),
      messages: [
        ...(conversation?.messages ?? []),
        { id: this.clock.id(), role: 'user', content: message, createdAt },
        { id: this.clock.id(), role: 'assistant', content, createdAt },
      ],
    };
  }
}
