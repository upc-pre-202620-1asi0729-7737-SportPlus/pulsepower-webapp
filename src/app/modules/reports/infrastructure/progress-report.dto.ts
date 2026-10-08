export interface ProgressReportDto {
  id: string;
  from: string;
  to: string;
  types: string[];
  requested_at: string;
  file_name: string;
  document_base64: string;
}
