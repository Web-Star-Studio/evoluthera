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
          {
            foreignKeyName: "anamnesis_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "anamnesis_templates"
            referencedColumns: ["id"]
          },
        ]
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
      anamnesis_templates: {
        Row: {
          created_at: string
          description: string | null
          fields: Json
          id: string
          is_default: boolean | null
          name: string
          psychologist_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_default?: boolean | null
          name: string
          psychologist_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          fields?: Json
          id?: string
          is_default?: boolean | null
          name?: string
          psychologist_id?: string
          updated_at?: string
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
      [_ in never]: never
    }
    Functions: {
      create_default_anamnesis_template: {
        Args: { psychologist_uuid: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
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
