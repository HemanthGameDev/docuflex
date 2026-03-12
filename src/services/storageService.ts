import { supabase } from '../lib/supabase';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
}

export const uploadDocument = async (
  file: Blob,
  userId: string,
  documentId: string,
  format: string
): Promise<UploadResult> => {
  const fileName = `${userId}/${documentId}.${format}`;
  const filePath = `documents/${fileName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload document: ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  return {
    url: urlData.publicUrl,
    path: filePath,
    size: file.size,
  };
};

export const deleteDocument = async (filePath: string): Promise<void> => {
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
