export interface GuidanceAlert {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly issuedAt: string;
  readonly reviewedAt: string | null;
}
