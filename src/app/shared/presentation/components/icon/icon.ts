import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'pulse'
  | 'home'
  | 'training'
  | 'sleep'
  | 'wellness'
  | 'calendar'
  | 'reports'
  | 'community'
  | 'settings'
  | 'arrow'
  | 'plus'
  | 'check'
  | 'menu'
  | 'close'
  | 'device'
  | 'spark'
  | 'download'
  | 'bell'
  | 'logout';
const paths: Record<IconName, string> = {
  pulse: 'M2 12h5l3-8 4 16 3-8h5',
  home: 'm3 10 9-7 9 7v10H3z M9 20v-7h6v7',
  training: 'M7 4v16 M4 7v10 M17 4v16 M20 7v10 M7 12h10',
  sleep: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
  wellness: 'M12 21s-9-5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 7-9 12-9 12Z',
  calendar: 'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 14h2 M14 14h2 M8 17h2',
  reports: 'M5 3h10l4 4v14H5z M14 3v5h5 M8 17v-4 M12 17v-7 M16 17v-5',
  community:
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M2 21v-3c0-5 14-5 14 0v3 M17 4a4 4 0 0 1 0 7 M19 14c3 0 3 3 3 5v2',
  settings:
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z',
  arrow: 'M5 12h14 m-6-6 6 6-6 6',
  plus: 'M12 5v14 M5 12h14',
  check: 'm5 12 4 4L19 6',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  close: 'm6 6 12 12 M18 6 6 18',
  device: 'M9 2h6v4 M9 18v4h6v-4 M6 6h12v12H6z M9 12h2l1-3 2 6 1-3',
  spark: 'm12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3z',
  download: 'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
  bell: 'M5 17h14l-2-3V9a5 5 0 0 0-10 0v5z M10 21h4',
  logout: 'M10 4H4v16h6 M10 12h11 m-4-4 4 4-4 4',
};
@Component({
  selector: 'pp-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input<IconName>('pulse');
  get path(): string {
    return paths[this.name()];
  }
}
