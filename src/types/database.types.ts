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
      announcements: {
        Row: {
          body: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          id: string
          pinned: boolean
          published_at: string
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          pinned?: boolean
          published_at?: string
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          id?: string
          pinned?: boolean
          published_at?: string
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          attendance_date: string
          break_minutes: number
          check_in: string | null
          check_out: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          early_leave_minutes: number
          employee_id: string
          id: string
          late_minutes: number
          notes: string | null
          overtime_minutes: number
          shift_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
          work_minutes: number
        }
        Insert: {
          attendance_date: string
          break_minutes?: number
          check_in?: string | null
          check_out?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          early_leave_minutes?: number
          employee_id: string
          id?: string
          late_minutes?: number
          notes?: string | null
          overtime_minutes?: number
          shift_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          work_minutes?: number
        }
        Update: {
          attendance_date?: string
          break_minutes?: number
          check_in?: string | null
          check_out?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          early_leave_minutes?: number
          employee_id?: string
          id?: string
          late_minutes?: number
          notes?: string | null
          overtime_minutes?: number
          shift_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          work_minutes?: number
        }
        Relationships: [
          {
            foreignKeyName: "attendance_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_corrections: {
        Row: {
          attendance_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          reason: string
          requested_check_in: string | null
          requested_check_out: string | null
          requested_status: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attendance_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          reason: string
          requested_check_in?: string | null
          requested_check_out?: string | null
          requested_status?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attendance_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          reason?: string
          requested_check_in?: string | null
          requested_check_out?: string | null
          requested_status?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_corrections_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          address_line: string | null
          city: string | null
          code: string
          company_id: string
          country: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          manager_id: string | null
          name: string
          phone: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          code: string
          company_id: string
          country?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          manager_id?: string | null
          name: string
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address_line?: string | null
          city?: string | null
          code?: string
          company_id?: string
          country?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          phone?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branches_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branches_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address_line: string | null
          city: string | null
          country: string
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          office_end_time: string | null
          office_start_time: string | null
          phone: string | null
          tax_registration_number: string | null
          timezone: string
          trade_license_number: string | null
          updated_at: string
          updated_by: string | null
          website: string | null
          working_days: number[]
        }
        Insert: {
          address_line?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          office_end_time?: string | null
          office_start_time?: string | null
          phone?: string | null
          tax_registration_number?: string | null
          timezone?: string
          trade_license_number?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
          working_days?: number[]
        }
        Update: {
          address_line?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          office_end_time?: string | null
          office_start_time?: string | null
          phone?: string | null
          tax_registration_number?: string | null
          timezone?: string
          trade_license_number?: string | null
          updated_at?: string
          updated_by?: string | null
          website?: string | null
          working_days?: number[]
        }
        Relationships: []
      }
      company_holidays: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          holiday_date: string
          id: string
          is_recurring: boolean
          name: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          holiday_date: string
          id?: string
          is_recurring?: boolean
          name: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          holiday_date?: string
          id?: string
          is_recurring?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_holidays_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_events: {
        Row: {
          action: string
          actor_id: string | null
          contract_id: string
          created_at: string
          id: string
          note: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          contract_id: string
          created_at?: string
          id?: string
          note?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          note?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          contract_name: string | null
          contract_type: string
          contract_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          end_date: string | null
          id: string
          notes: string | null
          notice_period_days: number
          offer_letter_name: string | null
          offer_letter_url: string | null
          renewal_date: string | null
          start_date: string
          status: string
          submitted_at: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          contract_name?: string | null
          contract_type: string
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          notes?: string | null
          notice_period_days?: number
          offer_letter_name?: string | null
          offer_letter_url?: string | null
          renewal_date?: string | null
          start_date: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          contract_name?: string | null
          contract_type?: string
          contract_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          notice_period_days?: number
          offer_letter_name?: string | null
          offer_letter_url?: string | null
          renewal_date?: string | null
          start_date?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          branch_id: string | null
          code: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          head_id: string | null
          id: string
          name: string
          parent_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          branch_id?: string | null
          code: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name: string
          parent_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          branch_id?: string | null
          code?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          head_id?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_head_id_fkey"
            columns: ["head_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      dependents: {
        Row: {
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          deleted_at: string | null
          employee_id: string
          gender: string | null
          id: string
          name: string
          relationship: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          employee_id: string
          gender?: string | null
          id?: string
          name: string
          relationship?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          deleted_at?: string | null
          employee_id?: string
          gender?: string | null
          id?: string
          name?: string
          relationship?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dependents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          department_id: string | null
          description: string | null
          grade: string | null
          id: string
          name: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          grade?: string | null
          id?: string
          name: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          grade?: string | null
          id?: string
          name?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          employee_id: string
          id: string
          is_primary: boolean
          name: string
          phone: string
          relationship: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          employee_id: string
          id?: string
          is_primary?: boolean
          name: string
          phone: string
          relationship?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          employee_id?: string
          id?: string
          is_primary?: boolean
          name?: string
          phone?: string
          relationship?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_contacts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      emirates_ids: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          eid_number: string
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          notes: string | null
          renewal_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          eid_number: string
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          notes?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          eid_number?: string
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emirates_ids_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emirates_ids_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_assets: {
        Row: {
          asset_tag: string | null
          assigned_date: string | null
          category: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          name: string
          notes: string | null
          return_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          asset_tag?: string | null
          assigned_date?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          name: string
          notes?: string | null
          return_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          asset_tag?: string | null
          assigned_date?: string | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          name?: string
          notes?: string | null
          return_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_assets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          document_type: string | null
          employee_id: string
          expiry_date: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          issue_date: string | null
          mime_type: string | null
          number: string | null
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type?: string | null
          employee_id: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          mime_type?: string | null
          number?: string | null
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          document_type?: string | null
          employee_id?: string
          expiry_date?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          mime_type?: string | null
          number?: string | null
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_loans: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          loan_type: string
          monthly_deduction: number
          notes: string | null
          outstanding: number
          principal: number
          start_date: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          loan_type?: string
          monthly_deduction: number
          notes?: string | null
          outstanding: number
          principal: number
          start_date: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          loan_type?: string
          monthly_deduction?: number
          notes?: string | null
          outstanding?: number
          principal?: number
          start_date?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_loans_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_notes: {
        Row: {
          body: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_salaries: {
        Row: {
          basic: number
          created_at: string
          created_by: string | null
          currency: string
          deductions: number
          deleted_at: string | null
          effective_date: string
          employee_id: string
          housing_allowance: number
          id: string
          notes: string | null
          other_allowances: number
          transport_allowance: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          basic?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          deleted_at?: string | null
          effective_date: string
          employee_id: string
          housing_allowance?: number
          id?: string
          notes?: string | null
          other_allowances?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          basic?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          deleted_at?: string | null
          effective_date?: string
          employee_id?: string
          housing_allowance?: number
          id?: string
          notes?: string | null
          other_allowances?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address_line: string | null
          branch_id: string | null
          city: string | null
          company_id: string
          country: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          date_of_joining: string | null
          date_of_leaving: string | null
          deleted_at: string | null
          department_id: string | null
          designation_id: string | null
          employee_code: string
          employment_type_id: string | null
          first_name: string
          gender: string | null
          id: string
          last_name: string
          manager_id: string | null
          marital_status: string | null
          nationality: string | null
          personal_email: string | null
          phone: string | null
          photo_url: string | null
          signature_url: string | null
          status: string
          updated_at: string
          updated_by: string | null
          user_id: string | null
          work_email: string | null
          work_location: string | null
        }
        Insert: {
          address_line?: string | null
          branch_id?: string | null
          city?: string | null
          company_id: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          date_of_leaving?: string | null
          deleted_at?: string | null
          department_id?: string | null
          designation_id?: string | null
          employee_code: string
          employment_type_id?: string | null
          first_name: string
          gender?: string | null
          id?: string
          last_name: string
          manager_id?: string | null
          marital_status?: string | null
          nationality?: string | null
          personal_email?: string | null
          phone?: string | null
          photo_url?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          work_email?: string | null
          work_location?: string | null
        }
        Update: {
          address_line?: string | null
          branch_id?: string | null
          city?: string | null
          company_id?: string
          country?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          date_of_joining?: string | null
          date_of_leaving?: string | null
          deleted_at?: string | null
          department_id?: string | null
          designation_id?: string | null
          employee_code?: string
          employment_type_id?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          last_name?: string
          manager_id?: string | null
          marital_status?: string | null
          nationality?: string | null
          personal_email?: string | null
          phone?: string | null
          photo_url?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          user_id?: string | null
          work_email?: string | null
          work_location?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_employment_type_id_fkey"
            columns: ["employment_type_id"]
            isOneToOne: false
            referencedRelation: "employment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employment_types: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_system: boolean
          name: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employment_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      experiences: {
        Row: {
          company_name: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          employee_id: string
          end_date: string | null
          id: string
          job_title: string | null
          start_date: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_name: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          job_title?: string | null
          start_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          job_title?: string | null
          start_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiences_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_letter_requests: {
        Row: {
          addressed_to: string | null
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          hr_notes: string | null
          id: string
          letter_type: string
          purpose: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          addressed_to?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          hr_notes?: string | null
          id?: string
          letter_type: string
          purpose?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          addressed_to?: string | null
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          hr_notes?: string | null
          id?: string
          letter_type?: string
          purpose?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_letter_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_letter_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      labour_cards: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          card_number: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          notes: string | null
          renewal_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          card_number: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          notes?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          card_number?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labour_cards_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "labour_cards_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          allocated: number
          carried_forward: number
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          leave_type_id: string
          updated_at: string
          updated_by: string | null
          year: number
        }
        Insert: {
          allocated?: number
          carried_forward?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          leave_type_id: string
          updated_at?: string
          updated_by?: string | null
          year: number
        }
        Update: {
          allocated?: number
          carried_forward?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          leave_type_id?: string
          updated_at?: string
          updated_by?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_request_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          note: string | null
          request_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          request_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_request_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "leave_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          end_date: string
          half_day_period: string | null
          id: string
          is_half_day: boolean
          leave_type_id: string
          manager_id: string | null
          reason: string | null
          start_date: string
          status: string
          total_days: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          end_date: string
          half_day_period?: string | null
          id?: string
          is_half_day?: boolean
          leave_type_id: string
          manager_id?: string | null
          reason?: string | null
          start_date: string
          status?: string
          total_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          end_date?: string
          half_day_period?: string | null
          id?: string
          is_half_day?: boolean
          leave_type_id?: string
          manager_id?: string | null
          reason?: string | null
          start_date?: string
          status?: string
          total_days?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          code: string
          color: string
          company_id: string
          created_at: string
          created_by: string | null
          days_per_year: number
          deleted_at: string | null
          description: string | null
          gender_restriction: string | null
          id: string
          is_paid: boolean
          is_system: boolean
          name: string
          requires_attachment: boolean
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code: string
          color?: string
          company_id: string
          created_at?: string
          created_by?: string | null
          days_per_year?: number
          deleted_at?: string | null
          description?: string | null
          gender_restriction?: string | null
          id?: string
          is_paid?: boolean
          is_system?: boolean
          name: string
          requires_attachment?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string
          color?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          days_per_year?: number
          deleted_at?: string | null
          description?: string | null
          gender_restriction?: string | null
          id?: string
          is_paid?: boolean
          is_system?: boolean
          name?: string
          requires_attachment?: boolean
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_insurance_policies: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          claims_notes: string | null
          company_id: string
          coverage: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          dependents_covered: number
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          policy_number: string
          provider: string
          renewal_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          claims_notes?: string | null
          company_id: string
          coverage: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dependents_covered?: number
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          policy_number: string
          provider: string
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          claims_notes?: string | null
          company_id?: string
          coverage?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          dependents_covered?: number
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          policy_number?: string
          provider?: string
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_insurance_policies_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_insurance_policies_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string
          email: boolean
          id: string
          in_app: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          email?: boolean
          id?: string
          in_app?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          email?: boolean
          id?: string
          in_app?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          dedupe_key: string | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          dedupe_key?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      passports: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          nationality: string
          notes: string | null
          passport_number: string
          place_of_issue: string | null
          renewal_date: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          nationality: string
          notes?: string | null
          passport_number: string
          place_of_issue?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          nationality?: string
          notes?: string | null
          passport_number?: string
          place_of_issue?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "passports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passports_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          employee_count: number
          id: string
          notes: string | null
          paid_at: string | null
          period_month: number
          period_year: number
          status: string
          total_deductions: number
          total_gross: number
          total_net: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          employee_count?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          period_month: number
          period_year: number
          status?: string
          total_deductions?: number
          total_gross?: number
          total_net?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          employee_count?: number
          id?: string
          notes?: string | null
          paid_at?: string | null
          period_month?: number
          period_year?: number
          status?: string
          total_deductions?: number
          total_gross?: number
          total_net?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payslips: {
        Row: {
          basic: number
          bonus: number
          commission: number
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          deductions: number
          employee_id: string
          gross: number
          housing_allowance: number
          id: string
          loan_deduction: number
          net: number
          notes: string | null
          other_allowances: number
          overtime: number
          run_id: string
          tax: number
          transport_allowance: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          basic?: number
          bonus?: number
          commission?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          employee_id: string
          gross?: number
          housing_allowance?: number
          id?: string
          loan_deduction?: number
          net?: number
          notes?: string | null
          other_allowances?: number
          overtime?: number
          run_id: string
          tax?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          basic?: number
          bonus?: number
          commission?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          employee_id?: string
          gross?: number
          housing_allowance?: number
          id?: string
          loan_deduction?: number
          net?: number
          notes?: string | null
          other_allowances?: number
          overtime?: number
          run_id?: string
          tax?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payslips_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payslips_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          key: string
          resource: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          action: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          key: string
          resource: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          key?: string
          resource?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string
          full_name: string
          id: string
          last_sign_in_at: string | null
          phone: string | null
          role_id: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email: string
          full_name: string
          id: string
          last_sign_in_at?: string | null
          phone?: string | null
          role_id: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string
          full_name?: string
          id?: string
          last_sign_in_at?: string | null
          phone?: string | null
          role_id?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      qualifications: {
        Row: {
          created_at: string
          created_by: string | null
          degree: string
          deleted_at: string | null
          employee_id: string
          end_year: number | null
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string | null
          start_year: number | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          degree: string
          deleted_at?: string | null
          employee_id: string
          end_year?: number | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string | null
          start_year?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          degree?: string
          deleted_at?: string | null
          employee_id?: string
          end_year?: number | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string | null
          start_year?: number | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_system: boolean
          key: string
          name: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          key: string
          name: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_system?: boolean
          key?: string
          name?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          break_minutes: number
          code: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_time: string
          grace_minutes: number
          id: string
          is_night: boolean
          name: string
          start_time: string
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          break_minutes?: number
          code: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_time: string
          grace_minutes?: number
          id?: string
          is_night?: boolean
          name: string
          start_time: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          break_minutes?: number
          code?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          end_time?: string
          grace_minutes?: number
          id?: string
          is_night?: boolean
          name?: string
          start_time?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string
          created_by: string | null
          granted: boolean
          id: string
          permission_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          permission_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          granted?: boolean
          id?: string
          permission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      visas: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          expiry_date: string
          id: string
          issue_date: string
          notes: string | null
          passport_number: string | null
          renewal_date: string | null
          sponsor: string | null
          status: string
          updated_at: string
          updated_by: string | null
          visa_number: string
          visa_type: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          expiry_date: string
          id?: string
          issue_date: string
          notes?: string | null
          passport_number?: string | null
          renewal_date?: string | null
          sponsor?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          visa_number: string
          visa_type: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          expiry_date?: string
          id?: string
          issue_date?: string
          notes?: string | null
          passport_number?: string | null
          renewal_date?: string | null
          sponsor?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
          visa_number?: string
          visa_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "visas_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visas_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_permissions: {
        Args: never
        Returns: {
          key: string
        }[]
      }
      current_user_role_key: { Args: never; Returns: string }
      has_permission: { Args: { perm: string }; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      owns_employee: { Args: { emp: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
