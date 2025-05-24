export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      account_controls: {
        Row: {
          created_at: string
          id: string
          status: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          patient_id: string
          title: string
          type: string
        }
        Insert: {
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          patient_id: string
          title: string
          type: string
        }
        Update: {
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          patient_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_communications: {
        Row: {
          created_at: string
          created_by: string
          id: string
          message: string
          message_type: string
          scheduled_at: string | null
          send_email: boolean
          sent_at: string | null
          status: string
          target_type: string
          target_users: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          message: string
          message_type?: string
          scheduled_at?: string | null
          send_email?: boolean
          sent_at?: string | null
          status?: string
          target_type: string
          target_users?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          message?: string
          message_type?: string
          scheduled_at?: string | null
          send_email?: boolean
          sent_at?: string | null
          status?: string
          target_type?: string
          target_users?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          data: Json
          encrypted_data: string | null
          id: string
          locked_at: string | null
          patient_id: string
          psychologist_id: string
          sent_at: string | null
          status: string | null
          template_id: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          data: Json
          encrypted_data?: string | null
          id?: string
          locked_at?: string | null
          patient_id: string
          psychologist_id: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          data?: Json
          encrypted_data?: string | null
          id?: string
          locked_at?: string | null
          patient_id?: string
          psychologist_id?: string
          sent_at?: string | null
          status?: string | null
          template_id?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis_applications: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          locked_at: string | null
          patient_id: string
          psychologist_id: string
          psychologist_notes: Json | null
          responses: Json | null
          sent_at: string | null
          started_at: string | null
          status: string | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          patient_id: string
          psychologist_id: string
          psychologist_notes?: Json | null
          responses?: Json | null
          sent_at?: string | null
          started_at?: string | null
          status?: string | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          patient_id?: string
          psychologist_id?: string
          psychologist_notes?: Json | null
          responses?: Json | null
          sent_at?: string | null
          started_at?: string | null
          status?: string | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_applications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_applications_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_applications_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "anamnesis_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis_default_templates: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          sections: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          sections: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          sections?: Json
        }
        Relationships: []
      }
      anamnesis_notifications: {
        Row: {
          anamnesis_id: string
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          type: string
        }
        Insert: {
          anamnesis_id: string
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          type: string
        }
        Update: {
          anamnesis_id?: string
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_notifications_anamnesis_id_fkey"
            columns: ["anamnesis_id"]
            isOneToOne: false
            referencedRelation: "anamnesis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis_response_history: {
        Row: {
          application_id: string
          created_at: string | null
          created_by: string
          id: string
          responses: Json
          version_number: number
        }
        Insert: {
          application_id: string
          created_at?: string | null
          created_by: string
          id?: string
          responses: Json
          version_number: number
        }
        Update: {
          application_id?: string
          created_at?: string | null
          created_by?: string
          id?: string
          responses?: Json
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_response_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "anamnesis_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_response_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_published: boolean | null
          name: string
          psychologist_id: string
          sections: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_published?: boolean | null
          name: string
          psychologist_id: string
          sections?: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_published?: boolean | null
          name?: string
          psychologist_id?: string
          sections?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      anamnesis_versions: {
        Row: {
          anamnesis_id: string
          created_at: string
          created_by: string
          data: Json
          encrypted_data: string | null
          id: string
          status: string
          version: number
        }
        Insert: {
          anamnesis_id: string
          created_at?: string
          created_by: string
          data: Json
          encrypted_data?: string | null
          id?: string
          status: string
          version: number
        }
        Update: {
          anamnesis_id?: string
          created_at?: string
          created_by?: string
          data?: Json
          encrypted_data?: string | null
          id?: string
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "anamnesis_versions_anamnesis_id_fkey"
            columns: ["anamnesis_id"]
            isOneToOne: false
            referencedRelation: "anamnesis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anamnesis_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_metrics: {
        Row: {
          commission_amount: number | null
          commission_rate: number | null
          created_at: string
          id: string
          month_year: string
          psychologist_id: string
          revenue_amount: number | null
          sessions_count: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          month_year: string
          psychologist_id: string
          revenue_amount?: number | null
          sessions_count?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          commission_amount?: number | null
          commission_rate?: number | null
          created_at?: string
          id?: string
          month_year?: string
          psychologist_id?: string
          revenue_amount?: number | null
          sessions_count?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_metrics_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_size: number | null
          attachment_url: string | null
          conversation_id: string
          created_at: string
          edited_at: string | null
          encrypted_content: string | null
          id: string
          is_read: boolean | null
          message_content: string
          message_type: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          encrypted_content?: string | null
          id?: string
          is_read?: boolean | null
          message_content: string
          message_type?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          encrypted_content?: string | null
          id?: string
          is_read?: boolean | null
          message_content?: string
          message_type?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_settings: {
        Row: {
          auto_response_enabled: boolean | null
          auto_response_message: string | null
          chat_enabled: boolean | null
          created_at: string
          daily_message_limit: number | null
          id: string
          max_message_length: number | null
          psychologist_id: string
          updated_at: string
        }
        Insert: {
          auto_response_enabled?: boolean | null
          auto_response_message?: string | null
          chat_enabled?: boolean | null
          created_at?: string
          daily_message_limit?: number | null
          id?: string
          max_message_length?: number | null
          psychologist_id: string
          updated_at?: string
        }
        Update: {
          auto_response_enabled?: boolean | null
          auto_response_message?: string | null
          chat_enabled?: boolean | null
          created_at?: string
          daily_message_limit?: number | null
          id?: string
          max_message_length?: number | null
          psychologist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_settings_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_reads: {
        Row: {
          communication_id: string
          id: string
          read_at: string
          user_id: string
        }
        Insert: {
          communication_id: string
          id?: string
          read_at?: string
          user_id: string
        }
        Update: {
          communication_id?: string
          id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_reads_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "admin_communications"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_recipients: {
        Row: {
          communication_id: string
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          communication_id: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          communication_id?: string
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_recipients_communication_id_fkey"
            columns: ["communication_id"]
            isOneToOne: false
            referencedRelation: "admin_communications"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_message_at: string | null
          patient_id: string
          psychologist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          patient_id: string
          psychologist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_message_at?: string | null
          patient_id?: string
          psychologist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_message_usage: {
        Row: {
          created_at: string
          id: string
          message_count: number | null
          patient_id: string
          psychologist_id: string
          updated_at: string
          usage_date: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message_count?: number | null
          patient_id: string
          psychologist_id: string
          updated_at?: string
          usage_date?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message_count?: number | null
          patient_id?: string
          psychologist_id?: string
          updated_at?: string
          usage_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_message_usage_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_message_usage_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          mood_score: number | null
          patient_id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood_score?: number | null
          patient_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood_score?: number | null
          patient_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_entries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_document_versions: {
        Row: {
          changes_summary: string | null
          content: string
          content_type: string
          created_at: string
          created_by: string
          document_id: string
          id: string
          title: string
          version: number
        }
        Insert: {
          changes_summary?: string | null
          content: string
          content_type?: string
          created_at?: string
          created_by: string
          document_id: string
          id?: string
          title: string
          version: number
        }
        Update: {
          changes_summary?: string | null
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string
          document_id?: string
          id?: string
          title?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_document_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "legal_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_documents: {
        Row: {
          content: string
          content_type: string
          created_at: string
          created_by: string
          document_type: string
          id: string
          is_active: boolean
          published_at: string | null
          title: string
          updated_at: string
          updated_by: string
          version: number
        }
        Insert: {
          content: string
          content_type?: string
          created_at?: string
          created_by: string
          document_type: string
          id?: string
          is_active?: boolean
          published_at?: string | null
          title: string
          updated_at?: string
          updated_by: string
          version?: number
        }
        Update: {
          content?: string
          content_type?: string
          created_at?: string
          created_by?: string
          document_type?: string
          id?: string
          is_active?: boolean
          published_at?: string | null
          title?: string
          updated_at?: string
          updated_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "legal_documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "legal_documents_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_invoices: {
        Row: {
          active_patients_count: number
          amount_per_patient: number
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          paid_at: string | null
          payment_method: string | null
          psychologist_id: string
          reference_month: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          active_patients_count?: number
          amount_per_patient?: number
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          psychologist_id: string
          reference_month: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          active_patients_count?: number
          amount_per_patient?: number
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string | null
          psychologist_id?: string
          reference_month?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_invoices_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_records: {
        Row: {
          created_at: string
          id: string
          mood_score: number
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_score: number
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_score?: number
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mood_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_activations: {
        Row: {
          activated_at: string | null
          activation_fee: number | null
          created_at: string
          deactivated_at: string | null
          id: string
          patient_id: string
          psychologist_id: string
          status: string
          stripe_payment_intent_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          activated_at?: string | null
          activation_fee?: number | null
          created_at?: string
          deactivated_at?: string | null
          id?: string
          patient_id: string
          psychologist_id: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          activated_at?: string | null
          activation_fee?: number | null
          created_at?: string
          deactivated_at?: string | null
          id?: string
          patient_id?: string
          psychologist_id?: string
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_activations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_activations_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_stats: {
        Row: {
          created_at: string
          diary_entries_count: number | null
          id: string
          last_activity: string | null
          mood_records_count: number | null
          patient_id: string
          streak_days: number | null
          tasks_completed: number | null
          total_points: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diary_entries_count?: number | null
          id?: string
          last_activity?: string | null
          mood_records_count?: number | null
          patient_id: string
          streak_days?: number | null
          tasks_completed?: number | null
          total_points?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diary_entries_count?: number | null
          id?: string
          last_activity?: string | null
          mood_records_count?: number | null
          patient_id?: string
          streak_days?: number | null
          tasks_completed?: number | null
          total_points?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_stats_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          created_at: string
          id: string
          patient_id: string
          psychologist_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          patient_id: string
          psychologist_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          patient_id?: string
          psychologist_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          activation_id: string | null
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          patient_id: string | null
          psychologist_id: string
          status: string
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          transaction_type: string
          updated_at: string
        }
        Insert: {
          activation_id?: string | null
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          patient_id?: string | null
          psychologist_id: string
          status: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_type: string
          updated_at?: string
        }
        Update: {
          activation_id?: string | null
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          patient_id?: string | null
          psychologist_id?: string
          status?: string
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_activation_id_fkey"
            columns: ["activation_id"]
            isOneToOne: false
            referencedRelation: "patient_activations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_type: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
          user_type: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
      psychological_tests: {
        Row: {
          category: string
          code: string
          created_at: string
          description: string | null
          id: string
          interpretation_ranges: Json
          is_active: boolean | null
          name: string
          questions: Json
          scoring_rules: Json
          updated_at: string
          version: string | null
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          interpretation_ranges: Json
          is_active?: boolean | null
          name: string
          questions: Json
          scoring_rules: Json
          updated_at?: string
          version?: string | null
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          interpretation_ranges?: Json
          is_active?: boolean | null
          name?: string
          questions?: Json
          scoring_rules?: Json
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          date: string
          duration: number | null
          homework: string | null
          id: string
          mood_assessment: number | null
          notes: string
          patient_id: string
          psychologist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          duration?: number | null
          homework?: string | null
          id?: string
          mood_assessment?: number | null
          notes: string
          patient_id: string
          psychologist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          duration?: number | null
          homework?: string | null
          id?: string
          mood_assessment?: number | null
          notes?: string
          patient_id?: string
          psychologist_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_responses: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          responder_id: string
          ticket_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          responder_id: string
          ticket_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          responder_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_responses_responder_id_fkey"
            columns: ["responder_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_ticket_responses_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      task_notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read_at: string | null
          recipient_id: string
          task_id: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read_at?: string | null
          recipient_id: string
          task_id: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read_at?: string | null
          recipient_id?: string
          task_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_notifications_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_responses: {
        Row: {
          commented_at: string | null
          created_at: string
          id: string
          patient_id: string
          psychologist_comment: string | null
          response: string
          response_data: Json | null
          response_type: string | null
          task_id: string
        }
        Insert: {
          commented_at?: string | null
          created_at?: string
          id?: string
          patient_id: string
          psychologist_comment?: string | null
          response: string
          response_data?: Json | null
          response_type?: string | null
          task_id: string
        }
        Update: {
          commented_at?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          psychologist_comment?: string | null
          response?: string
          response_data?: Json | null
          response_type?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_responses_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_templates: {
        Row: {
          category: string
          created_at: string
          description: string
          estimated_duration: number | null
          id: string
          is_public: boolean | null
          name: string
          options: Json | null
          psychologist_id: string
          task_type: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          estimated_duration?: number | null
          id?: string
          is_public?: boolean | null
          name: string
          options?: Json | null
          psychologist_id: string
          task_type?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          estimated_duration?: number | null
          id?: string
          is_public?: boolean | null
          name?: string
          options?: Json | null
          psychologist_id?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_templates_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          estimated_duration: number | null
          id: string
          options: Json | null
          patient_id: string
          priority: string | null
          psychologist_id: string
          status: string
          task_type: string | null
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          options?: Json | null
          patient_id: string
          priority?: string | null
          psychologist_id: string
          status?: string
          task_type?: string | null
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_duration?: number | null
          id?: string
          options?: Json | null
          patient_id?: string
          priority?: string | null
          psychologist_id?: string
          status?: string
          task_type?: string | null
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      temporary_passwords: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          temp_password: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          temp_password: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          temp_password?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      test_applications: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          interpretation: string | null
          notes: string | null
          patient_id: string
          psychologist_id: string
          responses: Json | null
          score: number | null
          started_at: string | null
          status: string | null
          test_id: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          interpretation?: string | null
          notes?: string | null
          patient_id: string
          psychologist_id: string
          responses?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          test_id: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          interpretation?: string | null
          notes?: string | null
          patient_id?: string
          psychologist_id?: string
          responses?: Json | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          test_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_applications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_applications_psychologist_id_fkey"
            columns: ["psychologist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_applications_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "psychological_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      test_results_history: {
        Row: {
          application_id: string
          completion_date: string
          created_at: string
          id: string
          interpretation: string
          patient_id: string
          score: number
          test_code: string
          test_name: string
        }
        Insert: {
          application_id: string
          completion_date: string
          created_at?: string
          id?: string
          interpretation: string
          patient_id: string
          score: number
          test_code: string
          test_name: string
        }
        Update: {
          application_id?: string
          completion_date?: string
          created_at?: string
          id?: string
          interpretation?: string
          patient_id?: string
          score?: number
          test_code?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_results_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "test_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_results_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_metrics: {
        Row: {
          active_patients_current_month: number | null
          active_patients_previous_month: number | null
          new_patients_last_30_days: number | null
          total_psychologists: number | null
        }
        Relationships: []
      }
      billing_dashboard_stats: {
        Row: {
          month: string | null
          overdue_invoices: number | null
          paid_invoices: number | null
          pending_invoices: number | null
          total_active_patients: number | null
          total_billed: number | null
          total_invoices: number | null
          total_received: number | null
        }
        Relationships: []
      }
      monthly_evolution: {
        Row: {
          count: number | null
          cumulative_count: number | null
          metric_type: string | null
          month: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_estimated_revenue: {
        Args: { target_month?: string }
        Returns: number
      }
      check_daily_message_limit: {
        Args: { p_patient_id: string; p_psychologist_id: string }
        Returns: boolean
      }
      create_default_anamnesis_template: {
        Args: { psychologist_uuid: string }
        Returns: string
      }
      create_document_version: {
        Args: {
          doc_type: string
          new_title: string
          new_content: string
          new_content_type?: string
          changes_summary?: string
          creator_id?: string
        }
        Returns: string
      }
      generate_invoice_number: {
        Args: { psychologist_uuid: string; ref_month: string }
        Returns: string
      }
      generate_monthly_invoices: {
        Args: { target_month?: string }
        Returns: number
      }
      generate_temp_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_active_document: {
        Args: { doc_type: string }
        Returns: {
          id: string
          title: string
          content: string
          content_type: string
          version: number
          published_at: string
          updated_at: string
        }[]
      }
      get_admin_setting: {
        Args: { key_name: string }
        Returns: Json
      }
      get_unread_communications: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          message: string
          message_type: string
          created_at: string
          sender_name: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      mark_communication_as_read: {
        Args: { communication_uuid: string }
        Returns: boolean
      }
      reopen_support_ticket: {
        Args: { ticket_id: string; reopener_id?: string }
        Returns: boolean
      }
      resolve_support_ticket: {
        Args: { ticket_id: string; resolver_id?: string }
        Returns: boolean
      }
      update_admin_setting: {
        Args: { key_name: string; new_value: Json; updated_by_user?: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
