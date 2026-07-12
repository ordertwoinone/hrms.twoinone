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
      advance_repayments: {
        Row: {
          advance_id: string
          amount: number
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          payroll_run_id: string | null
          repayment_date: string
        }
        Insert: {
          advance_id: string
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          payroll_run_id?: string | null
          repayment_date: string
        }
        Update: {
          advance_id?: string
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          payroll_run_id?: string | null
          repayment_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "advance_repayments_advance_id_fkey"
            columns: ["advance_id"]
            isOneToOne: false
            referencedRelation: "salary_advances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "advance_repayments_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      attendance_monthly_summary: {
        Row: {
          absent_days: number
          absent_deduction: number
          additional_duty_hours: number
          additional_duty_payment: number
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          notes: string | null
          period_month: number
          period_year: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          absent_days?: number
          absent_deduction?: number
          additional_duty_hours?: number
          additional_duty_payment?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          period_month: number
          period_year: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          absent_days?: number
          absent_deduction?: number
          additional_duty_hours?: number
          additional_duty_payment?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          period_month?: number
          period_year?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_monthly_summary_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_monthly_summary_employee_id_fkey"
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
      bank_accounts: {
        Row: {
          account_holder_name: string
          account_number: string
          bank_name: string
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          employee_id: string
          iban: string
          id: string
          is_primary: boolean
          notes: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_holder_name: string
          account_number: string
          bank_name: string
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          employee_id: string
          iban: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_holder_name?: string
          account_number?: string
          bank_name?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          employee_id?: string
          iban?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      bonuses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          bonus_type: string
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          effective_month: number | null
          effective_year: number | null
          employee_id: string
          id: string
          notes: string | null
          payroll_run_id: string | null
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bonus_type: string
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          effective_month?: number | null
          effective_year?: number | null
          employee_id: string
          id?: string
          notes?: string | null
          payroll_run_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bonus_type?: string
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          effective_month?: number | null
          effective_year?: number | null
          employee_id?: string
          id?: string
          notes?: string | null
          payroll_run_id?: string | null
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bonuses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonuses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonuses_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
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
      candidates: {
        Row: {
          company_id: string
          created_at: string
          current_employer: string | null
          current_title: string | null
          deleted_at: string | null
          email: string | null
          full_name: string
          id: string
          linkedin_url: string | null
          nationality: string | null
          notes: string | null
          phone: string | null
          resume_url: string | null
          source: string | null
          tags: string[] | null
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          company_id: string
          created_at?: string
          current_employer?: string | null
          current_title?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          linkedin_url?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          company_id?: string
          created_at?: string
          current_employer?: string | null
          current_title?: string | null
          deleted_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          linkedin_url?: string | null
          nationality?: string | null
          notes?: string | null
          phone?: string | null
          resume_url?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_template_items: {
        Row: {
          created_at: string
          description: string | null
          due_day_offset: number
          id: string
          responsible_role: string | null
          sort_order: number
          template_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_day_offset?: number
          id?: string
          responsible_role?: string | null
          sort_order?: number
          template_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_day_offset?: number
          id?: string
          responsible_role?: string | null
          sort_order?: number
          template_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_templates: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          name: string
          status: string
          type: string
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
          name: string
          status?: string
          type?: string
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
          name?: string
          status?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
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
          commission_fixed: number
          created_at: string
          created_by: string | null
          currency: string
          deductions: number
          deleted_at: string | null
          effective_date: string
          employee_id: string
          food_allowance: number
          housing_allowance: number
          id: string
          notes: string | null
          other_allowances: number
          overtime_rate_multiplier: number
          social_security_employee_pct: number
          social_security_employer_pct: number
          telephone_allowance: number
          transport_allowance: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          basic?: number
          commission_fixed?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          deleted_at?: string | null
          effective_date: string
          employee_id: string
          food_allowance?: number
          housing_allowance?: number
          id?: string
          notes?: string | null
          other_allowances?: number
          overtime_rate_multiplier?: number
          social_security_employee_pct?: number
          social_security_employer_pct?: number
          telephone_allowance?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          basic?: number
          commission_fixed?: number
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          deleted_at?: string | null
          effective_date?: string
          employee_id?: string
          food_allowance?: number
          housing_allowance?: number
          id?: string
          notes?: string | null
          other_allowances?: number
          overtime_rate_multiplier?: number
          social_security_employee_pct?: number
          social_security_employer_pct?: number
          telephone_allowance?: number
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
      job_applications: {
        Row: {
          applied_at: string
          assigned_to: string | null
          candidate_id: string
          company_id: string
          created_at: string
          expected_joining: string | null
          hired_at: string | null
          id: string
          interviewed_at: string | null
          job_posting_id: string
          notes: string | null
          offered_at: string | null
          offered_currency: string | null
          offered_salary: number | null
          rating: number | null
          rejected_at: string | null
          rejection_reason: string | null
          screened_at: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          assigned_to?: string | null
          candidate_id: string
          company_id: string
          created_at?: string
          expected_joining?: string | null
          hired_at?: string | null
          id?: string
          interviewed_at?: string | null
          job_posting_id: string
          notes?: string | null
          offered_at?: string | null
          offered_currency?: string | null
          offered_salary?: number | null
          rating?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          screened_at?: string | null
          stage?: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          assigned_to?: string | null
          candidate_id?: string
          company_id?: string
          created_at?: string
          expected_joining?: string | null
          hired_at?: string | null
          id?: string
          interviewed_at?: string | null
          job_posting_id?: string
          notes?: string | null
          offered_at?: string | null
          offered_currency?: string | null
          offered_salary?: number | null
          rating?: number | null
          rejected_at?: string | null
          rejection_reason?: string | null
          screened_at?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_posting_id_fkey"
            columns: ["job_posting_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          branch_id: string | null
          closes_at: string | null
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          deleted_at: string | null
          department_id: string | null
          description: string | null
          designation_id: string | null
          employment_type_id: string | null
          headcount: number
          id: string
          location: string | null
          published_at: string | null
          requirements: string | null
          salary_max: number | null
          salary_min: number | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          branch_id?: string | null
          closes_at?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          designation_id?: string | null
          employment_type_id?: string | null
          headcount?: number
          id?: string
          location?: string | null
          published_at?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          branch_id?: string | null
          closes_at?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deleted_at?: string | null
          department_id?: string | null
          description?: string | null
          designation_id?: string | null
          employment_type_id?: string | null
          headcount?: number
          id?: string
          location?: string | null
          published_at?: string | null
          requirements?: string | null
          salary_max?: number | null
          salary_min?: number | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_employment_type_id_fkey"
            columns: ["employment_type_id"]
            isOneToOne: false
            referencedRelation: "employment_types"
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
      loan_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          id: string
          loan_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          payroll_run_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          loan_id: string
          notes?: string | null
          payment_date: string
          payment_method?: string
          payroll_run_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          payroll_run_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_payments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "employee_loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_payments_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
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
      onboarding_checklists: {
        Row: {
          company_id: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          status: string
          target_date: string | null
          template_id: string | null
          title: string
          type: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          company_id: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          status?: string
          target_date?: string | null
          template_id?: string | null
          title: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          company_id?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          status?: string
          target_date?: string | null
          template_id?: string | null
          title?: string
          type?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_checklists_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_checklists_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "checklist_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_tasks: {
        Row: {
          checklist_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          responsible_role: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          responsible_role?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          responsible_role?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_tasks_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "onboarding_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_requests: {
        Row: {
          company_id: string
          created_at: string
          date: string
          deleted_at: string | null
          employee_id: string
          end_time: string
          hours_requested: number
          hr_id: string | null
          hr_remarks: string | null
          hr_reviewed_at: string | null
          hr_status: string | null
          id: string
          manager_id: string | null
          manager_remarks: string | null
          manager_reviewed_at: string | null
          manager_status: string | null
          payroll_run_id: string | null
          reason: string | null
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date: string
          deleted_at?: string | null
          employee_id: string
          end_time: string
          hours_requested: number
          hr_id?: string | null
          hr_remarks?: string | null
          hr_reviewed_at?: string | null
          hr_status?: string | null
          id?: string
          manager_id?: string | null
          manager_remarks?: string | null
          manager_reviewed_at?: string | null
          manager_status?: string | null
          payroll_run_id?: string | null
          reason?: string | null
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date?: string
          deleted_at?: string | null
          employee_id?: string
          end_time?: string
          hours_requested?: number
          hr_id?: string | null
          hr_remarks?: string | null
          hr_reviewed_at?: string | null
          hr_status?: string | null
          id?: string
          manager_id?: string | null
          manager_remarks?: string | null
          manager_reviewed_at?: string | null
          manager_status?: string | null
          payroll_run_id?: string | null
          reason?: string | null
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_requests_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_requests_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
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
      payroll_approvals: {
        Row: {
          actioned_at: string | null
          approver_id: string
          created_at: string
          id: string
          level: number
          payroll_run_id: string
          remarks: string | null
          status: string
        }
        Insert: {
          actioned_at?: string | null
          approver_id: string
          created_at?: string
          id?: string
          level: number
          payroll_run_id: string
          remarks?: string | null
          status?: string
        }
        Update: {
          actioned_at?: string | null
          approver_id?: string
          created_at?: string
          id?: string
          level?: number
          payroll_run_id?: string
          remarks?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_approvals_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_config: {
        Row: {
          agent_id: string | null
          bank_routing_code: string | null
          company_id: string
          created_at: string
          currency: string
          employer_id: string | null
          gratuity_5yr_plus_rate: number
          gratuity_5yr_rate: number
          gratuity_enabled: boolean
          housing_allowance: number
          id: string
          meal_allowance: number
          other_allowance: number
          overtime_rate_holiday: number
          overtime_rate_weekday: number
          overtime_rate_weekend: number
          payroll_day: number
          social_security_employee_pct: number
          social_security_employer_pct: number
          transport_allowance: number
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          agent_id?: string | null
          bank_routing_code?: string | null
          company_id: string
          created_at?: string
          currency?: string
          employer_id?: string | null
          gratuity_5yr_plus_rate?: number
          gratuity_5yr_rate?: number
          gratuity_enabled?: boolean
          housing_allowance?: number
          id?: string
          meal_allowance?: number
          other_allowance?: number
          overtime_rate_holiday?: number
          overtime_rate_weekday?: number
          overtime_rate_weekend?: number
          payroll_day?: number
          social_security_employee_pct?: number
          social_security_employer_pct?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          agent_id?: string | null
          bank_routing_code?: string | null
          company_id?: string
          created_at?: string
          currency?: string
          employer_id?: string | null
          gratuity_5yr_plus_rate?: number
          gratuity_5yr_rate?: number
          gratuity_enabled?: boolean
          housing_allowance?: number
          id?: string
          meal_allowance?: number
          other_allowance?: number
          overtime_rate_holiday?: number
          overtime_rate_weekday?: number
          overtime_rate_weekend?: number
          payroll_day?: number
          social_security_employee_pct?: number
          social_security_employer_pct?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_config_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
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
          locked_at: string | null
          locked_by: string | null
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
          locked_at?: string | null
          locked_by?: string | null
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
          locked_at?: string | null
          locked_by?: string | null
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
          absent_days: number
          advance_deduction: number
          basic: number
          bonus: number
          commission: number
          company_id: string
          created_at: string
          created_by: string | null
          currency: string
          deductions: number
          employee_id: string
          food_allowance: number
          gross: number
          housing_allowance: number
          id: string
          leave_encashment: number
          loan_deduction: number
          net: number
          notes: string | null
          ot_amount: number
          ot_hours: number
          other_allowances: number
          overtime: number
          penalty: number
          present_days: number
          run_id: string
          social_security_employee: number
          social_security_employer: number
          tax: number
          telephone_allowance: number
          transport_allowance: number
          updated_at: string
          updated_by: string | null
          working_days: number
        }
        Insert: {
          absent_days?: number
          advance_deduction?: number
          basic?: number
          bonus?: number
          commission?: number
          company_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          employee_id: string
          food_allowance?: number
          gross?: number
          housing_allowance?: number
          id?: string
          leave_encashment?: number
          loan_deduction?: number
          net?: number
          notes?: string | null
          ot_amount?: number
          ot_hours?: number
          other_allowances?: number
          overtime?: number
          penalty?: number
          present_days?: number
          run_id: string
          social_security_employee?: number
          social_security_employer?: number
          tax?: number
          telephone_allowance?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
          working_days?: number
        }
        Update: {
          absent_days?: number
          advance_deduction?: number
          basic?: number
          bonus?: number
          commission?: number
          company_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          deductions?: number
          employee_id?: string
          food_allowance?: number
          gross?: number
          housing_allowance?: number
          id?: string
          leave_encashment?: number
          loan_deduction?: number
          net?: number
          notes?: string | null
          ot_amount?: number
          ot_hours?: number
          other_allowances?: number
          overtime?: number
          penalty?: number
          present_days?: number
          run_id?: string
          social_security_employee?: number
          social_security_employer?: number
          tax?: number
          telephone_allowance?: number
          transport_allowance?: number
          updated_at?: string
          updated_by?: string | null
          working_days?: number
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
      performance_cycles: {
        Row: {
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          end_date: string
          id: string
          manager_review_deadline: string | null
          name: string
          self_review_deadline: string | null
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
          end_date: string
          id?: string
          manager_review_deadline?: string | null
          name: string
          self_review_deadline?: string | null
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
          end_date?: string
          id?: string
          manager_review_deadline?: string | null
          name?: string
          self_review_deadline?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_cycles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_goals: {
        Row: {
          achieved_value: string | null
          company_id: string
          created_at: string
          created_by: string | null
          cycle_id: string
          description: string | null
          employee_id: string
          id: string
          status: string
          target_value: string | null
          title: string
          updated_at: string
          weight: number | null
        }
        Insert: {
          achieved_value?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          cycle_id: string
          description?: string | null
          employee_id: string
          id?: string
          status?: string
          target_value?: string | null
          title: string
          updated_at?: string
          weight?: number | null
        }
        Update: {
          achieved_value?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          cycle_id?: string
          description?: string | null
          employee_id?: string
          id?: string
          status?: string
          target_value?: string | null
          title?: string
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_goals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "performance_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_goals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_reviews: {
        Row: {
          acknowledged_at: string | null
          comments: string | null
          company_id: string
          created_at: string
          cycle_id: string
          employee_id: string
          id: string
          improvements: string | null
          overall_rating: number | null
          reviewer_id: string | null
          status: string
          strengths: string | null
          submitted_at: string | null
          type: string
          updated_at: string
        }
        Insert: {
          acknowledged_at?: string | null
          comments?: string | null
          company_id: string
          created_at?: string
          cycle_id: string
          employee_id: string
          id?: string
          improvements?: string | null
          overall_rating?: number | null
          reviewer_id?: string | null
          status?: string
          strengths?: string | null
          submitted_at?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          comments?: string | null
          company_id?: string
          created_at?: string
          cycle_id?: string
          employee_id?: string
          id?: string
          improvements?: string | null
          overall_rating?: number | null
          reviewer_id?: string | null
          status?: string
          strengths?: string | null
          submitted_at?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_reviews_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "performance_cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "performance_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      salary_advances: {
        Row: {
          advance_date: string
          amount: number
          approved_at: string | null
          approved_by: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deleted_at: string | null
          employee_id: string
          id: string
          monthly_deduction: number
          notes: string | null
          outstanding: number
          reason: string | null
          repayment_months: number
          status: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          advance_date: string
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id: string
          id?: string
          monthly_deduction?: number
          notes?: string | null
          outstanding?: number
          reason?: string | null
          repayment_months?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          advance_date?: string
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          employee_id?: string
          id?: string
          monthly_deduction?: number
          notes?: string | null
          outstanding?: number
          reason?: string | null
          repayment_months?: number
          status?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_advances_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salary_advances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
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
      system_preferences: {
        Row: {
          company_id: string
          created_at: string
          date_format: string
          enable_overtime_module: boolean
          enable_performance_module: boolean
          enable_recruitment_module: boolean
          enable_self_service: boolean
          enable_training_module: boolean
          fiscal_year_start_month: number
          id: string
          language: string
          notify_birthday: boolean
          notify_contract_expiry: boolean
          notify_document_expiry: boolean
          notify_leave_approval: boolean
          time_format: string
          timezone: string
          updated_at: string
          updated_by: string | null
          work_days: string[]
          work_week_start: string
        }
        Insert: {
          company_id: string
          created_at?: string
          date_format?: string
          enable_overtime_module?: boolean
          enable_performance_module?: boolean
          enable_recruitment_module?: boolean
          enable_self_service?: boolean
          enable_training_module?: boolean
          fiscal_year_start_month?: number
          id?: string
          language?: string
          notify_birthday?: boolean
          notify_contract_expiry?: boolean
          notify_document_expiry?: boolean
          notify_leave_approval?: boolean
          time_format?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
          work_days?: string[]
          work_week_start?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          date_format?: string
          enable_overtime_module?: boolean
          enable_performance_module?: boolean
          enable_recruitment_module?: boolean
          enable_self_service?: boolean
          enable_training_module?: boolean
          fiscal_year_start_month?: number
          id?: string
          language?: string
          notify_birthday?: boolean
          notify_contract_expiry?: boolean
          notify_document_expiry?: boolean
          notify_leave_approval?: boolean
          time_format?: string
          timezone?: string
          updated_at?: string
          updated_by?: string | null
          work_days?: string[]
          work_week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "system_preferences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      training_courses: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          created_by: string | null
          deadline: string | null
          deleted_at: string | null
          description: string | null
          duration_hours: number | null
          id: string
          max_seats: number | null
          mode: string
          provider: string | null
          scheduled_date: string | null
          status: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          max_seats?: number | null
          mode?: string
          provider?: string | null
          scheduled_date?: string | null
          status?: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          deleted_at?: string | null
          description?: string | null
          duration_hours?: number | null
          id?: string
          max_seats?: number | null
          mode?: string
          provider?: string | null
          scheduled_date?: string | null
          status?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_courses_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      training_enrollments: {
        Row: {
          certificate_url: string | null
          company_id: string
          completion_date: string | null
          course_id: string
          employee_id: string
          enrolled_at: string
          id: string
          score: number | null
          status: string
          updated_at: string
        }
        Insert: {
          certificate_url?: string | null
          company_id: string
          completion_date?: string | null
          course_id: string
          employee_id: string
          enrolled_at?: string
          id?: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          certificate_url?: string | null
          company_id?: string
          completion_date?: string | null
          course_id?: string
          employee_id?: string
          enrolled_at?: string
          id?: string
          score?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_enrollments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "training_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_enrollments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
