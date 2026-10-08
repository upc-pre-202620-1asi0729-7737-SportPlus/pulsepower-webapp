import { Injectable, inject } from '@angular/core';
import { I18n } from '../../../shared/application/i18n';
import { WorkspaceMode } from '../../../shared/application/workspace-mode';
import { ReportDocument } from '../application/ports/report-ports';
import { ReportEntry } from '../domain/model/report-entry';
import { ReportRequest } from '../domain/model/report-request';

function pdfText(text: string): string {
  return text
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .split('')
    .map((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code <= 255 ? character : '?';
    })
    .join('')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}
function wrap(text: string, width = 88): string[] {
  const words = text.split(/\s+/),
    lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line.length + word.length + 1 > width) {
      if (line) lines.push(line);
      line = '';
    }
    if (word.length > width) {
      if (line) {
        lines.push(line);
        line = '';
      }
      for (let i = 0; i < word.length; i += width) lines.push(word.slice(i, i + width));
    } else line += (line ? ' ' : '') + word;
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}
export function createReportPdf(
  request: ReportRequest,
  entries: readonly ReportEntry[],
  text: (value: string) => string = (value) => value,
  demo = false,
): Uint8Array {
  const lines = [
    text('PULSEPOWER - PROGRESS REPORT'),
    ...(demo ? [text('Example records — not real measurements')] : []),
    request.from + ' / ' + request.to,
    text('Categories') + ': ' + request.types.map(text).join(', '),
    ...wrap(text('Source: locally recorded training, sleep and wellbeing data.')),
    ...wrap(text('Manual records are not physiological measurements or medical assessments.')),
    '',
    ...entries.flatMap((entry) =>
      wrap(entry.date + ' | ' + text(entry.type) + ' | ' + entry.summary),
    ),
    '',
    ...(request.note.trim() ? [text('NOTE'), ...wrap(request.note.trim())] : []),
  ];
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += 42) pages.push(lines.slice(index, index + 42));
  const objects: string[] = [];
  const add = (content: string): number => {
    objects.push(content);
    return objects.length;
  };
  add('<< /Type /Catalog /Pages 2 0 R >>');
  add('');
  add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const pageIds: number[] = [];
  for (const [index, page] of pages.entries()) {
    const stream =
      'BT /F1 11 Tf 50 790 Td 16 TL\n' +
      page.map((line, i) => (i ? 'T* ' : '') + '(' + pdfText(line) + ') Tj').join('\n') +
      '\nET\nBT /F1 9 Tf 50 35 Td (PulsePower | ' +
      pdfText(text('Page')) +
      ' ' +
      (index + 1) +
      ' / ' +
      pages.length +
      ') Tj ET';
    const contentId = add('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
    const pageId = add(
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ' +
        contentId +
        ' 0 R >>',
    );
    pageIds.push(pageId);
  }
  objects[1] =
    '<< /Type /Pages /Count ' +
    pages.length +
    ' /Kids [' +
    pageIds.map((id) => id + ' 0 R').join(' ') +
    '] >>';
  let output = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(output.length);
    output += index + 1 + ' 0 obj\n' + object + '\nendobj\n';
  });
  const xref = output.length;
  output += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    output += String(offset).padStart(10, '0') + ' 00000 n \n';
  });
  output +=
    'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return Uint8Array.from(output, (character) => character.charCodeAt(0));
}
@Injectable()
export class BrowserReportDocument extends ReportDocument {
  private readonly i18n = inject(I18n);
  private readonly workspace = inject(WorkspaceMode);
  async create(request: ReportRequest, entries: readonly ReportEntry[]): Promise<Uint8Array> {
    return createReportPdf(
      request,
      entries,
      (value) => this.i18n.text(value),
      this.workspace.mode === 'demo',
    );
  }
  download(bytes: Uint8Array, fileName: string): void {
    const blob = new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
      url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}
