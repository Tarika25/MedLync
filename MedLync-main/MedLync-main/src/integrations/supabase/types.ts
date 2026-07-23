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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: string
          created_at: string | null
          current_hash: string
          details: Json | null
          id: string
          prescription_id: string
          previous_hash: string | null
          user_id: string | null
          user_role: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          current_hash: string
          details?: Json | null
          id?: string
          prescription_id: string
          previous_hash?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          current_hash?: string
          details?: Json | null
          id?: string
          prescription_id?: string
          previous_hash?: string | null
          user_id?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      drug_database: {
        Row: {
          brand_price: number | null
          category: string | null
          contraindications: string[] | null
          created_at: string | null
          generic_name: string | null
          generic_price: number | null
          id: string
          interactions: string[] | null
          name: string
          side_effects: string[] | null
          standard_dosage: string | null
        }
        Insert: {
          brand_price?: number | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          generic_name?: string | null
          generic_price?: number | null
          id?: string
          interactions?: string[] | null
          name: string
          side_effects?: string[] | null
          standard_dosage?: string | null
        }
        Update: {
          brand_price?: number | null
          category?: string | null
          contraindications?: string[] | null
          created_at?: string | null
          generic_name?: string | null
          generic_price?: number | null
          id?: string
          interactions?: string[] | null
          name?: string
          side_effects?: string[] | null
          standard_dosage?: string | null
        }
        Relationships: []
      }
      hospital_doctors: {
        Row: {
          created_at: string
          hospital_user_id: string
          id: string
          name: string
          specialization: string | null
        }
        Insert: {
          created_at?: string
          hospital_user_id: string
          id?: string
          name: string
          specialization?: string | null
        }
        Update: {
          created_at?: string
          hospital_user_id?: string
          id?: string
          name?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hospital_doctors_hospital_user_id_fkey"
            columns: ["hospital_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hospital_doctors_hospital_user_id_fkey"
            columns: ["hospital_user_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          dosage: string
          duration: string
          end_date: string | null
          frequency: string
          id: string
          name: string
          prescription_id: string
          refill_count: number
        }
        Insert: {
          dosage: string
          duration: string
          end_date?: string | null
          frequency: string
          id?: string
          name: string
          prescription_id: string
          refill_count?: number
        }
        Update: {
          dosage?: string
          duration?: string
          end_date?: string | null
          frequency?: string
          id?: string
          name?: string
          prescription_id?: string
          refill_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "medicines_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          id: string
          is_verified: boolean | null
          otp_code: string
          phone_number: string
          prescription_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          otp_code: string
          phone_number: string
          prescription_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          otp_code?: string
          phone_number?: string
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "otp_verifications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_inventory: {
        Row: {
          id: string
          medicine_name: string
          pharmacy_id: string
          quantity: number
          status: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          medicine_name: string
          pharmacy_id: string
          quantity?: number
          status?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          medicine_name?: string
          pharmacy_id?: string
          quantity?: number
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prescription_drawings: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          prescription_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          prescription_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescription_drawings_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          additional_notes: string | null
          barcode_id: string | null
          chief_complaint: string | null
          collected_by: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          doctor_name: string | null
          expires_at: string | null
          follow_up_date: string | null
          id: string
          patient_id: string
          prescription_code: string
          status: string
          symptoms: string | null
          validity_days: number
        }
        Insert: {
          additional_notes?: string | null
          barcode_id?: string | null
          chief_complaint?: string | null
          collected_by?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          doctor_name?: string | null
          expires_at?: string | null
          follow_up_date?: string | null
          id?: string
          patient_id: string
          prescription_code?: string
          status?: string
          symptoms?: string | null
          validity_days?: number
        }
        Update: {
          additional_notes?: string | null
          barcode_id?: string | null
          chief_complaint?: string | null
          collected_by?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          doctor_name?: string | null
          expires_at?: string | null
          follow_up_date?: string | null
          id?: string
          patient_id?: string
          prescription_code?: string
          status?: string
          symptoms?: string | null
          validity_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          dispensed_at: string
          id: string
          pharmacy_id: string
          prescription_id: string
        }
        Insert: {
          dispensed_at?: string
          id?: string
          pharmacy_id: string
          prescription_id: string
        }
        Update: {
          dispensed_at?: string
          id?: string
          pharmacy_id?: string
          prescription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          age: number | null
          created_at: string
          date_of_birth: string | null
          email: string
          gender: string | null
          hospital_name: string | null
          id: string
          is_minor: boolean | null
          name: string
          parent_account_id: string | null
          password_hash: string
          patient_unique_id: string | null
          pharmacy_name: string | null
          phone: string | null
          profile_photo_url: string | null
          relationship_type: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          age?: number | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          gender?: string | null
          hospital_name?: string | null
          id?: string
          is_minor?: boolean | null
          name: string
          parent_account_id?: string | null
          password_hash: string
          patient_unique_id?: string | null
          pharmacy_name?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          relationship_type?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          age?: number | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          gender?: string | null
          hospital_name?: string | null
          id?: string
          is_minor?: boolean | null
          name?: string
          parent_account_id?: string | null
          password_hash?: string
          patient_unique_id?: string | null
          pharmacy_name?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          relationship_type?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "users_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      users_public: {
        Row: {
          age: number | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          gender: string | null
          hospital_name: string | null
          id: string | null
          is_minor: boolean | null
          name: string | null
          parent_account_id: string | null
          patient_unique_id: string | null
          pharmacy_name: string | null
          phone: string | null
          profile_photo_url: string | null
          relationship_type: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          hospital_name?: string | null
          id?: string | null
          is_minor?: boolean | null
          name?: string | null
          parent_account_id?: string | null
          patient_unique_id?: string | null
          pharmacy_name?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          relationship_type?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          gender?: string | null
          hospital_name?: string | null
          id?: string | null
          is_minor?: boolean | null
          name?: string | null
          parent_account_id?: string | null
          patient_unique_id?: string | null
          pharmacy_name?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          relationship_type?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "users_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "users_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "doctor" | "patient" | "pharmacy"
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
      user_role: ["doctor", "patient", "pharmacy"],
    },
  },
} as const
