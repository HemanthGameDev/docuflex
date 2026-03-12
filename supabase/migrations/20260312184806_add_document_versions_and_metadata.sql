/*
  # Add Document Versions and Enhanced Metadata

  1. Changes
    - Add document_size column to documents table
    - Add metadata fields to documents table
    - Create document_versions table for version history
    - Add indexes for better query performance

  2. New Tables
    - `document_versions`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key to documents)
      - `version_number` (integer)
      - `content_snapshot` (text)
      - `title` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, foreign key to auth.users)

  3. Security
    - Enable RLS on document_versions table
    - Add policies for authenticated users to manage their versions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE documents ADD COLUMN metadata jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'documents' AND column_name = 'version_count'
  ) THEN
    ALTER TABLE documents ADD COLUMN version_count integer DEFAULT 1;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  content_snapshot text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  content_type text NOT NULL DEFAULT 'plain',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(document_id, version_number)
);

ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own document versions"
  ON document_versions
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create own document versions"
  ON document_versions
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete own document versions"
  ON document_versions
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_created_at ON document_versions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_user_format ON documents(user_id, format);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
