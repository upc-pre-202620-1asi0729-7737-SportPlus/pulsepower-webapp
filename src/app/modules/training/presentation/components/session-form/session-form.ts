import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SessionCommand, PlannedActivity } from '../../../application/training.store';
import { Translate } from '../../../../../shared/application/i18n';
@Component({
  selector: 'pp-session-form',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    Translate,
  ],
  templateUrl: './session-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionForm {
  readonly initial = input.required<SessionCommand>();
  readonly activities = input.required<readonly PlannedActivity[]>();
  readonly busy = input(false);
  readonly submitted = output<SessionCommand>();
  readonly cancelled = output<void>();
  form!: SessionCommand;
  constructor() {
    effect(() => {
      this.form = { ...this.initial() };
    });
  }
}
