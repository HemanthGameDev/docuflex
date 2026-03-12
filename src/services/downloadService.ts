import { supabase } from '../lib/supabase';

const DEFAULT_EXPIRY_SECONDS = 60 * 10;

export const createSignedDownloadUrl = async (
  filePath: string,
  expiresInSeconds: number = DEFAULT_EXPIRY_SECONDS
): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || 'Failed to create signed URL');
  }

  return data.signedUrl;
};

export const triggerDownload = (url: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadFromStorage = async (
  filePath: string,
  filename: string,
  expiresInSeconds: number = DEFAULT_EXPIRY_SECONDS
): Promise<string> => {
  const signedUrl = await createSignedDownloadUrl(filePath, expiresInSeconds);
  triggerDownload(signedUrl, filename);
  return signedUrl;
};
