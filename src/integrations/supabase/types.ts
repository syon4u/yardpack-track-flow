export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_configurations: {
        Row: {
          api_key_name: string
          base_url: string
          carrier: string
          created_at: string
          credentials: Json | null
          id: string
          is_active: boolean | null
          rate_limit_per_minute: number | null
          supplier_filter: string[] | null
          updated_at: string
        }
        Insert: {
          api_key_name: string
          base_url: string
          carrier: string
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          rate_limit_per_minute?: number | null
          supplier_filter?: string[] | null
          updated_at?: string
        }
        Update: {
          api_key_name?: string
          base_url?: string
          carrier?: string
          created_at?: string
          credentials?: Json | null
          id?: string
          is_active?: boolean | null
          rate_limit_per_minute?: number | null
          supplier_filter?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      customer_mapping_rules: {
        Row: {
          created_at: string
          id: string
          magaya_customer_data: Json
          mapping_confidence: number | null
          mapping_status: string
          mapping_type: string
          sync_session_id: string | null
          updated_at: string
          yardpack_customer_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          magaya_customer_data: Json
          mapping_confidence?: number | null
          mapping_status?: string
          mapping_type?: string
          sync_session_id?: string | null
          updated_at?: string
          yardpack_customer_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          magaya_customer_data?: Json
          mapping_confidence?: number | null
          mapping_status?: string
          mapping_type?: string
          sync_session_id?: string | null
          updated_at?: string
          yardpack_customer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_mapping_rules_sync_session_id_fkey"
            columns: ["sync_session_id"]
            isOneToOne: false
            referencedRelation: "magaya_sync_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_mapping_rules_yardpack_customer_id_fkey"
            columns: ["yardpack_customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          item_type: string
          quantity: number | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          item_type: string
          quantity?: number | null
          total_amount: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          item_type?: string
          quantity?: number | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          auto_generated: boolean | null
          customs_duty: number | null
          document_type: string
          due_date: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          handling_fee: number | null
          id: string
          invoice_number: string | null
          invoice_type: Database["public"]["Enums"]["invoice_type"] | null
          line_items: Json | null
          notes: string | null
          package_id: string
          payment_due_date: string | null
          payment_status: string | null
          shipping_cost: number | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
          uploaded_at: string
          uploaded_by: string
        }
        Insert: {
          auto_generated?: boolean | null
          customs_duty?: number | null
          document_type?: string
          due_date?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          handling_fee?: number | null
          id?: string
          invoice_number?: string | null
          invoice_type?: Database["public"]["Enums"]["invoice_type"] | null
          line_items?: Json | null
          notes?: string | null
          package_id: string
          payment_due_date?: string | null
          payment_status?: string | null
          shipping_cost?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          uploaded_at?: string
          uploaded_by: string
        }
        Update: {
          auto_generated?: boolean | null
          customs_duty?: number | null
          document_type?: string
          due_date?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          handling_fee?: number | null
          id?: string
          invoice_number?: string | null
          invoice_type?: Database["public"]["Enums"]["invoice_type"] | null
          line_items?: Json | null
          notes?: string | null
          package_id?: string
          payment_due_date?: string | null
          payment_status?: string | null
          shipping_cost?: number | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
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
      magaya_auto_sync_config: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean | null
          retry_attempts: number | null
          retry_delay_seconds: number | null
          sync_on_status_changes: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          retry_attempts?: number | null
          retry_delay_seconds?: number | null
          sync_on_status_changes?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean | null
          retry_attempts?: number | null
          retry_delay_seconds?: number | null
          sync_on_status_changes?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
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
      magaya_sync_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_customers: number | null
          created_packages: number | null
          error_count: number | null
          id: string
          initiated_by: string
          mapped_customers: number | null
          processed_shipments: number | null
          session_data: Json | null
          session_type: string
          started_at: string
          status: string
          supplier_filter: string
          total_shipments: number | null
          updated_at: string
          updated_packages: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_customers?: number | null
          created_packages?: number | null
          error_count?: number | null
          id?: string
          initiated_by: string
          mapped_customers?: number | null
          processed_shipments?: number | null
          session_data?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          supplier_filter?: string
          total_shipments?: number | null
          updated_at?: string
          updated_packages?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_customers?: number | null
          created_packages?: number | null
          error_count?: number | null
          id?: string
          initiated_by?: string
          mapped_customers?: number | null
          processed_shipments?: number | null
          session_data?: Json | null
          session_type?: string
          started_at?: string
          status?: string
          supplier_filter?: string
          total_shipments?: number | null
          updated_at?: string
          updated_packages?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "magaya_sync_sessions_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manual_notifications: {
        Row: {
          created_at: string
          id: string
          message_body: string
          recipient_emails: Json
          recipient_ids: Json
          recipient_type: string
          sender_id: string
          sent_at: string
          subject: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_body: string
          recipient_emails?: Json
          recipient_ids?: Json
          recipient_type: string
          sender_id: string
          sent_at?: string
          subject: string
        }
        Update: {
          created_at?: string
          id?: string
          message_body?: string
          recipient_emails?: Json
          recipient_ids?: Json
          recipient_type?: string
          sender_id?: string
          sent_at?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_manual_notifications_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          notification_preferences: Json | null
          phone_number: string | null
          push_notifications_enabled: boolean | null
          push_token: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          notification_preferences?: Json | null
          phone_number?: string | null
          push_notifications_enabled?: boolean | null
          push_token?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notification_preferences?: Json | null
          phone_number?: string | null
          push_notifications_enabled?: boolean | null
          push_token?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          is_public: boolean
          setting_key: string
          setting_type: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          is_public?: boolean
          setting_key: string
          setting_type?: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          is_public?: boolean
          setting_key?: string
          setting_type?: string
          setting_value?: string
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
      calculate_customer_clv: {
        Args: Record<PropertyKey, never>
        Returns: {
          customerid: string
          customername: string
          totalspent: number
          packagecount: number
          avgpackagevalue: number
          firstorderdate: string
          lastorderdate: string
          customertenuremonths: number
          clvscore: number
          segment: string
          predictedvalue: number
        }[]
      }
      check_duplicate_customers: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_segmentation: {
        Args: Record<PropertyKey, never>
        Returns: {
          segment: string
          customercount: number
          totalvalue: number
          avgclv: number
          percentage: number
        }[]
      }
      get_seasonal_demand_analysis: {
        Args: Record<PropertyKey, never>
        Returns: {
          month: string
          year: number
          packagecount: number
          totalvalue: number
          avgvalue: number
          trend: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "customer" | "admin" | "warehouse"
      customer_type: "registered" | "guest" | "package_only"
      invoice_type: "shipping_invoice" | "receipt"
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
      app_role: ["customer", "admin", "warehouse"],
      customer_type: ["registered", "guest", "package_only"],
      invoice_type: ["shipping_invoice", "receipt"],
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
