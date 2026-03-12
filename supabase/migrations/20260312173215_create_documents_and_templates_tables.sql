/*
  # Create Documents and Templates Tables

  ## Overview
  This migration creates the core database structure for DocuFlex, a smart content converter platform.

  ## New Tables
  
  ### `templates`
  Stores predefined document templates (Resume, Academic Report, Blog)
  - `id` (uuid, primary key)
  - `name` (text) - Template name
  - `description` (text) - Template description
  - `category` (text) - Template category
  - `structure` (jsonb) - Template structure and styling
  - `preview_image` (text) - URL to template preview image
  - `created_at` (timestamptz)
  
  ### `documents`
  Stores user documents and conversion history
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to auth.users)
  - `title` (text) - Document title
  - `content` (text) - Original content
  - `content_type` (text) - plain, markdown, or richtext
  - `template_id` (uuid, foreign key to templates)
  - `format` (text) - Output format (pdf, docx, html)
  - `file_path` (text) - Storage path for generated file
  - `file_size` (integer) - File size in bytes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Users can only read/write their own documents
  - Templates are publicly readable but only admin writable
*/

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  structure jsonb NOT NULL DEFAULT '{}'::jsonb,
  preview_image text,
  created_at timestamptz DEFAULT now()
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  content_type text NOT NULL DEFAULT 'plain',
  template_id uuid REFERENCES templates(id) ON DELETE SET NULL,
  format text NOT NULL,
  file_path text,
  file_size integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Templates policies (public read, admin write)
CREATE POLICY "Anyone can view templates"
  ON templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view templates"
  ON templates FOR SELECT
  TO anon
  USING (true);

-- Documents policies (users can only access their own documents)
CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);

-- Insert default templates
INSERT INTO templates (name, description, category, structure) VALUES
  (
    'Professional Resume',
    'Clean and modern resume template suitable for job applications',
    'resume',
    '{"fontSize": "11pt", "fontFamily": "Arial, sans-serif", "margins": "1in", "sections": ["header", "summary", "experience", "education", "skills"]}'::jsonb
  ),
  (
    'Academic Report',
    'Formal academic report template with structured sections',
    'academic',
    '{"fontSize": "12pt", "fontFamily": "Times New Roman, serif", "margins": "1in", "sections": ["title", "abstract", "introduction", "methodology", "results", "conclusion", "references"]}'::jsonb
  ),
  (
    'Blog Post',
    'Modern blog post template with engaging layout',
    'blog',
    '{"fontSize": "16px", "fontFamily": "Georgia, serif", "margins": "auto", "maxWidth": "680px", "sections": ["title", "meta", "content", "author"]}'::jsonb
  )
ON CONFLICT DO NOTHING;