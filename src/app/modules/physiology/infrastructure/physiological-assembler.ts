import { PhysiologicalOverview } from '../domain/model/physiological-overview';
import { PhysiologicalOverviewDto } from './physiological-overview.dto';
export function physiologicalOverview(dto: PhysiologicalOverviewDto): PhysiologicalOverview {
  return {
    available: dto.integration_available,
    connection: dto.connection
      ? {
          id: dto.connection.id,
          provider: dto.connection.provider,
          status: dto.connection.status,
          lastSyncedAt: dto.connection.last_synced_at,
        }
      : null,
    records: dto.records.map((row) => ({
      id: row.id,
      metric: row.metric,
      value: row.value,
      unit: row.unit,
      recordedAt: row.recorded_at,
    })),
    assessment: dto.recovery
      ? {
          id: dto.recovery.id,
          level: dto.recovery.level,
          calculatedAt: dto.recovery.calculated_at,
          explanation: dto.recovery.explanation,
        }
      : null,
    recommendations: dto.recommendations.map((row) => ({
      id: row.id,
      title: row.title,
      explanation: row.explanation,
      suggestedAction: row.suggested_action,
    })),
    alerts: dto.alerts.map((row) => ({
      id: row.id,
      title: row.title,
      message: row.message,
      issuedAt: row.issued_at,
      reviewedAt: row.reviewed_at,
    })),
  };
}
