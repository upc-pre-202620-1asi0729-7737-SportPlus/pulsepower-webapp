import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { I18n, Translate } from '../../../../../shared/application/i18n';
import { PhysiologicalStore } from '../../../application/physiological.store';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { EmptyState } from '../../../../../shared/presentation/components/empty-state/empty-state';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';
@Component({
  selector: 'pp-assistant-page',
  imports: [MatButtonModule, FormsModule, Translate, PageHeading, EmptyState, Feedback, Icon],
  templateUrl: './assistant-page.html',
  styleUrl: './assistant-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssistantPage {
  readonly store = inject(PhysiologicalStore);
  private readonly i18n = inject(I18n);
  readonly question = signal('');
  readonly suggestions = [
    'guide.suggestion.sleep',
    'guide.suggestion.training',
    'guide.suggestion.stress',
    'guide.suggestion.plans',
  ];
  constructor() {
    void this.store.load();
  }
  async ask(): Promise<void> {
    if (await this.store.ask(this.question())) this.question.set('');
  }
  async askSuggestion(key: string): Promise<void> {
    await this.store.ask(this.i18n.text(key));
  }
}
