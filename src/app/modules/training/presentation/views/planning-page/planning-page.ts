import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Translate, LocalizedDate } from '../../../../../shared/application/i18n';
import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TrainingStore,
  ActivityCommand,
  PlannedActivity,
} from '../../../application/training.store';
import { PageHeading } from '../../../../../shared/presentation/components/page-heading/page-heading';
import { FormDialog } from '../../../../../shared/presentation/components/form-dialog/form-dialog';
import { Feedback } from '../../../../../shared/presentation/components/feedback/feedback';
import { Icon } from '../../../../../shared/presentation/components/icon/icon';

@Component({
  selector: 'pp-planning-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    Translate,
    FormsModule,
    LocalizedDate,
    RouterLink,
    PageHeading,
    FormDialog,
    Feedback,
    Icon,
  ],
  templateUrl: './planning-page.html',
  styleUrl: './planning-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanningPage {
  readonly store = inject(TrainingStore);
  periodFrom = this.store.today;
  periodTo = this.store.days()[6]!;
  readonly previous = (value: number): number => value - 1;
  readonly next = (value: number): number => value + 1;
  readonly editingId = signal<string | null>(null);
  form: ActivityCommand = this.blank();
  acceptOverlap = false;
  constructor() {
    void this.store.load();
    effect(() => {
      const period = this.store.period();
      if (period) {
        this.periodFrom = period.from;
        this.periodTo = period.to;
      }
    });
  }
  open(dialog: FormDialog, date = this.store.today): void {
    this.acceptOverlap = false;
    this.store.clearScheduleConflicts();
    this.editingId.set(null);
    this.form = { ...this.blank(), date };
    dialog.open();
  }
  edit(dialog: FormDialog, activity: PlannedActivity): void {
    this.acceptOverlap = false;
    this.store.clearScheduleConflicts();
    this.editingId.set(activity.id);
    this.form = { ...activity };
    dialog.open();
  }
  async save(dialog: FormDialog): Promise<void> {
    const id = this.editingId();
    const saved = id
      ? await this.store.reschedule(id, this.form.date, this.form.startTime, this.acceptOverlap)
      : await this.store.planActivity(this.form, this.acceptOverlap);
    if (saved) dialog.close();
  }
  private blank(): ActivityCommand {
    return {
      date: this.store.today,
      startTime: null,
      activity: '',
      durationMinutes: 30,
      intensity: 'Medium',
      kind: 'Workout',
    };
  }
}
