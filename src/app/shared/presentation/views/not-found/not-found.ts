import { MatButtonModule } from '@angular/material/button';
import { Translate } from '../../../application/i18n';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'pp-not-found',
  imports: [MatButtonModule, Translate, RouterLink],
  templateUrl: './not-found.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFound {}
