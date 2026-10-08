import { SupportRepository, SupportTicket } from './ports/support-repository';
import { Injectable, computed, inject, signal } from '@angular/core';
import { I18n } from './i18n';
import { ActionState } from './action-state';
import { Clock } from './clock';
import { requireText } from '../domain/validation';

@Injectable({ providedIn: 'root' })
export class HelpStore extends ActionState {
  private readonly repository = inject(SupportRepository);
  readonly tickets = signal<readonly SupportTicket[]>([]);
  load(): Promise<boolean> {
    return this.read(async () => this.tickets.set(this.repository.list()));
  }
  private readonly i18n = inject(I18n);
  private readonly clock = inject(Clock);
  readonly query = signal('');
  readonly supportDraft = signal<{ reference: string; description: string } | null>(null);
  readonly articles = [
    { title: 'help.records.title', body: 'help.records.body', path: '/training' },
    { title: 'help.sleep.title', body: 'help.sleep.body', path: '/sleep' },
    { title: 'help.reports.title', body: 'help.reports.body', path: '/reports' },
    { title: 'help.device.title', body: 'help.device.body', path: '/recovery' },
    { title: 'help.preferences.title', body: 'help.preferences.body', path: '/settings' },
  ];
  readonly results = computed(() => {
    const normalize = (value: string) =>
      value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase();
    const query = normalize(this.query().trim());
    return this.articles.filter((article) =>
      normalize(this.i18n.text(article.title) + ' ' + this.i18n.text(article.body)).includes(query),
    );
  });
  createSupportDraft(description: string): Promise<boolean> {
    return this.execute(async () => {
      const valid = requireText(description, 'Problem description', 2000);
      const ticket = {
        reference: 'DEMO-' + this.clock.id(),
        description: valid,
        createdAt: this.clock.now().toISOString(),
      };
      this.repository.save(ticket);
      this.supportDraft.set(ticket);
      this.tickets.set(this.repository.list());
    }, 'Support request simulated. Nothing was sent.');
  }
}
