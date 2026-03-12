/*
  # Update Templates Table Structure

  1. Changes
    - Add html_template column to store HTML template structure
    - Add css_styles column to store CSS styling
    - Update existing templates to use new structure
    - Keep backward compatibility with structure column

  2. Security
    - RLS policies already exist from previous migration
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'html_template'
  ) THEN
    ALTER TABLE templates ADD COLUMN html_template text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'templates' AND column_name = 'css_styles'
  ) THEN
    ALTER TABLE templates ADD COLUMN css_styles text DEFAULT '';
  END IF;
END $$;
