import { supabase } from '../lib/supabase';

export interface DocumentVersion {
  id: string;
  document_id: string;
  version_number: number;
  content_snapshot: string;
  title: string;
  content_type: string;
  created_at: string;
  created_by: string;
}

export const createVersion = async (
  documentId: string,
  title: string,
  content: string,
  contentType: string,
  userId: string
): Promise<DocumentVersion | null> => {
  const { data: existingVersions } = await supabase
    .from('document_versions')
    .select('version_number')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false })
    .limit(1);

  const nextVersionNumber = existingVersions && existingVersions.length > 0
    ? existingVersions[0].version_number + 1
    : 1;

  const { data, error } = await supabase
    .from('document_versions')
    .insert({
      document_id: documentId,
      version_number: nextVersionNumber,
      content_snapshot: content,
      title,
      content_type: contentType,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating version:', error);
    return null;
  }

  await supabase
    .from('documents')
    .update({ version_count: nextVersionNumber })
    .eq('id', documentId);

  return data as DocumentVersion;
};

export const getVersionHistory = async (
  documentId: string
): Promise<DocumentVersion[]> => {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('version_number', { ascending: false });

  if (error) {
    console.error('Error fetching version history:', error);
    return [];
  }

  return data as DocumentVersion[];
};

export const restoreVersion = async (
  versionId: string
): Promise<DocumentVersion | null> => {
  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('id', versionId)
    .single();

  if (error || !data) {
    console.error('Error restoring version:', error);
    return null;
  }

  return data as DocumentVersion;
};
