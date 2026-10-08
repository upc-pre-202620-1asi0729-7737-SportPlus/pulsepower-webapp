import { afterNextRender, Directive, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormDialog } from '../form-dialog/form-dialog';

@Directive({ selector: 'pp-form-dialog[routeEntry]' })
export class RouteEntryDialog {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(FormDialog);
  constructor() {
    afterNextRender(() => {
      if (this.route.snapshot.data['entry']) this.dialog.open();
    });
    this.dialog.closed.subscribe(() => {
      if (this.route.snapshot.data['entry'])
        void this.router.navigate(['..'], { relativeTo: this.route, replaceUrl: true });
    });
  }
}
