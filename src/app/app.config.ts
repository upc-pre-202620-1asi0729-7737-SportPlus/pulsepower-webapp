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
import { HttpTrainingRepository } from './modules/training/infrastructure/http-training-repository';
import { SleepRepository } from './modules/sleep/application/ports/sleep-repository';
import { HttpSleepRepository } from './modules/sleep/infrastructure/http-sleep-repository';
import { WellnessRepository } from './modules/wellness/application/ports/wellness-repository';
import { HttpWellnessRepository } from './modules/wellness/infrastructure/http-wellness-repository';
import { PhysiologicalRepository } from './modules/physiology/application/ports/physiological-repository';
import { HttpPhysiologicalRepository } from './modules/physiology/infrastructure/http-physiological-repository';
import {
  ReportSource,
  ReportRepository,
  ReportDocument,
} from './modules/reports/application/ports/report-ports';
import { HttpReportRepository } from './modules/reports/infrastructure/http-report-repository';
import { BrowserReportDocument } from './modules/reports/infrastructure/pdf-document';
import {
  CommunityRepository,
  ActivityHistory,
} from './modules/community/application/ports/community-ports';
import { HttpCommunityRepository } from './modules/community/infrastructure/http-community-repository';
import { ProfileRepository } from './modules/iam/application/ports/profile-repository';
import { HttpProfileRepository } from './modules/iam/infrastructure/http-profile-repository';
import { IdentityGateway } from './modules/iam/application/identity.service';
import { HttpIdentityGateway } from './modules/iam/infrastructure/http-identity-gateway';
import { SubscriptionGateway } from './modules/iam/application/subscription.service';
import { HttpSubscriptionGateway } from './modules/iam/infrastructure/http-subscription-gateway';
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
import { authInterceptor } from './shared/infrastructure/api';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
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
    provideHttpClient(withInterceptors([authInterceptor])),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    { provide: BrowserPreferences, useClass: LocalBrowserPreferences },
    { provide: TranslationLoader, useClass: JsonTranslationLoader },
    provideAppInitializer(() => inject(I18n).initialize()),

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
    { provide: TrainingRepository, useClass: HttpTrainingRepository },
    { provide: SleepRepository, useClass: HttpSleepRepository },
    { provide: WellnessRepository, useClass: HttpWellnessRepository },
    DemoPhysiologicalRepository,
    HttpPhysiologicalRepository,
    PersonalPhysiologicalRepository,
    {
      provide: PhysiologicalRepository,
      useFactory: () =>
        inject(PersonalPhysiologicalRepository),
    },
    { provide: ReportSource, useClass: WorkspaceReportSource },
    { provide: ReportRepository, useClass: HttpReportRepository },
    { provide: ReportDocument, useClass: BrowserReportDocument },
    { provide: CommunityRepository, useClass: HttpCommunityRepository },
    { provide: ActivityHistory, useClass: WorkspaceActivityHistory },
    { provide: ProfileRepository, useClass: HttpProfileRepository },
    { provide: IdentityGateway, useClass: HttpIdentityGateway },
    { provide: SubscriptionGateway, useClass: HttpSubscriptionGateway },
  ],
};
