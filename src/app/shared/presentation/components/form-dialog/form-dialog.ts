import { Translate } from '../../../application/i18n';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Icon } from '../icon/icon';
let dialogSequence = 0;
@Component({
  selector: 'pp-form-dialog',
  imports: [Translate, Icon, MatDialogModule, MatButtonModule],
  templateUrl: './form-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDialog {
  readonly titleId = 'dialog-title-' + ++dialogSequence;
  readonly title = input.required<string>();
  readonly closed = output<void>();
  private readonly template = viewChild.required<TemplateRef<unknown>>('dialog');
  private readonly dialogs = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  private ref?: MatDialogRef<unknown>;
  constructor() {
    this.destroyRef.onDestroy(() => {
      this.ref?.close();
    });
  }
  open(): void {
    if (this.ref) return;
    this.ref = this.dialogs.open(this.template(), {
      width: '540px',
      maxWidth: 'calc(100vw - 32px)',
      maxHeight: 'calc(100dvh - 48px)',
      ariaLabelledBy: this.titleId,
      autoFocus: 'first-tabbable',
      restoreFocus: true,
      panelClass: 'pulse-dialog',
    });
    this.ref.afterClosed().subscribe(() => {
      this.ref = undefined;
      if (!this.destroyRef.destroyed) this.closed.emit();
    });
  }
  close(): void {
    this.ref?.close();
  }
}
