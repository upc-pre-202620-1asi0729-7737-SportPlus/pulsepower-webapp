import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { Translate } from '../../../../../shared/application/i18n';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CheckInCommand } from '../../../application/wellness.store';
@Component({
  selector: 'pp-check-in-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    Translate,
    FormsModule,
  ],
  templateUrl: './check-in-form.html',
  styleUrl: './check-in-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckInForm {
  readonly date = input.required<string>();
  readonly initial = input<CheckInCommand | null>(null);
  readonly compact = input(false);
  readonly busy = input(false);
  readonly submitted = output<CheckInCommand>();
  readonly moods = [
    { value: 1, face: '😴', label: 'Overall state 1 of 5' },
    { value: 2, face: '😕', label: 'Overall state 2 of 5' },
    { value: 3, face: '😐', label: 'Overall state 3 of 5' },
    { value: 4, face: '🙂', label: 'Overall state 4 of 5' },
    { value: 5, face: '💪', label: 'Overall state 5 of 5' },
  ];
  form: CheckInCommand = { date: '', mood: 0, stress: 5, discomfort: false, notes: '' };
  constructor() {
    effect(() => {
      this.form = {
        ...(this.initial() ?? {
          date: this.date(),
          mood: 0,
          stress: 5,
          discomfort: false,
          notes: '',
        }),
      };
    });
  }
}
