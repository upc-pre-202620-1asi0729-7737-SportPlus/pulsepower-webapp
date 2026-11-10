import { SupportRepository } from './shared/application/ports/support-repository';
import { LocalSupportRepository } from './shared/infrastructure/local-support-repository';
import { NotificationInbox } from './shared/application/ports/notification-inbox';
import { LocalNotificationInbox } from './shared/infrastructure/local-notification-inbox';
import { BreathingRepository } from './modules/wellness/application/ports/breathing-repository';
import { LocalBreathingRepository } from './modules/wellness/infrastructure/local-breathing-repository';
import { RecoverySource } from './modules/physiology/application/ports/recovery-source';
import { WorkspaceRecoverySource } from './shared/application/workspace-recovery-source';
import { DemoPhysiologicalRepository } from './modules/physiology/infrastructure/demo-physiological-repository';
import { PersonalPhysiologicalRepository } from './modules/physiology/infrastructure/personal-physiological-repository';
import { NotificationPreferencesRepository } from './shared/application/ports/notification-preferences-repository';
import { LocalNotificationPreferencesRepository } from './shared/infrastructure/local-notification-preferences-repository';
import { ShellState } from './shared/application/shell-state';
import { TrainingRepository } from './modules/training/application/ports/training-repository';
import { LocalTrainingRepository } from './modules/training/infrastructure/local-training-repository';
import { SleepRepository } from './modules/sleep/application/ports/sleep-repository';
import { LocalSleepRepository } from './modules/sleep/infrastructure/local-sleep-repository';
import { WellnessRepository } from './modules/wellness/application/ports/wellness-repository';
import { LocalWellnessRepository } from './modules/wellness/infrastructure/local-wellness-repository';
import { PhysiologicalRepository } from './modules/physiology/application/ports/physiological-repository';
import {
  ReportSource,
  ReportRepository,
  ReportDocument,
} from './modules/reports/application/ports/report-ports';
import { LocalReportRepository } from './modules/reports/infrastructure/local-report-repository';
import { BrowserReportDocument } from './modules/reports/infrastructure/pdf-document';
import {
  CommunityRepository,
  ActivityHistory,
} from './modules/community/application/ports/community-ports';
import { LocalCommunityRepository } from './modules/community/infrastructure/local-community-repository';
import { ProfileRepository } from './modules/iam/application/ports/profile-repository';
import { LocalProfileRepository } from './modules/iam/infrastructure/local-profile-repository';
import { IdentityGateway } from './modules/iam/application/identity.service';
import { LocalIdentityGateway } from './modules/iam/infrastructure/local-identity-gateway';
import { SubscriptionGateway } from './modules/iam/application/subscription.service';
import { LocalSubscriptionGateway } from './modules/iam/infrastructure/local-subscription-gateway';
import { WorkspaceShell } from './shared/application/workspace-shell';
import { WearableFeed } from './modules/physiology/application/ports/wearable-feed';
import { WorkspaceWearableFeed } from './shared/application/workspace-wearable-feed';
import { WorkspaceReportSource } from './shared/application/workspace-report-source';
import { WorkspaceActivityHistory } from './shared/application/workspace-activity-history';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TitleStrategy, provideRouter, withInMemoryScrolling } from '@angular/router';
import { TranslatedTitleStrategy } from './shared/application/translated-title-strategy';
import { routes } from './app.routes';
import { initializeDemo } from './shared/infrastructure/demo-data';
import { BrowserStorage } from './shared/infrastructure/browser-storage';
import { Clock } from './shared/application/clock';
import { I18n } from './shared/application/i18n';
import { TranslationLoader } from './shared/application/ports/translation-loader';
import { JsonTranslationLoader } from './shared/infrastructure/json-translation-loader';
import { BrowserPreferences } from './shared/application/ports/browser-preferences';
import { LocalBrowserPreferences } from './shared/infrastructure/local-browser-preferences';
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: BrowserPreferences, useClass: LocalBrowserPreferences },
    { provide: TranslationLoader, useClass: JsonTranslationLoader },
    provideAppInitializer(() => inject(I18n).initialize()),
    provideAppInitializer(() => initializeDemo(inject(BrowserStorage), inject(Clock))),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
    ),
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    { provide: SupportRepository, useClass: LocalSupportRepository },
    { provide: NotificationInbox, useClass: LocalNotificationInbox },
    { provide: BreathingRepository, useClass: LocalBreathingRepository },
    { provide: RecoverySource, useClass: WorkspaceRecoverySource },
    { provide: WearableFeed, useClass: WorkspaceWearableFeed },
    {
      provide: NotificationPreferencesRepository,
      useClass: LocalNotificationPreferencesRepository,
    },
    { provide: ShellState, useClass: WorkspaceShell },
    { provide: TrainingRepository, useClass: LocalTrainingRepository },
    { provide: SleepRepository, useClass: LocalSleepRepository },
    { provide: WellnessRepository, useClass: LocalWellnessRepository },
    DemoPhysiologicalRepository,
    PersonalPhysiologicalRepository,
    {
      provide: PhysiologicalRepository,
      useFactory: () =>
        inject(BrowserStorage).isDemo
          ? inject(DemoPhysiologicalRepository)
          : inject(PersonalPhysiologicalRepository),
    },
    { provide: ReportSource, useClass: WorkspaceReportSource },
    { provide: ReportRepository, useClass: LocalReportRepository },
    { provide: ReportDocument, useClass: BrowserReportDocument },
    { provide: CommunityRepository, useClass: LocalCommunityRepository },
    { provide: ActivityHistory, useClass: WorkspaceActivityHistory },
    { provide: ProfileRepository, useClass: LocalProfileRepository },
    { provide: IdentityGateway, useClass: LocalIdentityGateway },
    { provide: SubscriptionGateway, useClass: LocalSubscriptionGateway },
  ],
};
