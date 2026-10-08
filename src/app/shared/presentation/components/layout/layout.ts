import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { NotificationCenter } from '../../../application/notification-center';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ShellState } from '../../../application/shell-state';
import { Clock } from '../../../application/clock';
import { I18n, Translate, TranslationKey } from '../../../application/i18n';
import { Icon, IconName } from '../icon/icon';
import { WorkspaceMode } from '../../../application/workspace-mode';
import { ProfileStore } from '../../../../modules/iam/application/profile.store';
import { IdentityService } from '../../../../modules/iam/application/identity.service';
interface NavItem {
  path: string;
  label: TranslationKey;
  icon: IconName;
  children?: { label: string; path: string }[];
}
const SHARED_NAV: NavItem[] = [{ path: '/home', label: 'home', icon: 'home' }];
const ATHLETE_NAV: NavItem[] = [
  {
    path: '/training',
    label: 'training',
    icon: 'training',
    children: [
      { label: 'Summary', path: '/training' },
      { label: 'Log Session', path: '/training/log' },
    ],
  },
  {
    path: '/sleep',
    label: 'sleep',
    icon: 'sleep',
    children: [
      { label: 'Summary', path: '/sleep' },
      { label: 'Log Night', path: '/sleep/log' },
    ],
  },
  {
    path: '/wellness',
    label: 'wellness',
    icon: 'wellness',
    children: [
      { label: 'Summary', path: '/wellness' },
      { label: 'Log Check-in', path: '/wellness/log' },
    ],
  },
  { path: '/planning', label: 'planning', icon: 'calendar' },
];
const WELLNESS_NAV: NavItem[] = [
  {
    path: '/sleep',
    label: 'sleep',
    icon: 'sleep',
    children: [
      { label: 'Summary', path: '/sleep' },
      { label: 'Log Night', path: '/sleep/log' },
    ],
  },
  {
    path: '/wellness',
    label: 'wellness',
    icon: 'wellness',
    children: [
      { label: 'Summary', path: '/wellness' },
      { label: 'Log Check-in', path: '/wellness/log' },
    ],
  },
];
const TRAILING_NAV: NavItem[] = [
  { path: '/reports', label: 'reports', icon: 'reports' },
  { path: '/community', label: 'community', icon: 'community' },
];
@Component({
  selector: 'pp-layout',
  imports: [
    MatToolbarModule,
    MatMenuModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    Icon,
    Translate,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'menuOpen.set(false)' },
})
export class Layout {
  readonly notifications = inject(NotificationCenter);
  readonly workspace = inject(WorkspaceMode);
  readonly i18n = inject(I18n);
  readonly shell = inject(ShellState);
  private readonly profile = inject(ProfileStore);
  readonly identity = inject(IdentityService);
  private readonly router = inject(Router);
  private readonly clock = inject(Clock);
  readonly menuOpen = signal(false);
  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  readonly nav = computed<NavItem[]>(() => {
    const focus = this.profile.profile()?.focus;
    const focusNav = focus === 'Wellness Seeker' ? WELLNESS_NAV : focus === 'Athlete' ? ATHLETE_NAV : [];
    return [...SHARED_NAV, ...focusNav, ...TRAILING_NAV];
  });
  readonly title = computed(() => {
    const path = this.currentUrl().split(/[?#]/)[0];
    if (path === '/training/log') return 'Training — Log Session';
    if (path === '/sleep/log') return 'Sleep — Log Night';
    if (path === '/wellness/log') return 'Wellness — Log Check-in';
    if (path === '/training') return 'Training — Summary';
    if (path === '/sleep') return 'Sleep — Summary';
    if (path === '/wellness') return 'Wellness — Summary';
    if (path === '/subscription') return 'Subscription';
    if (path === '/settings') return 'Settings';
    if (path === '/help') return 'Help center';
    if (path === '/recovery') return 'Recovery & insights';
    return (
      this.nav()
        .find((item) => item.path === path)
        ?.label.replace(/^./, (letter) => letter.toUpperCase()) ?? 'PulsePower'
    );
  });
  readonly date = computed(() =>
    new Intl.DateTimeFormat(this.i18n.locale(), {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(this.clock.now()),
  );
  constructor() {
    void this.shell.initialize();
    void this.profile.load();
    void this.notifications.start();
    effect(() => {
      this.currentUrl();
      this.menuOpen.set(false);
    });
  }
  async signOut(): Promise<void> {
    this.identity.signOut();
    if (await this.router.navigateByUrl('/sign-in')) this.identity.reloadDemo();
  }
}
