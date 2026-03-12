import { supabase } from '../lib/supabase';
import type { Document } from '../types/database';
import type { ContentType, ExportFormat } from './types';

export interface UploadResult {
  path: string;
  size: number;
}

export interface DocumentMetadataInput {
  documentId?: string;
  userId: string;
  title: string;
  content: string;
  contentType: ContentType;
  templateId?: string | null;
  format: ExportFormat;
  filePath: string;
  fileSize: number;
}

export interface StoredDocumentResult {
  upload: UploadResult;
  document: Document;
}

export const uploadDocument = async (
  file: Blob,
  userId: string,
  documentId: string,
  format: ExportFormat
): Promise<UploadResult> => {
  const filePath = `${userId}/${documentId}.${format}`;

  const { error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }

  return {
    path: filePath,
    size: file.size,
  };
};

export const saveDocumentMetadata = async (
  input: DocumentMetadataInput
): Promise<Document> => {
  const payload = {
    id: input.documentId,
    user_id: input.userId,
    title: input.title,
    content: input.content,
    content_type: input.contentType,
    template_id: input.templateId ?? null,
    format: input.format,
    file_path: input.filePath,
    file_size: input.fileSize,
    metadata: {
      generated_at: new Date().toISOString(),
      pipeline: 'documentPipeline',
    },
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('documents')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to save metadata: ${error?.message || 'Unknown error'}`);
  }

  return data as Document;
};

export const storeGeneratedDocument = async ({
  file,
  userId,
  title,
  content,
  contentType,
  templateId,
  format,
  documentId,
}: {
  file: Blob;
  userId: string;
  title: string;
  content: string;
  contentType: ContentType;
  templateId?: string | null;
  format: ExportFormat;
  documentId?: string;
}): Promise<StoredDocumentResult> => {
  const resolvedDocumentId = documentId ?? crypto.randomUUID();
  const upload = await uploadDocument(file, userId, resolvedDocumentId, format);
  const document = await saveDocumentMetadata({
    documentId: resolvedDocumentId,
    userId,
    title,
    content,
    contentType,
    templateId,
    format,
    filePath: upload.path,
    fileSize: upload.size,
  });

  return { upload, document };
};

export const deleteDocumentAsset = async (filePath: string): Promise<void> => {
  const { error } = await supabase.storage
    .from('documents')
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete document: ${error.message}`);
  }
};

export const downloadDocument = async (filePath: string): Promise<Blob> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download document: ${error.message}`);
  }

  return data;
};
