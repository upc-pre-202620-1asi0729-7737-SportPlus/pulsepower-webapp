import { requireChoice } from '../../../shared/domain/validation';
import { asRecord, asArray, textField } from '../../../shared/infrastructure/browser-storage';
import { ProgressReport } from '../domain/model/progress-report.entity';
import { REPORT_TYPES } from '../domain/model/report-type';
import { ProgressReportDto } from './progress-report.dto';
export const ReportAssembler = {
  decode(value: unknown): ProgressReportDto {
    const dto = asRecord(value);
    return {
      id: textField(dto, 'id'),
      from: textField(dto, 'from'),
      to: textField(dto, 'to'),
      types: asArray(dto['types']).map((type) =>
        requireChoice(String(type), REPORT_TYPES, 'report category'),
      ),
      requested_at: textField(dto, 'requested_at'),
      file_name: textField(dto, 'file_name'),
      document_base64: textField(dto, 'document_base64'),
    };
  },
  toDomain(dto: ProgressReportDto): ProgressReport {
    return {
      id: dto.id,
      from: dto.from,
      to: dto.to,
      types: dto.types.map((type) => requireChoice(type, REPORT_TYPES, 'category')),
      requestedAt: dto.requested_at,
      status: 'Completed',
      fileName: dto.file_name,
      documentRef: dto.id,
    };
  },
};
