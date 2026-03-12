import type { Template } from '../types/database';
import { runDocumentPipeline } from './documentPipeline';
import { triggerDownload } from './downloadService';
import type { ContentType, ExportFormat } from './types';

export interface ExportOptions {
  userId: string;
  title: string;
  content: string;
  contentType: ContentType;
  format: ExportFormat;
  template?: Template | null;
  templateId?: string | null;
  documentId?: string;
}

export const exportDocument = async (options: ExportOptions) => {
  const result = await runDocumentPipeline({
    userId: options.userId,
    title: options.title,
    content: options.content,
    contentType: options.contentType,
    format: options.format,
    template: options.template,
    templateId: options.templateId,
    documentId: options.documentId,
  });

  triggerDownload(result.downloadUrl, `${options.title}.${options.format}`);
  return result;
};
