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
      api_configurations: {
        Row: {
          api_key_name: string
          base_url: string
          carrier: string
          created_at: string
          id: string
          is_active: boolean | null
          rate_limit_per_minute: number | null
          updated_at: string
        }
        Insert: {
          api_key_name: string
          base_url: string
          carrier: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          rate_limit_per_minute?: number | null
          updated_at?: string
        }
        Update: {
          api_key_name?: string
          base_url?: string
          carrier?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          rate_limit_per_minute?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          customer_number: string
          customer_type: Database["public"]["Enums"]["customer_type"]
          email: string | null
          full_name: string
          id: string
          notes: string | null
          phone_number: string | null
          preferred_contact_method: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          customer_number?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          full_name: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          customer_number?: string
          customer_type?: Database["public"]["Enums"]["customer_type"]
          email?: string | null
          full_name?: string
          id?: string
          notes?: string | null
          phone_number?: string | null
          preferred_contact_method?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_customers_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          created_at: string
          html_content: string
          id: string
          is_active: boolean | null
          subject: string
          template_name: string
          text_content: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_content: string
          id?: string
          is_active?: boolean | null
          subject: string
          template_name: string
          text_content?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_content?: string
          id?: string
          is_active?: boolean | null
          subject?: string
          template_name?: string
          text_content?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          package_id: string
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          package_id: string
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          package_id?: string
          uploaded_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invoices_package_id"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invoices_uploaded_by"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      magaya_sync_log: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          magaya_response: Json | null
          package_id: string | null
          sync_status: string
          sync_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          magaya_response?: Json | null
          package_id?: string | null
          sync_status?: string
          sync_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          magaya_response?: Json | null
          package_id?: string | null
          sync_status?: string
          sync_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "magaya_sync_log_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          package_id: string | null
          recipient: string
          sent_at: string | null
          subject: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          package_id?: string | null
          recipient: string
          sent_at?: string | null
          subject?: string | null
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          package_id?: string | null
          recipient?: string
          sent_at?: string | null
          subject?: string | null
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_notifications_package_id"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_notifications_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      package_pickup_records: {
        Row: {
          authorized_by_staff: string
          created_at: string
          customer_satisfied: boolean | null
          dispute_reported: boolean | null
          id: string
          package_condition: string | null
          package_id: string
          pickup_notes: string | null
          pickup_person_name: string
          pickup_person_phone: string | null
          pickup_person_relationship: string | null
          pickup_timestamp: string
          updated_at: string
          verification_data: Json | null
          verification_method_id: string
          verification_successful: boolean
        }
        Insert: {
          authorized_by_staff: string
          created_at?: string
          customer_satisfied?: boolean | null
          dispute_reported?: boolean | null
          id?: string
          package_condition?: string | null
          package_id: string
          pickup_notes?: string | null
          pickup_person_name: string
          pickup_person_phone?: string | null
          pickup_person_relationship?: string | null
          pickup_timestamp?: string
          updated_at?: string
          verification_data?: Json | null
          verification_method_id: string
          verification_successful?: boolean
        }
        Update: {
          authorized_by_staff?: string
          created_at?: string
          customer_satisfied?: boolean | null
          dispute_reported?: boolean | null
          id?: string
          package_condition?: string | null
          package_id?: string
          pickup_notes?: string | null
          pickup_person_name?: string
          pickup_person_phone?: string | null
          pickup_person_relationship?: string | null
          pickup_timestamp?: string
          updated_at?: string
          verification_data?: Json | null
          verification_method_id?: string
          verification_successful?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "package_pickup_records_authorized_by_staff_fkey"
            columns: ["authorized_by_staff"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_pickup_records_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_pickup_records_verification_method_id_fkey"
            columns: ["verification_method_id"]
            isOneToOne: false
            referencedRelation: "pickup_verification_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          actual_delivery: string | null
          api_sync_status: string | null
          carrier: string | null
          consolidation_status: string | null
          created_at: string
          customer_id: string
          date_received: string
          delivery_address: string
          delivery_estimate: string | null
          description: string
          dimensions: string | null
          duty_amount: number | null
          duty_rate: number | null
          estimated_delivery: string | null
          external_tracking_number: string | null
          id: string
          last_api_sync: string | null
          last_notification_sent_at: string | null
          last_notification_status:
            | Database["public"]["Enums"]["package_status"]
            | null
          magaya_reference_number: string | null
          magaya_shipment_id: string | null
          notes: string | null
          package_value: number | null
          sender_address: string | null
          sender_name: string | null
          status: Database["public"]["Enums"]["package_status"]
          total_due: number | null
          tracking_number: string
          updated_at: string
          warehouse_location: string | null
          weight: number | null
        }
        Insert: {
          actual_delivery?: string | null
          api_sync_status?: string | null
          carrier?: string | null
          consolidation_status?: string | null
          created_at?: string
          customer_id: string
          date_received?: string
          delivery_address: string
          delivery_estimate?: string | null
          description: string
          dimensions?: string | null
          duty_amount?: number | null
          duty_rate?: number | null
          estimated_delivery?: string | null
          external_tracking_number?: string | null
          id?: string
          last_api_sync?: string | null
          last_notification_sent_at?: string | null
          last_notification_status?:
            | Database["public"]["Enums"]["package_status"]
            | null
          magaya_reference_number?: string | null
          magaya_shipment_id?: string | null
          notes?: string | null
          package_value?: number | null
          sender_address?: string | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          total_due?: number | null
          tracking_number: string
          updated_at?: string
          warehouse_location?: string | null
          weight?: number | null
        }
        Update: {
          actual_delivery?: string | null
          api_sync_status?: string | null
          carrier?: string | null
          consolidation_status?: string | null
          created_at?: string
          customer_id?: string
          date_received?: string
          delivery_address?: string
          delivery_estimate?: string | null
          description?: string
          dimensions?: string | null
          duty_amount?: number | null
          duty_rate?: number | null
          estimated_delivery?: string | null
          external_tracking_number?: string | null
          id?: string
          last_api_sync?: string | null
          last_notification_sent_at?: string | null
          last_notification_status?:
            | Database["public"]["Enums"]["package_status"]
            | null
          magaya_reference_number?: string | null
          magaya_shipment_id?: string | null
          notes?: string | null
          package_value?: number | null
          sender_address?: string | null
          sender_name?: string | null
          status?: Database["public"]["Enums"]["package_status"]
          total_due?: number | null
          tracking_number?: string
          updated_at?: string
          warehouse_location?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_packages_customer_id"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_codes: {
        Row: {
          code_type: string
          code_value: string
          created_at: string
          expires_at: string
          generated_by: string
          id: string
          is_active: boolean
          package_id: string
          used_at: string | null
        }
        Insert: {
          code_type: string
          code_value: string
          created_at?: string
          expires_at: string
          generated_by: string
          id?: string
          is_active?: boolean
          package_id: string
          used_at?: string | null
        }
        Update: {
          code_type?: string
          code_value?: string
          created_at?: string
          expires_at?: string
          generated_by?: string
          id?: string
          is_active?: boolean
          package_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pickup_codes_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_codes_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_dispute_logs: {
        Row: {
          created_at: string
          dispute_description: string
          dispute_type: string
          evidence_files: Json | null
          id: string
          package_id: string
          pickup_record_id: string | null
          reported_by: string
          resolution_notes: string | null
          resolution_status: string
          resolved_at: string | null
          resolved_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispute_description: string
          dispute_type: string
          evidence_files?: Json | null
          id?: string
          package_id: string
          pickup_record_id?: string | null
          reported_by: string
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispute_description?: string
          dispute_type?: string
          evidence_files?: Json | null
          id?: string
          package_id?: string
          pickup_record_id?: string | null
          reported_by?: string
          resolution_notes?: string | null
          resolution_status?: string
          resolved_at?: string | null
          resolved_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pickup_dispute_logs_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_dispute_logs_pickup_record_id_fkey"
            columns: ["pickup_record_id"]
            isOneToOne: false
            referencedRelation: "package_pickup_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_dispute_logs_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pickup_dispute_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pickup_verification_methods: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          requires_code: boolean
          requires_photo: boolean
          requires_signature: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          requires_code?: boolean
          requires_photo?: boolean
          requires_signature?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          requires_code?: boolean
          requires_photo?: boolean
          requires_signature?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone_number: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone_number?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      tracking_events: {
        Row: {
          carrier: string
          created_at: string
          event_description: string
          event_location: string | null
          event_timestamp: string
          event_type: string
          id: string
          package_id: string
          raw_data: Json | null
        }
        Insert: {
          carrier: string
          created_at?: string
          event_description: string
          event_location?: string | null
          event_timestamp: string
          event_type: string
          id?: string
          package_id: string
          raw_data?: Json | null
        }
        Update: {
          carrier?: string
          created_at?: string
          event_description?: string
          event_location?: string | null
          event_timestamp?: string
          event_type?: string
          id?: string
          package_id?: string
          raw_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tracking_events_package_id"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_events_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_duplicate_customers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "admin" | "warehouse"
      customer_type: "registered" | "guest" | "package_only"
      notification_type: "email" | "sms"
      package_status:
        | "received"
        | "in_transit"
        | "arrived"
        | "ready_for_pickup"
        | "picked_up"
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
    Enums: {
      app_role: ["customer", "admin", "warehouse"],
      customer_type: ["registered", "guest", "package_only"],
      notification_type: ["email", "sms"],
      package_status: [
        "received",
        "in_transit",
        "arrived",
        "ready_for_pickup",
        "picked_up",
      ],
    },
  },
} as const
