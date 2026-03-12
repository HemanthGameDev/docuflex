export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      documents: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          content_type: string
          template_id: string | null
          format: string
          file_path: string | null
          file_url: string | null
          file_size: number
          metadata: Json
          version_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          content_type?: string
          template_id?: string | null
          format: string
          file_path?: string | null
          file_url?: string | null
          file_size?: number
          metadata?: Json
          version_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          content_type?: string
          template_id?: string | null
          format?: string
          file_path?: string | null
          file_url?: string | null
          file_size?: number
          metadata?: Json
          version_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'documents_template_id_fkey'
            columns: ['template_id']
            isOneToOne: false
            referencedRelation: 'templates'
            referencedColumns: ['id']
          },
        ]
      }
      document_versions: {
        Row: {
          id: string
          document_id: string
          version_number: number
          content_snapshot: string
          title: string
          content_type: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          document_id: string
          version_number?: number
          content_snapshot: string
          title: string
          content_type?: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          document_id?: string
          version_number?: number
          content_snapshot?: string
          title?: string
          content_type?: string
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'document_versions_document_id_fkey'
            columns: ['document_id']
            isOneToOne: false
            referencedRelation: 'documents'
            referencedColumns: ['id']
          },
        ]
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          structure: Json
          html_template: string
          css_styles: string
          preview_image: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          structure?: Json
          html_template?: string
          css_styles?: string
          preview_image?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          structure?: Json
          html_template?: string
          css_styles?: string
          preview_image?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Document = Database['public']['Tables']['documents']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
