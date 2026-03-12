import type { Template } from '../types/database';
import { createHtmlBlob, createHtmlDocument } from './htmlExportService';
import { convertMarkdownToHtml } from './markdownService';
import { generatePDFFromHTML } from './pdfService';
import {
  plainTextToHtml,
  sanitizeContentForStorage,
  sanitizeHtml,
} from './sanitizationService';
import { storeGeneratedDocument } from './storageService';
import { loadTemplateById, renderTemplate } from './templateService';
import { convertHtmlToDocx } from './docxService';
import { createSignedDownloadUrl } from './downloadService';
import type { ContentType, ExportFormat } from './types';

export interface BuildDocumentOptions {
  title: string;
  content: string;
  contentType: ContentType;
  template?: Template | null;
  templateId?: string | null;
  author?: string;
  date?: string;
}

export interface PipelineInput extends BuildDocumentOptions {
  userId: string;
  format: ExportFormat;
  documentId?: string;
}

export interface PipelineResult {
  documentId: string;
  filePath: string;
  fileSize: number;
  downloadUrl: string;
  format: ExportFormat;
}

const convertToHtmlByType = (sanitizedContent: string, contentType: ContentType): string => {
  if (contentType === 'markdown') {
    return convertMarkdownToHtml(sanitizedContent);
  }

  if (contentType === 'richtext') {
    return sanitizeHtml(sanitizedContent);
  }

  return plainTextToHtml(sanitizedContent);
};

const buildTemplatedHtml = async (
  options: BuildDocumentOptions
): Promise<{
  htmlDocument: string;
  sanitizedContent: string;
  templateId: string | null;
}> => {
  const sanitizedContent = sanitizeContentForStorage(options.content, options.contentType);
  const renderedContent = convertToHtmlByType(sanitizedContent, options.contentType);
  const safeHtmlContent = sanitizeHtml(renderedContent);

  const template = options.template ?? (await loadTemplateById(options.templateId));
  const renderedTemplate = renderTemplate(template, {
    title: options.title,
    author: options.author ?? 'DocuFlex User',
    content: safeHtmlContent,
    date: options.date ?? new Date().toISOString().split('T')[0],
  });

  return {
    htmlDocument: createHtmlDocument({
      title: options.title,
      bodyHtml: renderedTemplate.bodyHtml,
      css: renderedTemplate.css,
    }),
    sanitizedContent,
    templateId: renderedTemplate.templateId,
  };
};

const generateOutput = async (
  format: ExportFormat,
  title: string,
  htmlDocument: string
): Promise<Blob> => {
  if (format === 'html') {
    return createHtmlBlob(htmlDocument);
  }

  if (format === 'docx') {
    return convertHtmlToDocx(htmlDocument);
  }

  return generatePDFFromHTML({ title, html: htmlDocument });
};

export const buildPreviewHtml = async (options: BuildDocumentOptions): Promise<string> => {
  const prepared = await buildTemplatedHtml(options);
  return prepared.htmlDocument;
};

export const runDocumentPipeline = async (
  input: PipelineInput
): Promise<PipelineResult> => {
  const prepared = await buildTemplatedHtml(input);
  const output = await generateOutput(input.format, input.title, prepared.htmlDocument);
  const stored = await storeGeneratedDocument({
    file: output,
    userId: input.userId,
    title: input.title,
    content: prepared.sanitizedContent,
    contentType: input.contentType,
    templateId: prepared.templateId,
    format: input.format,
    documentId: input.documentId,
  });
  const downloadUrl = await createSignedDownloadUrl(stored.upload.path);

  return {
    documentId: stored.document.id,
    filePath: stored.upload.path,
    fileSize: stored.upload.size,
    downloadUrl,
    format: input.format,
  };
};
