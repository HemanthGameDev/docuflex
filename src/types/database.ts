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
          created_at?: string
          updated_at?: string
        }
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
      }
    }
  }
}

export type Document = Database['public']['Tables']['documents']['Row']
export type Template = Database['public']['Tables']['templates']['Row']
