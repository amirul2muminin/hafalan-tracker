export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      hafalan_baru_logs: {
        Row: {
          id: string
          student_id: string
          juz_id: number
          from_page: number
          from_line: number
          to_page: number
          to_line: number
          total_lines: number
          pages: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          juz_id: number
          from_page: number
          from_line: number
          to_page: number
          to_line: number
          total_lines: number
          pages?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          juz_id?: number
          from_page?: number
          from_line?: number
          to_page?: number
          to_line?: number
          total_lines?: number
          pages?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hafalan_baru_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      persiapan_ujian_logs: {
        Row: {
          id: string
          student_id: string
          juz_id: number
          exam_type: Database["public"]["Enums"]["exam_type"]
          juz_part: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          juz_id: number
          exam_type: Database["public"]["Enums"]["exam_type"]
          juz_part: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          juz_id?: number
          exam_type?: Database["public"]["Enums"]["exam_type"]
          juz_part?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "persiapan_ujian_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      ujian_logs: {
        Row: {
          id: string
          student_id: string
          juz_id: number
          exam_type: Database["public"]["Enums"]["exam_type"]
          juz_part: number
          result: Database["public"]["Enums"]["exam_result"]
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          juz_id: number
          exam_type: Database["public"]["Enums"]["exam_type"]
          juz_part: number
          result: Database["public"]["Enums"]["exam_result"]
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          juz_id?: number
          exam_type?: Database["public"]["Enums"]["exam_type"]
          juz_part?: number
          result?: Database["public"]["Enums"]["exam_result"]
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ujian_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      murojaah_logs: {
        Row: {
          id: string
          student_id: string
          juz_id: number
          total_pages: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          student_id: string
          juz_id: number
          total_pages: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          juz_id?: number
          total_pages?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "murojaah_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      murojaah_cycles: {
        Row: {
          created_at: string
          current_day: number
          current_pages: number
          id: string
          student_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_day?: number
          current_pages?: number
          id?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_day?: number
          current_pages?: number
          id?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "murojaah_cycles_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_progress: {
        Row: {
          created_at: string
          id: string
          last_juz_id: number | null
          last_line: number | null
          last_page: number | null
          student_id: string
          total_juz: number
          total_lines: number
          total_pages: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_juz_id?: number | null
          last_line?: number | null
          last_page?: number | null
          student_id: string
          total_juz?: number
          total_lines?: number
          total_pages?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_juz_id?: number | null
          last_line?: number | null
          last_page?: number | null
          student_id?: string
          total_juz?: number
          total_lines?: number
          total_pages?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      target_hafalan: {
        Row: {
          created_at: string
          deadline: string
          id: string
          student_id: string
          target_type: Database["public"]["Enums"]["target_type"]
          target_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deadline: string
          id?: string
          student_id: string
          target_type: Database["public"]["Enums"]["target_type"]
          target_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deadline?: string
          id?: string
          student_id?: string
          target_type?: Database["public"]["Enums"]["target_type"]
          target_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "target_hafalan_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      exam_result: "mumtaz" | "jayyid_jiddan_plus" | "jayyid_jiddan" | "jayyid_plus" | "jayyid" | "maqbul" | "rosib"
      exam_type: "quarter_juz" | "half_juz" | "one_juz" | "five_juz"
      target_type: "juz" | "page" | "line"
      user_role: "student" | "teacher" | "examiner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      exam_result: ["mumtaz", "jayyid_jiddan_plus", "jayyid_jiddan", "jayyid_plus", "jayyid", "maqbul", "rosib"],
      exam_type: ["quarter_juz", "half_juz", "one_juz", "five_juz"],
      target_type: ["juz", "page", "line"],
      user_role: ["student", "teacher", "examiner"],
    },
  },
} as const
